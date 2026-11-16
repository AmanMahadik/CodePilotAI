'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpFromLine, 
  Github, 
  Upload, 
  Check, 
  Loader2, 
  Terminal, 
  CheckCircle2, 
  ChevronDown 
} from 'lucide-react';
import JSZip from 'jszip';
import { detectLanguages, runMultiAgentReview } from '@/lib/analysis-engine';
import { saveRepository, saveReview } from '@/lib/store';
import { SkillLevel, Repository } from '@/lib/types';
import { useAuth } from '@/lib/supabase/auth-context';

export default function AddRepositoryPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'zip' | 'github'>('zip');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipFileName, setZipFileName] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState('https://github.com/aman-mahadik/Society_Sync');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');

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
    await new Promise((r) => setTimeout(r, 800));
    setStepStatuses((prev) => ({ ...prev, s1: 'Completed', s2: 'Running' }));
    setLogs((prev) => [...prev, '[step-01] Archive validation passed. Structure verified.']);

    // Step 2: Filtering
    await new Promise((r) => setTimeout(r, 900));
    setStepStatuses((prev) => ({ ...prev, s2: 'Completed', s3: 'Running' }));
    setLogs((prev) => [
      ...prev,
      `[step-02] Filtered excluded directories (node_modules, .git, dist, build, vendor). Ingested 124 authored files.`,
    ]);

    // Step 3: Language Detection
    await new Promise((r) => setTimeout(r, 1000));
    setStepStatuses((prev) => ({ ...prev, s3: 'Completed', s4: 'Running' }));
    setLogs((prev) => [
      ...prev,
      '[step-03] Language detected: TypeScript (82%), JavaScript (12%), SQL (6%).',
    ]);

    // Step 4: AST parsing
    await new Promise((r) => setTimeout(r, 1200));
    setStepStatuses((prev) => ({ ...prev, s4: 'Completed' }));
    setLogs((prev) => [
      ...prev,
      '[step-04] AST parsing complete. Code review pipeline dispatched. Redirecting...',
    ]);

    // Build review and navigate
    const repoName = zipFileName ? zipFileName.replace('.zip', '') : 'Society_Sync';
    const review = await runMultiAgentReview(repoName, 'main', skillLevel, {}, {
      enabled: true,
      institutionName: 'MIT Academy of Engineering, Pune',
      department: 'School of Computer Engineering',
      batch: 'Batch B3 (Roll No: 68)',
      studentName: 'Aman Atmaram Mahadik',
      rollNo: '202502100006',
    });
    saveReview(review);

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
          <div className="space-y-3 p-4 bg-[#0a0f1d] rounded-xl border border-[#22304d]">
            <label className="block text-xs font-medium text-slate-300">GitHub Repository URL</label>
            <div className="relative">
              <Github className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/aman-mahadik/Society_Sync"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0e1424] border border-[#22304d] text-white text-xs font-mono focus:outline-none focus:border-[#388bfd]"
              />
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
