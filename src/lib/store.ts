'use client';

import { Repository, Review, NotificationItem } from './types';
import { INITIAL_REPOSITORIES, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS } from './sample-data';

const REPOS_KEY = 'codepilot_repositories';
const REVIEWS_KEY = 'codepilot_reviews';
const NOTIFS_KEY = 'codepilot_notifications';
const FACULTY_SUBMISSIONS_KEY = 'codepilot_faculty_submissions';

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

const DEFAULT_FACULTY_SUBMISSIONS: FacultySubmission[] = [
  {
    id: 'sub-rev-1',
    name: 'Aman Mahadik',
    prn: 'DEV-001',
    rollNo: 'DEV-001',
    batch: 'Active Cohort',
    repoName: 'Society_Sync',
    branch: 'main',
    score: 80,
    criticals: 0,
    highs: 1,
    status: 'Needs Review',
    grade: 'Pending',
    submittedAt: 'Recent',
    reviewLink: '/report/rev-1',
  },
];

export function getStoredRepositories(): Repository[] {
  if (typeof window === 'undefined') return INITIAL_REPOSITORIES;
  try {
    const data = localStorage.getItem(REPOS_KEY);
    if (!data) return INITIAL_REPOSITORIES;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REPOSITORIES;
  } catch (e) {
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
    return typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0 
      ? { ...INITIAL_REVIEWS, ...parsed } 
      : INITIAL_REVIEWS;
  } catch (e) {
    return INITIAL_REVIEWS;
  }
}

export function getLatestReview(): Review | undefined {
  const reviews = getStoredReviews();
  const values = Object.values(reviews);
  if (values.length === 0) return INITIAL_REVIEWS['rev-1'];
  return values.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

export function getReviewById(id: string): Review | undefined {
  const reviews = getStoredReviews();
  if (reviews[id]) return reviews[id];
  if (id === 'default' || id === 'rev-1') return INITIAL_REVIEWS['rev-1'] || getLatestReview();
  return getLatestReview() || INITIAL_REVIEWS['rev-1'];
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
    name: review.institutionBranding?.studentName || 'Student Developer',
    prn: review.institutionBranding?.rollNo || 'STU-001',
    rollNo: review.institutionBranding?.rollNo || '01',
    batch: review.institutionBranding?.batch || 'Active Cohort',
    repoName: review.repositoryName,
    branch: review.branch,
    score: review.scores.overall,
    criticals,
    highs,
    status: 'Needs Review',
    grade: 'Pending',
    submittedAt: 'Just now',
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
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FACULTY_SUBMISSIONS;
  } catch (e) {
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
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NOTIFICATIONS;
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
  }
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined') return;
  const notifs = getStoredNotifications();
  const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(updated));
}
