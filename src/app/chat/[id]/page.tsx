'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Bot, 
  User, 
  Send, 
  FileCode, 
  Terminal, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  Clock, 
  Loader2, 
  CornerDownRight, 
  ExternalLink 
} from 'lucide-react';
import { getReviewById, getStoredRepositories, getStoredReviews } from '@/lib/store';
import { ChatMessage, Finding, Repository, Review } from '@/lib/types';

export default function RepositoryChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const repoId = params?.id as string;
  const anchoredFindingId = searchParams?.get('findingId');

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize repository context and finding anchor
  useEffect(() => {
    const reviews = getStoredReviews();
    const review = Object.values(reviews).find((r) => r.repositoryId === repoId || r.id === repoId) || Object.values(reviews)[0];

    if (review && anchoredFindingId) {
      const found = review.findings.find((f) => f.id === anchoredFindingId);
      if (found) {
        setActiveFinding(found);
      }
    }

    // Load initial conversation history (FR-123)
    const initialMsgs: ChatMessage[] = [
      {
        id: 'msg-1',
        repositoryId: repoId || 'repo-1',
        role: 'assistant',
        content: `Hello! I am your CodePilot AI mentor grounded in repository **${review?.repositoryName || 'ecommerce-microservices'}** (FR-121). I have indexed all 38 files, AST representations, and audit findings. Ask me to explain any vulnerability, refactor anti-patterns, or suggest idiomatic TypeScript solutions.`,
        createdAt: new Date().toISOString(),
        citations: [
          {
            file: 'src/middleware/auth.ts',
            lineRange: '18-24',
            codeSnippet: 'const secret = process.env.JWT_SECRET || "SUPER_SECRET_DEFAULT_KEY_12345";',
          },
        ],
      },
    ];

    if (anchoredFindingId && review) {
      const found = review.findings.find((f) => f.id === anchoredFindingId);
      if (found) {
        initialMsgs.push({
          id: 'msg-anchor',
          repositoryId: repoId || 'repo-1',
          role: 'assistant',
          content: `You've anchored question context to **Finding #${found.id}: ${found.title}** located in \`${found.file}\` (lines ${found.lineStart}-${found.lineEnd}). How can I help you remediate or understand this finding?`,
          createdAt: new Date().toISOString(),
          anchoredFindingId: found.id,
          citations: [
            {
              file: found.file,
              lineRange: `${found.lineStart}-${found.lineEnd}`,
              codeSnippet: found.codeSnippet,
            },
          ],
        });
      }
    }

    setMessages(initialMsgs);
  }, [repoId, anchoredFindingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage('');

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      repositoryId: repoId,
      role: 'user',
      content: userText,
      createdAt: new Date().toISOString(),
      anchoredFindingId: activeFinding?.id,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    // Simulate RAG grounding latency (<2s SLA per PRD)
    setTimeout(() => {
      let replyContent = '';
      const citations = [];

      const lower = userText.toLowerCase();
      if (lower.includes('sql') || lower.includes('inject')) {
        replyContent = `The SQL injection vulnerability in \`src/controllers/product.controller.ts\` occurs because user input from query parameters is concatenated directly into the Prisma raw query string without parameter escaping. An attacker could pass a payload like \`' OR '1'='1\` to dump catalog contents or execute database modifications. \n\n**Recommended Fix**: Migrate from \`$queryRawUnsafe\` to Prisma type-safe query builders or \`$queryRaw\` parameterized template literals.`;
        citations.push({
          file: 'src/controllers/product.controller.ts',
          lineRange: '42-48',
          codeSnippet: 'const products = await prisma.$queryRawUnsafe(`SELECT * FROM products WHERE category = \'${category}\'`);',
        });
      } else if (lower.includes('secret') || lower.includes('jwt') || lower.includes('token')) {
        replyContent = `In \`src/middleware/auth.ts\`, the fallback string \`"SUPER_SECRET_DEFAULT_KEY_12345"\` provides an attacker with a known signing secret if \`process.env.JWT_SECRET\` is unset in production. \n\n**Staff Engineer Guideline**: Fail-fast configuration. Throw an explicit fatal exception during server startup if critical cryptographic secrets are missing, rather than defaulting to hardcoded strings.`;
        citations.push({
          file: 'src/middleware/auth.ts',
          lineRange: '18-24',
          codeSnippet: 'const secret = process.env.JWT_SECRET || "SUPER_SECRET_DEFAULT_KEY_12345";',
        });
      } else if (lower.includes('foreach') || lower.includes('async') || lower.includes('promise')) {
        replyContent = `Array.prototype.forEach is synchronous and does not await promise resolution inside its callback. In \`src/services/order.service.ts\`, stock reservations run asynchronously in the background while the route controller immediately sends a success response to the client. If stock reservation fails, the client already received an order confirmation. Use \`await Promise.all(items.map(...))\` or a \`for (const item of items)\` loop.`;
        citations.push({
          file: 'src/services/order.service.ts',
          lineRange: '89-97',
          codeSnippet: 'items.forEach(async (item) => { await inventoryService.reserveStock(item.id, item.quantity); });',
        });
      } else {
        replyContent = `Based on the repository index for \`${repoId}\`, I've analyzed your question against the codebase AST. In this module, ensuring strong interface contracts, sanitizing database queries, and handling asynchronous promise loops correctly are the primary areas needed to meet production standards.`;
        citations.push({
          file: 'src/services/order.service.ts',
          lineRange: '12-30',
          codeSnippet: '// Domain service logic for order orchestration',
        });
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        repositoryId: repoId,
        role: 'assistant',
        content: replyContent,
        createdAt: new Date().toISOString(),
        citations,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1400);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col h-[calc(100vh-140px)]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/review/rev-1"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Repository Grounded AI Chat
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                FR-121 - FR-124
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded over AST embeddings & codebase index • Latency &lt; 2s (P95)
            </p>
          </div>
        </div>

        {activeFinding && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800 text-xs text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Anchored to #{activeFinding.id} (FR-122)</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-5 pr-2">
        {messages.map((msg) => {
          const isAI = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                isAI ? 'justify-start' : 'justify-end'
              }`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 shadow-md ${
                  isAI
                    ? 'bg-slate-900/90 text-slate-200 border border-slate-800'
                    : 'bg-brand-600 text-white'
                }`}
              >
                {/* Anchored badge if present */}
                {msg.anchoredFindingId && (
                  <div className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-mono mb-2 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800">
                    <span>Anchored Context: #{msg.anchoredFindingId}</span>
                  </div>
                )}

                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                {/* Source Citations (FR-124) */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Source Code Citations (FR-124):
                    </span>
                    {msg.citations.map((cite, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-[11px] font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between text-brand-300">
                          <span className="flex items-center gap-1">
                            <FileCode className="w-3 h-3" />
                            {cite.file} (lines {cite.lineRange})
                          </span>
                          <span className="text-[9px] text-slate-500">grounded context</span>
                        </div>
                        {cite.codeSnippet && (
                          <pre className="text-slate-400 text-[10.5px] overflow-x-auto bg-slate-950/60 p-2 rounded">
                            {cite.codeSnippet}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
              <span>Grounding answer against repository AST index...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-Ups */}
      <div className="pb-3 flex flex-wrap gap-2 text-xs">
        {[
          'Explain the SQL injection vulnerability in product.controller.ts',
          'How do I fix the hardcoded JWT secret?',
          'Why does forEach with async cause unhandled race conditions?',
          'Generate unit tests for payment.adapter.ts',
        ].map((q, idx) => (
          <button
            key={idx}
            onClick={() => setInputMessage(q)}
            className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="relative shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question about the repository code, architecture, or specific findings..."
          className="w-full pl-4 pr-24 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isTyping}
          className="absolute right-2 top-2 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-40"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
