'use client';

import { Repository, Review, NotificationItem } from './types';
import { INITIAL_REPOSITORIES, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS } from './sample-data';

const REPOS_KEY = 'codepilot_repositories';
const REVIEWS_KEY = 'codepilot_reviews';
const NOTIFS_KEY = 'codepilot_notifications';
const FACULTY_SUBMISSIONS_KEY = 'codepilot_faculty_submissions';

const LEGACY_DEMO_REPO_NAMES = new Set(['ecommerce-microservices', 'e-commerce-microservices']);

export interface FacultySubmission {
  id: string;
  name: string;
  prn: string;
  rollNo: string;
  batch: string;
  repoName: string;
  branch: string;
  score: number;
  criticals: number;
  highs: number;
  status: 'Graded' | 'Needs Review';
  grade: string;
  submittedAt: string;
  reviewLink: string;
}

const DEFAULT_FACULTY_SUBMISSIONS: FacultySubmission[] = [];

function isLegacySampleReview(review: Review): boolean {
  const repoLower = (review.repositoryName || '').toLowerCase();
  if (LEGACY_DEMO_REPO_NAMES.has(repoLower)) return true;
  if (review.id === 'rev-1' && review.repositoryName === 'Society_Sync' && review.institutionBranding?.rollNo === 'DEV-001') {
    return true;
  }
  return false;
}

export function getStoredRepositories(): Repository[] {
  if (typeof window === 'undefined') return INITIAL_REPOSITORIES;
  try {
    const data = localStorage.getItem(REPOS_KEY);
    if (!data) return INITIAL_REPOSITORIES;
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return INITIAL_REPOSITORIES;
    return parsed.filter((r: Repository) => !LEGACY_DEMO_REPO_NAMES.has((r.name || '').toLowerCase()));
  } catch {
    return INITIAL_REPOSITORIES;
  }
}

export function saveRepository(repo: Repository): void {
  if (typeof window === 'undefined') return;
  const current = getStoredRepositories();
  const existingIdx = current.findIndex((r) => r.id === repo.id);
  let updated: Repository[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = repo;
  } else {
    updated = [repo, ...current];
  }
  localStorage.setItem(REPOS_KEY, JSON.stringify(updated));
}

export function getStoredReviews(): Record<string, Review> {
  if (typeof window === 'undefined') return INITIAL_REVIEWS;
  try {
    const data = localStorage.getItem(REVIEWS_KEY);
    if (!data) return INITIAL_REVIEWS;
    const parsed = JSON.parse(data);
    if (typeof parsed !== 'object' || parsed === null) return INITIAL_REVIEWS;

    const cleaned: Record<string, Review> = {};
    let hadLegacy = false;
    for (const [k, rev] of Object.entries(parsed as Record<string, Review>)) {
      if (rev && !isLegacySampleReview(rev)) {
        cleaned[k] = rev;
      } else {
        hadLegacy = true;
      }
    }

    if (hadLegacy) {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(cleaned));
    }

    return cleaned;
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function getLatestReview(): Review | undefined {
  const reviews = getStoredReviews();
  const values = Object.values(reviews);
  if (values.length === 0) return undefined;
  return values.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

export function getReviewById(id: string): Review | undefined {
  const reviews = getStoredReviews();
  if (reviews[id]) return reviews[id];
  if (id === 'default' || id === 'latest') return getLatestReview();
  return undefined;
}

export function saveReview(review: Review): void {
  if (typeof window === 'undefined') return;
  const reviews = getStoredReviews();
  reviews[review.id] = review;
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

  // Add notification
  const notifs = getStoredNotifications();
  const newNotif: NotificationItem = {
    id: `notif-${Date.now()}`,
    title: 'Review Finished',
    message: `Review for ${review.repositoryName} (${review.branch}) scored ${review.scores.overall}/100.`,
    timestamp: 'Just now',
    read: false,
    type: 'review_completed',
    link: `/review/${review.id}`,
  };
  localStorage.setItem(NOTIFS_KEY, JSON.stringify([newNotif, ...notifs]));

  // Auto-register in faculty roster queue
  const criticals = review.findings.filter((f) => f.severity === 'Critical').length;
  const highs = review.findings.filter((f) => f.severity === 'High').length;
  const submissions = getFacultySubmissions();
  const existingSubIdx = submissions.findIndex((s) => s.repoName === review.repositoryName);

  const submission: FacultySubmission = {
    id: `sub-${review.id}`,
    name: review.institutionBranding?.studentName || '',
    prn: review.institutionBranding?.rollNo || '',
    rollNo: review.institutionBranding?.rollNo || '',
    batch: review.institutionBranding?.batch || '',
    repoName: review.repositoryName,
    branch: review.branch,
    score: review.scores.overall,
    criticals,
    highs,
    status: 'Needs Review',
    grade: 'Pending',
    submittedAt: new Date().toLocaleDateString(),
    reviewLink: `/report/${review.id}`,
  };

  let updatedSubs: FacultySubmission[];
  if (existingSubIdx >= 0) {
    updatedSubs = [...submissions];
    updatedSubs[existingSubIdx] = { ...updatedSubs[existingSubIdx], ...submission };
  } else {
    updatedSubs = [submission, ...submissions];
  }
  localStorage.setItem(FACULTY_SUBMISSIONS_KEY, JSON.stringify(updatedSubs));
}

export function getFacultySubmissions(): FacultySubmission[] {
  if (typeof window === 'undefined') return DEFAULT_FACULTY_SUBMISSIONS;
  try {
    const data = localStorage.getItem(FACULTY_SUBMISSIONS_KEY);
    if (!data) return DEFAULT_FACULTY_SUBMISSIONS;
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return DEFAULT_FACULTY_SUBMISSIONS;
    return parsed.filter(
      (s: FacultySubmission) =>
        !LEGACY_DEMO_REPO_NAMES.has((s.repoName || '').toLowerCase()) && s.id !== 'sub-rev-1'
    );
  } catch {
    return DEFAULT_FACULTY_SUBMISSIONS;
  }
}

export function updateFacultyGrade(id: string, grade: string, status: 'Graded' | 'Needs Review'): void {
  if (typeof window === 'undefined') return;
  const submissions = getFacultySubmissions();
  const updated = submissions.map((s) => (s.id === id ? { ...s, grade, status } : s));
  localStorage.setItem(FACULTY_SUBMISSIONS_KEY, JSON.stringify(updated));
}

export function getStoredNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const data = localStorage.getItem(NOTIFS_KEY);
    if (!data) return INITIAL_NOTIFICATIONS;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined') return;
  const notifs = getStoredNotifications();
  const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(updated));
}
