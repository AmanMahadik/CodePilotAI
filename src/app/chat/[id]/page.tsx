'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Command,
  Send,
  FileCode,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Bot,
  ArrowUp,
  Loader2,
  FolderGit2
} from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/supabase/auth-context';
import { getReviewById, getLatestReview, getStoredRepositories } from '@/lib/store';
import { Review, Finding, Repository } from '@/lib/types';
import { RepositoryRagIndex } from '@/lib/rag-engine';

interface ChatItem {
  role: 'assistant' | 'user';
  author: string;
  content: string;
  context?: {
    file: string;
    lines: string;
    type: string;
    codeSnippet?: string;
  };
}

export default function TerminalAIPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = (params?.id as string) || '';
  const initialFindingId = searchParams.get('findingId');

  const { user } = useAuth();
  const [review, setReview] = useState<Review | null>(null);
  const [repoName, setRepoName] = useState<string>('Engineering Workspace');
  const [branch, setBranch] = useState<string>('main');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ragEngine, setRagEngine] = useState<RepositoryRagIndex | null>(null);
  const [allRepoFiles, setAllRepoFiles] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeReview = getReviewById(routeId) || getLatestReview();
      const repos = getStoredRepositories();
      const matchingRepo = repos.find((r) => r.id === routeId || (activeReview && r.id === activeReview.repositoryId));

      const determinedName = activeReview?.repositoryName || matchingRepo?.name || 'Workspace';
      const determinedBranch = activeReview?.branch || matchingRepo?.branch || 'main';

      setReview(activeReview || null);
      setRepoName(determinedName);
      setBranch(determinedBranch);

      const filesMap = activeReview?.files || matchingRepo?.files || {
        'src/index.ts': `// Application root for ${determinedName}\nimport express from 'express';\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.get('/api/health', (req, res) => res.json({ status: 'ok', service: '${determinedName}' }));\napp.listen(PORT, () => console.log('Listening on ' + PORT));\n`,
        'src/auth.ts': `// Authentication & session validation\nimport jwt from 'jsonwebtoken';\nconst JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';\n\nexport function verifySession(token: string) {\n  try {\n    return jwt.verify(token, JWT_SECRET);\n  } catch (err) {\n    return null;\n  }\n}\n`,
        'README.md': `# ${determinedName}\n\nAutomated analysis target repository.\n## Getting Started\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`,
      };

      const index = new RepositoryRagIndex(determinedName, filesMap, activeReview?.findings || []);
      setRagEngine(index);
      setAllRepoFiles(Object.keys(filesMap));

      // Initial system message
      const defaultMsg: ChatItem = {
        role: 'assistant',
        author: 'CodePilot AI • RAG Agent',
        content: activeReview
          ? `Hello! I have indexed ${determinedName} (${determinedBranch}) using the Repository Grounded RAG Engine. I have chunked ${Object.keys(filesMap).length} source files and indexed ${activeReview.findings.length} findings with line-level citations. Ask me anything about architecture, vulnerabilities, or code logic!`
          : `Hello! CodePilot Terminal RAG Engine is online. Connect or review a repository to inspect codebase architecture, OWASP vulnerabilities, and AST metrics.`,
        context: activeReview?.findings?.[0]
          ? {
            file: activeReview.findings[0].file,
            lines: `${activeReview.findings[0].lineStart}-${activeReview.findings[0].lineEnd}`,
            type: `${activeReview.findings[0].severity} • ${activeReview.findings[0].category}`,
            codeSnippet: activeReview.findings[0].codeSnippet,
          }
          : undefined,
      };

      setMessages([defaultMsg]);

      // If redirected with a specific findingId, trigger explanation
      if (initialFindingId && activeReview) {
        const targetFinding = activeReview.findings.find((f) => f.id === initialFindingId);
        if (targetFinding) {
          const followUpMsg: ChatItem = {
            role: 'assistant',
            author: 'CodePilot AI • RAG Agent',
            content: `Inspecting finding ${targetFinding.id}: **${targetFinding.title}**\n\n${targetFinding.principleExplanation || targetFinding.description}\n\nSuggested Fix: ${targetFinding.suggestedFix || 'Apply recommended parameterization and validations.'}`,
            context: {
              file: targetFinding.file,
              lines: `${targetFinding.lineStart}-${targetFinding.lineEnd}`,
              type: `${targetFinding.severity} • ${targetFinding.owaspCategory || targetFinding.category}`,
              codeSnippet: targetFinding.codeSnippet,
            },
          };
          setMessages([defaultMsg, followUpMsg]);
        }
      }

      setLoaded(true);
    }
  }, [routeId, initialFindingId]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const newMsg: ChatItem = {
      role: 'user',
      author: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Developer',
      content: text,
      context: undefined,
    };
    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let ctx: { file: string; lines: string; type: string; codeSnippet?: string } | undefined = undefined;

      if (ragEngine) {
        const ragRes = ragEngine.generateAnswer(text, review);
        reply = ragRes.answer;
        if (ragRes.citations && ragRes.citations.length > 0) {
          const topCit = ragRes.citations[0];
          ctx = {
            file: topCit.file,
            lines: topCit.lineRange,
            type: topCit.type,
            codeSnippet: topCit.codeSnippet,
          };
        }
      } else {
        reply = `I processed your request regarding ${repoName}. To ground responses, ensure repository files are indexed.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          author: 'CodePilot AI • RAG Agent',
          content: reply,
          context: ctx,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const uniqueFiles = Array.from(new Set(review?.findings.map((f) => f.file) || []));

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-130px)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 shrink-0">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
            {repoName.toUpperCase()} / AI ASSISTANT
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Terminal AI
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Repository-grounded engineering conversation.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#238636]/15 border border-[#238636]/30 text-[#3fb950] text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse"></span>
          <span>Context connected</span>
        </div>
      </div>

      {/* Main Terminal Window with Landscape Two-Column Layout */}
      <div className="flex-1 rounded-xl bg-[#0e1424] border border-[#1c2438] flex flex-col overflow-hidden">
        {/* Terminal Title Bar */}
        <div className="px-4 py-2.5 bg-[#0a0f1d] border-b border-[#1c2438] flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Logo size={18} rounded="rounded-sm" />
            <span className="font-semibold text-white">CodePilot Terminal</span>
          </div>
          <span>{repoName} • {branch}</span>
        </div>

        {/* 2-Column Split Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: File Explorer (w-64) */}
          <div className="w-64 bg-[#0a0f1d] border-r border-[#1c2438] p-3 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <span>Explorer</span>
                <span>{review?.totalFilesAnalyzed || uniqueFiles.length || 0} files</span>
              </div>

              {/* File Tree */}
              <div className="font-mono text-xs space-y-1 text-slate-300 select-none">
                <div className="flex items-center gap-1 text-slate-400">
                  <ChevronDown className="w-3 h-3" />
                  <span className="font-bold text-white truncate">{repoName.toUpperCase()}</span>
                </div>

                <div className="pl-3 space-y-1">
                  {(allRepoFiles.length > 0 ? allRepoFiles : uniqueFiles).length > 0 ? (
                    (allRepoFiles.length > 0 ? allRepoFiles : uniqueFiles).map((filePath, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSend(`Explain code in ${filePath}`)}
                        className="px-2 py-1 rounded hover:bg-[#18233c] text-slate-300 hover:text-white cursor-pointer flex items-center gap-1.5 truncate transition-colors text-[11px]"
                      >
                        <FileCode className="w-3 h-3 text-[#58a6ff] shrink-0" />
                        <span className="truncate">{filePath}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-500 italic py-2 pl-2">
                      No files loaded. Connect a repo to explore AST trees.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Findings Bottom Section in Explorer */}
            {review && review.findings && review.findings.length > 0 && (
              <div className="pt-3 border-t border-[#172033] space-y-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Active Findings
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  {review.findings.slice(0, 4).map((f) => (
                    <div
                      key={f.id}
                      onClick={() => handleSend(`Explain finding ${f.id}: ${f.title}`)}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer truncate transition-colors"
                      title={f.title}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${f.severity === 'Critical'
                          ? 'bg-[#da3633]'
                          : f.severity === 'High'
                            ? 'bg-[#f0883e]'
                            : 'bg-[#e3b341]'
                          }`}
                      ></span>
                      <span className="truncate text-[11px]">{f.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Chat Conversation & Input */}
          <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden bg-[#0c111e]">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, i) => (
                <div key={i} className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                    <Logo size={18} rounded="rounded-sm" />
                    <span>{msg.author}</span>
                  </div>

                  <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                    {msg.content}
                  </div>

                  {/* Context snippet if present */}
                  {msg.context && (
                    <div className="p-3 rounded-lg bg-[#070a12] border border-[#172033] font-mono text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] uppercase text-slate-500 tracking-wider">
                        <span>GROUNDED RAG CITATION</span>
                        <span className="text-[#3fb950] font-semibold">Vector & Symbol Match</span>
                      </div>
                      <div className="text-[#58a6ff] font-semibold flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 shrink-0" />
                        <span>{msg.context.file}</span>
                        <span className="text-slate-400 font-normal">• Lines {msg.context.lines}</span>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {msg.context.type}
                      </div>
                      {msg.context.codeSnippet && (
                        <pre className="p-2.5 rounded bg-[#04060a] border border-[#141b2d] text-slate-300 text-[10px] overflow-x-auto whitespace-pre font-mono leading-relaxed mt-1">
                          {msg.context.codeSnippet}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="p-3 rounded-xl bg-[#0e1424] border border-[#1c2438] text-xs text-slate-400 flex items-center gap-2 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#58a6ff]" />
                  <span>Grounding response against {repoName} AST index...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts & Input Bar */}
            <div className="pt-3 border-t border-[#1c2438] space-y-3 shrink-0">
              <div className="flex flex-wrap gap-2">
                {[
                  review?.findings?.[0]
                    ? `Explain finding ${review.findings[0].id}`
                    : 'Explain repository architecture',
                  'Check OWASP security vulnerabilities',
                  'Suggest code refactoring',
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="px-3 py-1 rounded-md bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-[11px] font-mono text-slate-300 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask about ${repoName}...`}
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#0e1424] border border-[#22304d] text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-[#388bfd]"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-9 h-9 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </form>
                <div className="text-[10px] text-slate-500 font-mono mt-1.5">
                  AI responses are grounded in repository AST index • Press Enter to send
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
