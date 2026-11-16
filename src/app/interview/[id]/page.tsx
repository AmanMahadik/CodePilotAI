'use client';

import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, ArrowRight, Loader2, Award } from 'lucide-react';

export default function TechnicalInterviewPage() {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    setTimeout(() => {
      setEvaluating(false);
      setSubmitted(true);
    }, 1200);
  };

  const handleNext = () => {
    setAnswer('');
    setSubmitted(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
          PHASE 2 / LEARNING &amp; DEVELOPMENT
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Technical interview simulator
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Practice engineering interviews using your own repository as context.
        </p>

        <div className="mt-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8957e5]/20 text-[#a371f7] border border-[#8957e5]/30 text-xs font-mono font-medium">
            <span>🔮</span>
            <span>Phase 2 Preview</span>
          </span>
        </div>
      </div>

      {/* Landscape Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Interview Session */}
        <div className="lg:col-span-8 rounded-xl bg-[#0e1424] border border-[#1c2438] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1c2438]">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Interview session
            </h3>
            <span className="flex items-center gap-1.5 text-xs font-mono text-[#3fb950]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse"></span>
              <span>Ready</span>
            </span>
          </div>

          <div className="text-[10px] font-mono text-slate-400">
            CONTEXT • SOCIETY_SYNC / src/middleware/auth.ts
          </div>

          {/* Question Box */}
          <div className="p-4 rounded-lg bg-[#0a0f1d] border-l-2 border-[#8957e5] border-t border-r border-b border-[#1c2438] space-y-2.5">
            <div className="text-[10px] font-bold text-[#a371f7] font-mono uppercase tracking-wider">
              AI INTERVIEWER • BACKEND ENGINEERING
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">
              I noticed that your authentication middleware constructs a SQL query using an email value. Can you explain the security risk associated with this implementation, and how you would redesign it to prevent an injection attack?
            </p>
            <div className="text-[10px] font-mono text-slate-500">
              Question 01 • Security fundamentals • Medium difficulty
            </div>
          </div>

          {/* Student Answer */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white font-mono uppercase tracking-wider">
              Your answer
            </label>
            <textarea
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Explain your approach as if you were answering an interviewer..."
              className="w-full p-3.5 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-500 font-mono leading-relaxed focus:outline-none focus:border-[#388bfd]"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400 font-mono">
              Take your time. Structure your answer.
            </span>
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || evaluating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{evaluating ? 'Evaluating...' : 'Submit answer →'}</span>
            </button>
          </div>

          {/* Evaluator Feedback if submitted */}
          {submitted && (
            <div className="p-4 rounded-lg bg-[#0a0f1d] border border-[#238636]/40 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center gap-1.5 text-[#3fb950] font-bold font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Interviewer Evaluation (Passed: 89/100)</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11.5px]">
                Strong answer. You accurately identified that directly interpolating input alters SQL syntax trees, and you correctly recommended prepared statements and ORM parameterized query builders to maintain cryptographic boundaries.
              </p>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Evaluation Rubric & Session Settings */}
        <div className="lg:col-span-4 space-y-4">
          {/* Rubric Card */}
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Evaluation rubric
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Your answer will be evaluated across:
              </p>
            </div>

            {/* Rubric Bars */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>Technical accuracy</span>
                  <span className="font-bold text-white">/ 40</span>
                </div>
                <div className="w-full h-1.5 bg-[#162032] rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-[#8957e5] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>Problem solving</span>
                  <span className="font-bold text-white">/ 25</span>
                </div>
                <div className="w-full h-1.5 bg-[#162032] rounded-full overflow-hidden">
                  <div className="w-[75%] h-full bg-[#58a6ff] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>Communication</span>
                  <span className="font-bold text-white">/ 20</span>
                </div>
                <div className="w-full h-1.5 bg-[#162032] rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-[#3fb950] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>Best practices</span>
                  <span className="font-bold text-white">/ 15</span>
                </div>
                <div className="w-full h-1.5 bg-[#162032] rounded-full overflow-hidden">
                  <div className="w-[70%] h-full bg-[#e3b341] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Settings Card */}
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-3 text-xs font-mono">
            <h4 className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              SESSION SETTINGS
            </h4>
            <div className="space-y-1.5">
              <div className="text-slate-300">Repository: <span className="text-white font-semibold">Society_Sync</span></div>
              <div className="text-slate-300">Level: <span className="text-white font-semibold">Intermediate</span></div>
              <div className="text-slate-300">Format: <span className="text-white font-semibold">Technical Q&amp;A</span></div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleNext}
                className="w-full py-2 rounded-md bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-slate-200 transition-colors"
              >
                Next question →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
