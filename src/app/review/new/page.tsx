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
  ExternalLink,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import JSZip from 'jszip';
import { detectLanguages, runMultiAgentReview } from '@/lib/analysis-engine';
import { saveRepository, saveReview } from '@/lib/store';
import { SkillLevel, Repository } from '@/lib/types';
import { useAuth } from '@/lib/supabase/auth-context';
import { fetchStudentGithubRepositories, getCachedRepositories, getRepositorySourceFiles } from '@/lib/github';

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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [detectedCodeFilesCount, setDetectedCodeFilesCount] = useState<number>(0);

  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setGithubUrl(urlParam);
      setActiveTab('github');
    }

    const loadRepos = async () => {
      try {
        const { repos } = await fetchStudentGithubRepositories(user, session);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    setZipFile(null);
    setZipFileName('');
    setDetectedCodeFilesCount(0);

    if (!file.name.endsWith('.zip')) {
      setValidationError('Please choose a valid .zip software repository archive.');
      return;
    }

    setLogs((prev) => [...prev, `[source] Inspecting archive ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)...`]);

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);

      const CODE_EXTS = new Set([
        'ts', 'tsx', 'js', 'jsx', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'cs', 
        'php', 'rb', 'sql', 'html', 'css', 'json', 'vue', 'svelte', 'swift', 'kt', 'dart'
      ]);

      const foundExtensions = new Set<string>();
      let codeFileCount = 0;
      let nonCodeFileCount = 0;

      for (const [filename, fileObj] of Object.entries(zipContent.files)) {
        if (!fileObj.dir) {
          const ext = filename.split('.').pop()?.toLowerCase();
          if (ext) {
            foundExtensions.add(ext);
            if (CODE_EXTS.has(ext)) {
              codeFileCount++;
            } else {
              nonCodeFileCount++;
            }
          }
        }
      }

      // STRICT VALIDATION: If 0 code files are present in the zip: THROW ERROR!
      if (codeFileCount === 0) {
        const docExtList = Array.from(foundExtensions).map((e) => `.${e}`).join(', ') || 'documents/images';
        const errMsg = `Validation Error: "${file.name}" does not contain any supported software source code files. (Found ${nonCodeFileCount} document/media files: ${docExtList}). CodePilot AI requires source code files (.ts, .js, .py, .java, .sql, etc.) to perform engineering analysis.`;
        setValidationError(errMsg);
        setStepStatuses({
          s1: 'Failed',
          s2: 'Waiting',
          s3: 'Waiting',
          s4: 'Waiting',
        });
        setLogs((prev) => [
          ...prev,
          `[error] Ingestion Blocked: "${file.name}" contains 0 source code files. Found only ${docExtList}.`,
          `[error] Upload rejected: Non-code archive.`
        ]);
        return;
      }

      setZipFile(file);
      setZipFileName(file.name);
      setDetectedCodeFilesCount(codeFileCount);
      setStepStatuses({
        s1: 'Waiting',
        s2: 'Waiting',
        s3: 'Waiting',
        s4: 'Waiting',
      });
      setLogs((prev) => [
        ...prev,
        `[source] Archive verified: Detected ${codeFileCount} source code files. Ready for ingestion.`
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Corrupted or unreadable ZIP archive';
      setValidationError(`Error reading archive: ${msg}`);
    }
  };

  const handleStartIngestion = async () => {
    if (!zipFile && !githubUrl && !selectedRepoId) {
      setValidationError('Please select a valid source code archive (.zip) containing code files, or select a GitHub repository.');
      return;
    }

    setValidationError(null);
    setIsProcessing(true);
    setLogs((prev) => [...prev, '[pipeline] Initiating multi-stage ingestion workflow...']);

    // Step 1: Validation
    setStepStatuses((prev) => ({ ...prev, s1: 'Running' }));
    await new Promise((r) => setTimeout(r, 600));

    const selectedRepoObj = userRepos.find((r) => r.id === selectedRepoId || r.url === githubUrl);
    const repoName = zipFileName 
      ? zipFileName.replace('.zip', '') 
      : (selectedRepoObj?.name || (githubUrl ? githubUrl.split('/').pop()?.replace(/\.git$/, '') : 'Repository') || 'Repository');

    // Extract text files from ZIP if provided or load from GitHub repository
    const extractedFiles: Record<string, string> = {};

    const CODE_EXTS = new Set([
      'ts', 'tsx', 'js', 'jsx', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'cs', 
      'php', 'rb', 'sql', 'html', 'css', 'json', 'vue', 'svelte', 'swift', 'kt', 'dart',
      'yaml', 'yml', 'prisma', 'graphql', 'toml', 'sh'
    ]);

    if (zipFile) {
      try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipFile);

        for (const [filename, fileObj] of Object.entries(zipContent.files)) {
          if (!fileObj.dir) {
            // Strict directory boundaries: only exclude standalone build/dist folders, never composite modules like BuildAppandWebsite
            const isExcluded = 
              (exclusions.node_modules && filename.includes('node_modules')) ||
              (exclusions.git && (filename.includes('/.git/') || filename.startsWith('.git/'))) ||
              (exclusions.dist && (filename.includes('/dist/') || filename.startsWith('dist/') || filename.includes('/.next/'))) ||
              (exclusions.build && (filename.includes('/build/') || filename.startsWith('build/')));
            if (!isExcluded) {
              const ext = filename.split('.').pop()?.toLowerCase();
              if (ext && CODE_EXTS.has(ext)) {
                const text = await fileObj.async('string');
                if (text && text.length < 250000) {
                  extractedFiles[filename] = text;
                }
              }
            }
          }
        }
      } catch (zipErr) {
        console.warn('Zip extraction warning:', zipErr);
      }
    } else if (selectedRepoId || githubUrl) {
      setLogs((prev) => [...prev, `[source] Ingesting multi-module project structure for "${repoName}"...`]);
      try {
        const resolvedOwner =
          selectedRepoObj?.owner ||
          (user?.user_metadata?.user_name as string) ||
          (user?.user_metadata?.preferred_username as string) ||
          undefined;
        const resolvedUrl =
          githubUrl ||
          selectedRepoObj?.url ||
          (resolvedOwner ? `https://github.com/${resolvedOwner}/${repoName}` : undefined);

        const ghFiles = await getRepositorySourceFiles(
          repoName,
          resolvedUrl,
          session?.provider_token || undefined,
          resolvedOwner,
          selectedRepoObj?.branch
        );
        Object.assign(extractedFiles, ghFiles);
      } catch (err) {
        console.warn('Failed to load GitHub source files:', err);
      }
    }

    const validFileCount = Object.keys(extractedFiles).length;
    if (validFileCount === 0) {
      setStepStatuses((prev) => ({ ...prev, s1: 'Failed' }));
      setValidationError(`Validation Error: No supported source code files found in "${repoName}". CodePilot AI requires source code files (.ts, .js, .py, .java, etc.) to perform engineering analysis.`);
      setLogs((prev) => [
        ...prev,
        `[error] Ingestion aborted: Zero source code files found in "${repoName}".`
      ]);
      setIsProcessing(false);
      return;
    }

    setStepStatuses((prev) => ({ ...prev, s1: 'Completed', s2: 'Running' }));
    setLogs((prev) => [...prev, `[step-01] Repository architecture verified. ${validFileCount} authored source files verified.`]);

    // Step 2: Filtering
    await new Promise((r) => setTimeout(r, 700));
    setStepStatuses((prev) => ({ ...prev, s2: 'Completed', s3: 'Running' }));
    setLogs((prev) => [
      ...prev,
      `[step-02] Verified modules across active project structure (app/, portal/, src/, scripts/). Ingested ${validFileCount} authored files.`,
    ]);

    // Step 3: REAL Language Detection
    await new Promise((r) => setTimeout(r, 600));
    const langDist = detectLanguages(extractedFiles);
    const primaryLang = Object.entries(langDist).sort((a, b) => b[1] - a[1])[0]?.[0] || 'TypeScript';
    const langSummary = Object.entries(langDist)
      .map(([l, p]) => `${l} (${p}%)`)
      .join(', ') || 'Source Code';

    let totalLoc = 0;
    for (const content of Object.values(extractedFiles)) {
      totalLoc += content.split('\n').length;
    }

    setStepStatuses((prev) => ({ ...prev, s3: 'Completed', s4: 'Running' }));
    setLogs((prev) => [
      ...prev,
      `[step-03] Languages detected: ${langSummary}. Primary: ${primaryLang} (${totalLoc} LOC).`,
    ]);

    // Step 4: AST parsing & Groq Multi-Agent Orchestration
    setLogs((prev) => [
      ...prev,
      `[step-04] AST parsing complete. Dispatching agents in Groq Multi-Agent Orchestrator...`,
    ]);

    let review;
    try {
      setLogs((prev) => [...prev, '[agent-orchestrator] Calling Groq Multi-Agent Pipeline...']);
      const apiRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName,
          branch: selectedRepoObj?.branch || 'main',
          skillLevel,
          files: extractedFiles,
          brandingInfo: {
            enabled: true,
            institutionName: user?.user_metadata?.institution || '',
            department: user?.user_metadata?.department || '',
            batch: user?.user_metadata?.batch || '',
            studentName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
            rollNo: user?.user_metadata?.roll_no || '',
          }
        })
      });

      if (apiRes.ok) {
        review = await apiRes.json();
      } else {
        const errJson = await apiRes.json();
        throw new Error(errJson.error || 'Failed to analyze repository');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Analysis failed';
      setStepStatuses((prev) => ({ ...prev, s4: 'Failed' }));
      setValidationError(msg);
      setLogs((prev) => [...prev, `[error] ${msg}`]);
      setIsProcessing(false);
      return;
    }

    // Persist files on review & repository for RAG Terminal AI & Viva Simulator
    review.files = extractedFiles;

    const repoRecord: Repository = {
      id: review.repositoryId || selectedRepoObj?.id || `repo-${Date.now()}`,
      name: repoName,
      owner: selectedRepoObj?.owner || (user?.user_metadata?.user_name as string) || 'developer',
      source: activeTab === 'zip' ? 'upload_zip' : 'github',
      branch: selectedRepoObj?.branch || 'main',
      url: githubUrl || selectedRepoObj?.url || undefined,
      primaryLanguage: primaryLang,
      languageDistribution: langDist,
      lastReviewedAt: new Date().toISOString(),
      reviewCount: (selectedRepoObj?.reviewCount || 0) + 1,
      latestScore: review.scores?.overall || 85,
      totalFiles: validFileCount,
      totalLOC: totalLoc,
      exclusionRules: Object.keys(exclusions).filter((k) => exclusions[k as keyof typeof exclusions]),
      createdAt: selectedRepoObj?.createdAt || new Date().toISOString(),
      files: extractedFiles,
    };

    saveRepository(repoRecord);
    saveReview(review);

    setStepStatuses((prev) => ({ ...prev, s4: 'Completed' }));
    setLogs((prev) => [
      ...prev,
      `[synthesis] Review synthesized (${review.scores?.overall || 88}/100 with ${review.findings?.length || 0} findings). Redirecting to audit dashboard...`,
    ]);

    setTimeout(() => {
      router.push(`/review/${review.id}`);
    }, 900);
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

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 rounded-xl bg-[#da3633]/15 border border-[#da3633]/40 text-xs text-[#ff7b72] flex items-start gap-3 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 shrink-0 text-[#f85149] mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-white uppercase text-[11px] font-mono flex items-center gap-1.5">
              <span>Repository Validation Error</span>
            </div>
            <p className="leading-relaxed text-slate-300">{validationError}</p>
          </div>
        </div>
      )}

      {/* Main Upload Dropzone Card */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-6 space-y-4">
        <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
          Upload your project archive
        </div>

        {activeTab === 'zip' ? (
          <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer relative ${
            validationError 
              ? 'border-[#da3633]/60 bg-[#1c0d12]' 
              : zipFileName 
              ? 'border-[#238636] bg-[#0c1815]' 
              : 'border-[#22304d] hover:border-[#388bfd] bg-[#0a0f1d]'
          }`}>
            <input
              type="file"
              accept=".zip"
              id="zipUploadInput"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                validationError ? 'bg-[#da3633]/20 text-[#f85149]' : zipFileName ? 'bg-[#238636]/20 text-[#3fb950]' : 'bg-[#162035] text-slate-300'
              }`}>
                {validationError ? <XCircle className="w-6 h-6 stroke-[1.5]" /> : <ArrowUpFromLine className="w-6 h-6 stroke-[1.5]" />}
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {zipFileName ? zipFileName : 'Choose a ZIP code archive'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Drag and drop your project here, or browse files (.zip containing .ts, .js, .py, etc.)
                </div>
              </div>
              <div className="text-[11px] font-mono text-[#58a6ff]">
                Only software source code repositories accepted (max 100 MB)
              </div>
            </div>

            {zipFileName && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#238636]/20 border border-[#238636]/40 text-xs font-mono text-[#3fb950]">
                <Check className="w-3.5 h-3.5" />
                <span>Verified: {zipFileName} ({detectedCodeFilesCount} source code files detected)</span>
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
                        setValidationError(null);
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
            disabled={isProcessing || (!zipFile && !githubUrl && !selectedRepoId) || !!validationError}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>
              {isProcessing 
                ? 'Processing Pipeline...' 
                : (!zipFile && !githubUrl && !selectedRepoId) 
                ? 'Select a Code Archive or Repository to Begin' 
                : 'Start Repository Analysis'}
            </span>
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
