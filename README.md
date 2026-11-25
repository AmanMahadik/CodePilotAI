# CodePilot AI — Autonomous AI Software Engineering Assistant

> **Product Requirements Document & SRS Implementation (CPA-PRD-001 / CPA-SRS-001)**  
> **Autonomous AI Software Engineering Assistant**  
> **Process Model**: Incremental Engineering Process Model  

---

## 🌟 Executive Overview
**CodePilot AI** is an AI software engineering mentor that reviews student and early-career code the way a senior staff engineer would: at scale, with constructive explanations, OWASP Top 10 mappings, suggested code diffs, repository-grounded RAG chat, and downloadable certified institutional PDF reports.

---

## 🚀 Key Features & SRS Module Traceability

### 1. Authentication (FR-001 to FR-020)
- **Supabase OAuth**: Native GitHub OAuth (`provider: 'github'`) and Google OAuth (`provider: 'google'`).
- **Email/Password**: Registration and login with bcrypt/argon2 hashing handled via Supabase Auth.
- **Session Tokens**: Signed JWT access & refresh token session lifecycle.
- **Verification & Reset**: Password reset link dispatch (≤ 30 min) and email verification handling (FR-004, FR-006).
- **Compliance & Deletion**: 30-day user and repository data purge request (FR-007).
- **Interactive Demo Access**: 1-click test login for Student Developer or Faculty Reviewer.

### 2. Dashboard & Progress Trends (FR-021 to FR-040)
- **Repository List View (FR-021)**: Connected and uploaded repositories with branch tags, language breakdown, and health scores.
- **Review History (FR-022)**: Chronological list of past reviews per repo linking to full reports.
- **Progress Trend View (FR-023)**: Categorized defect counts by severity (Critical, High, Medium, Low) across review cycles.
- **Notifications Panel (FR-024)**: In-app notification center for async review completions and security alerts.

### 3. Repository Upload & Ingestion Engine (FR-041 to FR-070)
- **ZIP Archive Upload (FR-041)**: Client-side ZIP extraction via `jszip` with automated binary file filtering (max 200MB).
- **GitHub Ingestion (FR-042, FR-043)**: Shallow pull & branch selection (`main`, `develop`).
- **Language Detection (FR-044)**: Detects primary & secondary languages and percentage distributions (TypeScript, Python, JavaScript, SQL, etc.).
- **Configurable Exclusion Rules (FR-045)**: Automatically ignores `node_modules`, `.git`, `dist`, `build`, `.next`, and logs.

### 4. Multi-Agent AI Review Pipeline (FR-071 to FR-120)
- **Multi-Agent Orchestrator (FR-071)**:
  - **Repository Agent**: AST parsing, dependency manifest audit, and directory hygiene.
  - **Review & Quality Agent**: Idiomatic style, cyclomatic complexity, DRY violations, and SOLID principles.
  - **Security Agent**: OWASP Top 10 vulnerability mapping and credential/secret leak scanning.
  - **Documentation Agent**: Auto-drafts complete README and suggests missing inline docstrings.
- **Severity Rubric (FR-072)**: Tagged Critical, High, Medium, Low, Informational.
- **Senior Principle Explanations (FR-073)**: Plain-language explanations of why the issue matters beyond the superficial symptom.
- **Line Ranges & Code Snippets (FR-074)**: Precise file paths and line ranges with context previews.
- **Skill-Level Calibration (FR-075)**: Dynamic tone and depth toggle (Beginner, Intermediate, Advanced).
- **SLA & Real-time Progress (FR-076, FR-077)**: Analyzes repos in &lt;60s with live progress step animations.
- **Re-review on Push (FR-078)**: Re-runs analysis on updated commits without re-configuring.

### 5. Repository-Grounded AI Chat (FR-121 to FR-150)
- **Grounded via RAG (FR-121)**: Contextual responses grounded in repository files and AST index.
- **Finding Follow-up Anchor (FR-122)**: Click "Ask AI about this finding" to anchor the chat session directly to any finding ID.
- **Conversation History (FR-123)**: Retained per repository session.
- **Source Code Citations (FR-124)**: Chat answers quote exact file paths, line ranges, and code snippets.

### 6. Documentation Generation (FR-151 to FR-170)
- **Auto-drafted README (FR-151)**: Complete production-ready README scaffold with Markdown preview, copy, and download.
- **Inline Comment Suggestions (FR-152)**: Auto-suggested JSDoc and docstrings for high-complexity public methods.

### 7. Bug Detection & OWASP Security Scan (FR-171 to FR-210)
- **Defect Detection (FR-171)**: Flags async forEach loops, NaN direct comparisons, and unhandled catch blocks.
- **Suggested Fixes & Diffs (FR-172)**: Side-by-side or unified Before vs. After code diffs.
- **OWASP Top 10 Mapping (FR-191)**: Maps findings to OWASP A01 (Access Control), A02 (Cryptographic Failures), A03 (SQL Injection), A05 (Misconfiguration), and A07 (Auth Failures).
- **Secrets Scanner (FR-192)**: Heuristic detection of AWS keys, GitHub tokens, database connection strings, and fallback JWT secrets.

### 8. Institutional PDF Report & Shareable Links (FR-211 to FR-230)
- **Certified PDF Export (FR-211)**: Executive summary, health score radar, and finding breakdowns exported via `jsPDF` and `html2canvas`.
- **Public Shareable Link (FR-212)**: Read-only public report accessible at `/report/[id]`.
- **Branding Header Toggle (FR-213)**: Toggle institutional headers for academic institutions or custom departments.

### 9. Phase 2 Features (Preview)
- **Mock Technical Interview (FR-331)**: Interview simulation grounded in the candidate's repository with AI evaluator feedback.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS & Glassmorphism UI
- **Auth & Storage**: Supabase Auth (GitHub & Google OAuth, JWT tokens)
- **Icons**: Lucide React
- **ZIP Processing**: JSZip
- **PDF Generation**: jsPDF + html2canvas

---

## ⚙️ Environment Configuration

Create a `.env.local` file (see `.env.example`) with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
GROQ_API_KEY=gsk_your_groq_api_key
JWT_SECRET=your-long-random-jwt-secret
TOKEN_ENCRYPTION_KEY=your-64-char-hex-aes256-key
```

### Institutional PDF Export & Verification Setup:
- **Server-Side Rendering**: `GET` / `POST /api/reports/[id]/pdf` generates print-ready A4 PDFs using `puppeteer-core` and local Chrome/Edge (`CHROMIUM_EXECUTABLE_PATH` / `PUPPETEER_EXECUTABLE_PATH`).
- **Dedicated Print View**: `/report/[id]/print` renders the isolated 8-section A4 document with `@page` headers/footers, subtle watermarks, and zero app chrome.
- **Verification**: `/report/[id]/verify?t=...` validates the HMAC signature and SHA-256 report digest generated at export time.
- **Vercel Deployment**: Set all keys from `.env.example` in Vercel **Project Settings > Environment Variables**. If deploying headless server-side Chromium on Vercel, provide `CHROMIUM_EXECUTABLE_PATH` (or install `@sparticuz/chromium`); otherwise, the Download PDF action falls back seamlessly to the clean `/report/[id]/print?autoprint=1` A4 layout.

### GitHub OAuth App Registration:
You can connect GitHub OAuth directly or via Supabase:
1. In your GitHub account, go to **Settings > Developer Settings > OAuth Apps > New OAuth App**:
   - **Application name**: `CodePilot AI`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**:
     ```
     http://localhost:3000/api/auth/github/callback
     ```
     *(If using Supabase Auth proxy, also add: `https://<your-supabase-id>.supabase.co/auth/v1/callback`)*
2. Generate a **Client Secret**.
3. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to your `.env.local` (and to Supabase under **Authentication > Providers > GitHub**).

### Database Migration:
Apply the authentication and repositories migration in your Supabase SQL Editor:
- File: [supabase/migrations/20261125_auth_system.sql](file:///C:/CodePilotAI/supabase/migrations/20261125_auth_system.sql)
- Creates `public.users`, `public.oauth_accounts` (with AES-256-GCM token storage), and `public.repositories` with Row Level Security (RLS) policies.

---

## 🏃 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---
*CodePilot AI — Engineering Assistant Platform.*
