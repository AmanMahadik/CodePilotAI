import React from 'react';
import { Bot, Shield, CheckCircle2, Code2, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-dark-900/95 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">CodePilot AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Autonomous AI Software Engineering Assistant that reviews student code like a thoughtful Staff Engineer at scale.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational (95% SLA)</span>
            </div>
          </div>

          {/* Academic Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-white font-semibold text-xs uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Academic Specification</span>
            </div>
            <p className="text-slate-300 font-medium">MIT Academy of Engineering, Pune</p>
            <p className="text-slate-400">Alandi (D.), Pune — A.Y. 2025-2026</p>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 font-mono text-[11px] text-slate-300 space-y-1">
              <div>Name: <span className="text-white font-semibold">Aman Atmaram Mahadik</span></div>
              <div>PRN: <span className="text-brand-300">202502100006</span></div>
              <div>Roll No: <span className="text-brand-300">68</span> (Batch B3)</div>
              <div>Assignment: <span className="text-brand-300">Assignment 1</span></div>
            </div>
          </div>

          {/* Architecture & PRD Tracing */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-white font-semibold text-xs uppercase tracking-wider">
              <Code2 className="w-3.5 h-3.5 text-brand-400" />
              <span>SRS Module Traceability</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li><span className="text-brand-400 font-mono">FR-001 - FR-020:</span> Supabase OAuth & Auth</li>
              <li><span className="text-brand-400 font-mono">FR-021 - FR-040:</span> Repository Dashboard & Trends</li>
              <li><span className="text-brand-400 font-mono">FR-041 - FR-070:</span> ZIP & GitHub Ingestion</li>
              <li><span className="text-brand-400 font-mono">FR-071 - FR-120:</span> Multi-Agent AI Review</li>
              <li><span className="text-brand-400 font-mono">FR-121 - FR-150:</span> RAG Grounded Chat & Citations</li>
              <li><span className="text-brand-400 font-mono">FR-191 - FR-210:</span> OWASP Top 10 Security Scan</li>
              <li><span className="text-brand-400 font-mono">FR-211 - FR-230:</span> Institutional PDF Report</li>
            </ul>
          </div>

          {/* Standards & Compliance */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-white font-semibold text-xs uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Compliance & Security</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              FERPA & GDPR aligned handling of student repositories. End-to-end encrypted in transit (TLS 1.3) and at rest.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">WCAG 2.1 AA</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">OWASP Top 10</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">ISO 27001 Ready</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© 2026 CodePilot AI • Document CPA-PRD-001 (Rev 1.0.0) • Process Model: Incremental Model</p>
          <div className="flex items-center gap-4">
            <span>SLA: &lt;60s P95 Analysis</span>
            <span>•</span>
            <span>Multi-Agent Swarm Orchestrator</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
