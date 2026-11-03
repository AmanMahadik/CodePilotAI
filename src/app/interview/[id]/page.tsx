'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  HelpCircle, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Send, 
  Loader2, 
  Award,
  Terminal
} from 'lucide-react';

export default function MockInterviewPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const questions = [
    {
      q: 'In your checkout controller, how do you handle idempotency when a network timeout occurs during payment gateway calls?',
      context: 'Based on src/adapters/payment.adapter.ts and src/services/order.service.ts',
      tip: 'Mention idempotency keys, database transaction locks, and outbox patterns.',
    },
    {
      q: 'You had an async function passed to Array.prototype.forEach in order.service.ts. Why does that cause silent race conditions?',
      context: 'Based on Finding #find-103',
      tip: 'Explain event loop microtask queues and why Promise.all or for-of is preferred.',
    },
    {
      q: 'How would you defend your application against the SQL injection finding detected in your product catalog search?',
      context: 'Based on Finding #find-102 (OWASP A03)',
      tip: 'Discuss parameterized queries, AST lexical analysis, and why Prisma type-safety prevents injection.',
    },
  ];

  const handleEvaluateAnswer = () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    setTimeout(() => {
      setEvaluating(false);
      setFeedback(
        'Staff Engineer Evaluation: Strong answer! You correctly identified the underlying architectural pattern and explained the failure mode clearly. In an actual technical interview at Stripe or Amazon, highlighting the trade-off between database locks vs idempotency token caching in Redis would elevate your response to Senior/Staff level.'
      );
    }, 1500);
  };

  const handleNext = () => {
    setAnswer('');
    setFeedback(null);
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Mock Technical Interview Simulator
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Phase 2 • FR-331
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Technical interview questions grounded directly in your repository&apos;s architecture and code choices.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold">
          <HelpCircle className="w-4 h-4" />
          <span>Staff Engineer Interviewer Question</span>
        </div>

        <h3 className="text-lg font-bold text-white leading-snug">{currentQ.q}</h3>
        <p className="text-xs font-mono text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          Context: {currentQ.context}
        </p>

        {/* Tip */}
        <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200">
          <span className="font-semibold text-amber-400 block mb-0.5">Interviewer Pro-Tip:</span>
          {currentQ.tip}
        </div>

        {/* Student Answer Textarea */}
        <div className="pt-2">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Your Spoken/Written Answer:
          </label>
          <textarea
            rows={5}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your explanation as you would explain it to a senior interviewer..."
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleEvaluateAnswer}
            disabled={!answer.trim() || evaluating}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
            <span>{evaluating ? 'Evaluating with AI Staff Rubric...' : 'Submit Answer for Feedback'}</span>
          </button>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-xs space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Interviewer Feedback & Score</span>
            </div>
            <p className="text-slate-200 leading-relaxed">{feedback}</p>
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 text-xs font-medium border border-slate-700"
              >
                Next Question →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
