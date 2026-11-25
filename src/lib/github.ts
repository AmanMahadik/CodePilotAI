import { Repository } from './types';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase/client';

export interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  private: boolean;
  updated_at: string;
  size: number;
}

/**
 * Maps a raw GitHub API repository object to CodePilot AI's Repository interface
 */
export function mapGitHubToRepository(gh: GitHubRepoItem, ownerLogin?: string): Repository {
  const language = gh.language || 'TypeScript';
  const loc = gh.size > 0 ? Math.max(gh.size * 25, 450) : 2400;
  const files = Math.max(Math.round(loc / 120), 12);
  
  // Deterministic health score calibration based on stars/issues
  const scoreBase = 88;
  const issuePenalty = Math.min((gh.open_issues_count || 0) * 2, 14);
  const starBonus = Math.min((gh.stargazers_count || 0) * 1, 6);
  const score = Math.max(65, Math.min(98, scoreBase - issuePenalty + starBonus));

  return {
    id: `gh-${gh.id}`,
    name: gh.name,
    owner: ownerLogin || gh.owner?.login || 'developer',
    source: 'github',
    branch: gh.default_branch || 'main',
    url: gh.html_url,
    primaryLanguage: language,
    languageDistribution: { [language]: 100 },
    latestScore: score,
    totalFiles: files,
    totalLOC: loc,
    reviewCount: 1,
    exclusionRules: ['node_modules', '.git', 'dist', 'build', '.next'],
    createdAt: gh.updated_at,
    lastReviewedAt: 'Ready for AI review',
  };
}

/**
 * Fetches all repositories for the logged-in student:
 * 1. Using GitHub Provider OAuth Token from Supabase session (both public + private)
 * 2. Fallback using GitHub username from user_metadata (public repos)
 * 3. Fallback from local storage or mock starter repos
 */
export async function fetchStudentGithubRepositories(
  user: User | null,
  session: Session | null,
  _legacyUnusedParam?: string
): Promise<{ repos: Repository[]; rawCount: number; error: string | null; githubLinked?: boolean }> {
  try {
    // 1. Try our server-side secure repository endpoint (which uses AES-256 decrypted tokens)
    if (typeof window !== 'undefined') {
      try {
        const apiRes = await fetch('/api/repositories');
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.githubLinked && apiData.tokenValid && Array.isArray(apiData.repos) && apiData.repos.length > 0) {
            const mapped = apiData.repos.map((item: GitHubRepoItem) => mapGitHubToRepository(item));
            try {
              localStorage.setItem('codepilot_student_repos', JSON.stringify(mapped));
            } catch {}
            return {
              repos: mapped,
              rawCount: mapped.length,
              error: null,
              githubLinked: true,
            };
          }
        }
      } catch (apiErr) {
        console.warn('api/repositories fetch fallback:', apiErr);
      }
    }

    // 2. Check for OAuth provider_token in Supabase session
    const providerToken = session?.provider_token || 
                          (typeof window !== 'undefined' ? localStorage.getItem('codepilot_gh_token') : null);

    const username = user?.user_metadata?.user_name || 
                     user?.user_metadata?.preferred_username ||
                     (user?.app_metadata?.provider === 'github' ? user?.email?.split('@')[0] : null);

    let apiUrl = '';
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (providerToken) {
      // Authenticated endpoint returning all private and public repos
      apiUrl = 'https://api.github.com/user/repos?sort=updated&per_page=50&type=all';
      headers['Authorization'] = `Bearer ${providerToken}`;
    } else if (username) {
      // Public user repositories endpoint
      apiUrl = `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=50`;
    } else {
      // Return cached or fallback repos if no user is connected
      const cached = getCachedRepositories();
      return { repos: cached, rawCount: cached.length, error: null };
    }

    const res = await fetch(apiUrl, { headers });
    
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson.message || `GitHub API responded with status ${res.status}`;
      console.warn('GitHub fetch warning:', msg);
      const cached = getCachedRepositories();
      return { repos: cached, rawCount: cached.length, error: msg };
    }

    const data: GitHubRepoItem[] = await res.json();
    if (!Array.isArray(data)) {
      const cached = getCachedRepositories();
      return { repos: cached, rawCount: cached.length, error: 'Unexpected response format from GitHub' };
    }

    const mapped = data.map((item) => mapGitHubToRepository(item, username || undefined));

    // Cache locally for instant page transitions
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('codepilot_student_repos', JSON.stringify(mapped));
      } catch (e) {
        console.warn('Could not cache repos in localStorage:', e);
      }
    }

    return { repos: mapped, rawCount: data.length, error: null };
  } catch (err: unknown) {
    console.error('Error fetching student GitHub repositories:', err);
    const cached = getCachedRepositories();
    return { repos: cached, rawCount: cached.length, error: (err as Error).message };
  }
}

/**
 * Returns cached repositories from localStorage or fallback starter repos
 */
export function getCachedRepositories(): Repository[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('codepilot_student_repos');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading cached repos:', e);
    }
  }

  // Return empty array when no repositories are connected or cached
  return [];
}

/**
 * Retrieves authored source code files for a given GitHub repository via our server-side proxy
 * (/api/github/files) to avoid browser CORS restrictions on raw.githubusercontent.com.
 */
export async function getRepositorySourceFiles(
  repoName: string,
  repoUrl?: string,
  sessionToken?: string | null,
  owner?: string,
  branch?: string
): Promise<Record<string, string>> {
  const token =
    sessionToken ||
    (typeof window !== 'undefined' ? localStorage.getItem('codepilot_gh_token') : null);

  const effectiveUrl =
    repoUrl ||
    (owner && repoName ? `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}` : undefined);

  if (!effectiveUrl && (!owner || !repoName)) {
    return {};
  }

  try {
    if (typeof window !== 'undefined') {
      const proxyRes = await fetch('/api/github/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: effectiveUrl,
          owner,
          repoName,
          branch,
          token,
        }),
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data?.files && typeof data.files === 'object') {
          return data.files as Record<string, string>;
        }
      }
    }

    return {};
  } catch (err) {
    console.warn(`Failed to fetch source files for ${repoName}:`, err);
    return {};
  }
}
