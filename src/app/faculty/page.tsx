'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  School, 
  Search, 
  AlertTriangle, 
  ChevronRight,
  Filter,
  CheckCircle2,
  FileCheck2,
  Clock
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { getFacultySubmissions, updateFacultyGrade, FacultySubmission } from '@/lib/store';

export default function FacultyPortalPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('All');
  const [submissions, setSubmissions] = useState<FacultySubmission[]>([]);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState('');

  useEffect(() => {
    setSubmissions(getFacultySubmissions());
  }, []);

  const handleSaveGrade = (id: string) => {
    if (!gradeInput.trim()) return;
    updateFacultyGrade(id, gradeInput.trim(), 'Graded');
    setSubmissions(getFacultySubmissions());
    setGradingId(null);
    setGradeInput('');
  };

  const filtered = submissions.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.includes(searchTerm) ||
      s.prn.includes(searchTerm) ||
      s.repoName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = filterBatch === 'All' || s.batch === filterBatch;
    return matchesSearch && matchesBatch;
  });

  const totalSubmissions = submissions.length;
  const gradedCount = submissions.filter((s) => s.status === 'Graded').length;
  const avgQuality = totalSubmissions > 0 
    ? Math.round(submissions.reduce((acc, s) => acc + (s.score || 0), 0) / totalSubmissions) 
    : 0;
  const totalCriticals = submissions.reduce((acc, s) => acc + (s.criticals || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-[#3fb950]" />
            <span>FACULTY PORTAL • ACADEMIC EVALUATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Classroom Submissions &amp; Defect Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional Code Audit • Cohort Roster &amp; Assignment Oversight
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#0e1424] border border-[#1c2438] text-xs font-mono text-slate-300">
            Evaluator: <span className="text-white font-semibold">{user?.user_metadata?.full_name || user?.email || 'Faculty Evaluator'}</span>
          </span>
        </div>
      </div>

      {/* 4 Class-Wide Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Submissions Recorded</span>
          <div className="text-3xl font-bold text-white mt-1">
            {totalSubmissions.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Active Cohort</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Graded Submissions</span>
          <div className="text-3xl font-bold text-[#3fb950] mt-1 font-mono">
            {gradedCount} <span className="text-sm font-normal text-slate-400">/ {totalSubmissions}</span>
          </div>
          <span className="text-[10px] text-[#3fb950] font-mono block mt-0.5">
            {totalSubmissions > 0 ? `${Math.round((gradedCount / totalSubmissions) * 100)}% Evaluated` : 'No submissions yet'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Cohort Average Quality</span>
          <div className="text-3xl font-bold text-[#58a6ff] mt-1 font-mono">
            {totalSubmissions > 0 ? avgQuality : '--'} <span className="text-sm font-normal text-slate-400">/ 100</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
            {totalSubmissions > 0 ? 'Live computed score' : 'Awaiting submissions'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Critical Defects</span>
          <div className="text-3xl font-bold text-[#da3633] mt-1 font-mono">{totalCriticals}</div>
          <span className="text-[10px] text-[#ff7b72] font-mono block mt-0.5">Across cohort projects</span>
        </div>
      </div>

      {/* Student Submissions Roster */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1c2438] gap-3">
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Student Submissions Roster ({filtered.length})
            </h3>
            <p className="text-[11px] text-slate-400">Live submissions recorded across student project reviews</p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student, roll, or repo..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-[#388bfd]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-mono text-slate-400 border-b border-[#1c2438]">
                <th className="pb-3 font-semibold">ROLL / PRN</th>
                <th className="pb-3 font-semibold">STUDENT NAME</th>
                <th className="pb-3 font-semibold">REPOSITORY</th>
                <th className="pb-3 font-semibold">CODE HEALTH</th>
                <th className="pb-3 font-semibold">DEFECTS</th>
                <th className="pb-3 font-semibold">GRADE</th>
                <th className="pb-3 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172033]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400 font-mono space-y-2">
                    <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <div className="font-semibold text-slate-300">No student submissions found</div>
                    <div className="text-[11px] text-slate-500">
                      Submissions appear here automatically when students execute code reviews.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#131b2e] transition-colors">
                    <td className="py-3.5 font-mono">
                      <div className="font-bold text-white">Roll: {item.rollNo}</div>
                      <div className="text-[10px] text-slate-500">{item.prn}</div>
                    </td>
                    <td className="py-3.5 font-medium text-white">
                      {item.name}
                    </td>
                    <td className="py-3.5 font-mono text-xs">
                      <div className="text-[#58a6ff] font-semibold">{item.repoName}</div>
                      <div className="text-[10px] text-slate-500">branch: {item.branch}</div>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#238636]/15 border border-[#238636]/40 text-[#3fb950] font-mono font-bold text-[10px]">
                        {item.score} / 100
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-[11px]">
                      <span className="text-[#ff7b72] font-semibold">{item.criticals} Crit</span>
                      <span className="text-slate-500 mx-1">•</span>
                      <span className="text-[#f0883e] font-semibold">{item.highs} High</span>
                    </td>
                    <td className="py-3.5 font-mono text-xs font-bold text-white">
                      {gradingId === item.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={gradeInput}
                            onChange={(e) => setGradeInput(e.target.value)}
                            placeholder="e.g. 48/50"
                            className="w-20 px-2 py-1 rounded bg-[#070a12] border border-[#388bfd] text-xs text-white font-mono"
                          />
                          <button
                            onClick={() => handleSaveGrade(item.id)}
                            className="px-2 py-1 rounded bg-[#238636] hover:bg-[#2ea043] text-white text-[10px]"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{item.grade}</span>
                          <button
                            onClick={() => {
                              setGradingId(item.id);
                              setGradeInput(item.grade === 'Pending' ? '' : item.grade);
                            }}
                            className="text-[10px] text-[#58a6ff] hover:underline font-normal"
                          >
                            Grade
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={item.reviewLink}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-slate-200 transition-colors"
                      >
                        <span>Inspect Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
