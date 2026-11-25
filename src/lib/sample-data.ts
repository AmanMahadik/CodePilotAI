import { Repository, Review, NotificationItem } from './types';

// No hardcoded sample repositories or reviews in production.
// Real repositories and reviews are loaded dynamically from user sessions & storage.
export const INITIAL_REPOSITORIES: Repository[] = [];

export const INITIAL_REVIEWS: Record<string, Review> = {};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
