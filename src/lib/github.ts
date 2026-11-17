import { Repository } from './types';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase/client';

export interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  private: boolean;
  updated_at: string;
  size: number;
}

/**
 * Maps a raw GitHub API repository object to CodePilot AI's Repository interface
 */
export function mapGitHubToRepository(gh: GitHubRepoItem, ownerLogin?: string): Repository {
  const language = gh.language || 'TypeScript';
  const loc = gh.size > 0 ? Math.max(gh.size * 25, 450) : 2400;
  const files = Math.max(Math.round(loc / 120), 12);
  
  // Deterministic health score calibration based on stars/issues
  const scoreBase = 88;
  const issuePenalty = Math.min((gh.open_issues_count || 0) * 2, 14);
  const starBonus = Math.min((gh.stargazers_count || 0) * 1, 6);
  const score = Math.max(65, Math.min(98, scoreBase - issuePenalty + starBonus));

  return {
    id: `gh-${gh.id}`,
    name: gh.name,
    owner: ownerLogin || gh.owner?.login || 'developer',
    source: 'github',
    branch: gh.default_branch || 'main',
    url: gh.html_url,
    primaryLanguage: language,
    languageDistribution: { [language]: 100 },
    latestScore: score,
    totalFiles: files,
    totalLOC: loc,
    reviewCount: 1,
    exclusionRules: ['node_modules', '.git', 'dist', 'build', '.next'],
    createdAt: gh.updated_at,
    lastReviewedAt: 'Ready for AI review',
  };
}

/**
 * Fetches all repositories for the logged-in student:
 * 1. Using GitHub Provider OAuth Token from Supabase session (both public + private)
 * 2. Fallback using GitHub username from user_metadata (public repos)
 * 3. Fallback from local storage or mock starter repos
 */
export async function fetchStudentGithubRepositories(
  user: User | null,
  session: Session | null,
  manualUsername?: string
): Promise<{ repos: Repository[]; rawCount: number; error: string | null }> {
  try {
    // 1. Check for manual username or user_metadata username
    const username = manualUsername || 
                     user?.user_metadata?.user_name || 
                     user?.user_metadata?.preferred_username ||
                     (user?.app_metadata?.provider === 'github' ? user?.email?.split('@')[0] : null);

    // 2. Check for OAuth provider_token in session
    const providerToken = session?.provider_token || 
                          (typeof window !== 'undefined' ? localStorage.getItem('codepilot_gh_token') : null);

    let apiUrl = '';
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (providerToken) {
      // Authenticated endpoint returning all private and public repos
      apiUrl = 'https://api.github.com/user/repos?sort=updated&per_page=50&type=all';
      headers['Authorization'] = `Bearer ${providerToken}`;
    } else if (username) {
      // Public user repositories endpoint
      apiUrl = `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=50`;
    } else {
      // Return cached or fallback repos if no user is connected
      const cached = getCachedRepositories();
      return { repos: cached, rawCount: cached.length, error: null };
    }

    const res = await fetch(apiUrl, { headers });
    
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson.message || `GitHub API responded with status ${res.status}`;
      console.warn('GitHub fetch warning:', msg);
      const cached = getCachedRepositories();
      return { repos: cached, rawCount: cached.length, error: msg };
    }

    const data: GitHubRepoItem[] = await res.json();
    if (!Array.isArray(data)) {
      const cached = getCachedRepositories();
      return { repos: cached, rawCount: cached.length, error: 'Unexpected response format from GitHub' };
    }

    const mapped = data.map((item) => mapGitHubToRepository(item, username || undefined));

    // Cache locally for instant page transitions
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('codepilot_student_repos', JSON.stringify(mapped));
        if (username) {
          localStorage.setItem('codepilot_student_gh_username', username);
        }
      } catch (e) {
        console.warn('Could not cache repos in localStorage:', e);
      }
    }

    return { repos: mapped, rawCount: data.length, error: null };
  } catch (err: unknown) {
    console.error('Error fetching student GitHub repositories:', err);
    const cached = getCachedRepositories();
    return { repos: cached, rawCount: cached.length, error: (err as Error).message };
  }
}

/**
 * Returns cached repositories from localStorage or fallback starter repos
 */
export function getCachedRepositories(): Repository[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('codepilot_student_repos');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading cached repos:', e);
    }
  }

  // Default starter repositories
  return [
    {
      id: 'repo-1',
      name: 'Society_Sync',
      owner: 'developer',
      source: 'github',
      branch: 'main',
      url: 'https://github.com/developer/Society_Sync',
      primaryLanguage: 'TypeScript',
      languageDistribution: { TypeScript: 82, JavaScript: 12, SQL: 6 },
      latestScore: 92,
      totalFiles: 124,
      totalLOC: 14280,
      reviewCount: 4,
      exclusionRules: ['node_modules', '.git'],
      createdAt: new Date().toISOString(),
      lastReviewedAt: '12 min ago',
    },
    {
      id: 'repo-2',
      name: 'Hyperlocal-Civic',
      owner: 'developer',
      source: 'github',
      branch: 'main',
      url: 'https://github.com/developer/civic-reporter',
      primaryLanguage: 'JavaScript',
      languageDistribution: { JavaScript: 90, HTML: 10 },
      latestScore: 78,
      totalFiles: 45,
      totalLOC: 4800,
      reviewCount: 2,
      exclusionRules: ['node_modules', '.git'],
      createdAt: new Date().toISOString(),
      lastReviewedAt: 'Yesterday',
    },
    {
      id: 'repo-3',
      name: 'Campus-Connect',
      owner: 'developer',
      source: 'github',
      branch: 'develop',
      url: 'https://github.com/developer/campus-connect',
      primaryLanguage: 'Java',
      languageDistribution: { Java: 85, XML: 15 },
      latestScore: 88,
      totalFiles: 62,
      totalLOC: 7200,
      reviewCount: 3,
      exclusionRules: ['node_modules', '.git'],
      createdAt: new Date().toISOString(),
      lastReviewedAt: '2 days ago',
    },
    {
      id: 'repo-4',
      name: 'Energy-Saver',
      owner: 'developer',
      source: 'upload_zip',
      branch: 'main',
      url: 'https://github.com/developer/energy-saver',
      primaryLanguage: 'TypeScript',
      languageDistribution: { TypeScript: 95, CSS: 5 },
      latestScore: 85,
      totalFiles: 38,
      totalLOC: 3950,
      reviewCount: 1,
      exclusionRules: ['node_modules', '.git'],
      createdAt: new Date().toISOString(),
      lastReviewedAt: '4 days ago',
    },
  ];
}
