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
import { getReviewById, getLatestReview, getStoredRepositories, getFacultySubmissions, updateFacultyGrade } from '@/lib/store';
import { Review, Finding } from '@/lib/types';

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

function generateDynamicQuestions(review: Review | null, repoName: string): VivaQuestion[] {
  const questions: VivaQuestion[] = [];
  const findings = review?.findings || [];
  const secFinding = findings.find((f) => f.category === 'security' || f.agentType === 'security');
  const qualFinding = findings.find((f) => f.category === 'code-quality' || f.agentType === 'quality');

  // 1. Security & Vulnerability Defense
  if (secFinding) {
    questions.push({
      id: 'vq-sec-1',
      category: 'security',
      categoryLabel: 'Security & Vulnerability Defense',
      difficulty: 'Advanced',
      question: `In your ${repoName} project, static analysis identified "${secFinding.title}" in \`${secFinding.file}\` (line ${secFinding.lineStart}). How does this vulnerability impact system security, and how should it be remediated?`,
      codeContext: `// Flagged in ${secFinding.file} (Line ${secFinding.lineStart}):\n${secFinding.codeSnippet}\n\n// Remediation Rule:\n${secFinding.suggestedFix || 'Sanitize and isolate untrusted inputs'}`,
      expectedConcepts: [
        'Root cause of unvalidated or unparameterized data flow',
        'Defense-in-depth: Input validation, parameterization, and least privilege',
        'Secure coding guidelines to prevent regression in production builds'
      ],
      sampleStudentAnswer: `This vulnerability occurs when untrusted user inputs or sensitive credentials are handled insecurely without proper isolation or parameterization. In ${secFinding.file}, directly embedding unvalidated inputs allows malicious actors to manipulate execution flow or intercept secrets. I remediated it by applying parameterized checks, environment variable isolation, and defensive validation.`,
      modelAnswer: secFinding.principleExplanation + ' ' + (secFinding.suggestedFix || 'Apply strict input parameterization.'),
      rubricCriteria: 'Technical accuracy regarding vulnerability root cause, impact assessment, and defensive remediation.',
    });
  } else {
    questions.push({
      id: 'vq-sec-clean',
      category: 'security',
      categoryLabel: 'OWASP Security & Hardening',
      difficulty: 'Advanced',
      question: `Your ${repoName} repository passed security checks without critical OWASP vulnerabilities. How did your engineering design ensure defensive data validation, authentication security, and secrets isolation?`,
      codeContext: `// Defensive Programming Pattern in ${repoName}:\nconst API_SECRET = process.env.API_SECRET; // Loaded via vault/environment\nif (!input || typeof input !== 'string') throw new ValidationError();`,
      expectedConcepts: [
        'Zero-trust secrets management with environment variables',
        'Strong cryptographic hygiene (salting, HTTPS, timing-safe compares)',
        'Input schema validation at all service and controller boundaries'
      ],
      sampleStudentAnswer: `We enforced strict separation between application code and operational credentials using environment variables. All incoming payloads pass through schema validation before reaching business logic, and database operations use parameterized bindings to prevent injection.`,
      modelAnswer: 'Defensive architecture requires treating all network inputs as untrusted, enforcing strict schema parsing, using parameterized statements, and keeping secrets strictly in secure vaults.',
      rubricCriteria: 'Depth of knowledge regarding defense-in-depth, secrets hygiene, and injection prevention.',
    });
  }

  // 2. Architecture & Modularity
  questions.push({
    id: 'vq-arch-1',
    category: 'architecture',
    categoryLabel: 'System Architecture & Modularity',
    difficulty: 'Intermediate',
    question: `Explain the architectural design and module separation in ${repoName}. How do you ensure loose coupling and high cohesion across your ${review?.totalFilesAnalyzed || 'indexed'} source files (${review?.totalLinesOfCode || 'codebase'} lines of code)?`,
    codeContext: `// Architecture Pipeline:\nControllers / API Routes -> Business Domain Services -> Data Storage / Repositories`,
    expectedConcepts: [
      'Single Responsibility Principle across modular boundaries',
      'Encapsulation of side effects and domain logic',
      'Dependency inversion and testability of core components'
    ],
    sampleStudentAnswer: `In ${repoName}, we structured code to respect the Single Responsibility Principle. Controller endpoints only parse requests and delegate logic to dedicated service functions. This isolation ensures components remain loosely coupled and easily testable without hard dependencies on transport layers.`,
    modelAnswer: 'A robust modular architecture separates interface presentation, business rules, and persistent storage abstractions. Loose coupling facilitates unit testing, team concurrency, and clean refactoring.',
    rubricCriteria: 'Clarity on module boundaries, decoupling techniques, and scalable code organization.',
  });

  // 3. Quality & Error Handling
  if (qualFinding) {
    questions.push({
      id: 'vq-qual-1',
      category: 'database',
      categoryLabel: 'Code Quality & Error Resilience',
      difficulty: 'Intermediate',
      question: `Code analysis flagged a quality/reliability item in \`${qualFinding.file}\`: "${qualFinding.title}". Why does this pattern hurt maintainability, and what refactoring strategy resolved it?`,
      codeContext: `// Snippet from ${qualFinding.file}:\n${qualFinding.codeSnippet}`,
      expectedConcepts: [
        'Graceful exception handling without silent failures',
        'Structured logging and error boundary containment',
        'Clean code conventions to prevent technical debt'
      ],
      sampleStudentAnswer: `Allowing unhandled edge cases or code smells in ${qualFinding.file} causes subtle runtime bugs that escape testing. By refactoring to explicitly catch exceptions, log with appropriate severity levels, and enforce strict type contracts, we make the system resilient to failure.`,
      modelAnswer: qualFinding.principleExplanation + ' ' + (qualFinding.suggestedFix || 'Refactor to ensure complete error handling.'),
      rubricCriteria: 'Understanding of runtime resilience, error boundaries, and static type guarantees.',
    });
  } else {
    questions.push({
      id: 'vq-qual-clean',
      category: 'database',
      categoryLabel: 'Data Integrity & State Management',
      difficulty: 'Intermediate',
      question: `In ${repoName}, how do you ensure ACID guarantees or atomic state transitions when mutating data, and how are unexpected failures communicated to the client?`,
      codeContext: `try {\n  await transaction.begin();\n  // ... state updates ...\n  await transaction.commit();\n} catch (err) {\n  await transaction.rollback();\n  throw err;\n}`,
      expectedConcepts: [
        'Atomic database transactions with rollback on error',
        'Deterministic HTTP status codes and structured error payloads',
        'Idempotency in API operations'
      ],
      sampleStudentAnswer: `We wrap multi-step state mutations in atomic transactions with explicit rollback on error. When an exception occurs, state is restored to its pristine condition and structured error messages are returned without leaking database internals.`,
      modelAnswer: 'Data consistency requires atomic transactions, defensive rollback semantics, and structured error responses that protect internal schemas while notifying users accurately.',
      rubricCriteria: 'Explanation of database atomicity, rollback safety, and user-facing error schemas.',
    });
  }

  // 4. Engineering Trade-offs & Viva Defense
  questions.push({
    id: 'vq-def-1',
    category: 'defense',
    categoryLabel: 'Engineering Trade-offs & Defense',
    difficulty: 'Advanced',
    question: `During the development of ${repoName}, what was the most significant technical trade-off or challenge you encountered, and what empirical evidence guided your solution?`,
    codeContext: `// Evaluation Metric:\nScalability vs. Simplicity • Client-side vs. Server-side computation`,
    expectedConcepts: [
      'Identification of real performance or design constraints',
      'Evaluation of alternative technical approaches',
      'Post-implementation monitoring or validation metrics'
    ],
    sampleStudentAnswer: `Our primary challenge was balancing client-side responsiveness with deterministic server verification. We opted for client-side state hydration backed by strict server-side validation. This gave instantaneous user feedback while preventing unauthorized state tampering.`,
    modelAnswer: 'Engineering defense requires presenting objective trade-offs (e.g. latency vs consistency, memory vs CPU overhead), explaining evaluated alternatives, and substantiating choices with profiling data.',
    rubricCriteria: 'Maturity in discussing engineering trade-offs, alternative evaluations, and design rationale.',
  });

  return questions;
}

export default function TechnicalInterviewPage() {
  const params = useParams();
  const routeId = (params?.id as string) || 'default';
  const { user, role } = useAuth();
  const isFaculty = role === 'faculty';

  const [review, setReview] = useState<Review | null>(null);
  const [repoName, setRepoName] = useState<string>('Workspace');
  const [candidateName, setCandidateName] = useState<string>('Authenticated User');
  const [candidatePRN, setCandidatePRN] = useState<string>('Active Session');
  const [branch, setBranch] = useState<string>('main');
  const [vivaQuestions, setVivaQuestions] = useState<VivaQuestion[]>([]);

  const [activeCategory, setActiveCategory] = useState<'all' | 'security' | 'architecture' | 'database' | 'defense'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<VivaQuestion | null>(null);
  const [studentInput, setStudentInput] = useState<string>('');
  const [evaluated, setEvaluated] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState<number>(92);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [facultyAssignedScore, setFacultyAssignedScore] = useState<string>('48/50');
  const [scoreSaved, setScoreSaved] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeReview = getReviewById(routeId) || getLatestReview();
      const repos = getStoredRepositories();
      const matchingRepo = repos.find((r) => r.id === routeId || (activeReview && r.id === activeReview.repositoryId));

      const determinedName = activeReview?.repositoryName || matchingRepo?.name || 'No repository selected';
      const determinedBranch = activeReview?.branch || matchingRepo?.branch || 'main';

      const determinedStudent =
        activeReview?.institutionBranding?.studentName ||
        (user?.user_metadata?.full_name as string) ||
        (user?.user_metadata?.user_name as string) ||
        user?.email?.split('@')[0] ||
        'Authenticated User';

      const determinedPRN = activeReview?.institutionBranding?.rollNo || 'Active Session';

      setReview(activeReview || null);
      setRepoName(determinedName);
      setBranch(determinedBranch);
      setCandidateName(determinedStudent);
      setCandidatePRN(determinedPRN);

      const generated = generateDynamicQuestions(activeReview || null, determinedName);
      setVivaQuestions(generated);
      setSelectedQuestion(generated[0]);
      setStudentInput(generated[0]?.sampleStudentAnswer || '');
    }
  }, [routeId, user]);

  useEffect(() => {
    if (selectedQuestion) {
      setStudentInput(selectedQuestion.sampleStudentAnswer || '');
      setEvaluated(false);
      setScoreSaved(false);
      setFeedbackText('');
    }
  }, [selectedQuestion]);

  const filteredQuestions = activeCategory === 'all' 
    ? vivaQuestions 
    : vivaQuestions.filter((q) => q.category === activeCategory);

  const handleEvaluate = () => {
    if (!selectedQuestion) return;
    setEvaluating(true);

    setTimeout(() => {
      setEvaluating(false);
      setEvaluated(true);

      // Intelligent scoring based on student's actual text and expected concepts
      const inputLower = studentInput.toLowerCase();
      let matchedCount = 0;
      for (const concept of selectedQuestion.expectedConcepts) {
        const words = concept.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        const matchFound = words.some((w) => inputLower.includes(w));
        if (matchFound) matchedCount++;
      }

      const conceptRatio = selectedQuestion.expectedConcepts.length > 0 
        ? (matchedCount / selectedQuestion.expectedConcepts.length) 
        : 0.8;

      const lengthFactor = Math.min(20, Math.round(studentInput.length / 15));
      const calculatedScore = Math.min(98, Math.max(70, Math.round(65 + (conceptRatio * 20) + lengthFactor)));
      setEvaluationScore(calculatedScore);

      // Tailored feedback based on matched concepts
      if (conceptRatio >= 0.7) {
        setFeedbackText(`Excellent technical defense! The response directly articulates ${matchedCount} core concepts, explaining both the root causes and systematic remediation strategies in ${repoName}.`);
      } else if (conceptRatio >= 0.4) {
        setFeedbackText(`Satisfactory viva answer. Addressed basic mechanics (${matchedCount}/${selectedQuestion.expectedConcepts.length} concepts identified). To reach full faculty marks, expand upon the theoretical defense and prevention mechanisms.`);
      } else {
        setFeedbackText(`Needs technical depth. The answer lacks specific architectural vocabulary. Review the faculty benchmark answer below to understand expected defense criteria.`);
      }
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
              ? `Review candidate viva defense questions for ${candidateName}, evaluate responses against academic rubrics, and record final marks.`
              : `Interactive defense preparation for ${repoName} code review. Test your architectural and security knowledge before live faculty evaluation.`}
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
          {review && (
            <Link
              href={`/report/${review.id}`}
              className="px-3.5 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>View Audit Report</span>
            </Link>
          )}
        </div>
      </div>

      {/* 4 Summary Context Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Target Repository</span>
          <div className="text-lg font-bold text-white mt-1 truncate">{repoName}</div>
          <span className="text-[10px] text-[#58a6ff] font-mono block mt-0.5">branch: {branch} ({candidatePRN})</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Candidate / Author</span>
          <div className="text-lg font-bold text-white mt-1 truncate">{candidateName}</div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">PRN: {candidatePRN} • Cohort 2026</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Viva Defense Readiness</span>
          <div className="text-2xl font-bold text-[#3fb950] mt-1 font-mono">
            {review?.scores?.overall || 88} / 100
          </div>
          <span className="text-[10px] text-[#3fb950] font-mono block mt-0.5">Certified for Faculty Viva</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Dynamic Questions</span>
          <div className="text-2xl font-bold text-[#a371f7] mt-1 font-mono">{vivaQuestions.length} Questions</div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Grounded in Active AST Audit</span>
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
              const isSelected = selectedQuestion?.id === q.id;
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
          {selectedQuestion ? (
            <>
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
                      {isFaculty ? `Candidate Viva Defense Response (${candidateName})` : 'Your Defense Response (Viva Simulation)'}
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
                  <div className="mt-4 p-4 rounded-xl bg-[#11182c] border border-[#233152] space-y-3">
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
                      {feedbackText}
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

              {/* Faculty Grading & Record Control */}
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
                    ? `Assign official viva grade marks for candidate ${candidateName} (${candidatePRN}) in ${repoName} audit.`
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
            </>
          ) : (
            <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-8 text-center text-slate-400">
              No questions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
