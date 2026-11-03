import React from 'react';
import { AgentExecutionStatus } from '@/lib/types';
import { 
  FolderGit2, 
  Sparkles, 
  ShieldAlert, 
  BookOpen, 
  CheckCircle2, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

interface MultiAgentPipelineProps {
  agents: AgentExecutionStatus[];
}

export default function MultiAgentPipeline({ agents }: MultiAgentPipelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'repository':
        return FolderGit2;
      case 'quality':
        return Sparkles;
      case 'security':
        return ShieldAlert;
      case 'documentation':
        return BookOpen;
      default:
        return Sparkles;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'running':
        return 'text-brand-400 bg-brand-500/10 border-brand-500/30 animate-pulse';
      case 'failed':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-slate-400 bg-slate-800/40 border-slate-700/40';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-5 border-b border-slate-800/80 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Multi-Agent Orchestration Pipeline
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
              FR-071
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous agent swarm analyzing repository structure, code hygiene, OWASP security, and documentation.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          SLA Target: &lt;60s <span className="text-emerald-400 font-semibold">(Achieved: 40s)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {agents.map((agent, idx) => {
          const Icon = getIcon(agent.agentType);
          return (
            <div
              key={agent.agentType}
              className="relative p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group"
            >
              {/* Connector line for desktop */}
              {idx < agents.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 w-4 h-0.5 bg-slate-800 z-10" />
              )}

              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-brand-400 group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(agent.status)}`}>
                  {agent.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  {agent.status === 'running' && <Loader2 className="w-3 h-3 text-brand-400 animate-spin" />}
                  {agent.status === 'failed' && <AlertCircle className="w-3 h-3 text-rose-400" />}
                  <span className="capitalize">{agent.status}</span>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                {agent.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {agent.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{(agent.durationMs / 1000).toFixed(1)}s runtime</span>
                <span className="text-brand-400 font-semibold">
                  {agent.findingsCount} {agent.findingsCount === 1 ? 'finding' : 'findings'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
