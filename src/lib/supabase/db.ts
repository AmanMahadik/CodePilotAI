import { supabase } from './client';
import { Repository, Review, Finding } from '@/lib/types';

/**
 * Fetch all repositories from Supabase PostgreSQL
 */
export async function fetchRepositoriesFromDB() {
  try {
    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching repositories from Supabase, using local fallback:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('DB connect error:', err);
    return null;
  }
}

/**
 * Save new repository to Supabase PostgreSQL
 */
export async function saveRepositoryToDB(repo: Partial<Repository>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      name: repo.name,
      owner: repo.owner || 'amanmahadik',
      source: repo.source || 'github',
      branch: repo.branch || 'main',
      url: repo.url,
      primary_language: repo.primaryLanguage || 'TypeScript',
      language_distribution: repo.languageDistribution || { TypeScript: 100 },
      total_files: repo.totalFiles || 0,
      total_loc: repo.totalLOC || 0,
      latest_score: repo.latestScore || 85,
      exclusion_rules: repo.exclusionRules || ['node_modules', '.git'],
      last_reviewed_at: new Date().toISOString(),
      user_id: user?.id || null,
    };

    const { data, error } = await supabase
      .from('repositories')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Supabase repository insert error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('saveRepositoryToDB exception:', err);
    return null;
  }
}

/**
 * Save complete review to Supabase PostgreSQL
 */
export async function saveReviewToDB(review: Review) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const reviewPayload = {
      repository_name: review.repositoryName,
      branch: review.branch,
      status: review.status,
      skill_level: review.skillLevel,
      overall_score: review.scores.overall,
      quality_score: review.scores.quality,
      security_score: review.scores.security,
      reliability_score: review.scores.reliability,
      documentation_score: review.scores.documentation,
      duration_seconds: review.durationSeconds,
      executive_summary: review.executiveSummary,
      readme_draft: review.readmeDraft,
      share_token: review.shareToken || `CPAI-${Date.now().toString().slice(-4)}`,
      user_id: user?.id || null,
    };

    const { data: savedReview, error: reviewError } = await supabase
      .from('reviews')
      .insert([reviewPayload])
      .select()
      .single();

    if (reviewError || !savedReview) {
      console.warn('Supabase review insert error:', reviewError?.message);
      return null;
    }

    // Insert findings
    if (review.findings && review.findings.length > 0) {
      const findingsPayload = review.findings.map((f, idx) => ({
        review_id: savedReview.id,
        finding_code: f.id.startsWith('CPAI') ? f.id : `CPAI-00${idx + 1}`,
        agent_type: f.agentType,
        category: f.category,
        severity: f.severity,
        title: f.title,
        description: f.description,
        principle_explanation: f.principleExplanation,
        file: f.file,
        line_start: f.lineStart,
        line_end: f.lineEnd,
        code_snippet: f.codeSnippet,
        suggested_fix: f.suggestedFix,
        diff_original: f.diff?.original,
        diff_modified: f.diff?.modified,
        owasp_category: f.owaspCategory,
        confidence_score: 95,
      }));

      await supabase.from('findings').insert(findingsPayload);
    }

    return savedReview;
  } catch (err) {
    console.warn('saveReviewToDB exception:', err);
    return null;
  }
}

/**
 * Fetch reviews from Supabase PostgreSQL
 */
export async function fetchReviewsFromDB() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, findings(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching reviews from Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('fetchReviewsFromDB exception:', err);
    return null;
  }
}
