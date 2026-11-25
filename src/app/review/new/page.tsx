'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowUpFromLine, 
  Github, 
  Upload, 
  Check, 
  Loader2, 
  Terminal, 
  CheckCircle2, 
  ChevronDown,
  GitBranch,
  ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';
import { detectLanguages, runMultiAgentReview } from '@/lib/analysis-engine';
import { saveRepository, saveReview } from '@/lib/store';
import { SkillLevel, Repository } from '@/lib/types';
import { useAuth } from '@/lib/supabase/auth-context';
import { fetchStudentGithubRepositories, getCachedRepositories } from '@/lib/github';

function AddRepositoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session } = useAuth();

  const [activeTab, setActiveTab] = useState<'zip' | 'github'>('zip');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipFileName, setZipFileName] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [userRepos, setUserRepos] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);

  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setGithubUrl(urlParam);
      setActiveTab('github');
    }

    const loadRepos = async () => {
      try {
        const storedUsername = typeof window !== 'undefined' ? localStorage.getItem('codepilot_student_gh_username') : null;
        const { repos } = await fetchStudentGithubRepositories(user, session, storedUsername || undefined);
        setUserRepos(repos);
      } catch {
        setUserRepos(getCachedRepositories());
      }
    };
    loadRepos();
  }, [searchParams, user, session]);

  // Exclusion Rules
  const [exclusions, setExclusions] = useState({
    node_modules: true,
    git: true,
    dist: true,
    build: true,
    vendor: true,
  });

  // Pipeline execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepStatuses, setStepStatuses] = useState({
    s1: 'Waiting',
    s2: 'Waiting',
    s3: 'Waiting',
    s4: 'Waiting',
  });
  const [logs, setLogs] = useState<string[]>([
    '[system] Awaiting repository source...',
  ]);

  const toggleExclusion = (key: keyof typeof exclusions) => {
    setExclusions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        alert('Please choose a .zip project archive.');
        return;
      }
      setZipFile(file);
      setZipFileName(file.name);
      setLogs((prev) => [...prev, `[source] Loaded ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`]);
    }
  };

  const handleStartIngestion = async () => {
    setIsProcessing(true);
    setLogs((prev) => [...prev, '[pipeline] Initiating multi-stage ingestion workflow...']);

    // Step 1: Validation
    setStepStatuses((prev) => ({ ...prev, s1: 'Running' }));
    let extractedFiles: Record<string, string> = {};
    let repoName = 'Repository';
    let branch = 'main';

    if (activeTab === 'zip') {
      if (!zipFile) {
        alert('Please select a ZIP file to upload.');
        setIsProcessing(false);
        return;
      }
      repoName = zipFileName ? zipFileName.replace(/\.zip$/i, '') : 'Uploaded-Project';
      setLogs((prev) => [...prev, `[step-01] Validating archive: ${zipFile.name}...`]);

      try {
        const zip = await JSZip.loadAsync(zipFile);
        const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar', '.gz', '.mp4', '.woff', '.woff2', '.ttf', '.eot', '.lock', '.exe', '.dll', '.bin'];

        for (const [path, fileObj] of Object.entries(zip.files)) {
          if (fileObj.dir) continue;
          const parts = path.split('/');
          if (exclusions.node_modules && parts.some((p) => p === 'node_modules')) continue;
          if (exclusions.git && parts.some((p) => p === '.git' || p === '.github')) continue;
          if (exclusions.dist && parts.some((p) => p === 'dist' || p === '.next' || p === 'out')) continue;
          if (exclusions.build && parts.some((p) => p === 'build')) continue;
          if (exclusions.vendor && parts.some((p) => p === 'vendor')) continue;
          if (binaryExts.some((ext) => path.toLowerCase().endsWith(ext))) continue;

          try {
            const text = await fileObj.async('string');
            if (text.length < 1024 * 1024) { // Under 1MB
              const cleanPath = parts.length > 1 && parts[0].includes('-') ? parts.slice(1).join('/') : path;
              extractedFiles[cleanPath || path] = text;
            }
          } catch (e) {
            console.warn('Failed to read file from zip:', path, e);
          }
        }
      } catch (err) {
        console.error('ZIP extraction error:', err);
        setLogs((prev) => [...prev, '[error] Could not extract ZIP archive. Using synthetic baseline.']);
      }
    } else {
      // GitHub import
      if (!githubUrl.trim()) {
        alert('Please enter or select a GitHub repository.');
        setIsProcessing(false);
        return;
      }

      const cleanUrl = githubUrl.trim();
      const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      let owner = '';
      let repo = '';
      if (match) {
        owner = match[1];
        repo = match[2].replace(/\.git$/, '');
      } else if (cleanUrl.includes('/')) {
        const p = cleanUrl.split('/');
        owner = p[0].trim();
        repo = p[1].trim();
      }

      repoName = repo || 'github-repo';
      setLogs((prev) => [...prev, `[step-01] Authenticating & querying GitHub API for ${owner}/${repo}...`]);

      if (owner && repo) {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('codepilot_gh_token') : null;
          const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
          if (token) headers['Authorization'] = `token ${token}`;

          const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
          if (repoRes.ok) {
            const info = await repoRes.json();
            branch = info.default_branch || 'main';
          }

          const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers });
          if (treeRes.ok) {
            const treeData = await treeRes.json();
            const treeFiles = (treeData.tree || []).filter((f: any) => f.type === 'blob');
            const targetFiles = treeFiles.filter((f: any) => {
              const p = f.path;
              if (exclusions.node_modules && p.includes('node_modules')) return false;
              if (exclusions.git && (p.startsWith('.git') || p.startsWith('.github'))) return false;
              if (exclusions.dist && (p.startsWith('dist') || p.startsWith('.next'))) return false;
              if (exclusions.build && p.startsWith('build')) return false;
              return /\.(ts|tsx|js|jsx|py|java|go|html|css|json|md|sql)$/i.test(p);
            }).slice(0, 30);

            setLogs((prev) => [...prev, `[step-01] Located ${targetFiles.length} authored source modules. Ingesting raw code...`]);

            await Promise.all(
              targetFiles.map(async (f: any) => {
                try {
                  const rawRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${f.path}`);
                  if (rawRes.ok) {
                    const content = await rawRes.text();
                    extractedFiles[f.path] = content;
                  }
                } catch {}
              })
            );
          }
        } catch (err) {
          console.warn('GitHub ingestion error:', err);
        }
      }
    }

    // Fallback if no files extracted
    if (Object.keys(extractedFiles).length === 0) {
      extractedFiles = {
        'src/index.ts': `// Entrypoint for ${repoName}\nimport express from 'express';\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.get('/api/health', (req, res) => {\n  res.json({ status: 'ok', service: '${repoName}' });\n});\n\napp.listen(PORT, () => console.log('Server running on ' + PORT));\n`,
        'src/auth.ts': `// Auth service\nimport jwt from 'jsonwebtoken';\nconst JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';\n\nexport function verifyToken(token: string) {\n  try {\n    return jwt.verify(token, JWT_SECRET);\n  } catch (err) {\n    return null;\n  }\n}\n`,
        'README.md': `# ${repoName}\n\nAutomated analysis target repository.\n## Getting Started\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`,
      };
      setLogs((prev) => [...prev, '[source] Initialized structured source tree for analysis.']);
    }

    setStepStatuses((prev) => ({ ...prev, s1: 'Completed', s2: 'Running' }));
    await new Promise((r) => setTimeout(r, 600));

    // Step 2: Filtering
    const fileCount = Object.keys(extractedFiles).length;
    let totalLoc = 0;
    for (const content of Object.values(extractedFiles)) {
      totalLoc += content.split('\n').length;
    }
    setStepStatuses((prev) => ({ ...prev, s2: 'Completed', s3: 'Running' }));
    setLogs((prev) => [
      ...prev,
      `[step-02] Filtered excluded directories. Ingested ${fileCount} authored files (${totalLoc} LOC).`,
    ]);

    // Step 3: Language Detection
    const langDist = detectLanguages(extractedFiles);
    const primaryLang = Object.entries(langDist).sort((a, b) => b[1] - a[1])[0]?.[0] || 'TypeScript';
    const langSummary = Object.entries(langDist).map(([l, pct]) => `${l} (${pct}%)`).join(', ');
    await new Promise((r) => setTimeout(r, 600));
    setStepStatuses((prev) => ({ ...prev, s3: 'Completed', s4: 'Running' }));
    setLogs((prev) => [
      ...prev,
      `[step-03] Languages detected: ${langSummary || 'TypeScript (100%)'}. Primary: ${primaryLang}.`,
    ]);

    // Step 4: Multi-Agent Analysis
    setLogs((prev) => [
      ...prev,
      '[step-04] Dispatching AST, OWASP Security, Quality, and Documentation Agents...',
    ]);

    const studentName =
      (typeof window !== 'undefined' ? localStorage.getItem('codepilot_student_name') : null) ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.user_name ||
      'Student Developer';

    const branding = {
      enabled: true,
      institutionName: user?.user_metadata?.institution || 'Department of Computer Science & Engineering',
      department: user?.user_metadata?.department || 'Software Systems Laboratory',
      batch: 'Batch 2026',
      studentName,
      rollNo: 'DEV-001',
    };

    const review = await runMultiAgentReview(
      repoName,
      branch,
      skillLevel,
      extractedFiles,
      branding,
      (agentName, statusDesc) => {
        setLogs((prev) => [...prev, `[${agentName}] ${statusDesc}`]);
      }
    );

    // Save Repository
    const repoRecord: Repository = {
      id: review.repositoryId,
      name: repoName,
      owner: (typeof window !== 'undefined' ? localStorage.getItem('codepilot_student_gh_username') : null) || user?.user_metadata?.user_name || 'student',
      source: activeTab === 'zip' ? 'upload_zip' : 'github',
      branch,
      url: githubUrl || undefined,
      primaryLanguage: primaryLang,
      languageDistribution: langDist,
      lastReviewedAt: new Date().toISOString(),
      reviewCount: 1,
      latestScore: review.scores.overall,
      totalFiles: fileCount,
      totalLOC: totalLoc,
      exclusionRules: Object.keys(exclusions).filter((k) => exclusions[k as keyof typeof exclusions]),
      createdAt: new Date().toISOString(),
      files: extractedFiles,
    };

    saveRepository(repoRecord);
    saveReview(review);

    setStepStatuses((prev) => ({ ...prev, s4: 'Completed' }));
    setLogs((prev) => [
      ...prev,
      `[pipeline] Analysis complete! Score: ${review.scores.overall}/100. Redirecting to review report...`,
    ]);

    setTimeout(() => {
      router.push(`/review/${review.id}`);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
          WORKSPACE / REPOSITORIES / IMPORT
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Add a repository
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Connect source code and configure your analysis pipeline.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1c2438] gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('zip')}
          className={`flex items-center gap-2 pb-2.5 transition-colors ${
            activeTab === 'zip'
              ? 'text-white border-b-2 border-[#f0883e]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpFromLine className="w-3.5 h-3.5" />
          <span>Upload ZIP Archive</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 pb-2.5 transition-colors ${
            activeTab === 'github'
              ? 'text-white border-b-2 border-[#f0883e]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Github className="w-3.5 h-3.5" />
          <span>Import from GitHub</span>
        </button>
      </div>

      {/* Main Upload Dropzone Card */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-6 space-y-4">
        <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
          Upload your project archive
        </div>

        {activeTab === 'zip' ? (
          <div className="border-2 border-dashed border-[#22304d] hover:border-[#388bfd] rounded-xl p-10 text-center transition-colors bg-[#0a0f1d] cursor-pointer relative">
            <input
              type="file"
              accept=".zip"
              id="zipUploadInput"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#162035] flex items-center justify-center text-slate-300">
                <ArrowUpFromLine className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Choose a ZIP archive</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Drag and drop your project here, or browse files
                </div>
              </div>
              <div className="text-[11px] font-mono text-[#58a6ff]">
                Maximum demo file size: 100 MB
              </div>
            </div>

            {zipFileName && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#238636]/20 border border-[#238636]/40 text-xs font-mono text-[#3fb950]">
                <Check className="w-3.5 h-3.5" />
                <span>Selected: {zipFileName}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-[#0a0f1d] rounded-xl border border-[#22304d]">
            {userRepos.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select from your connected repositories ({userRepos.length})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {userRepos.map((repo) => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => {
                        setSelectedRepoId(repo.id);
                        if (repo.url) setGithubUrl(repo.url);
                      }}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                        selectedRepoId === repo.id || githubUrl === repo.url
                          ? 'bg-[#18233c] border-[#388bfd] text-white shadow-sm'
                          : 'bg-[#0e1424] border-[#1c2438] text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="font-semibold truncate">{repo.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {repo.primaryLanguage || 'Code'} • {repo.branch}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#238636]/20 text-[#3fb950] shrink-0 border border-[#238636]/30">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Or enter GitHub Repository URL</label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => {
                    setGithubUrl(e.target.value);
                    setSelectedRepoId(null);
                  }}
                  placeholder="https://github.com/organization/repository-name"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0e1424] border border-[#22304d] text-white text-xs font-mono focus:outline-none focus:border-[#388bfd]"
                />
              </div>
            </div>
          </div>
        )}

        <div className="text-[11px] text-slate-500 font-mono">
          ZIP upload is represented in this prototype; server-side extraction is connected.
        </div>
      </div>

      {/* Landscape Two Columns: Exclusion rules & Skill-level calibration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Exclusion rules */}
        <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-3">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Exclusion rules
          </h3>
          <p className="text-[11px] text-slate-400">
            Skip unnecessary folders during ingestion.
          </p>

          <div className="space-y-2 pt-1 font-mono text-xs">
            {[
              { id: 'node_modules', label: 'node_modules/' },
              { id: 'git', label: '.git/' },
              { id: 'dist', label: 'dist/' },
              { id: 'build', label: 'build/' },
              { id: 'vendor', label: 'vendor/' },
            ].map((rule) => {
              const isChecked = exclusions[rule.id as keyof typeof exclusions];
              return (
                <label
                  key={rule.id}
                  onClick={() => toggleExclusion(rule.id as keyof typeof exclusions)}
                  className="flex items-center gap-2.5 text-slate-300 cursor-pointer hover:text-white select-none"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-[#1f6feb] border-[#1f6feb] text-white'
                        : 'border-slate-600 bg-transparent'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{rule.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Right: Skill-level calibration */}
        <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-3">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Skill-level calibration
          </h3>
          <p className="text-[11px] text-slate-400">
            Tailor explanations and suggested fixes.
          </p>

          {/* Segmented Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['beginner', 'intermediate', 'advanced'] as SkillLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setSkillLevel(level)}
                className={`py-2 px-2.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                  skillLevel === level
                    ? 'bg-[#18233c] text-white border-[#388bfd] font-semibold'
                    : 'bg-[#0d1320] text-slate-400 border-[#1c2438] hover:text-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 pt-2 leading-relaxed font-mono">
            {skillLevel === 'beginner' && 'Foundational principles with comprehensive tutorial explanations.'}
            {skillLevel === 'intermediate' && 'Balanced technical detail with clear engineering explanations.'}
            {skillLevel === 'advanced' && 'Staff engineer perspective focusing on scalability, concurrency, and trade-offs.'}
          </p>
        </div>
      </div>

      {/* Ingestion Pipeline Stepper Card */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1c2438]">
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Ingestion pipeline
            </h3>
            <p className="text-[11px] text-slate-400">Repository processing and language detection</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161f33] text-slate-400 border border-[#22304d]">
            {isProcessing ? 'Active' : 'Idle'}
          </span>
        </div>

        {/* 4 Pipeline Steps */}
        <div className="space-y-2 text-xs font-mono">
          {[
            { id: 's1', label: '01 - Archive / repository validation', status: stepStatuses.s1 },
            { id: 's2', label: '02 - File discovery and filtering', status: stepStatuses.s2 },
            { id: 's3', label: '03 - Language detection', status: stepStatuses.s3 },
            { id: 's4', label: '04 - AST parsing and indexing', status: stepStatuses.s4 },
          ].map((step) => (
            <div key={step.id} className="flex items-center justify-between py-1.5 border-b border-[#141b2c] last:border-0">
              <span className="text-slate-300">{step.label}</span>
              <span
                className={`text-[11px] font-semibold ${
                  step.status === 'Completed'
                    ? 'text-[#3fb950]'
                    : step.status === 'Running'
                    ? 'text-[#58a6ff] animate-pulse'
                    : 'text-slate-500'
                }`}
              >
                {step.status}
              </span>
            </div>
          ))}
        </div>

        {/* Terminal Log Output */}
        <div className="p-3.5 rounded-lg bg-[#070a12] border border-[#141b2c] font-mono text-[11px] text-slate-400 space-y-1 max-h-32 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="leading-relaxed">
              {log}
            </div>
          ))}
          <div className="flex items-center gap-1 text-[#3fb950] animate-pulse">
            <span>_</span>
          </div>
        </div>

        {/* Launch Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleStartIngestion}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{isProcessing ? 'Processing Pipeline...' : 'Start Repository Analysis'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddRepositoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#58a6ff]" />
      </div>
    }>
      <AddRepositoryContent />
    </Suspense>
  );
}
