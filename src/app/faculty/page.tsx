'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  School, 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Filter,
  Award
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

export default function FacultyPortalPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('B3');

  const students = [
    {
      id: 'stud-68',
      name: 'Alex Morgan',
      prn: '202502100006',
      rollNo: '68',
      batch: 'B3',
      repoName: 'Society_Sync',
      branch: 'main',
      score: 92,
      criticals: 1,
      highs: 1,
      status: 'Graded',
      grade: '48 / 50',
      submittedAt: 'Today, 12 min ago',
      reviewLink: '/review/rev-1',
    },
    {
      id: 'stud-65',
      name: 'Rohan Deshmukh',
      prn: '202502100003',
      rollNo: '65',
      batch: 'B3',
      repoName: 'Civic_Reporter_API',
      branch: 'main',
      score: 78,
      criticals: 2,
      highs: 3,
      status: 'Needs Review',
      grade: 'Pending',
      submittedAt: 'Yesterday, 4:20 PM',
      reviewLink: '/review/rev-1',
    },
    {
      id: 'stud-67',
      name: 'Snehal Kulkarni',
      prn: '202502100005',
      rollNo: '67',
      batch: 'B3',
      repoName: 'Smart_Campus_Portal',
      branch: 'develop',
      score: 88,
      criticals: 0,
      highs: 2,
      status: 'Graded',
      grade: '44 / 50',
      submittedAt: '2 days ago',
      reviewLink: '/review/rev-1',
    },
    {
      id: 'stud-70',
      name: 'Vikram Shinde',
      prn: '202502100008',
      rollNo: '70',
      batch: 'B3',
      repoName: 'Energy_Audit_Service',
      branch: 'main',
      score: 85,
      criticals: 0,
      highs: 1,
      status: 'Graded',
      grade: '43 / 50',
      submittedAt: '4 days ago',
      reviewLink: '/review/rev-1',
    },
  ];

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.includes(searchTerm) ||
      s.prn.includes(searchTerm) ||
      s.repoName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <span className="text-[11px] font-mono text-slate-400 uppercase">Enrolled Students</span>
          <div className="text-3xl font-bold text-white mt-1">68</div>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Batch B3 Active</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Submissions Reviewed</span>
          <div className="text-3xl font-bold text-[#3fb950] mt-1 font-mono">64 <span className="text-sm font-normal text-slate-400">/ 68</span></div>
          <span className="text-[10px] text-[#3fb950] font-mono block mt-0.5">94% Completion Rate</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Class Average Quality</span>
          <div className="text-3xl font-bold text-[#58a6ff] mt-1 font-mono">86 <span className="text-sm font-normal text-slate-400">/ 100</span></div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Above target baseline</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Common Critical Flaws</span>
          <div className="text-3xl font-bold text-[#da3633] mt-1 font-mono">14</div>
          <span className="text-[10px] text-[#ff7b72] font-mono block mt-0.5">SQL Injection (OWASP A03)</span>
        </div>
      </div>

      {/* Class-wide Defect Pattern Callout (Informing Faculty Lecture Planning) */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#e3b341]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Faculty Lecture Recommendation (From Swarm Analysis)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-[#161f33] px-2 py-0.5 rounded border border-[#22304d]">
            Curriculum Insight
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The Security Agent detected that <span className="text-[#ff7b72] font-bold">42% of students</span> in Batch B3 are concatenating unsanitized inputs into raw SQL strings without parameterized placeholders, and <span className="text-[#f0883e] font-bold">36%</span> are using asynchronous callbacks inside <code className="text-slate-200">Array.prototype.forEach</code> resulting in unhandled race conditions.
        </p>

        <div className="p-3 rounded-lg bg-[#070a12] border border-[#172033] text-[11px] font-mono text-slate-400">
          <span className="text-[#3fb950] font-semibold">Suggested Action:</span> Dedicate 20 minutes in upcoming Lab 04 to SQL AST lexical analysis and promise concurrency with <code className="text-[#58a6ff]">Promise.all</code>.
        </div>
      </div>

      {/* Student Submissions Roster */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1c2438] gap-3">
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Student Submissions Roster • Batch B3
            </h3>
            <p className="text-[11px] text-slate-400">Assignment 1 — Software Engineering &amp; Quality Audit</p>
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
              {filtered.map((item) => (
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
                    {item.grade}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
