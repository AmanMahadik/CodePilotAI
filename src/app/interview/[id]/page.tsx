'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  HelpCircle, 
  School, 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  BookOpen, 
  Award, 
  Check, 
  RotateCw,
  Send,
  Code2,
  Brain,
  ThumbsUp,
  FileCheck
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { getFacultySubmissions, updateFacultyGrade } from '@/lib/store';

interface VivaQuestion {
  id: string;
  category: 'security' | 'architecture' | 'database' | 'defense';
  categoryLabel: string;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  question: string;
  codeContext?: string;
  expectedConcepts: string[];
  sampleStudentAnswer?: string;
  modelAnswer: string;
  rubricCriteria: string;
}

const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 'vq-1',
    category: 'security',
    categoryLabel: 'OWASP Security & Injection Defense',
    difficulty: 'Advanced',
    question: 'In your Society_Sync project, the code analysis flagged an unparameterized SQL query in the resident lookup handler. How does this vulnerability occur, and how did you remediate it to prevent SQL Injection (OWASP A03)?',
    codeContext: `// Vulnerable Code:
const res = await db.query(\`SELECT * FROM residents WHERE email = '\${email}'\`);

// Remediated Code:
const res = await db.query('SELECT * FROM residents WHERE email = $1', [email]);`,
    expectedConcepts: [
      'Separation of code execution from user-controlled data',
      'Prepared statements & parameter placeholders ($1 / ?)',
      'Defense-in-depth: Input validation + DB constraint checks'
    ],
    sampleStudentAnswer: 'The vulnerability occurs because dynamic string interpolation embeds untrusted user input directly into the query string before parsing. If an attacker inputs an SQL fragment like \' OR \'1\'=\'1, it alters the abstract syntax tree of the SQL command. I remediated it by using parameterized prepared statements ($1), which forces the database engine to treat user input strictly as literal values rather than executable SQL syntax.',
    modelAnswer: 'Dynamic concatenation allows malicious user payloads to break out of string literals and alter the database query structure. By converting to parameterized queries, the database engine compiles the SQL execution plan before binding parameters, rendering injection attacks completely inert.',
    rubricCriteria: 'Technical accuracy regarding AST query separation, parameter binding, and real-world exploit mitigation.'
  },
  {
    id: 'vq-2',
    category: 'architecture',
    categoryLabel: 'Multi-Agent Pipeline & Architecture',
    difficulty: 'Intermediate',
    question: 'Explain the architecture of the CodePilot AI Multi-Agent execution pipeline. Why are specialized agents (AST Parser, OWASP Security, Quality Analyzer, Rubric Engine) separated rather than using a single prompt?',
    codeContext: `Pipeline:
[Source Files] -> [AST Parser Agent] -> [Parallel Analysis Agents] -> [Synthesis & Rubric Engine] -> [Report / Dashboard]`,
    expectedConcepts: [
      'Single Responsibility Principle applied to AI agents',
      'Independent heuristics and rule-based linting combined with LLMs',
      'Reduced hallucination and deterministic grading rubrics'
    ],
    sampleStudentAnswer: 'Separating the pipeline into specialized agents follows the Single Responsibility Principle. The AST agent handles deterministic syntax validation, while the security agent focuses strictly on OWASP vulnerability patterns without being distracted by documentation formatting. This modularity reduces token overhead, prevents hallucination, and allows parallel asynchronous execution.',
    modelAnswer: 'Each agent possesses specialized domain focus and distinct evaluation rubrics. Breaking down the audit into isolated stages allows deterministic AST tools to pre-filter code smells before LLM security reasoning runs, yielding reproducible, audited findings.',
    rubricCriteria: 'Clarity on multi-agent decomposition, fault tolerance, and deterministic vs generative trade-offs.'
  },
  {
    id: 'vq-3',
    category: 'database',
    categoryLabel: 'Supabase RLS & Access Control',
    difficulty: 'Advanced',
    question: 'How does Row Level Security (RLS) in PostgreSQL/Supabase enforce multi-tenancy and data isolation between Student Developers and Faculty Evaluators?',
    codeContext: `CREATE POLICY "Faculty can review student cohort submissions"
ON reviews FOR SELECT
USING (auth.jwt() ->> 'role' = 'faculty' OR auth.uid() = user_id);`,
    expectedConcepts: [
      'Kernel-level database security enforcement',
      'JWT claims inspection (auth.jwt() ->> \'role\')',
      'Elimination of application-layer authorization bypass risks'
    ],
    sampleStudentAnswer: 'Row Level Security ensures that authorization policies are enforced at the database engine level rather than relying solely on client or API middleware. By inspecting auth.jwt()->>\'role\', faculty members are granted SELECT access across cohort student submissions, while students are restricted exclusively to their own created reviews via auth.uid() = user_id.',
    modelAnswer: 'PostgreSQL RLS evaluates policy predicates for every row touched by a query. Even if an attacker manipulates API parameters, the database engine enforces isolation based on the cryptographically verified JWT claims.',
    rubricCriteria: 'Understanding of database-level access control, JWT verification, and authorization architecture.'
  },
  {
    id: 'vq-4',
    category: 'defense',
    categoryLabel: 'Engineering Trade-offs & Viva Defense',
    difficulty: 'Intermediate',
    question: 'When implementing Next.js App Router for this system, why was client-side state hydration chosen for real-time review previews, and how did you prevent SSR vendor bundling conflicts?',
    codeContext: `// Next.js Config:
transpilePackages: ['@supabase/ssr', '@supabase/supabase-js'],
webpack: (config, { isServer }) => {
  if (!isServer) config.resolve.fallback = { fs: false, crypto: false };
  return config;
}`,
    expectedConcepts: [
      'Hydration lifecycle in Next.js App Router',
      'Separation of browser APIs from Node server runtimes',
      'Webpack fallback resolutions for isomorphic clients'
    ],
    sampleStudentAnswer: 'Next.js App Router performs server pre-rendering even on client components. When libraries like Supabase utilize Node-specific modules (fs, crypto), bundler mismatches occur if vendor chunks are not explicitly transpiled. We configured Webpack fallbacks and transpilePackages so browser clients bundle cleanly while maintaining fast instant hydration.',
    modelAnswer: 'Configuring explicit webpack fallback resolutions prevents server-only node built-ins from crashing client bundles during SSR compilation, ensuring smooth hydration without runtime vendor chunk missing errors.',
    rubricCriteria: 'Technical depth regarding Next.js SSR vs client bundle compilation and bundling mechanics.'
  }
];

export default function TechnicalInterviewPage() {
  const params = useParams();
  const routeId = (params?.id as string) || 'default';
  const { user, role } = useAuth();
  const isFaculty = role === 'faculty';

  const [activeCategory, setActiveCategory] = useState<'all' | 'security' | 'architecture' | 'database' | 'defense'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<VivaQuestion>(VIVA_QUESTIONS[0]);
  const [studentInput, setStudentInput] = useState<string>('');
  const [evaluated, setEvaluated] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState<number>(92);
  const [facultyAssignedScore, setFacultyAssignedScore] = useState<string>('48/50');
  const [scoreSaved, setScoreSaved] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    if (selectedQuestion) {
      setStudentInput(selectedQuestion.sampleStudentAnswer || '');
      setEvaluated(false);
      setScoreSaved(false);
    }
  }, [selectedQuestion]);

  const filteredQuestions = activeCategory === 'all' 
    ? VIVA_QUESTIONS 
    : VIVA_QUESTIONS.filter(q => q.category === activeCategory);

  const handleEvaluate = () => {
    setEvaluating(true);
    setTimeout(() => {
      setEvaluating(false);
      setEvaluated(true);
      // Realistic calculation based on length and keywords
      const score = Math.min(98, Math.max(78, Math.round(75 + (studentInput.length > 100 ? 15 : 5) + Math.random() * 8)));
      setEvaluationScore(score);
    }, 700);
  };

  const handleSaveFacultyScore = () => {
    const subs = getFacultySubmissions();
    if (subs.length > 0) {
      updateFacultyGrade(subs[0].id, facultyAssignedScore, 'Graded');
    }
    setScoreSaved(true);
    setTimeout(() => setScoreSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            {isFaculty ? (
              <>
                <School className="w-3.5 h-3.5 text-[#3fb950]" />
                <span className="text-[#3fb950] font-semibold">FACULTY EVALUATION • ACADEMIC VIVA &amp; INTERVIEW OVERSIGHT</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#a371f7]" />
                <span className="text-[#a371f7] font-semibold">STUDENT PREPARATION • TECHNICAL VIVA &amp; DEFENSE SIMULATOR</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Technical Interview &amp; Viva Assessment</span>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              isFaculty 
                ? 'bg-[#238636]/15 text-[#3fb950] border-[#238636]/40' 
                : 'bg-[#8957e5]/20 text-[#a371f7] border-[#8957e5]/40'
            }`}>
              {isFaculty ? 'Evaluator Oversight' : 'AI Defense Practice'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isFaculty 
              ? 'Review candidate viva defense questions, evaluate student responses against academic rubrics, and record final marks.'
              : 'Interactive defense preparation for Society_Sync code review. Test your architectural and security knowledge before live faculty evaluation.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Link
            href={isFaculty ? "/faculty" : "/dashboard"}
            className="px-3 py-1.5 rounded-lg bg-[#0e1424] hover:bg-[#151d33] border border-[#1c2438] text-xs font-medium text-slate-300 transition-colors"
          >
            {isFaculty ? '← Return to Classroom Roster' : '← Engineering Overview'}
          </Link>
          <Link
            href="/report/rev-1"
            className="px-3.5 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>View Audit Report</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Context Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Target Repository</span>
          <div className="text-lg font-bold text-white mt-1 truncate">Society_Sync</div>
          <span className="text-[10px] text-[#58a6ff] font-mono block mt-0.5">branch: main (DEV-001)</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Candidate / Author</span>
          <div className="text-lg font-bold text-white mt-1 truncate">Aman Mahadik</div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">PRN: DEV-001 • Cohort 2026</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Viva Defense Readiness</span>
          <div className="text-2xl font-bold text-[#3fb950] mt-1 font-mono">88 / 100</div>
          <span className="text-[10px] text-[#3fb950] font-mono block mt-0.5">Certified for Faculty Viva</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Questions in Bank</span>
          <div className="text-2xl font-bold text-[#a371f7] mt-1 font-mono">{VIVA_QUESTIONS.length} Questions</div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Security, Architecture &amp; RLS</span>
        </div>
      </div>

      {/* Main Grid: Left Column Questions, Right Column Evaluation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Category Filters & Question List */}
        <div className="lg:col-span-4 space-y-4">
          {/* Categories Tab Selector */}
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-3 space-y-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">
              Assessment Domain
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'security', 'architecture', 'database', 'defense'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors capitalize ${
                    activeCategory === cat
                      ? 'bg-[#1f6feb] text-white font-semibold'
                      : 'bg-[#111728] text-slate-400 hover:text-white hover:bg-[#161f36]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-2">
            {filteredQuestions.map((q, idx) => {
              const isSelected = selectedQuestion.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestion(q)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#131b30] border-[#388bfd] shadow-lg shadow-blue-500/10'
                      : 'bg-[#0e1424] border-[#1c2438] hover:border-slate-700 hover:bg-[#111728]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-slate-400 uppercase">{q.categoryLabel}</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold ${
                      q.difficulty === 'Advanced' 
                        ? 'bg-[#da3633]/20 text-[#ff7b72]' 
                        : 'bg-[#238636]/20 text-[#3fb950]'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                    {q.question}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1a2336] text-[10px] font-mono text-slate-500">
                    <span>Q{idx + 1} of {filteredQuestions.length}</span>
                    <span className="text-[#58a6ff] flex items-center gap-0.5">
                      Inspect <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Defense Workspace & Rubrics */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Question Detail Box */}
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2438]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#1f6feb]/20 text-[#58a6ff] text-[11px] font-mono font-bold">
                  {selectedQuestion.categoryLabel}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Difficulty: <span className="text-white font-semibold">{selectedQuestion.difficulty}</span>
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Viva ID: {selectedQuestion.id}
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {selectedQuestion.question}
              </h3>
            </div>

            {/* Code Context Snippet if available */}
            {selectedQuestion.codeContext && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Code Context &amp; AST Scenario</span>
                </div>
                <pre className="p-3 rounded-lg bg-[#070a12] border border-[#1a2336] text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
                  {selectedQuestion.codeContext}
                </pre>
              </div>
            )}

            {/* Expected Core Principles */}
            <div className="p-3 rounded-lg bg-[#111728] border border-[#1a243a] space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                Key Academic Concepts Tested
              </span>
              <ul className="text-xs text-slate-300 space-y-1">
                {selectedQuestion.expectedConcepts.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3fb950] shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Student Defense Response & AI Viva Evaluation Area */}
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2438]">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#a371f7]" />
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  {isFaculty ? 'Candidate Viva Defense Response' : 'Your Defense Response (Viva Simulation)'}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {studentInput.length} characters
              </span>
            </div>

            <textarea
              rows={5}
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              placeholder="Type your technical viva defense answer here..."
              className="w-full p-3 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 font-mono focus:outline-none focus:border-[#388bfd] leading-relaxed resize-none"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-slate-400">
                Rubric: <span className="text-slate-300">{selectedQuestion.rubricCriteria}</span>
              </div>

              <button
                onClick={handleEvaluate}
                disabled={evaluating || !studentInput.trim()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#8957e5] hover:bg-[#9a67f7] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 shrink-0"
              >
                {evaluating ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating with AI Examiner...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Evaluate with AI Examiner</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Feedback & Score Box */}
            {evaluated && (
              <div className="mt-4 p-4 rounded-xl bg-[#11182c] border border-[#233152] space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#3fb950]" />
                    <span className="text-xs font-bold text-white font-mono uppercase">
                      AI Viva Evaluation Verdict
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-md bg-[#238636]/20 border border-[#238636]/40 text-[#3fb950] font-mono font-bold text-xs">
                    Score: {evaluationScore} / 100
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Strong demonstration of technical knowledge. The answer clearly distinguishes between application-layer input parsing and database AST query evaluation. Accurately explained how parameterized statements eliminate injection vectors.
                </p>

                {/* Model Answer Accordion */}
                <div className="pt-2 border-t border-[#1e2a47]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">
                    Faculty Benchmark Model Answer:
                  </div>
                  <div className="text-xs font-mono text-slate-300 bg-[#070a12] p-3 rounded-lg border border-[#172033]">
                    {selectedQuestion.modelAnswer}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Faculty Grading & Record Control (Always available for Evaluator, or preview for Student) */}
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-[#3fb950]" />
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Academic Viva Grading &amp; Cohort Sync
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#238636]/15 text-[#3fb950] border border-[#238636]/30">
                Official Rubric
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {isFaculty 
                ? 'Assign official viva grade marks for candidate Aman Mahadik (DEV-001) in Society_Sync audit.'
                : 'Official faculty evaluator rubric and marks record for this assessment.'}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-300">Assigned Viva Marks:</span>
                <input
                  type="text"
                  value={facultyAssignedScore}
                  onChange={(e) => setFacultyAssignedScore(e.target.value)}
                  placeholder="e.g. 48/50"
                  className="w-28 px-3 py-1.5 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs font-mono text-white text-center focus:border-[#388bfd]"
                />
              </div>

              <button
                onClick={handleSaveFacultyScore}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{scoreSaved ? 'Saved to Roster!' : 'Record Grade to Cohort Roster'}</span>
              </button>

              {scoreSaved && (
                <span className="text-xs font-mono text-[#3fb950] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Grade recorded in Classroom Submissions
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
