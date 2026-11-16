-- ==============================================================================
-- CodePilot AI — Database Migration Schema (PostgreSQL / Supabase)
-- Project: CodePilot AI (MIT Academy of Engineering, Pune)
-- Student: Aman Atmaram Mahadik | Roll No: 68 | Batch: B3
-- ==============================================================================

-- 1. DROP ALL OLD TABLES
DROP TABLE IF EXISTS extracted_fields CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS verifications CASCADE;
DROP TABLE IF EXISTS institution_records CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;
DROP TABLE IF EXISTS rule_sets CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS interview_sessions CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS findings CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS repositories CASCADE;
DROP TABLE IF EXISTS faculty_roster CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CREATE NEW TABLES FOR CODEPILOT AI
-- ==============================================================================

-- 2.1 PROFILES TABLE (Stores both Student & Faculty profiles linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty')),
  avatar_url TEXT,
  github_username TEXT,
  institution_name TEXT DEFAULT 'MIT Academy of Engineering, Pune',
  department TEXT DEFAULT 'School of Computer Engineering',
  prn TEXT DEFAULT '202502100006',
  roll_no TEXT DEFAULT '68',
  batch TEXT DEFAULT 'B3',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 REPOSITORIES TABLE
CREATE TABLE public.repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('github', 'upload_zip', 'sample')),
  branch TEXT NOT NULL DEFAULT 'main',
  url TEXT,
  primary_language TEXT NOT NULL DEFAULT 'TypeScript',
  language_distribution JSONB DEFAULT '{"TypeScript": 80, "JavaScript": 20}'::jsonb,
  total_files INT NOT NULL DEFAULT 0,
  total_loc INT NOT NULL DEFAULT 0,
  latest_score INT,
  exclusion_rules TEXT[] DEFAULT ARRAY['node_modules', '.git', 'dist', 'build', 'vendor'],
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 REVIEWS TABLE
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  repository_name TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('analyzing', 'completed', 'failed')),
  skill_level TEXT NOT NULL DEFAULT 'intermediate' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  overall_score INT NOT NULL DEFAULT 85,
  quality_score INT NOT NULL DEFAULT 90,
  security_score INT NOT NULL DEFAULT 80,
  reliability_score INT NOT NULL DEFAULT 85,
  documentation_score INT NOT NULL DEFAULT 90,
  duration_seconds INT NOT NULL DEFAULT 42,
  executive_summary TEXT,
  readme_draft TEXT,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  faculty_feedback TEXT,
  faculty_grade TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 FINDINGS TABLE
CREATE TABLE public.findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  finding_code TEXT NOT NULL, -- e.g. CPAI-001
  agent_type TEXT NOT NULL CHECK (agent_type IN ('repository', 'quality', 'security', 'documentation')),
  category TEXT NOT NULL CHECK (category IN ('security', 'code-quality', 'bug', 'documentation', 'performance')),
  severity TEXT NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low', 'Informational')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  principle_explanation TEXT NOT NULL,
  file TEXT NOT NULL,
  line_start INT NOT NULL,
  line_end INT NOT NULL,
  code_snippet TEXT NOT NULL,
  suggested_fix TEXT,
  diff_original TEXT,
  diff_modified TEXT,
  owasp_category TEXT,
  confidence_score INT DEFAULT 95,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 CHAT MESSAGES (Repository-Grounded Terminal AI)
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  context_file TEXT,
  context_lines TEXT,
  anchored_finding_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 INTERVIEW SESSIONS (Phase 2 Mock Technical Interview)
CREATE TABLE public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  context_file TEXT,
  student_answer TEXT,
  ai_feedback TEXT,
  score INT,
  rubric_accuracy INT DEFAULT 32,
  rubric_problem_solving INT DEFAULT 20,
  rubric_communication INT DEFAULT 17,
  rubric_best_practices INT DEFAULT 12,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.7 FACULTY ROSTER & CLASSROOM SUBMISSIONS
CREATE TABLE public.faculty_roster (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  batch TEXT DEFAULT 'B3',
  assignment_name TEXT DEFAULT 'Assignment 1',
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'graded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_roster ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, self-update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Repositories: Owners and faculty can read; owners can write
CREATE POLICY "Users can read repositories" ON public.repositories FOR SELECT USING (true);
CREATE POLICY "Users can insert own repositories" ON public.repositories FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own repositories" ON public.repositories FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Reviews: Readable by all (for sharing & faculty), writable by owner
CREATE POLICY "Reviews readable by all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Faculty can update reviews" ON public.reviews FOR UPDATE USING (true);

-- Findings: Readable by all
CREATE POLICY "Findings readable by all" ON public.findings FOR SELECT USING (true);
CREATE POLICY "Findings insertable" ON public.findings FOR INSERT WITH CHECK (true);

-- Chat messages: Readable by all in session
CREATE POLICY "Chat messages readable" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Chat messages insertable" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- Interview sessions: Readable and insertable
CREATE POLICY "Interview sessions readable" ON public.interview_sessions FOR SELECT USING (true);
CREATE POLICY "Interview sessions insertable" ON public.interview_sessions FOR INSERT WITH CHECK (true);

-- Faculty roster: Readable by faculty and student
CREATE POLICY "Faculty roster readable" ON public.faculty_roster FOR SELECT USING (true);
CREATE POLICY "Faculty roster insertable" ON public.faculty_roster FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 4. AUTOMATIC USER PROFILE TRIGGER
-- (Automatically creates a student or faculty profile when user signs in via GitHub/Email)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT;
  user_name TEXT;
  user_avatar TEXT;
  github_nick TEXT;
BEGIN
  -- If logged in via GitHub, role is student
  IF NEW.raw_app_meta_data->>'provider' = 'github' THEN
    assigned_role := 'student';
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'user_name', 'Student Developer');
    user_avatar := NEW.raw_user_meta_data->>'avatar_url';
    github_nick := NEW.raw_user_meta_data->>'user_name';
  ELSE
    -- Email/password: check metadata or default to faculty/student
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'faculty');
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    user_avatar := NULL;
    github_nick := NULL;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    avatar_url,
    github_username,
    institution_name,
    prn,
    roll_no,
    batch
  ) VALUES (
    NEW.id,
    NEW.email,
    user_name,
    assigned_role,
    user_avatar,
    github_nick,
    'MIT Academy of Engineering, Pune',
    COALESCE(NEW.raw_user_meta_data->>'prn', '202502100006'),
    COALESCE(NEW.raw_user_meta_data->>'roll_no', '68'),
    'B3'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    github_username = EXCLUDED.github_username,
    role = EXCLUDED.role;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. SEED INITIAL REPRESENTATIVE DATA
-- ==============================================================================
INSERT INTO public.repositories (
  id,
  name,
  owner,
  source,
  branch,
  primary_language,
  language_distribution,
  total_files,
  total_loc,
  latest_score,
  last_reviewed_at
) VALUES 
(
  'e1a2b3c4-0001-4000-8000-000000000001',
  'Society_Sync',
  'amanmahadik',
  'github',
  'main',
  'TypeScript',
  '{"TypeScript": 82, "JavaScript": 12, "SQL": 6}'::jsonb,
  124,
  14280,
  92,
  now() - INTERVAL '12 minutes'
),
(
  'e1a2b3c4-0002-4000-8000-000000000002',
  'Hyperlocal-Civic',
  'amanmahadik',
  'github',
  'main',
  'JavaScript',
  '{"JavaScript": 90, "HTML": 10}'::jsonb,
  45,
  4800,
  78,
  now() - INTERVAL '1 day'
),
(
  'e1a2b3c4-0003-4000-8000-000000000003',
  'Campus-Connect',
  'amanmahadik',
  'github',
  'develop',
  'Java',
  '{"Java": 85, "XML": 15}'::jsonb,
  62,
  7200,
  88,
  now() - INTERVAL '2 days'
),
(
  'e1a2b3c4-0004-4000-8000-000000000004',
  'Energy-Saver',
  'amanmahadik',
  'upload_zip',
  'main',
  'TypeScript',
  '{"TypeScript": 95, "CSS": 5}'::jsonb,
  38,
  3950,
  85,
  now() - INTERVAL '4 days'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Review
INSERT INTO public.reviews (
  id,
  repository_id,
  repository_name,
  branch,
  status,
  skill_level,
  overall_score,
  quality_score,
  security_score,
  reliability_score,
  documentation_score,
  duration_seconds,
  executive_summary,
  share_token
) VALUES (
  'f1a2b3c4-0001-4000-8000-000000000001',
  'e1a2b3c4-0001-4000-8000-000000000001',
  'Society_Sync',
  'main',
  'completed',
  'intermediate',
  92,
  94,
  82,
  90,
  96,
  42,
  'Multi-agent analysis completed across 124 source files in Society_Sync. The codebase demonstrates clean modular architecture, but flagged 1 Critical SQL Injection risk and 1 High Ownership validation defect.',
  'CPAI-2026-028'
) ON CONFLICT (id) DO NOTHING;

-- Seed Findings
INSERT INTO public.findings (
  review_id,
  finding_code,
  agent_type,
  category,
  severity,
  title,
  description,
  principle_explanation,
  file,
  line_start,
  line_end,
  code_snippet,
  suggested_fix,
  owasp_category,
  confidence_score
) VALUES 
(
  'f1a2b3c4-0001-4000-8000-000000000001',
  'CPAI-001',
  'security',
  'security',
  'Critical',
  'Potential SQL injection in authentication query',
  'Direct string interpolation inside database execution handler.',
  'Directly interpolating user-controlled input into a SQL statement can allow an attacker to modify the query. Use parameterized queries to keep data separate from executable SQL.',
  'src/middleware/auth.ts',
  18,
  24,
  'const query = ''SELECT * FROM users WHERE email = "'' + email + ''"''; db.execute(query);',
  'const query = ''SELECT * FROM users WHERE email = ?''; db.execute(query, [email]);',
  'A03:2021 - Injection',
  98
),
(
  'f1a2b3c4-0001-4000-8000-000000000001',
  'CPAI-002',
  'security',
  'security',
  'High',
  'Missing ownership validation in resident endpoint',
  'Tenant identification not verified against session societyId.',
  'Authentication alone does not prove that a user is authorized to access a particular resident record. Enforce tenant and resource ownership checks.',
  'src/api/residents/[id].ts',
  42,
  47,
  'const resident = await getResident(req.param.id);',
  'const resident = await getResidentForSociety(req.param.id, user.societyId);',
  'A01:2021 - Broken Access Control',
  94
),
(
  'f1a2b3c4-0001-4000-8000-000000000001',
  'CPAI-003',
  'quality',
  'performance',
  'Medium',
  'Unbounded database query in activity history',
  'Query executes without pagination LIMIT / OFFSET constraints.',
  'Loading all historical records can cause performance degradation as the system grows. Introduce pagination and a bounded result size.',
  'src/services/activity.ts',
  61,
  64,
  'const activities = await db.activity.findMany();',
  'const activities = await db.activity.findMany({ take: 20, skip: page * 20 });',
  NULL,
  89
)
ON CONFLICT (id) DO NOTHING;
