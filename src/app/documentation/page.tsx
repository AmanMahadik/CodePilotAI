'use client';

import React, { useState } from 'react';
import { BookOpen, Check, Copy, Download, RefreshCw, FileText } from 'lucide-react';

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [acceptedActions, setAcceptedActions] = useState<Record<string, boolean>>({});

  const handleAccept = (file: string) => {
    setAcceptedActions((prev) => ({ ...prev, [file]: true }));
  };

  const rawMarkdown = `# Society Sync

A centralized digital platform for modern housing society management.

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Expo](https://img.shields.io/badge/Expo%20SDK-54-black)]()
[![Next.js](https://img.shields.io/badge/Next.js-15-black)]()
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ecf8e)]()

## Overview
SocietySync streamlines society operations with resident management, maintenance tracking, event-fund transparency, parking coordination, security access and emergency communication.

## Architecture
\`\`\`
Mobile App (Expo / React Native)
  ↓
Next.js 15 Portal & API
  ↓
Supabase Authentication + PostgreSQL
  ↓
RBAC - Master Admin • Admin • Owner • Renter • Security
\`\`\`

## Getting Started
\`\`\`bash
npm install
npx expo start
npm run dev
\`\`\`

## Core Modules
- Society onboarding and approval workflow
- Resident and role-based access management
- Event fund collection and expenditure transparency
- Maintenance dues and payment tracking
- Visitor security, parking and SOS alerts

## API Routes
- POST /api/auth/login
- GET /api/residents
- GET /api/maintenance/dues
- POST /api/events/expenses
- POST /api/security/visitors
`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
            SOCIETY_SYNC / DOCUMENTATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Documentation Agent
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate and maintain developer documentation from source code.
          </p>
        </div>

        <button
          onClick={() => alert('Documentation regenerated successfully by Documentation Agent.')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          <span>Generate documentation</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1c2438] gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-2.5 transition-colors ${
            activeTab === 'preview'
              ? 'text-white border-b-2 border-[#f0883e]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={`pb-2.5 transition-colors ${
            activeTab === 'raw'
              ? 'text-white border-b-2 border-[#f0883e]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Raw Markdown
        </button>
      </div>

      {/* Main Documentation Card */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-6 space-y-6">
        {activeTab === 'preview' ? (
          <div className="space-y-6 text-xs">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2438]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#238636]/15 border border-[#238636]/40 text-[#3fb950] font-mono font-bold text-[10px]">
                README.md • Generated
              </span>
              <span className="text-[10px] font-mono text-slate-500">Updated just now</span>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-xl font-extrabold text-white">Society Sync</h2>
              <p className="text-slate-400 mt-1">
                A centralized digital platform for modern housing society management.
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-[#238636] text-white font-bold">
                build passing
              </span>
              <span className="px-2 py-0.5 rounded bg-[#161f33] text-slate-300 border border-[#22304d]">
                Expo SDK 54
              </span>
              <span className="px-2 py-0.5 rounded bg-[#161f33] text-slate-300 border border-[#22304d]">
                Next.js 15
              </span>
              <span className="px-2 py-0.5 rounded bg-[#161f33] text-slate-300 border border-[#22304d]">
                Supabase
              </span>
            </div>

            {/* Section: Overview */}
            <div>
              <h3 className="text-sm font-bold text-white mb-1.5">Overview</h3>
              <p className="text-slate-300 leading-relaxed">
                SocietySync streamlines society operations with resident management, maintenance tracking, event-fund transparency, parking coordination, security access and emergency communication.
              </p>
            </div>

            {/* Section: Architecture */}
            <div>
              <h3 className="text-sm font-bold text-white mb-1.5">Architecture</h3>
              <pre className="p-4 rounded-lg bg-[#070a12] border border-[#172033] font-mono text-[11px] text-[#58a6ff] leading-relaxed">
{`Mobile App (Expo / React Native)
  ↓
Next.js 15 Portal & API
  ↓
Supabase Authentication + PostgreSQL
  ↓
RBAC - Master Admin • Admin • Owner • Renter • Security`}
              </pre>
            </div>

            {/* Section: Getting Started */}
            <div>
              <h3 className="text-sm font-bold text-white mb-1.5">Getting Started</h3>
              <div className="p-3.5 rounded-lg bg-[#070a12] border border-[#172033] font-mono text-[11px] text-[#3fb950] space-y-1">
                <div>npm install</div>
                <div>npx expo start</div>
                <div>npm run dev</div>
              </div>
            </div>

            {/* Section: Core Modules */}
            <div>
              <h3 className="text-sm font-bold text-white mb-1.5">Core Modules</h3>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                <li>Society onboarding and approval workflow</li>
                <li>Resident and role-based access management</li>
                <li>Event fund collection and expenditure transparency</li>
                <li>Maintenance dues and payment tracking</li>
                <li>Visitor security, parking and SOS alerts</li>
              </ul>
            </div>

            {/* Section: API Routes */}
            <div>
              <h3 className="text-sm font-bold text-white mb-1.5">API Routes</h3>
              <div className="p-3.5 rounded-lg bg-[#070a12] border border-[#172033] font-mono text-[11px] text-slate-300 space-y-1">
                <div><span className="text-[#3fb950] font-bold">POST</span> /api/auth/login</div>
                <div><span className="text-[#58a6ff] font-bold">GET</span>  /api/residents</div>
                <div><span className="text-[#58a6ff] font-bold">GET</span>  /api/maintenance/dues</div>
                <div><span className="text-[#3fb950] font-bold">POST</span> /api/events/expenses</div>
                <div><span className="text-[#3fb950] font-bold">POST</span> /api/security/visitors</div>
              </div>
            </div>
          </div>
        ) : (
          <textarea
            readOnly
            value={rawMarkdown}
            rows={18}
            className="w-full p-4 rounded-lg bg-[#070a12] border border-[#172033] font-mono text-xs text-slate-300 leading-relaxed"
          />
        )}
      </div>

      {/* Inline JSDoc / Docstring Suggestions Table */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-3">
        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
          Inline JSDoc / Docstring suggestions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-mono text-slate-400 border-b border-[#1c2438]">
                <th className="pb-2 font-semibold">FILE</th>
                <th className="pb-2 font-semibold">SUGGESTION</th>
                <th className="pb-2 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172033] font-mono">
              {[
                { file: 'auth.ts', desc: 'Document authentication middleware parameters' },
                { file: 'payment.ts', desc: 'Add payment processing method docstring' },
                { file: 'resident.ts', desc: 'Document resident retrieval return type' },
              ].map((item, i) => {
                const isAccepted = acceptedActions[item.file];
                return (
                  <tr key={i} className="hover:bg-[#131b2e] transition-colors">
                    <td className="py-3 text-[#58a6ff] font-bold">{item.file}</td>
                    <td className="py-3 text-slate-300 font-sans">{item.desc}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleAccept(item.file)}
                        className={`px-3 py-1 rounded text-xs font-sans transition-colors ${
                          isAccepted
                            ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40 cursor-default'
                            : 'bg-[#161f33] hover:bg-[#1f2c49] text-slate-200 border border-[#22304d]'
                        }`}
                      >
                        {isAccepted ? 'Accepted' : 'Accept'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
