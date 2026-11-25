import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth-server';
import { decryptToken } from '@/lib/crypto';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const CODE_EXTS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'h', 'hpp',
  'cs', 'php', 'rb', 'sql', 'html', 'css', 'scss', 'json', 'vue', 'svelte',
  'swift', 'kt', 'dart', 'yaml', 'yml', 'prisma', 'graphql', 'toml', 'sh', 'md'
]);

const IGNORED_DIRS = ['node_modules/', '.git/', '.next/', 'dist/', 'build/', 'vendor/', '__pycache__/'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      repoUrl,
      owner: rawOwner,
      repoName: rawRepoName,
      branch: requestedBranch,
      token: clientToken,
    } = body as {
      repoUrl?: string;
      owner?: string;
      repoName?: string;
      branch?: string;
      token?: string;
    };

    let owner = rawOwner?.trim() || '';
    let repo = rawRepoName?.trim() || '';

    if (repoUrl) {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
      if (match) {
        owner = match[1];
        repo = match[2].replace(/\.git$/, '');
      }
    }

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Repository owner and name or GitHub URL are required.' },
        { status: 400 }
      );
    }

    // Resolve GitHub access token (from client session or encrypted DB record)
    let token = clientToken || null;
    if (!token) {
      const session = getSessionFromRequest(req);
      if (session?.id) {
        try {
          const { data: oauth } = await supabase
            .from('oauth_accounts')
            .select('access_token_encrypted')
            .eq('user_id', session.id)
            .eq('provider', 'github')
            .maybeSingle();
          if (oauth?.access_token_encrypted) {
            token = decryptToken(oauth.access_token_encrypted);
          }
        } catch {}
      }
    }

    const apiHeaders: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'CodePilot-AI',
    };
    if (token) {
      apiHeaders['Authorization'] = `Bearer ${token}`;
    }

    // 1. Determine default branch from repo metadata
    let branch = requestedBranch || 'main';
    try {
      const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: apiHeaders,
      });
      if (metaRes.ok) {
        const meta = await metaRes.json();
        if (!requestedBranch && meta.default_branch) {
          branch = meta.default_branch;
        }
      }
    } catch {}

    // 2. Fetch recursive git tree
    let treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      { headers: apiHeaders }
    );

    if (!treeRes.ok && branch === 'main') {
      branch = 'master';
      treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
        { headers: apiHeaders }
      );
    }

    if (!treeRes.ok) {
      const errJson = await treeRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errJson.message ||
            `Could not read repository tree for ${owner}/${repo} (${treeRes.status}). Ensure repository is accessible.`,
          files: {},
        },
        { status: treeRes.status === 404 ? 404 : 502 }
      );
    }

    const treeData = await treeRes.json();
    if (!Array.isArray(treeData.tree)) {
      return NextResponse.json({ files: {}, branch });
    }

    // 3. Prioritize actual source files (src/, app/, lib/, etc.) over lockfiles/configs
    const candidates = treeData.tree
      .filter((node: { path?: string; type?: string; size?: number }) => {
        if (node.type !== 'blob' || !node.path) return false;
        if (node.size && node.size > 150000) return false;
        const lowerPath = node.path.toLowerCase();
        if (IGNORED_DIRS.some((dir) => lowerPath.includes(dir) || lowerPath.startsWith(dir))) {
          return false;
        }
        if (lowerPath.endsWith('package-lock.json') || lowerPath.endsWith('yarn.lock') || lowerPath.endsWith('pnpm-lock.yaml')) {
          return false;
        }
        const ext = lowerPath.split('.').pop();
        return Boolean(ext && CODE_EXTS.has(ext));
      })
      .sort((a: { path: string }, b: { path: string }) => {
        // Prioritize src/ and app/ files first
        const aIsCode = /^(src|app|lib|server|api|components)\//i.test(a.path) ? 0 : 1;
        const bIsCode = /^(src|app|lib|server|api|components)\//i.test(b.path) ? 0 : 1;
        return aIsCode - bIsCode;
      })
      .slice(0, 35);

    const files: Record<string, string> = {};

    // 4. Download file contents cleanly on server (works for both public and private repos)
    await Promise.all(
      candidates.map(async (item: { path: string; sha?: string }) => {
        try {
          if (token && item.sha) {
            // GitHub Blob API works reliably with Bearer tokens for private repositories
            const blobRes = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/git/blobs/${item.sha}`,
              { headers: apiHeaders }
            );
            if (blobRes.ok) {
              const blob = await blobRes.json();
              if (blob.encoding === 'base64' && typeof blob.content === 'string') {
                files[item.path] = Buffer.from(blob.content, 'base64').toString('utf8');
                return;
              }
            }
          }

          // Raw content fallback (no CORS restriction on server)
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${item.path
            .split('/')
            .map(encodeURIComponent)
            .join('/')}`;
          const rawRes = await fetch(
            rawUrl,
            token ? { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'CodePilot-AI' } } : { headers: { 'User-Agent': 'CodePilot-AI' } }
          );
          if (rawRes.ok) {
            const text = await rawRes.text();
            if (text && text.length < 150000) {
              files[item.path] = text;
            }
          }
        } catch {}
      })
    );

    return NextResponse.json({
      files,
      branch,
      count: Object.keys(files).length,
    });
  } catch (err) {
    console.error('POST /api/github/files error:', err);
    return NextResponse.json({ error: 'Failed to fetch repository source files', files: {} }, { status: 500 });
  }
}
