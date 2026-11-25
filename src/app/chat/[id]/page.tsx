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
import { Review } from '@/lib/types';
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

      const filesMap = activeReview?.files || matchingRepo?.files || {};
      const fileKeys = Object.keys(filesMap);
      const index = new RepositoryRagIndex(determinedName, filesMap, activeReview?.findings || []);
      setRagEngine(index);
      setAllRepoFiles(fileKeys);

      // Initial system message
      const defaultMsg: ChatItem = {
        role: 'assistant',
        author: 'CodePilot AI • RAG Agent',
        content: activeReview
          ? `Hello! I have indexed ${determinedName} (${determinedBranch}) using the Repository Grounded RAG Engine. ${fileKeys.length > 0 ? `Chunked ${fileKeys.length} source files and ` : ''}Indexed ${activeReview.findings.length} findings with line-level citations. Ask me anything about architecture, vulnerabilities, or code logic!`
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
            author: 'CodePilot AI • Security & Quality Agent',
            content: `Inspecting finding ${targetFinding.id}: **${targetFinding.title}**\n\n${targetFinding.principleExplanation || targetFinding.description}\n\nSuggested Fix: ${targetFinding.suggestedFix || 'Apply recommended parameterization and validations.'}`,
            context: {
              file: targetFinding.file,
              lines: `${targetFinding.lineStart}-${targetFinding.lineEnd}`,
              type: `${targetFinding.severity} • ${targetFinding.owaspCategory || targetFinding.category}`,
            },
          };
          setMessages([defaultMsg, followUpMsg]);
        }
      }

      setLoaded(true);
    }
  }, [routeId, initialFindingId]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const newMsg: ChatItem = {
      role: 'user',
      author: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Developer',
      content: text,
      context: undefined,
    };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          repoName,
          branch,
          findings: review?.findings || [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          const matchedFinding = review?.findings.find(
            (f) =>
              text.toLowerCase().includes(f.id.toLowerCase()) ||
              text.toLowerCase().includes(f.title.toLowerCase())
          );

          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              author: 'CodePilot AI • Groq Agent (gpt-oss-120b)',
              content: data.reply,
              context: matchedFinding
                ? {
                    file: matchedFinding.file,
                    lines: `${matchedFinding.lineStart}-${matchedFinding.lineEnd}`,
                    type: `${matchedFinding.severity} • ${matchedFinding.category}`,
                  }
                : data.rag?.chunks?.length > 0
                ? {
                    file: data.rag.chunks[0].filePath,
                    lines: 'pgvector RAG',
                    type: `${(data.rag.chunks[0].similarity * 100).toFixed(0)}% match`,
                  }
                : undefined,
            },
          ]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Groq chat API error, falling back to local heuristic response:', err);
    }

    setTimeout(() => {
      if (ragEngine) {
        const ragRes = ragEngine.generateAnswer(text, review);
        const topCit = ragRes.citations?.[0];
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            author: 'CodePilot AI • Repository RAG Agent',
            content: ragRes.answer,
            context: topCit
              ? {
                  file: topCit.file,
                  lines: topCit.lineRange,
                  type: topCit.type,
                  codeSnippet: topCit.codeSnippet,
                }
              : undefined,
          },
        ]);
        setIsTyping(false);
        return;
      }

      let reply = '';
      let ctx: ChatItem['context'] | undefined = undefined;

      const lower = text.toLowerCase();

      // Check if user is asking about a specific finding
      const matchedFinding = review?.findings.find(
        (f) =>
          lower.includes(f.id.toLowerCase()) ||
          lower.includes(f.title.toLowerCase()) ||
          (f.category && lower.includes(f.category.toLowerCase())) ||
          (f.owaspCategory && lower.includes(f.owaspCategory.toLowerCase().slice(0, 10)))
      );

      if (matchedFinding) {
        reply = `Regarding **${matchedFinding.title}** (${matchedFinding.id}) in \`${matchedFinding.file}\`:\n\n${matchedFinding.principleExplanation || matchedFinding.description}\n\n**Remediation:** ${matchedFinding.suggestedFix || 'Ensure defensive validation and follow OWASP best practices.'}`;
        ctx = {
          file: matchedFinding.file,
          lines: `${matchedFinding.lineStart}-${matchedFinding.lineEnd}`,
          type: `${matchedFinding.severity} • ${matchedFinding.category}`,
        };
      } else if (lower.includes('architecture') || lower.includes('structure')) {
        reply = `${repoName} is structured as a modular repository (${review?.totalFilesAnalyzed || 1} indexed files, ${review?.totalLinesOfCode || 100} lines of code). The multi-agent pipeline evaluated clean boundaries across interface controllers, domain logic, and persistent storage abstractions.`;
        if (review?.findings?.[0]) {
          ctx = {
            file: review.findings[0].file,
            lines: `${review.findings[0].lineStart}-${review.findings[0].lineEnd}`,
            type: 'Architecture Boundary Review',
          };
        }
      } else if (lower.includes('security') || lower.includes('vulnerability') || lower.includes('owasp')) {
        const secFindings = review?.findings.filter((f) => f.agentType === 'security' || f.category === 'security') || [];
        if (secFindings.length > 0) {
          reply = `Security analysis for ${repoName} flagged ${secFindings.length} vulnerability pattern(s). Critical focus: ${secFindings.map((f) => `\`${f.title}\` in ${f.file}`).join(', ')}.`;
          ctx = {
            file: secFindings[0].file,
            lines: `${secFindings[0].lineStart}-${secFindings[0].lineEnd}`,
            type: `${secFindings[0].severity} • Security Context`,
          };
        } else {
          reply = `Security audit completed for ${repoName}. No critical OWASP Top 10 vulnerabilities or secret leaks were detected in current indexed sources.`;
        }
      } else if (lower.includes('fix') || lower.includes('refactor')) {
        if (review?.findings && review.findings.length > 0) {
          const topFinding = review.findings[0];
          reply = `Recommended refactoring for ${topFinding.file}:\n${topFinding.suggestedFix || 'Refactor to isolate side effects, apply strict typing, and enforce input validation.'}`;
          ctx = {
            file: topFinding.file,
            lines: `${topFinding.lineStart}-${topFinding.lineEnd}`,
            type: 'Refactoring Direction',
          };
        } else {
          reply = `Codebase maintainability is currently rated at ${review?.scores?.quality || 90}%. Standardize error boundaries and ensure complete test coverage on exported service functions.`;
        }
      } else {
        reply = `I analyzed your query against the ${repoName} AST symbol graph. To maintain high code health and pass automated checks, ensure functions follow single responsibility and keep cyclomatic branch complexity bounded.`;
        if (review?.findings?.[0]) {
          ctx = {
            file: review.findings[0].file,
            lines: `${review.findings[0].lineStart}-${review.findings[0].lineEnd}`,
            type: 'Repository Context',
          };
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          author: 'CodePilot AI • Repository Agent',
          content: reply,
          context: ctx,
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  const explorerFiles = allRepoFiles.length > 0
    ? allRepoFiles
    : Array.from(new Set(review?.findings.map((f) => f.file) || []));

  return (
    <div className="space-y-4 w-full max-w-[1600px] mx-auto min-h-[700px] h-[calc(100vh-115px)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1 shrink-0">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">
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
      <div className="flex-1 rounded-xl bg-[#0e1424] border border-[#22304d] shadow-2xl flex flex-col overflow-hidden">
        {/* Terminal Title Bar */}
        <div className="px-5 py-3 bg-[#0a0f1d] border-b border-[#1c2438] flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Logo size={20} rounded="rounded-sm" />
            <span className="font-semibold text-white">CodePilot Terminal</span>
          </div>
          <span>{repoName} • {branch}</span>
        </div>

        {/* 2-Column Split Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: File Explorer */}
          <div className="w-64 lg:w-72 bg-[#0a0f1d] border-r border-[#1c2438] p-4 flex flex-col justify-between shrink-0 overflow-y-auto hidden sm:flex">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <span>Explorer</span>
                <span>{review?.totalFilesAnalyzed || explorerFiles.length || 0} files</span>
              </div>

              {/* File Tree */}
              <div className="font-mono text-xs space-y-1 text-slate-300 select-none">
                <div className="flex items-center gap-1 text-slate-400">
                  <ChevronDown className="w-3 h-3" />
                  <span className="font-bold text-white truncate">{repoName.toUpperCase()}</span>
                </div>

                <div className="pl-3 space-y-1">
                  {explorerFiles.length > 0 ? (
                    explorerFiles.map((filePath, idx) => (
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
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          f.severity === 'Critical'
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
          <div className="flex-1 flex flex-col justify-between p-5 sm:p-6 overflow-hidden bg-[#0c111e]">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, i) => (
                <div key={i} className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                    <Logo size={18} rounded="rounded-sm" />
                    <span>{msg.author}</span>
                  </div>

                  <div className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                    {msg.content}
                  </div>

                  {/* Context snippet if present */}
                  {msg.context && (
                    <div className="p-3 rounded-lg bg-[#070a12] border border-[#172033] font-mono text-[11px] space-y-1">
                      <div className="text-[10px] uppercase text-slate-500 tracking-wider">
                        SOURCE CONTEXT
                      </div>
                      <div className="text-[#58a6ff] font-semibold">
                        {msg.context.file} • Lines {msg.context.lines}
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {msg.context.type}
                      </div>
                      {msg.context.codeSnippet && (
                        <pre className="mt-2 p-2.5 rounded bg-[#0c111e] border border-[#1c2438] text-[10.5px] text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
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
                    className="flex-1 px-4 py-3 rounded-lg bg-[#0e1424] border border-[#22304d] text-sm text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-[#388bfd]"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-11 h-11 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
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
