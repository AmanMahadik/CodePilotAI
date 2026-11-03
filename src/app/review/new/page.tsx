'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  Github, 
  FileCode, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Layers, 
  Settings2,
  Bot,
  ArrowRight
} from 'lucide-react';
import JSZip from 'jszip';
import { detectLanguages, runMultiAgentReview } from '@/lib/analysis-engine';
import { saveRepository, saveReview } from '@/lib/store';
import { SkillLevel, Repository } from '@/lib/types';
import { useAuth } from '@/lib/supabase/auth-context';

export default function NewReviewPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'upload' | 'github'>('upload');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipFileName, setZipFileName] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState('https://github.com/aman-mahadik/ecommerce-microservices');
  const [branch, setBranch] = useState('main');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [exclusionRules, setExclusionRules] = useState('node_modules, .git, dist, build, .next, *.log, *.bin');

  // Parsing & Analysis State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [detectedLangs, setDetectedLangs] = useState<{ primary: string; distribution: Record<string, number> } | null>(null);
  const [fileCount, setFileCount] = useState<number>(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        alert('Please upload a .zip archive of your project repository.');
        return;
      }
      setZipFile(file);
      setZipFileName(file.name);

      // Pre-scan ZIP using JSZip
      try {
        const zip = await JSZip.loadAsync(file);
        const paths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);
        setFileCount(paths.length);
        const langs = detectLanguages(paths);
        setDetectedLangs(langs);
      } catch (err) {
        console.error('Error pre-reading zip:', err);
      }
    }
  };

  const handleStartReview = async () => {
    setIsProcessing(true);
    setProgressPercent(10);
    setCurrentStep('Ingesting repository files and applying exclusion rules (FR-045)...');

    const filesContent: Record<string, string> = {};
    const repoName = activeTab === 'upload' 
      ? (zipFileName.replace('.zip', '') || 'uploaded-project') 
      : (githubUrl.split('/').pop()?.replace('.git', '') || 'github-repo');

    if (activeTab === 'upload' && zipFile) {
      try {
        const zip = await JSZip.loadAsync(zipFile);
        const exclusions = exclusionRules.split(',').map((s) => s.trim().toLowerCase());

        let count = 0;
        for (const [path, entry] of Object.entries(zip.files)) {
          if (entry.dir) continue;
          const isExcluded = exclusions.some((rule) => path.toLowerCase().includes(rule.replace('*', '')));
          if (isExcluded) continue;

          // Exclude large binary extensions (FR-041)
          const ext = path.split('.').pop()?.toLowerCase();
          if (['png', 'jpg', 'jpeg', 'gif', 'zip', 'tar', 'exe', 'dll', 'so', 'bin', 'woff', 'ttf'].includes(ext || '')) {
            continue;
          }

          if (count < 60) {
            try {
              const text = await entry.async('string');
              filesContent[path] = text;
              count++;
            } catch (e) {
              // Ignore binary read failures
            }
          }
        }
      } catch (err) {
        console.error('ZIP extraction error:', err);
      }
    } else {
      // Simulate/populate representative files for GitHub ingestion (FR-043)
      filesContent['src/middleware/auth.ts'] = `import jwt from 'jsonwebtoken';
export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  const secret = process.env.JWT_SECRET || "SUPER_SECRET_DEFAULT_KEY_12345";
  const decoded = jwt.verify(token, secret);
  req.user = decoded;
  next();
}`;
      filesContent['src/controllers/product.controller.ts'] = `import { prisma } from '../lib/prisma';
export async function getProducts(req, res) {
  const { category } = req.query;
  const products = await prisma.$queryRawUnsafe(
    \`SELECT * FROM products WHERE category = '\${category}' AND is_active = true\`
  );
  res.json({ products });
}`;
      filesContent['src/services/order.service.ts'] = `export async function processOrderItems(items, orderId) {
  items.forEach(async (item) => {
    await inventoryService.reserveStock(item.id, item.quantity);
  });
  return { success: true };
}`;
      filesContent['package.json'] = `{
  "name": "${repoName}",
  "dependencies": {
    "jsonwebtoken": "^8.5.1"
  }
}`;
    }

    // Step 2: Repository Agent AST & Language Detection (FR-044)
    setTimeout(() => {
      setProgressPercent(35);
      setCurrentStep('Repository Agent: Indexing AST, language distribution & dependencies (FR-044)...');
    }, 1200);

    // Step 3: Review & Quality Agent (FR-071)
    setTimeout(() => {
      setProgressPercent(60);
      setCurrentStep('Review Agent: Evaluating SOLID principles, bug patterns & complexity (FR-171)...');
    }, 2400);

    // Step 4: Security Agent OWASP Scan (FR-191, FR-192)
    setTimeout(() => {
      setProgressPercent(85);
      setCurrentStep('Security Agent: Scanning OWASP Top 10 vulnerabilities & credentials (FR-191)...');
    }, 3600);

    // Step 5: Finalizing Review & Generating Executive Summary
    setTimeout(async () => {
      setProgressPercent(100);
      setCurrentStep('Documentation Agent: Finalizing report and auto-drafting README (FR-151)...');

      const review = await runMultiAgentReview(
        repoName,
        branch,
        skillLevel,
        filesContent,
        {
          enabled: true,
          institutionName: 'MIT Academy of Engineering, Alandi (D.), Pune',
          department: 'Department of Computer Engineering',
          batch: 'Batch B3 (Roll No: 68)',
          studentName: user?.user_metadata?.full_name || 'Aman Atmaram Mahadik',
          rollNo: '202502100006',
        }
      );

      const paths = Object.keys(filesContent);
      const langs = detectLanguages(paths);

      const newRepo: Repository = {
        id: review.repositoryId,
        name: repoName,
        owner: user?.user_metadata?.user_name || 'aman-mahadik',
        source: activeTab === 'upload' ? 'upload_zip' : 'github',
        branch: branch || 'main',
        url: activeTab === 'github' ? githubUrl : undefined,
        primaryLanguage: langs.primary,
        languageDistribution: langs.distribution,
        lastReviewedAt: review.createdAt,
        reviewCount: 1,
        latestScore: review.scores.overall,
        totalFiles: review.totalFilesAnalyzed,
        totalLOC: review.totalLinesOfCode,
        exclusionRules: exclusionRules.split(',').map((s) => s.trim()),
        createdAt: new Date().toISOString(),
      };

      saveRepository(newRepo);
      saveReview(review);

      // Redirect directly to review findings page
      router.push(`/review/${review.id}`);
    }, 4800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Initiate CodePilot AI Review
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
            FR-041 - FR-078
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Upload a project .zip archive or connect your GitHub repository for multi-agent inspection in &lt;60s.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>ZIP Archive Upload (FR-041)</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'github'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Github className="w-4 h-4" />
          <span>GitHub Integration (FR-042, FR-043)</span>
        </button>
      </div>

      {/* Form Content */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        {activeTab === 'upload' ? (
          /* ZIP Upload Dropzone (FR-041) */
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Project Archive (.zip, max 200MB)
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl p-8 text-center transition-colors bg-slate-900/40">
              <input
                type="file"
                id="zipInput"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="zipInput" className="cursor-pointer block space-y-3">
                <div className="w-12 h-12 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/30">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white">Click to browse or drag and drop</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Binary non-code files are automatically excluded per PRD exclusion criteria.
                  </p>
                </div>
                {zipFileName && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-800 text-xs font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Loaded: {zipFileName} ({fileCount} source files detected)</span>
                  </div>
                )}
              </label>
            </div>
          </div>
        ) : (
          /* GitHub Integration (FR-042, FR-043) */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                GitHub Repository URL (Public or OAuth Authorized)
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repository"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Branch to Analyze
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-brand-500"
              />
            </div>
          </div>
        )}

        {/* Configuration Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          {/* Skill-Level Calibration (FR-075) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Skill-Level Calibration (FR-075)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as SkillLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSkillLevel(level)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium capitalize border transition-all ${
                    skillLevel === level
                      ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              {skillLevel === 'beginner' && 'Provides foundational principles, detailed background, and guidance.'}
              {skillLevel === 'intermediate' && 'Standard senior engineer PR review style: concise, actionable, and pragmatic.'}
              {skillLevel === 'advanced' && 'Staff engineer perspective: concurrency, architecture, and threat modeling.'}
            </p>
          </div>

          {/* Configurable Exclusion Rules (FR-045) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Exclusion Rules (FR-045)
            </label>
            <input
              type="text"
              value={exclusionRules}
              onChange={(e) => setExclusionRules(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Files and directories ignored to avoid reviewing vendor or generated artifacts.
            </p>
          </div>
        </div>

        {/* Live Progress Stepper during Analysis (FR-076, FR-077) */}
        {isProcessing && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-brand-500/40 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-brand-300 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {currentStep}
              </span>
              <span className="font-mono text-slate-400">{progressPercent}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 text-[10px] font-mono text-slate-400 text-center">
              <span className={progressPercent >= 25 ? 'text-emerald-400 font-bold' : ''}>1. Ingestion</span>
              <span className={progressPercent >= 50 ? 'text-emerald-400 font-bold' : ''}>2. Repo Agent</span>
              <span className={progressPercent >= 75 ? 'text-emerald-400 font-bold' : ''}>3. Security Scan</span>
              <span className={progressPercent >= 95 ? 'text-emerald-400 font-bold' : ''}>4. Doc Agent</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleStartReview}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isProcessing ? 'Analyzing Swarm Active...' : 'Launch Multi-Agent Review (<60s SLA)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
