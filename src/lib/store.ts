'use client';

import { Repository, Review, NotificationItem } from './types';
import { INITIAL_REPOSITORIES, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS } from './sample-data';

const REPOS_KEY = 'codepilot_repositories';
const REVIEWS_KEY = 'codepilot_reviews';
const NOTIFS_KEY = 'codepilot_notifications';

export function getStoredRepositories(): Repository[] {
  if (typeof window === 'undefined') return INITIAL_REPOSITORIES;
  try {
    const data = localStorage.getItem(REPOS_KEY);
    if (!data) {
      localStorage.setItem(REPOS_KEY, JSON.stringify(INITIAL_REPOSITORIES));
      return INITIAL_REPOSITORIES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse repositories from localStorage', e);
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
    if (!data) {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse reviews from localStorage', e);
    return INITIAL_REVIEWS;
  }
}

export function getReviewById(id: string): Review | undefined {
  const reviews = getStoredReviews();
  return reviews[id];
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
}

export function getStoredNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const data = localStorage.getItem(NOTIFS_KEY);
    if (!data) {
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(data);
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
