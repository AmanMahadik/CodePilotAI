'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Loader2
} from 'lucide-react';
import Logo from '@/components/Logo';

interface ChatItem {
  role: 'assistant' | 'user';
  author: string;
  content: string;
  context?: {
    file: string;
    lines: string;
    type: string;
  };
}

export default function TerminalAIPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      role: 'assistant',
      author: 'CodePilot AI • Repository Agent',
      content:
        "Hello Aman! I've indexed the Society_Sync repository. I can explain its architecture, inspect code, investigate findings, and suggest refactors.",
      context: {
        file: 'src/middleware/auth.ts',
        lines: '18-24',
        type: 'Repository indexed • TypeScript',
      },
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const newMsg: ChatItem = {
      role: 'user',
      author: 'Aman Mahadik',
      content: text,
      context: undefined,
    };
    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let ctx: { file: string; lines: string; type: string } | undefined = {
        file: 'src/middleware/auth.ts',
        lines: '18-24',
        type: 'Repository indexed • TypeScript',
      };

      const lower = text.toLowerCase();
      if (lower.includes('sql') || lower.includes('inject')) {
        reply =
          'The SQL injection in auth.ts occurs because req.body.email is interpolated directly into `SELECT * FROM users WHERE email = "${email}"`. To fix this, use parameterized queries with placeholders `?` or prisma.$queryRaw parameterized templates so input is never executed as SQL syntax.';
      } else if (lower.includes('architecture')) {
        reply =
          'Society_Sync is organized as a layered monolith: Expo mobile client communicating with Next.js 15 route handlers, Supabase Auth for token issuance, and PostgreSQL relational schemas managed by Prisma.';
        ctx = {
          file: 'src/api/routes.ts',
          lines: '1-45',
          type: 'Layered Monolith • Next.js 15',
        };
      } else if (lower.includes('payment') || lower.includes('adapter')) {
        reply =
          'The payment adapter in src/adapters/payment.ts can be refactored using an Idempotency-Key header stored in Redis to guarantee zero duplicate society maintenance billing runs upon network retries.';
        ctx = {
          file: 'src/adapters/payment.ts',
          lines: '12-38',
          type: 'Payment Service • TypeScript',
        };
      } else {
        reply =
          `I examined ${text} against the Society_Sync AST index. To maintain compliance with the CPA-PRD-001 SRS, ensure tenant isolation (societyId) checks on all queries.`;
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
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-130px)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 shrink-0">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
            SOCIETY_SYNC / AI ASSISTANT
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
          <span>Society_Sync • main</span>
        </div>

        {/* 2-Column Split Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: File Explorer (w-64) */}
          <div className="w-64 bg-[#0a0f1d] border-r border-[#1c2438] p-3 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <span>Explorer</span>
                <span>124 files</span>
              </div>

              {/* File Tree */}
              <div className="font-mono text-xs space-y-1 text-slate-300 select-none">
                <div className="flex items-center gap-1 text-slate-400">
                  <ChevronDown className="w-3 h-3" />
                  <span className="font-bold text-white">SOCIETY_SYNC</span>
                </div>

                <div className="pl-3 space-y-1">
                  <div className="flex items-center gap-1 text-[#58a6ff]">
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                    <span>src/</span>
                  </div>

                  <div className="pl-3 space-y-1">
                    <div className="flex items-center gap-1 text-slate-400">
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                      <span>middleware/</span>
                    </div>

                    <div className="pl-3">
                      <div className="px-2 py-1 rounded bg-[#18233c] text-white font-semibold flex items-center gap-1.5">
                        <span className="text-[10px] text-[#58a6ff] font-bold">TS</span>
                        <span>auth.ts</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 pt-1">
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                      <span>api/</span>
                    </div>
                    <div className="pl-3 text-slate-400 flex items-center gap-1.5 py-0.5">
                      <span className="text-[10px] text-[#58a6ff] font-bold">TS</span>
                      <span>residents.ts</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500 pt-1">
                      <ChevronRight className="w-3 h-3" />
                      <span>services/</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <ChevronRight className="w-3 h-3" />
                      <span>components/</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <ChevronRight className="w-3 h-3" />
                      <span>assets/</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <ChevronRight className="w-3 h-3" />
                      <span>docs/</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Findings Bottom Section in Explorer */}
            <div className="pt-3 border-t border-[#172033] space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Active Findings
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-[#da3633]"></span>
                  <span>SQL injection • Line 19</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-[#f0883e]"></span>
                  <span>Access control • Line 42</span>
                </div>
              </div>
            </div>
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

                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {msg.content}
                  </p>

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
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="p-3 rounded-xl bg-[#0e1424] border border-[#1c2438] text-xs text-slate-400 flex items-center gap-2 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#58a6ff]" />
                  <span>Grounding answer against repository AST index...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts & Input Bar */}
            <div className="pt-3 border-t border-[#1c2438] space-y-3 shrink-0">
              <div className="flex flex-wrap gap-2">
                {[
                  'Explain SQL injection',
                  'Refactor payment adapter',
                  'Explain architecture',
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
                    placeholder="Ask about your codebase..."
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
                  AI responses are simulated • Press Enter to send
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
