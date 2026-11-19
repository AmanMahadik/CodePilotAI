const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

async function generateMasterPresentation() {
  console.log('🚀 Generating CodePilot AI Master Project Defense Presentation...');
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'CodePilot AI — Autonomous AI Software Engineering Assistant (Master Project Presentation)';
  pptx.subject = 'Comprehensive Engineering Defense, Architecture & UML Portfolio';
  pptx.author = 'CodePilot AI Project Team';
  pptx.company = 'Department of Computer Science & Engineering';

  // Master Color Palette
  const C = {
    darkCanvas: '090D16',
    darkCard: '101625',
    cardBorder: '1E293B',
    white: 'FFFFFF',
    slideBg: 'F8FAFC',
    headerNavy: '0F172A',
    subText: '64748B',
    borderMuted: 'E2E8F0',
    borderStrong: 'CBD5E1',

    // Accents
    blueFill: 'EFF6FF',
    blueBorder: '3B82F6',
    blueDark: '1E40AF',
    blueText: '1D4ED8',

    greenFill: 'F0FDF4',
    greenBorder: '22C55E',
    greenDark: '15803D',
    greenText: '166534',

    amberFill: 'FFFBEB',
    amberBorder: 'F59E0B',
    amberDark: 'B45309',
    amberText: '92400E',

    purpleFill: 'FAF5FF',
    purpleBorder: 'A855F7',
    purpleDark: '7E22CE',
    purpleText: '6B21A8',

    roseFill: 'FFF1F2',
    roseBorder: 'F43F5E',
    roseDark: '9F1239',
    roseText: 'BE123C',

    slateFill: 'F1F5F9',
    slateBorder: '94A3B8',
    slateText: '334155'
  };

  const F = {
    title: 'Segoe UI',
    body: 'Segoe UI',
    mono: 'Consolas'
  };
  const COLORS = C;
  const FONTS = F;
  const addSlideHeader = (slide, num, tag, title, sub) => addHeader(slide, num, tag, title, sub);

  const logoPath = path.resolve('c:/CodePilotAI/public/logo.png');
  const hasLogo = fs.existsSync(logoPath);

  // Helper: Standard Slide Header for Content & Diagram Slides
  function addHeader(slide, sectionNum, sectionTag, title, subtitle) {
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.5, y: 0.35, w: 12.33, h: 0.85,
      fill: { color: C.white },
      line: { color: C.borderMuted, width: 1 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.25 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.7, y: 0.47, w: 2.1, h: 0.24,
      fill: { color: C.blueFill },
      line: { color: C.blueBorder, width: 1 }
    });
    slide.addText(sectionTag.toUpperCase(), {
      x: 0.7, y: 0.47, w: 2.1, h: 0.24,
      fontFace: F.mono, fontSize: 8.5, bold: true, color: C.blueDark, align: 'center', valign: 'middle'
    });

    slide.addText(`${sectionNum}. ${title}`, {
      x: 2.95, y: 0.42, w: 7.2, h: 0.35,
      fontFace: F.title, fontSize: 16, bold: true, color: C.headerNavy, valign: 'middle'
    });

    slide.addText(subtitle, {
      x: 2.95, y: 0.75, w: 7.5, h: 0.35,
      fontFace: F.body, fontSize: 9.5, color: C.subText, valign: 'top'
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 10.4, y: 0.47, w: 2.2, h: 0.24,
      fill: { color: C.slateFill },
      line: { color: C.slateBorder, width: 1 }
    });
    slide.addText('PROJECT DEFENSE DECK', {
      x: 10.4, y: 0.47, w: 2.2, h: 0.24,
      fontFace: F.mono, fontSize: 8, bold: true, color: C.slateText, align: 'center', valign: 'middle'
    });
  }

  // ==========================================
  // SLIDE 1: COVER / TITLE SLIDE (Dark Hero)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.darkCanvas };

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0, y: 0, w: 13.33, h: 0.15,
      fill: { color: '3B82F6' }
    });

    if (hasLogo) {
      slide.addImage({ path: logoPath, x: 1.1, y: 1.25, w: 1.7, h: 1.7 });
    }

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 3.1, y: 1.25, w: 4.8, h: 0.32,
      fill: { color: '162238' },
      line: { color: '38BDF8', width: 1 }
    });
    slide.addText('FINAL YEAR B.TECH CAPSTONE PROJECT DEFENSE', {
      x: 3.1, y: 1.25, w: 4.8, h: 0.32,
      fontFace: F.mono, fontSize: 9, bold: true, color: '38BDF8', align: 'center', valign: 'middle'
    });

    slide.addText('CodePilot AI', {
      x: 3.0, y: 1.7, w: 9.0, h: 0.9,
      fontFace: F.title, fontSize: 40, bold: true, color: 'FFFFFF'
    });

    slide.addText('Autonomous AI Software Engineering Assistant with Multi-Agent AST Auditing', {
      x: 3.1, y: 2.65, w: 9.0, h: 0.4,
      fontFace: F.title, fontSize: 17, color: '94A3B8'
    });

    slide.addText('An automated software engineering platform featuring dual student and faculty portals, GitHub OAuth repository reflection, AST-level static security analysis (OWASP Top 10), Senior Engineer educational diff patches, and institutional defect analytics.', {
      x: 3.1, y: 3.15, w: 8.8, h: 0.8,
      fontFace: F.body, fontSize: 11, color: 'CBD5E1', lineSpacing: 15
    });

    // 4 Key Pillars Cards
    const pillars = [
      { tag: '01. DUAL ROLES', title: 'Student & Faculty Portal', sub: 'GitHub OAuth + Institutional Email' },
      { tag: '02. MULTI-AGENT', title: '4 Specialized AI Agents', sub: 'Repo, Quality, Security, Docs' },
      { tag: '03. OWASP AUDIT', title: 'Deterministic Static Scan', sub: 'CWE-89, CWE-79, Senior Diffs' },
      { tag: '04. VIVA SIMULATOR', title: 'Terminal AI & Defense', sub: 'Project viva questions & code chat' }
    ];

    pillars.forEach((p, i) => {
      const posX = 1.1 + i * 2.82;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 4.3, w: 2.65, h: 1.85,
        fill: { color: C.darkCard },
        line: { color: C.cardBorder, width: 1 },
        shadow: { type: 'outer', color: '000000', blur: 6, offset: 2, angle: 90, opacity: 0.4 }
      });

      slide.addText(p.tag, {
        x: posX, y: 4.45, w: 2.65, h: 0.3,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: '38BDF8', align: 'center'
      });
      slide.addText(p.title, {
        x: posX + 0.1, y: 4.8, w: 2.45, h: 0.5,
        fontFace: F.title, fontSize: 12, bold: true, color: 'FFFFFF', align: 'center'
      });
      slide.addText(p.sub, {
        x: posX + 0.1, y: 5.35, w: 2.45, h: 0.5,
        fontFace: F.body, fontSize: 9.5, color: '94A3B8', align: 'center'
      });
    });

    slide.addText('Department of Computer Science & Engineering • Academic Year 2025–2026 • Production v1.0.0', {
      x: 1.1, y: 6.65, w: 10.9, h: 0.3,
      fontFace: F.mono, fontSize: 9, color: '64748B'
    });
  }

  // ==========================================
  // SLIDE 2: PROBLEM STATEMENT & MOTIVATION
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '01', 'Context & Motivation', 'Problem Statement & Current Academic Challenges', 'Why existing manual evaluation and conventional linters fail university software engineering labs.');

    const challenges = [
      {
        num: '01',
        title: 'Overwhelming Manual Faculty Review Burden',
        desc: 'Faculty oversee batches of 60–120+ students. Reviewing full repository codebases, checking commit veracity, and grading architecture takes hours per assignment, leading to delayed feedback and shallow grading.',
        impact: 'Students submit untested code without meaningful architectural feedback.',
        color: C.roseBorder, fill: C.roseFill, badgeColor: C.roseDark
      },
      {
        num: '02',
        title: 'Cryptic Linters Without Educational Context',
        desc: 'Standard CLI linters (ESLint, Sonar) output cold error messages without explaining the architectural "Why". Students copy-paste fixes or suppress linter warnings without learning senior engineering design principles.',
        impact: 'High defect recurrence in subsequent semester project submissions.',
        color: C.amberBorder, fill: C.amberFill, badgeColor: C.amberDark
      },
      {
        num: '03',
        title: 'Undetected OWASP Security Vulnerabilities',
        desc: 'Traditional college lab assignments fail to verify real-world security standards. Critical vulnerabilities like SQL Injection (A03), Broken Access Control (A01), and hardcoded API tokens slip into production unnoticed.',
        impact: 'Graduating engineers lack foundational secure-by-default coding habits.',
        color: C.purpleBorder, fill: C.purpleFill, badgeColor: C.purpleDark
      },
      {
        num: '04',
        title: 'Lack of Viva & Technical Defense Preparation',
        desc: 'Students struggle in oral viva defenses and technical placement interviews because they cannot articulate design trade-offs, explain complex file relationships, or justify why their code was structured that way.',
        impact: 'Poor project presentation and weak placement interview performance.',
        color: C.blueBorder, fill: C.blueFill, badgeColor: C.blueDark
      }
    ];

    challenges.forEach((ch, i) => {
      const posX = 0.6 + i * 3.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.5, w: 2.85, h: 5.2,
        fill: { color: C.white },
        line: { color: ch.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
      });

      // Top Tag
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX, y: 1.5, w: 2.85, h: 0.55,
        fill: { color: ch.fill },
        line: { color: ch.color, width: 1 }
      });
      slide.addText(`CHALLENGE ${ch.num}`, {
        x: posX, y: 1.5, w: 2.85, h: 0.55,
        fontFace: F.mono, fontSize: 10, bold: true, color: ch.badgeColor, align: 'center', valign: 'middle'
      });

      slide.addText(ch.title, {
        x: posX + 0.15, y: 2.2, w: 2.55, h: 0.75,
        fontFace: F.title, fontSize: 12, bold: true, color: C.headerNavy
      });

      slide.addText(ch.desc, {
        x: posX + 0.15, y: 3.05, w: 2.55, h: 1.9,
        fontFace: F.body, fontSize: 9.5, color: C.subText, lineSpacing: 13
      });

      // Impact Box
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX + 0.15, y: 5.15, w: 2.55, h: 1.25,
        fill: { color: C.slateFill },
        line: { color: C.borderMuted, width: 1 }
      });
      slide.addText('ACADEMIC IMPACT:', {
        x: posX + 0.25, y: 5.25, w: 2.35, h: 0.25,
        fontFace: F.mono, fontSize: 8, bold: true, color: C.headerNavy
      });
      slide.addText(ch.impact, {
        x: posX + 0.25, y: 5.5, w: 2.35, h: 0.8,
        fontFace: F.body, fontSize: 8.5, color: ch.badgeColor, lineSpacing: 11
      });
    });
  }

  // ==========================================
  // SLIDE 3: PROPOSED SOLUTION & PURPOSE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '02', 'Project Purpose', 'Proposed Solution: The CodePilot AI Ecosystem', 'An end-to-end autonomous assistant designed for student mentorship and faculty governance.');

    // Left Column: What CodePilot AI Does
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.5, w: 5.9, h: 5.2,
      fill: { color: C.white },
      line: { color: C.blueBorder, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
    });

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.6, y: 1.5, w: 5.9, h: 0.55,
      fill: { color: C.blueFill },
      line: { color: C.blueBorder, width: 1 }
    });
    slide.addText('CORE VALUE PROPOSITION', {
      x: 0.8, y: 1.5, w: 5.5, h: 0.55,
      fontFace: F.title, fontSize: 11, bold: true, color: C.blueDark, valign: 'middle'
    });

    const studentBenefits = [
      { title: 'Seamless GitHub OAuth Ingestion', text: 'Students authorize once; their repositories instantly populate the workspace without manual git clone or CLI credential setup.' },
      { title: 'Sub-Minute Multi-Agent Reviews', text: '4 parallel agents inspect the codebase under 42 seconds (P95 SLA) across quality, security, and documentation dimensions.' },
      { title: 'Senior Engineer Mentorship Diffs', text: 'Rather than just flagging errors, CodePilot provides production-grade code diffs and in-depth explanations tailored to skill level.' },
      { title: 'Context-Grounded Terminal AI Chat', text: 'Students can highlight any finding (e.g. CPAI-001 SQLi) and converse with an AI agent grounded strictly in their repository AST.' },
      { title: 'Interview & Viva Simulator', text: 'Simulates tough defense questions asked by external academic evaluators to prepare students before final project submission.' }
    ];

    studentBenefits.forEach((b, i) => {
      const bY = 2.2 + i * 0.85;
      slide.addShape(pptx.shapes.OVAL, {
        x: 0.85, y: bY + 0.05, w: 0.3, h: 0.3,
        fill: { color: C.blueFill },
        line: { color: C.blueBorder, width: 1.5 }
      });
      slide.addText(`${i + 1}`, {
        x: 0.85, y: bY + 0.05, w: 0.3, h: 0.3,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: C.blueDark, align: 'center', valign: 'middle'
      });

      slide.addText(b.title, {
        x: 1.3, y: bY, w: 5.0, h: 0.25,
        fontFace: F.title, fontSize: 10, bold: true, color: C.headerNavy
      });
      slide.addText(b.text, {
        x: 1.3, y: bY + 0.26, w: 5.0, h: 0.52,
        fontFace: F.body, fontSize: 8.5, color: C.subText, lineSpacing: 11
      });
    });

    // Right Column: Faculty & Institutional Value
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.5, w: 5.9, h: 5.2,
      fill: { color: C.white },
      line: { color: C.greenBorder, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
    });

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 6.8, y: 1.5, w: 5.9, h: 0.55,
      fill: { color: C.greenFill },
      line: { color: C.greenBorder, width: 1 }
    });
    slide.addText('FACULTY OVERSIGHT & LAB GOVERNANCE', {
      x: 7.0, y: 1.5, w: 5.5, h: 0.55,
      fontFace: F.title, fontSize: 11, bold: true, color: C.greenDark, valign: 'middle'
    });

    const facultyBenefits = [
      { title: 'Dedicated Faculty Email Portal', text: 'Faculty sign in using official academic credentials, completely separated from the student GitHub OAuth flow.' },
      { title: 'Class-Wide Defect Heatmap & Analytics', text: 'Instantly view cohort-wide vulnerability trends across the last 10 reviews (Critical, High, Medium, Low breakdown).' },
      { title: 'Automated Cohort Roster Oversight', text: 'Filter students by batch (Cohort A, Cohort B), roll number, PRN, or repository health score in a unified grid.' },
      { title: 'One-Click Submission Grading & Marks', text: 'Review audit findings, assign normalized lab marks (e.g., 48/50), and submit evaluative feedback directly to PostgreSQL.' },
      { title: 'Export IEEE Standard PDF Audit Reports', text: 'Generates formal, printable audit certificates showing total LOC, health breakdown, and OWASP compliance badges.' }
    ];

    facultyBenefits.forEach((b, i) => {
      const bY = 2.2 + i * 0.85;
      slide.addShape(pptx.shapes.OVAL, {
        x: 7.05, y: bY + 0.05, w: 0.3, h: 0.3,
        fill: { color: C.greenFill },
        line: { color: C.greenBorder, width: 1.5 }
      });
      slide.addText(`${i + 1}`, {
        x: 7.05, y: bY + 0.05, w: 0.3, h: 0.3,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: C.greenDark, align: 'center', valign: 'middle'
      });

      slide.addText(b.title, {
        x: 7.5, y: bY, w: 5.0, h: 0.25,
        fontFace: F.title, fontSize: 10, bold: true, color: C.headerNavy
      });
      slide.addText(b.text, {
        x: 7.5, y: bY + 0.26, w: 5.0, h: 0.52,
        fontFace: F.body, fontSize: 8.5, color: C.subText, lineSpacing: 11
      });
    });
  }

  // ==========================================
  // SLIDE 4: DUAL USER PERSONAS & WORKFLOWS
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '03', 'User Personas', 'Role Separation: Student vs. Faculty Evaluator', 'Isolated authentication paradigms, data models, and access privileges.');

    // Student Persona Box
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.5, w: 5.9, h: 5.2,
      fill: { color: C.white },
      line: { color: C.blueBorder, width: 1.5 }
    });

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.6, y: 1.5, w: 5.9, h: 0.9,
      fill: { color: C.blueFill }
    });
    slide.addText('STUDENT DEVELOPER PERSONA\nRole: Self-Correction, Ingestion, & Learning', {
      x: 0.8, y: 1.55, w: 5.5, h: 0.8,
      fontFace: F.title, fontSize: 11, bold: true, color: C.blueDark
    });

    const studentSteps = [
      '1. Authentication: Signs in strictly via GitHub OAuth2 (read:user, user:email, repo scopes).',
      '2. Ingestion Choice: Connects live GitHub repo or drags a project .ZIP archive into browser.',
      '3. Calibration: Configures exclusion rules (.git, node_modules) and skill level (Beginner/Intermediate/Advanced).',
      '4. Inspection: Reviews Overall Health (0-100), OWASP security score, and clean code score.',
      '5. Actionable Fixes: Inspects Senior Engineer diff patches with 1-click clipboard copy.',
      '6. Interactive Chat: Opens Terminal AI to ask grounded questions about complex AST logic.',
      '7. Defense Preparation: Runs Interview Simulator to practice viva defense before lab submission.'
    ];

    studentSteps.forEach((st, i) => {
      slide.addText(st, {
        x: 0.85, y: 2.55 + i * 0.55, w: 5.4, h: 0.5,
        fontFace: F.body, fontSize: 9, color: C.headerNavy, lineSpacing: 11
      });
    });

    // Faculty Persona Box
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.5, w: 5.9, h: 5.2,
      fill: { color: C.white },
      line: { color: C.greenBorder, width: 1.5 }
    });

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 6.8, y: 1.5, w: 5.9, h: 0.9,
      fill: { color: C.greenFill }
    });
    slide.addText('FACULTY EVALUATOR PERSONA\nRole: Lab Governance, Roster Oversight, & Grading', {
      x: 7.0, y: 1.55, w: 5.5, h: 0.8,
      fontFace: F.title, fontSize: 11, bold: true, color: C.greenDark
    });

    const facultySteps = [
      '1. Authentication: Signs in using institutional email & password (faculty@university.edu).',
      '2. Cohort Roster: Browses classroom submissions filtered by batch (Cohort A/B) or roll number.',
      '3. Defect Analytics: Analyzes class-wide security vulnerabilities (Critical SQLi vs High Auth issues).',
      '4. Code Audit Inspection: Deep-dives into individual student submissions to inspect code quality.',
      '5. Grading & Feedback: Assigns normalized marks (e.g. 48/50) and enters permanent remarks.',
      '6. Verification: Verifies that students have resolved critical OWASP vulnerabilities prior to sign-off.',
      '7. Certification: Exports formal IEEE code audit PDF report for departmental lab records.'
    ];

    facultySteps.forEach((st, i) => {
      slide.addText(st, {
        x: 7.05, y: 2.55 + i * 0.55, w: 5.4, h: 0.5,
        fontFace: F.body, fontSize: 9, color: C.headerNavy, lineSpacing: 11
      });
    });
  }

  // ==========================================
  // SLIDE 5: SYSTEM ARCHITECTURE & TECH STACK
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '04', 'System Architecture', 'Modern Cloud Architecture & Technology Stack', 'Production-grade stack engineered for high performance, security, and responsive UX.');

    const stackCards = [
      {
        layer: 'FRONTEND & UI FRAMEWORK',
        tech: 'Next.js 14.2 (App Router) + React 18',
        desc: 'Server-side rendering (SSR), streaming dynamic routes, zero-layout-shift landscape workspace, and high-performance client state.',
        tags: ['App Router', 'TypeScript 5.7', 'Server Components', 'Lucide Icons'],
        color: C.blueBorder, fill: C.blueFill, text: C.blueDark
      },
      {
        layer: 'DESIGN SYSTEM & STYLING',
        tech: 'Tailwind CSS 3.4 + GitHub Primer Dark',
        desc: 'Dark theme canvas (#090D16), custom scrollbars, ergonomic information density, responsive grid layouts, and accessible contrast ratios.',
        tags: ['Tailwind CSS', 'CSS Variables', 'DarkMode: class', 'GitHub Primer'],
        color: C.purpleBorder, fill: C.purpleFill, text: C.purpleDark
      },
      {
        layer: 'IDENTITY & AUTHENTICATION',
        tech: '@supabase/ssr v0.5.2 + GitHub OAuth2',
        desc: 'Singleton browser client, PKCE verifier cookie jar (SameSite=lax), automatic code exchange race-condition handling, and role claims.',
        tags: ['RFC 7636 PKCE', 'GoTrue Auth', 'JWT Tokens', 'Lax Cookies'],
        color: C.greenBorder, fill: C.greenFill, text: C.greenDark
      },
      {
        layer: 'DATABASE & PERSISTENCE',
        tech: 'Supabase PostgreSQL 15 + RLS',
        desc: 'Relational data model (7 tables: repositories, reviews, findings, faculty rosters), Row Level Security, and local storage fallback.',
        tags: ['PostgreSQL 15', 'Row Level Security', 'PostgREST', 'LocalStorage'],
        color: C.amberBorder, fill: C.amberFill, text: C.amberDark
      },
      {
        layer: 'IN-MEMORY ANALYSIS ENGINE',
        tech: 'JSZip + Multi-Agent AST Pipeline',
        desc: 'Client-side ZIP extraction, language distribution scanner, AST syntax parser, OWASP rule evaluation, and sub-60s SLA runtime.',
        tags: ['JSZip 3.10', 'AST Parser', 'Multi-Agent', 'P95 SLA: 42s'],
        color: C.roseBorder, fill: C.roseFill, text: C.roseDark
      },
      {
        layer: 'EXTERNAL INTEGRATIONS',
        tech: 'GitHub REST API v3 + JSPDF Export',
        desc: 'Authenticated user/repos catalog fetching, commit tree mapping, and IEEE standard formal audit report generation via html2canvas/jspdf.',
        tags: ['GitHub REST', 'OAuth Scopes', 'JSPDF 2.5', 'html2canvas'],
        color: C.slateBorder, fill: C.slateFill, text: C.slateText
      }
    ];

    stackCards.forEach((sc, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const posX = 0.6 + col * 4.1;
      const posY = 1.5 + row * 2.65;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: posY, w: 3.9, h: 2.45,
        fill: { color: C.white },
        line: { color: sc.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.25 }
      });

      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX, y: posY, w: 3.9, h: 0.45,
        fill: { color: sc.fill }
      });
      slide.addText(sc.layer, {
        x: posX + 0.15, y: posY, w: 3.6, h: 0.45,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: sc.text, valign: 'middle'
      });

      slide.addText(sc.tech, {
        x: posX + 0.15, y: posY + 0.55, w: 3.6, h: 0.35,
        fontFace: F.title, fontSize: 11, bold: true, color: C.headerNavy
      });

      slide.addText(sc.desc, {
        x: posX + 0.15, y: posY + 0.9, w: 3.6, h: 0.85,
        fontFace: F.body, fontSize: 8.5, color: C.subText, lineSpacing: 11
      });

      // Tags
      const tagStr = sc.tags.map((t) => `[${t}]`).join(' ');
      slide.addText(tagStr, {
        x: posX + 0.15, y: posY + 1.85, w: 3.6, h: 0.45,
        fontFace: F.mono, fontSize: 7.5, color: sc.text
      });
    });
  }

  // ==========================================
  // SLIDE 6: MULTI-AGENT INGESTION PIPELINE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '05', 'Core Innovation', 'Multi-Agent Ingestion & AST Analysis Pipeline', 'The 4 specialized AI agents working synchronously to evaluate submitted repositories.');

    const agents = [
      {
        num: 'AGENT 01',
        name: 'Repository Ingestion Agent',
        role: 'Validation & File Structure Indexing',
        sla: 'Runtime: 320ms • 124 files',
        desc: 'Unpacks ZIP archives in-memory or fetches commit trees via GitHub API. Strips blacklisted directories (.git, node_modules, dist, build, vendor) to guarantee zero wasted tokens and pure authored code analysis.',
        color: C.blueBorder, fill: C.blueFill, text: C.blueDark
      },
      {
        num: 'AGENT 02',
        name: 'Quality & Clean Code Agent',
        role: 'Linting, Complexity & Smells',
        sla: 'Runtime: 1.2s • 8 findings',
        desc: 'Analyzes Cyclomatic Complexity, cognitive function length, dead code paths, and bad practices such as unbounded database queries (e.g. missing pagination on activity logs) that degrade production performance.',
        color: C.amberBorder, fill: C.amberFill, text: C.amberDark
      },
      {
        num: 'AGENT 03',
        name: 'OWASP Security Agent',
        role: 'Vulnerability & CWE Static Audit',
        sla: 'Runtime: 2.4s • 3 findings',
        desc: 'Applies rigorous AST pattern matching for OWASP Top 10 vulnerabilities: SQL Injection in authentication endpoints (CWE-89 / A03), Broken Access Control (A01), and hardcoded credential leaks with 98% confidence.',
        color: C.roseBorder, fill: C.roseFill, text: C.roseDark
      },
      {
        num: 'AGENT 04',
        name: 'Documentation & Patch Agent',
        role: 'Senior Engineer Explanations & Diffs',
        sla: 'Runtime: 600ms • 5 suggestions',
        desc: 'Synthesizes clean patch diffs (+/- lines) and formulates "Senior Engineer Explanations". It calibrates technical tone based on student skill level (Beginner principle tutorials vs Advanced staff engineer trade-offs).',
        color: C.greenBorder, fill: C.greenFill, text: C.greenDark
      }
    ];

    agents.forEach((ag, i) => {
      const posX = 0.6 + i * 3.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.5, w: 2.85, h: 5.2,
        fill: { color: C.white },
        line: { color: ag.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
      });

      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX, y: 1.5, w: 2.85, h: 0.55,
        fill: { color: ag.fill }
      });
      slide.addText(ag.num, {
        x: posX, y: 1.5, w: 2.85, h: 0.55,
        fontFace: F.mono, fontSize: 9.5, bold: true, color: ag.text, align: 'center', valign: 'middle'
      });

      slide.addText(ag.name, {
        x: posX + 0.15, y: 2.2, w: 2.55, h: 0.5,
        fontFace: F.title, fontSize: 12, bold: true, color: C.headerNavy
      });

      slide.addText(ag.role, {
        x: posX + 0.15, y: 2.7, w: 2.55, h: 0.35,
        fontFace: F.mono, fontSize: 8, color: ag.text
      });

      slide.addText(ag.desc, {
        x: posX + 0.15, y: 3.15, w: 2.55, h: 2.0,
        fontFace: F.body, fontSize: 9, color: C.subText, lineSpacing: 13
      });

      // SLA Badge
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX + 0.15, y: 5.3, w: 2.55, h: 1.0,
        fill: { color: C.slateFill },
        line: { color: C.borderMuted, width: 1 }
      });
      slide.addText('BENCHMARK SLA:', {
        x: posX + 0.25, y: 5.4, w: 2.35, h: 0.25,
        fontFace: F.mono, fontSize: 8, bold: true, color: C.headerNavy
      });
      slide.addText(ag.sla, {
        x: posX + 0.25, y: 5.68, w: 2.35, h: 0.5,
        fontFace: F.mono, fontSize: 8, color: ag.text
      });
    });
  }

  // ==========================================
  // SLIDE 3: 01. USE CASE DIAGRAM
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.slideBg };
    addSlideHeader(slide, '01', 'UML Behavioral Model', 'Use Case Diagram (Actors & System Boundary)', 'Functional capabilities mapped across Student Developer, Faculty Evaluator, and External Services.');

    // Actor 1: Student Developer
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.7, w: 2.0, h: 2.3,
      fill: { color: COLORS.blueFill },
      line: { color: COLORS.blueBorder, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.25 }
    });
    slide.addText('fa:user\nStudent Developer', {
      x: 0.7, y: 1.85, w: 1.8, h: 0.6,
      fontFace: FONTS.title, fontSize: 11, bold: true, color: COLORS.blueDark, align: 'center'
    });
    slide.addText('• Signs in via GitHub\n• Syncs public repos\n• Uploads ZIP project\n• Inspects findings\n• Runs Terminal AI\n• Exports PDF audit', {
      x: 0.7, y: 2.45, w: 1.8, h: 1.45,
      fontFace: FONTS.body, fontSize: 8.5, color: COLORS.headerNavy, lineSpacing: 12
    });

    // Actor 2: Faculty Evaluator
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 4.3, w: 2.0, h: 2.3,
      fill: { color: COLORS.greenFill },
      line: { color: COLORS.greenBorder, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.25 }
    });
    slide.addText('Faculty Evaluator', {
      x: 0.7, y: 4.45, w: 1.8, h: 0.5,
      fontFace: FONTS.title, fontSize: 11, bold: true, color: COLORS.greenDark, align: 'center'
    });
    slide.addText('• Email/Pass auth\n• Oversees cohort\n• Class defect trends\n• Evaluates submissions\n• Grades assignments\n• Downloads reports', {
      x: 0.7, y: 5.0, w: 1.8, h: 1.45,
      fontFace: FONTS.body, fontSize: 8.5, color: COLORS.headerNavy, lineSpacing: 12
    });

    // System Boundary Box
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 2.9, y: 1.45, w: 7.6, h: 5.3,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderStrong, width: 1.5, dashType: 'dash' }
    });
    slide.addText('SYSTEM BOUNDARY: CodePilot AI Platform', {
      x: 3.1, y: 1.55, w: 5.0, h: 0.3,
      fontFace: FONTS.mono, fontSize: 9.5, bold: true, color: COLORS.subText
    });

    // Use Case Ovals inside boundary
    const useCases = [
      { id: 'UC-01', text: 'GitHub OAuth2 Login', x: 3.2, y: 2.0, w: 2.2, h: 0.6, color: COLORS.blueFill, border: COLORS.blueBorder },
      { id: 'UC-02', text: 'Institutional Email Auth', x: 3.2, y: 2.8, w: 2.2, h: 0.6, color: COLORS.greenFill, border: COLORS.greenBorder },
      { id: 'UC-03', text: 'Sync & Import Repositories', x: 3.2, y: 3.6, w: 2.2, h: 0.6, color: COLORS.blueFill, border: COLORS.blueBorder },
      { id: 'UC-04', text: 'Upload ZIP Project Archive', x: 3.2, y: 4.4, w: 2.2, h: 0.6, color: COLORS.blueFill, border: COLORS.blueBorder },
      { id: 'UC-05', text: 'Configure Exclusions & Skill', x: 3.2, y: 5.2, w: 2.2, h: 0.6, color: COLORS.slateFill, border: COLORS.slateBorder },

      { id: 'UC-06', text: 'Trigger Multi-Agent Review', x: 5.65, y: 2.0, w: 2.3, h: 0.6, color: COLORS.amberFill, border: COLORS.amberBorder },
      { id: 'UC-07', text: 'Ingestion & AST Parsing', x: 5.65, y: 2.8, w: 2.3, h: 0.6, color: COLORS.amberFill, border: COLORS.amberBorder },
      { id: 'UC-08', text: 'OWASP Security & Clean Scan', x: 5.65, y: 3.6, w: 2.3, h: 0.6, color: COLORS.amberFill, border: COLORS.amberBorder },
      { id: 'UC-09', text: 'Explore Finding Diffs & Fixes', x: 5.65, y: 4.4, w: 2.3, h: 0.6, color: COLORS.blueFill, border: COLORS.blueBorder },
      { id: 'UC-10', text: 'Ask Terminal AI (Grounded)', x: 5.65, y: 5.2, w: 2.3, h: 0.6, color: COLORS.purpleFill, border: COLORS.purpleBorder },

      { id: 'UC-11', text: 'Interview Simulator (Defense)', x: 8.15, y: 2.0, w: 2.15, h: 0.6, color: COLORS.purpleFill, border: COLORS.purpleBorder },
      { id: 'UC-12', text: 'Export Formal PDF Report', x: 8.15, y: 2.8, w: 2.15, h: 0.6, color: COLORS.slateFill, border: COLORS.slateBorder },
      { id: 'UC-13', text: 'Cohort Defect Analytics', x: 8.15, y: 3.6, w: 2.15, h: 0.6, color: COLORS.greenFill, border: COLORS.greenBorder },
      { id: 'UC-14', text: 'Grade & Review Submissions', x: 8.15, y: 4.4, w: 2.15, h: 0.6, color: COLORS.greenFill, border: COLORS.greenBorder }
    ];

    useCases.forEach((uc) => {
      slide.addShape(pptx.shapes.OVAL, {
        x: uc.x, y: uc.y, w: uc.w, h: uc.h,
        fill: { color: uc.color },
        line: { color: uc.border, width: 1.2 }
      });
      slide.addText(`${uc.id}\n${uc.text}`, {
        x: uc.x + 0.05, y: uc.y + 0.08, w: uc.w - 0.1, h: uc.h - 0.16,
        fontFace: FONTS.body, fontSize: 8.5, bold: true, color: COLORS.headerNavy, align: 'center', valign: 'middle'
      });
    });

    // External Services (Right Side)
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 10.75, y: 1.7, w: 2.0, h: 2.3,
      fill: { color: COLORS.slateFill },
      line: { color: COLORS.slateBorder, width: 1.5 }
    });
    slide.addText('External Service\nGitHub Cloud', {
      x: 10.85, y: 1.85, w: 1.8, h: 0.5,
      fontFace: FONTS.title, fontSize: 10.5, bold: true, color: COLORS.headerNavy, align: 'center'
    });
    slide.addText('• OAuth Authorize\n• Token Exchange\n• Public Repos API\n• Commit Metadata', {
      x: 10.85, y: 2.45, w: 1.8, h: 1.45,
      fontFace: FONTS.body, fontSize: 8.5, color: COLORS.subText, lineSpacing: 12
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 10.75, y: 4.3, w: 2.0, h: 2.3,
      fill: { color: COLORS.slateFill },
      line: { color: COLORS.slateBorder, width: 1.5 }
    });
    slide.addText('External Service\nSupabase DB & Auth', {
      x: 10.85, y: 4.45, w: 1.8, h: 0.5,
      fontFace: FONTS.title, fontSize: 10.5, bold: true, color: COLORS.headerNavy, align: 'center'
    });
    slide.addText('• GoTrue Auth Service\n• PostgreSQL Database\n• Row Level Security\n• Report Storage', {
      x: 10.85, y: 5.0, w: 1.8, h: 1.45,
      fontFace: FONTS.body, fontSize: 8.5, color: COLORS.subText, lineSpacing: 12
    });
  }

  // ==========================================
  // SLIDE 4: 02. CLASS DIAGRAM
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.slideBg };
    addSlideHeader(slide, '02', 'UML Structural Model', 'Class Diagram (Domain Models & Relationships)', 'Domain entities, aggregations, class attributes, methods, and agent pipeline contracts.');

    // Helper to draw UML Class Card
    function drawUmlClass(x, y, w, h, name, stereotype, attrs, methods, headerColor, headerBg) {
      slide.addShape(pptx.shapes.RECTANGLE, {
        x, y, w, h,
        fill: { color: COLORS.white },
        line: { color: headerColor, width: 1.2 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.25 }
      });

      // Class Header
      slide.addShape(pptx.shapes.RECTANGLE, {
        x, y, w, h: 0.5,
        fill: { color: headerBg },
        line: { color: headerColor, width: 1 }
      });
      slide.addText(`${stereotype ? stereotype + '\n' : ''}${name}`, {
        x, y: y + 0.04, w, h: 0.44,
        fontFace: FONTS.title, fontSize: 9.5, bold: true, color: headerColor, align: 'center'
      });

      // Attributes Section
      const attrY = y + 0.55;
      const attrH = (h - 0.55) * 0.5;
      slide.addText(attrs.join('\n'), {
        x: x + 0.1, y: attrY, w: w - 0.2, h: attrH,
        fontFace: FONTS.mono, fontSize: 7.5, color: COLORS.headerNavy, lineSpacing: 9
      });

      // Divider
      slide.addShape(pptx.shapes.LINE, {
        x: x, y: attrY + attrH, w: w, h: 0,
        line: { color: COLORS.borderMuted, width: 1 }
      });

      // Methods Section
      slide.addText(methods.join('\n'), {
        x: x + 0.1, y: attrY + attrH + 0.05, w: w - 0.2, h: h - (attrY + attrH) - 0.08,
        fontFace: FONTS.mono, fontSize: 7.5, color: COLORS.blueDark, lineSpacing: 9
      });
    }

    // Class 1: User
    drawUmlClass(0.6, 1.5, 2.7, 2.5, 'User', '<<abstract>>', 
      ['+ id: String', '+ email: String', '+ role: UserRole', '+ fullName: String', '+ avatarUrl: String', '+ createdAt: DateTime'],
      ['+ login(): Promise<Session>', '+ logout(): Promise<void>', '+ getInitials(): String'],
      COLORS.blueDark, COLORS.blueFill);

    // Class 2: Student
    drawUmlClass(0.6, 4.3, 2.7, 2.3, 'Student', '<<subclass>>',
      ['+ githubUsername: String', '+ rollNo: String', '+ cohort: String'],
      ['+ syncGithubRepos(): Repo[]', '+ submitForReview(id): Review', '+ downloadReport(id): PDF'],
      COLORS.blueDark, COLORS.blueFill);

    // Class 3: Faculty
    drawUmlClass(3.6, 4.3, 2.7, 2.3, 'Faculty', '<<subclass>>',
      ['+ department: String', '+ designation: String'],
      ['+ viewCohortRoster(): Student[]', '+ gradeSubmission(id, grade)', '+ filterByBatch(batch): List'],
      COLORS.greenDark, COLORS.greenFill);

    // Class 4: Repository
    drawUmlClass(3.6, 1.5, 3.1, 2.5, 'Repository', '<<entity>>',
      ['+ id: String', '+ name: String', '+ owner: String', '+ branch: String', '+ primaryLanguage: String', '+ latestScore: Int (0-100)', '+ totalLOC: Int', '+ exclusionRules: String[]'],
      ['+ detectLanguages(): Map', '+ filterExclusions(): File[]', '+ mapToWorkspace(): Repo'],
      COLORS.purpleDark, COLORS.purpleFill);

    // Class 5: CodeReview
    drawUmlClass(7.0, 1.5, 3.1, 2.5, 'CodeReview', '<<entity>>',
      ['+ id: String', '+ repositoryId: String', '+ skillLevel: SkillLevel', '+ overallHealthScore: Int', '+ qualityScore: Int (94%)', '+ securityScore: Int (82%)', '+ runtimeDuration: Float'],
      ['+ calculateScores(): Void', '+ generateSummary(): Text', '+ runAgents(): Promise'],
      COLORS.amberDark, COLORS.amberFill);

    // Class 6: Finding
    drawUmlClass(7.0, 4.3, 3.1, 2.3, 'Finding', '<<entity>>',
      ['+ id: String (CPAI-001)', '+ reviewId: String', '+ severity: SeverityLevel', '+ category: String (OWASP)', '+ filePath: String', '+ lineStart: Int', '+ confidenceScore: Float'],
      ['+ seniorExplanation(): Text', '+ suggestedDiff(): Text', '+ applyFix(): Void'],
      COLORS.roseText, COLORS.roseFill);

    // Class 7: MultiAgentPipeline
    drawUmlClass(10.4, 1.5, 2.4, 5.1, 'MultiAgentPipeline', '<<orchestrator>>',
      ['+ pipelineId: String', '+ currentPhase: Phase', '+ repoAgent: Agent', '+ qualityAgent: Agent', '+ securityAgent: Agent', '+ docAgent: Agent', '+ isExecuting: Boolean'],
      ['+ validateArchive(): Bool', '+ filterFiles(): File[]', '+ parseAST(): ASTTree', '+ runSecurityScan(): Res', '+ runQualityScan(): Res', '+ runDocScan(): Res', '+ aggregateScores(): Score', '+ formatOutput(): Review'],
      COLORS.slateText, COLORS.slateFill);
  }

  // ==========================================
  // SLIDE 5: 03. PACKAGE DIAGRAM
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.slideBg };
    addSlideHeader(slide, '03', 'UML Structural Model', 'Package Diagram (Layering & Dependency Direction)', 'Hierarchical module boundaries, layer isolation, and strict downward coupling.');

    const packages = [
      {
        name: 'Presentation & UI Layer (Next.js 14)',
        tabColor: COLORS.blueDark,
        bgColor: COLORS.blueFill,
        borderColor: COLORS.blueBorder,
        x: 0.6, y: 1.5, w: 12.1, h: 1.15,
        modules: [
          'app/ (Routes: /dashboard, /repositories, /review/new, /review/[id], /report/[id], /faculty, /chat/[id])',
          'components/ (AppLayout, FindingCard, MultiAgentPipeline, PdfExportModal, Logo, Navbar, Footer)',
          'styles/ (globals.css, Tailwind CSS 3.4 utilities, GitHub Primer dark theme variables)'
        ]
      },
      {
        name: 'Authentication & Session Layer',
        tabColor: COLORS.greenDark,
        bgColor: COLORS.greenFill,
        borderColor: COLORS.greenBorder,
        x: 0.6, y: 2.85, w: 5.9, h: 1.15,
        modules: [
          'lib/supabase/auth-context.tsx (AuthProvider, useAuth, session observer)',
          'lib/supabase/client.ts (createBrowserClient singleton, PKCE cookie jar)',
          'app/auth/ (Client callback page, PKCE exchange, role switcher)'
        ]
      },
      {
        name: 'Intelligence & Agent Analysis Layer',
        tabColor: COLORS.amberDark,
        bgColor: COLORS.amberFill,
        borderColor: COLORS.amberBorder,
        x: 6.8, y: 2.85, w: 5.9, h: 1.15,
        modules: [
          'lib/analysis-engine.ts (runMultiAgentReview orchestrator, 4 agent workers)',
          'lib/github.ts (fetchStudentGithubRepositories, token transport)',
          'lib/store.ts (Client persistence fallback, sample review data)'
        ]
      },
      {
        name: 'Data Access & Persistence Layer (PostgreSQL & Supabase)',
        tabColor: COLORS.purpleDark,
        bgColor: COLORS.purpleFill,
        borderColor: COLORS.purpleBorder,
        x: 0.6, y: 4.2, w: 12.1, h: 1.15,
        modules: [
          'lib/supabase/db.ts (saveRepositoryToDB, fetchRepositoriesFromDB, dynamic owner mapping)',
          'supabase/schema.sql (PostgreSQL tables: repositories, reviews, findings, faculty rosters, audit_logs)',
          'lib/types.ts (Data contracts: Repository, CodeReview, Finding, SkillLevel, UserRole)'
        ]
      },
      {
        name: 'External Infrastructure & Third-Party APIs',
        tabColor: COLORS.slateText,
        bgColor: COLORS.slateFill,
        borderColor: COLORS.slateBorder,
        x: 0.6, y: 5.55, w: 12.1, h: 1.15,
        modules: [
          'GitHub Cloud API (OAuth2 authorization endpoint, REST v3 /user/repos endpoint)',
          'Supabase Cloud Hosting (AWS Managed PostgreSQL 15, GoTrue authentication engine, RLS policies)'
        ]
      }
    ];

    packages.forEach((pkg) => {
      // Package Tab
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: pkg.x, y: pkg.y, w: 4.2, h: 0.32,
        fill: { color: pkg.bgColor },
        line: { color: pkg.borderColor, width: 1.2 }
      });
      slide.addText(pkg.name, {
        x: pkg.x + 0.1, y: pkg.y + 0.04, w: 4.0, h: 0.25,
        fontFace: FONTS.title, fontSize: 8.5, bold: true, color: pkg.tabColor
      });

      // Package Body
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: pkg.x, y: pkg.y + 0.28, w: pkg.w, h: pkg.h - 0.28,
        fill: { color: COLORS.white },
        line: { color: pkg.borderColor, width: 1.2 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.2 }
      });

      // Modules inside Package
      pkg.modules.forEach((mod, mi) => {
        slide.addText(`•  ${mod}`, {
          x: pkg.x + 0.2, y: pkg.y + 0.35 + mi * 0.24, w: pkg.w - 0.4, h: 0.24,
          fontFace: FONTS.mono, fontSize: 8.5, color: COLORS.headerNavy
        });
      });
    });
  }

  // ==========================================
  // SLIDE 6: 04. DEPLOYMENT DIAGRAM
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.slideBg };
    addSlideHeader(slide, '04', 'UML Physical / Deployment Model', 'Deployment Diagram (Runtime Infrastructure & Network Nodes)', 'Physical deployment nodes, runtime containers, network protocols, and connection ports.');

    const nodes = [
      {
        title: 'CLIENT WORKSTATION NODE',
        sub: 'Web Browser Container',
        x: 0.6, y: 1.5, w: 3.7, h: 5.2,
        color: COLORS.blueBorder,
        fill: COLORS.blueFill,
        textColor: COLORS.blueDark,
        artifacts: [
          { name: 'React 18 SPA Artifact', desc: 'Next.js App Router client bundles, virtual DOM hydration' },
          { name: 'Tailwind CSS Engine', desc: 'Pre-compiled stylesheet, GitHub Primer dark variables' },
          { name: 'In-Memory JSZip Runtime', desc: 'Browser-side ZIP decompressor & file tree parser' },
          { name: 'Client Cookie Jar', desc: 'codepilot-auth-token (PKCE verifier, lax cookie)' },
          { name: 'LocalStorage Session Store', desc: 'codepilot_student_repos cache for zero-latency views' }
        ]
      },
      {
        title: 'VERCEL SERVERLESS NODE',
        sub: 'Edge & Node.js 20.x Host',
        x: 4.8, y: 1.5, w: 3.7, h: 5.2,
        color: COLORS.purpleBorder,
        fill: COLORS.purpleFill,
        textColor: COLORS.purpleDark,
        artifacts: [
          { name: 'Next.js 14 App Server', desc: 'Node.js 20 runtime, SSR page generator & router' },
          { name: 'Multi-Agent Analysis Engine', desc: 'AST parsing, language detection, OWASP rule evaluation' },
          { name: 'GitHub Integration Proxy', desc: 'Token-authorized relay for public & private repo fetching' },
          { name: 'Static Asset CDN Distribution', desc: '.next/static chunks, logo assets, icons delivery' },
          { name: 'Vercel Security Firewall', desc: 'DDoS mitigation, SSL/TLS termination, HTTP/2 multiplexing' }
        ]
      },
      {
        title: 'SUPABASE CLOUD PLATFORM',
        sub: 'AWS eu-central Managed Cluster',
        x: 9.0, y: 1.5, w: 3.7, h: 5.2,
        color: COLORS.greenBorder,
        fill: COLORS.greenFill,
        textColor: COLORS.greenDark,
        artifacts: [
          { name: 'PostgreSQL 15 Database', desc: 'Relational engine storing repos, reviews, findings, rosters' },
          { name: 'GoTrue Auth Microservice', desc: 'PKCE validation, OAuth callback verification, JWT signing' },
          { name: 'Row Level Security Engine', desc: 'Per-user tenant isolation on student & faculty tables' },
          { name: 'PostgREST API Gateway', desc: 'Instant HTTPS REST endpoint translating queries to SQL' },
          { name: 'Automated Daily Backups', desc: 'Point-in-time recovery & audit log persistence' }
        ]
      }
    ];

    nodes.forEach((node) => {
      // 3D Host Node Card
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: node.x, y: node.y, w: node.w, h: node.h,
        fill: { color: COLORS.white },
        line: { color: node.color, width: 2 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.3 }
      });

      // Node Header
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: node.x, y: node.y, w: node.w, h: 0.65,
        fill: { color: node.fill },
        line: { color: node.color, width: 1 }
      });
      slide.addText(`<<device>>\n${node.title}`, {
        x: node.x + 0.1, y: node.y + 0.05, w: node.w - 0.2, h: 0.35,
        fontFace: FONTS.title, fontSize: 9.5, bold: true, color: node.textColor, align: 'center'
      });
      slide.addText(node.sub, {
        x: node.x + 0.1, y: node.y + 0.4, w: node.w - 0.2, h: 0.2,
        fontFace: FONTS.body, fontSize: 8, color: COLORS.subText, align: 'center'
      });

      // Execution Artifacts
      node.artifacts.forEach((art, ai) => {
        const artY = node.y + 0.85 + ai * 0.83;
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: node.x + 0.15, y: artY, w: node.w - 0.3, h: 0.72,
          fill: { color: COLORS.slateFill },
          line: { color: COLORS.borderMuted, width: 1 }
        });

        slide.addText(`<<executionEnvironment>> ${art.name}`, {
          x: node.x + 0.25, y: artY + 0.06, w: node.w - 0.5, h: 0.24,
          fontFace: FONTS.mono, fontSize: 8, bold: true, color: COLORS.headerNavy
        });
        slide.addText(art.desc, {
          x: node.x + 0.25, y: artY + 0.3, w: node.w - 0.5, h: 0.38,
          fontFace: FONTS.body, fontSize: 7.5, color: COLORS.subText, lineSpacing: 9
        });
      });
    });

    // Network Lines & Protocols
    slide.addShape(pptx.shapes.LEFT_RIGHT_ARROW, {
      x: 4.35, y: 3.8, w: 0.4, h: 0.2,
      fill: { color: COLORS.blueBorder }
    });
    slide.addText('HTTPS (Port 443)\nTLS 1.3 / WSS', {
      x: 4.15, y: 4.1, w: 0.8, h: 0.4,
      fontFace: FONTS.mono, fontSize: 6.5, bold: true, color: COLORS.blueDark, align: 'center'
    });

    slide.addShape(pptx.shapes.LEFT_RIGHT_ARROW, {
      x: 8.55, y: 3.8, w: 0.4, h: 0.2,
      fill: { color: COLORS.greenBorder }
    });
    slide.addText('PostgREST / JSON\nTCP 5432 (SSL)', {
      x: 8.35, y: 4.1, w: 0.8, h: 0.4,
      fontFace: FONTS.mono, fontSize: 6.5, bold: true, color: COLORS.greenDark, align: 'center'
    });
  }

  // ==========================================
  // SLIDE 7: 05. COMPONENT DIAGRAM
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.slideBg };
    addSlideHeader(slide, '05', 'UML Component Model', 'Component Diagram (Wiring, Provided & Required Interfaces)', 'Modular software building blocks with stereotype pins and communication interfaces.');

    const components = [
      { name: 'Presentation UI Component', desc: 'Dashboard, repos list, faculty roster, and report views', prov: ['IUserInterface'], req: ['IAuthService', 'IIngestionService'], x: 0.6, y: 1.6, w: 3.6, color: COLORS.blueBorder, fill: COLORS.blueFill },
      { name: 'Auth & Identity Component', desc: 'Supabase SSR singleton, GoTrue PKCE handshake, role claim router', prov: ['IAuthService'], req: ['ISupabaseAuthAPI'], x: 4.8, y: 1.6, w: 3.6, color: COLORS.greenBorder, fill: COLORS.greenFill },
      { name: 'GitHub Integration Proxy', desc: 'OAuth token store & user/repos catalog client', prov: ['IGitHubCatalog'], req: ['IGitHubRestAPI'], x: 9.0, y: 1.6, w: 3.7, color: COLORS.slateBorder, fill: COLORS.slateFill },

      { name: 'Ingestion & Validation Engine', desc: 'JSZip unpacker, exclusion rules, AST index generator', prov: ['IIngestionService', 'IASTParser'], req: ['IRawArchiveSource'], x: 0.6, y: 4.2, w: 3.6, color: COLORS.amberBorder, fill: COLORS.amberFill },
      { name: 'Multi-Agent Review Pipeline', desc: 'Ensemble coordinator for Quality, Security, and Doc agents', prov: ['IReviewEngine'], req: ['IASTParser', 'IOWASPRulesKB'], x: 4.8, y: 4.2, w: 3.6, color: COLORS.purpleBorder, fill: COLORS.purpleFill },
      { name: 'Data Persistence Component', desc: 'PostgreSQL schema manager & review record cache', prov: ['IDataAccess'], req: ['IPostgresDatabase'], x: 9.0, y: 4.2, w: 3.7, color: COLORS.greenBorder, fill: COLORS.greenFill }
    ];

    components.forEach((c) => {
      // Component Box with Component Stereotype Icon
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: c.x, y: c.y, w: c.w, h: 2.5,
        fill: { color: COLORS.white },
        line: { color: c.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.25 }
      });

      // Component Header Band
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: c.x, y: c.y, w: c.w, h: 0.55,
        fill: { color: c.fill },
        line: { color: c.color, width: 1 }
      });
      slide.addText(`<<component>>\n${c.name}`, {
        x: c.x + 0.1, y: c.y + 0.05, w: c.w - 0.2, h: 0.45,
        fontFace: FONTS.title, fontSize: 9.5, bold: true, color: COLORS.headerNavy, align: 'center'
      });

      slide.addText(c.desc, {
        x: c.x + 0.2, y: c.y + 0.65, w: c.w - 0.4, h: 0.5,
        fontFace: FONTS.body, fontSize: 8.5, color: COLORS.subText, lineSpacing: 11
      });

      // Provided Interfaces (Green)
      slide.addText(`PROVIDED INTERFACES:`, {
        x: c.x + 0.2, y: c.y + 1.2, w: c.w - 0.4, h: 0.2,
        fontFace: FONTS.mono, fontSize: 7, bold: true, color: COLORS.greenDark
      });
      c.prov.forEach((p, pi) => {
        slide.addText(`⚪  ${p}`, {
          x: c.x + 0.2, y: c.y + 1.4 + pi * 0.22, w: c.w - 0.4, h: 0.22,
          fontFace: FONTS.mono, fontSize: 7.5, color: COLORS.headerNavy
        });
      });

      // Required Interfaces (Amber)
      const reqY = c.y + 1.4 + c.prov.length * 0.22 + 0.05;
      slide.addText(`REQUIRED INTERFACES:`, {
        x: c.x + 0.2, y: reqY, w: c.w - 0.4, h: 0.2,
        fontFace: FONTS.mono, fontSize: 7, bold: true, color: COLORS.amberDark
      });
      c.req.forEach((r, ri) => {
        slide.addText(`◒  ${r}`, {
          x: c.x + 0.2, y: reqY + 0.2 + ri * 0.22, w: c.w - 0.4, h: 0.22,
          fontFace: FONTS.mono, fontSize: 7.5, color: COLORS.headerNavy
        });
      });
    });
  }

  // ==========================================
  // SLIDE 8: 06. COMPOSITE STRUCTURE DIAGRAM
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.slideBg };
    addSlideHeader(slide, '06', 'UML Structural Decomposition', 'Composite Structure Diagram (Internal Classifier & Ports)', 'Decomposition of the MultiAgentReviewPipeline classifier into internal parts, ports, and connectors.');

    // Outer Classifier Boundary
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.45, w: 12.1, h: 5.3,
      fill: { color: COLORS.white },
      line: { color: COLORS.purpleBorder, width: 2 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
    });

    slide.addText('<<classifier>> MultiAgentReviewPipeline', {
      x: 0.9, y: 1.55, w: 6.0, h: 0.35,
      fontFace: FONTS.title, fontSize: 12, bold: true, color: COLORS.purpleDark
    });

    // Inlet Ports
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.4, y: 2.3, w: 0.4, h: 0.4,
      fill: { color: COLORS.blueFill },
      line: { color: COLORS.blueBorder, width: 1.5 }
    });
    slide.addText('p1: RawSourcePort\n(ZIP / GitHub Stream)', {
      x: 0.9, y: 2.15, w: 2.4, h: 0.5,
      fontFace: FONTS.mono, fontSize: 7.5, color: COLORS.blueDark
    });

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.4, y: 4.8, w: 0.4, h: 0.4,
      fill: { color: COLORS.amberFill },
      line: { color: COLORS.amberBorder, width: 1.5 }
    });
    slide.addText('p2: ConfigPort\n(Exclusions, SkillLevel)', {
      x: 0.9, y: 4.65, w: 2.4, h: 0.5,
      fontFace: FONTS.mono, fontSize: 7.5, color: COLORS.amberDark
    });

    // Internal Part 1: Validator & Filter
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.5, y: 2.8, w: 2.5, h: 2.0,
      fill: { color: COLORS.slateFill },
      line: { color: COLORS.slateBorder, width: 1.2 }
    });
    slide.addText('validator: ArchiveValidator\n& ExclusionFilter', {
      x: 1.6, y: 2.9, w: 2.3, h: 0.5,
      fontFace: FONTS.title, fontSize: 9.5, bold: true, color: COLORS.headerNavy, align: 'center'
    });
    slide.addText('• Checks zip integrity\n• Strips node_modules\n• Strips .git, dist, build\n• Ingests clean file tree', {
      x: 1.6, y: 3.45, w: 2.3, h: 1.2,
      fontFace: FONTS.body, fontSize: 8, color: COLORS.subText, lineSpacing: 11
    });

    // Internal Part 2: Language & AST Dispatcher
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.3, y: 2.8, w: 2.5, h: 2.0,
      fill: { color: COLORS.blueFill },
      line: { color: COLORS.blueBorder, width: 1.2 }
    });
    slide.addText('astEngine: ASTDispatcher\n& LanguageDetector', {
      x: 4.4, y: 2.9, w: 2.3, h: 0.5,
      fontFace: FONTS.title, fontSize: 9.5, bold: true, color: COLORS.blueDark, align: 'center'
    });
    slide.addText('• Multi-lang distribution\n• Parses TypeScript AST\n• Builds symbol indexes\n• Prepares agent chunks', {
      x: 4.4, y: 3.45, w: 2.3, h: 1.2,
      fontFace: FONTS.body, fontSize: 8, color: COLORS.headerNavy, lineSpacing: 11
    });

    // Internal Ensemble Container (Parallel Agents)
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.1, y: 2.1, w: 2.7, h: 3.4,
      fill: { color: COLORS.purpleFill },
      line: { color: COLORS.purpleBorder, width: 1.5, dashType: 'dash' }
    });
    slide.addText('agentEnsemble: ParallelAgents', {
      x: 7.2, y: 2.2, w: 2.5, h: 0.3,
      fontFace: FONTS.mono, fontSize: 8.5, bold: true, color: COLORS.purpleDark, align: 'center'
    });

    // Agent subparts
    const subAgents = [
      { name: 'qaAgent: QualityAuditor', desc: 'Code smells, complexity', color: COLORS.blueBorder },
      { name: 'secAgent: OWASPAuditor', desc: 'SQLi, broken auth, secrets', color: COLORS.roseBorder },
      { name: 'docAgent: DocstringAuditor', desc: 'API docs, parameter types', color: COLORS.greenBorder }
    ];
    subAgents.forEach((sa, sai) => {
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 7.25, y: 2.6 + sai * 0.9, w: 2.4, h: 0.75,
        fill: { color: COLORS.white },
        line: { color: sa.color, width: 1 }
      });
      slide.addText(sa.name, {
        x: 7.3, y: 2.65 + sai * 0.9, w: 2.3, h: 0.25,
        fontFace: FONTS.mono, fontSize: 7.5, bold: true, color: COLORS.headerNavy
      });
      slide.addText(sa.desc, {
        x: 7.3, y: 2.92 + sai * 0.9, w: 2.3, h: 0.4,
        fontFace: FONTS.body, fontSize: 7.5, color: COLORS.subText
      });
    });

    // Internal Part 3: Aggregator & Calibrator
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 10.1, y: 2.8, w: 2.3, h: 2.0,
      fill: { color: COLORS.greenFill },
      line: { color: COLORS.greenBorder, width: 1.2 }
    });
    slide.addText('aggregator: ScoreAggregator\n& FixCalibrator', {
      x: 10.2, y: 2.9, w: 2.1, h: 0.5,
      fontFace: FONTS.title, fontSize: 9.5, bold: true, color: COLORS.greenDark, align: 'center'
    });
    slide.addText('• Computes health / 100\n• Weight: 94% Q, 82% S\n• Formats Senior diffs\n• Calibrates skill level', {
      x: 10.2, y: 3.45, w: 2.1, h: 1.2,
      fontFace: FONTS.body, fontSize: 8, color: COLORS.headerNavy, lineSpacing: 11
    });

    // Outlet Port
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 12.5, y: 3.65, w: 0.4, h: 0.4,
      fill: { color: COLORS.greenFill },
      line: { color: COLORS.greenBorder, width: 1.5 }
    });
    slide.addText('p3: ReviewOut\n(CodeReview & Findings)', {
      x: 10.7, y: 5.0, w: 1.9, h: 0.4,
      fontFace: FONTS.mono, fontSize: 7.5, color: COLORS.greenDark, align: 'right'
    });
  }

  // ==========================================
  // SLIDE 9: 07. STATE TRANSITION DIAGRAM
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.slideBg };
    addSlideHeader(slide, '07', 'UML Dynamic / Behavioral Model', 'State Transition Diagram (Code Review Lifecycle)', 'State machine showing submission transitions from unreviewed idle to fully audited and graded.');

    const states = [
      { name: 'IDLE / STANDBY', desc: 'Workspace loaded, awaiting user source selection', x: 0.6, y: 2.2, w: 2.2, h: 1.3, color: COLORS.slateBorder, fill: COLORS.slateFill },
      { name: 'INGESTING_ARCHIVE', desc: 'Reading ZIP in memory or fetching GitHub commit tree', x: 3.1, y: 2.2, w: 2.3, h: 1.3, color: COLORS.blueBorder, fill: COLORS.blueFill },
      { name: 'AST_PARSING', desc: 'Language distribution detection & syntax tree indexing', x: 5.7, y: 2.2, w: 2.3, h: 1.3, color: COLORS.amberBorder, fill: COLORS.amberFill },
      { name: 'PARALLEL_SCANNING', desc: 'Concurrent Quality, OWASP Security & Doc evaluation', x: 8.3, y: 2.2, w: 2.5, h: 1.3, color: COLORS.purpleBorder, fill: COLORS.purpleFill },
      { name: 'REVIEW_COMPLETED', desc: 'Weighted scores computed, senior fix diffs generated', x: 8.3, y: 4.5, w: 2.5, h: 1.3, color: COLORS.greenBorder, fill: COLORS.greenFill },
      { name: 'SUBMISSION_GRADED', desc: 'Faculty Evaluator grades submission & commits feedback', x: 4.0, y: 4.5, w: 2.8, h: 1.3, color: COLORS.greenBorder, fill: COLORS.greenFill }
    ];

    states.forEach((s) => {
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: s.x, y: s.y, w: s.w, h: s.h,
        fill: { color: s.fill },
        line: { color: s.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.25 }
      });
      slide.addText(s.name, {
        x: s.x + 0.1, y: s.y + 0.15, w: s.w - 0.2, h: 0.35,
        fontFace: FONTS.mono, fontSize: 9, bold: true, color: COLORS.headerNavy, align: 'center'
      });
      slide.addText(s.desc, {
        x: s.x + 0.15, y: s.y + 0.5, w: s.w - 0.3, h: 0.7,
        fontFace: FONTS.body, fontSize: 8, color: COLORS.subText, align: 'center', lineSpacing: 11
      });
    });

    // Error State Box
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 3.1, y: 4.5, w: 2.3, h: 1.0,
      fill: { color: COLORS.roseFill },
      line: { color: COLORS.roseBorder, width: 1.2 }
    });
    slide.addText('INGESTION_FAILED\n[Corrupted ZIP / Invalid Repo]', {
      x: 3.15, y: 4.65, w: 2.2, h: 0.7,
      fontFace: FONTS.mono, fontSize: 8, bold: true, color: COLORS.roseText, align: 'center'
    });

    // Transition Arrows & Events
    const transitions = [
      { from: '0.6', arrowX: 2.8, y: 2.85, label: 'Select Repo' },
      { from: '3.1', arrowX: 5.4, y: 2.85, label: 'Validation Pass' },
      { from: '5.7', arrowX: 8.0, y: 2.85, label: 'AST Ready' },
      { from: '8.3', arrowX: 9.55, y: 3.9, label: 'Scores Aggregate', down: true },
      { from: '8.3', arrowX: 7.2, y: 5.15, label: 'Faculty Evaluates', left: true }
    ];

    // Right arrows
    [2.8, 5.4, 8.0].forEach((ax, idx) => {
      slide.addShape(pptx.shapes.RIGHT_ARROW, {
        x: ax, y: 2.7, w: 0.28, h: 0.22,
        fill: { color: COLORS.blueBorder }
      });
      slide.addText(transitions[idx].label, {
        x: ax - 0.45, y: 2.35, w: 1.2, h: 0.25,
        fontFace: FONTS.mono, fontSize: 7, color: COLORS.blueDark, align: 'center'
      });
    });

    // Down arrow
    slide.addShape(pptx.shapes.DOWN_ARROW, {
      x: 9.45, y: 3.8, w: 0.22, h: 0.45,
      fill: { color: COLORS.greenBorder }
    });
    slide.addText('Analysis Complete', {
      x: 9.8, y: 3.85, w: 1.4, h: 0.3,
      fontFace: FONTS.mono, fontSize: 7.5, color: COLORS.greenDark
    });

    // Left arrow
    slide.addShape(pptx.shapes.LEFT_ARROW, {
      x: 7.3, y: 5.05, w: 0.5, h: 0.22,
      fill: { color: COLORS.greenBorder }
    });
    slide.addText('Assign Grade', {
      x: 7.0, y: 4.75, w: 1.1, h: 0.25,
      fontFace: FONTS.mono, fontSize: 7.5, color: COLORS.greenDark, align: 'center'
    });
  }

  // ==========================================
  // SLIDE 10: 08. ACTIVITY DIAGRAM
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.slideBg };
    addSlideHeader(slide, '08', 'UML Workflow Model', 'Activity Diagram (Parallel Multi-Agent Ingestion Flow)', 'End-to-end processing pipeline showing fork/join parallelism and student/faculty decision points.');

    // Activity Nodes
    const activities = [
      { name: 'Start Review Request', x: 0.6, y: 1.7, w: 2.0, h: 0.7, fill: COLORS.blueFill, line: COLORS.blueBorder },
      { name: 'Decision: Source Type?\n(ZIP File vs GitHub Repo)', x: 0.6, y: 2.8, w: 2.0, h: 1.0, fill: COLORS.amberFill, line: COLORS.amberBorder, diamond: true },
      { name: 'Strip Exclusions\n(node_modules, .git)', x: 0.6, y: 4.2, w: 2.0, h: 0.8, fill: COLORS.slateFill, line: COLORS.slateBorder },
      { name: 'Parse Language & AST Tree', x: 0.6, y: 5.4, w: 2.0, h: 0.8, fill: COLORS.slateFill, line: COLORS.slateBorder },

      // Fork Synchronizer
      { name: 'PARALLEL FORK BAR (Synchronized Agent Dispatch)', x: 3.3, y: 1.8, w: 0.2, h: 4.4, fork: true },

      // Parallel Agents
      { name: 'Quality Agent Activity\n• Linting & Formatting\n• Unbounded Query Audit', x: 4.2, y: 2.0, w: 2.6, h: 1.1, fill: COLORS.blueFill, line: COLORS.blueBorder },
      { name: 'OWASP Security Agent\n• SQL Injection (A03)\n• Broken Access Control (A01)', x: 4.2, y: 3.45, w: 2.6, h: 1.1, fill: COLORS.roseFill, line: COLORS.roseBorder },
      { name: 'Documentation Agent\n• API Completeness Audit\n• Parameter Docstrings', x: 4.2, y: 4.9, w: 2.6, h: 1.1, fill: COLORS.greenFill, line: COLORS.greenBorder },

      // Join Synchronizer
      { name: 'PARALLEL JOIN BAR (Aggregate Findings)', x: 7.5, y: 1.8, w: 0.2, h: 4.4, fork: true },

      // Post-Processing
      { name: 'Calculate Health Score\n(0-100 Weighted Average)', x: 8.3, y: 2.0, w: 2.3, h: 0.9, fill: COLORS.greenFill, line: COLORS.greenBorder },
      { name: 'Formulate Senior Diffs\n& Explanations', x: 8.3, y: 3.2, w: 2.3, h: 0.9, fill: COLORS.amberFill, line: COLORS.amberBorder },
      { name: 'Persist in Supabase DB\n& Render Interactive Cards', x: 8.3, y: 4.4, w: 2.3, h: 0.9, fill: COLORS.purpleFill, line: COLORS.purpleBorder },
      { name: 'Faculty Grade Assignment\n& PDF Audit Generation', x: 10.9, y: 3.2, w: 2.0, h: 1.5, fill: COLORS.greenFill, line: COLORS.greenBorder }
    ];

    activities.forEach((act) => {
      if (act.fork) {
        slide.addShape(pptx.shapes.RECTANGLE, {
          x: act.x, y: act.y, w: act.w, h: act.h,
          fill: { color: COLORS.headerNavy }
        });
      } else {
        slide.addShape(act.diamond ? pptx.shapes.DIAMOND : pptx.shapes.ROUNDED_RECTANGLE, {
          x: act.x, y: act.y, w: act.w, h: act.h,
          fill: { color: act.fill },
          line: { color: act.line, width: 1.2 }
        });
        slide.addText(act.name, {
          x: act.x + 0.05, y: act.y + 0.05, w: act.w - 0.1, h: act.h - 0.1,
          fontFace: FONTS.title, fontSize: 8, bold: true, color: COLORS.headerNavy, align: 'center', valign: 'middle'
        });
      }
    });

    // Connecting arrows
    slide.addShape(pptx.shapes.RIGHT_ARROW, { x: 2.65, y: 4.0, w: 0.6, h: 0.2, fill: { color: COLORS.blueBorder } });
    slide.addShape(pptx.shapes.RIGHT_ARROW, { x: 3.55, y: 2.5, w: 0.6, h: 0.2, fill: { color: COLORS.blueBorder } });
    slide.addShape(pptx.shapes.RIGHT_ARROW, { x: 3.55, y: 4.0, w: 0.6, h: 0.2, fill: { color: COLORS.roseBorder } });
    slide.addShape(pptx.shapes.RIGHT_ARROW, { x: 3.55, y: 5.4, w: 0.6, h: 0.2, fill: { color: COLORS.greenBorder } });
    slide.addShape(pptx.shapes.RIGHT_ARROW, { x: 6.85, y: 2.5, w: 0.6, h: 0.2, fill: { color: COLORS.blueBorder } });
    slide.addShape(pptx.shapes.RIGHT_ARROW, { x: 6.85, y: 4.0, w: 0.6, h: 0.2, fill: { color: COLORS.roseBorder } });
    slide.addShape(pptx.shapes.RIGHT_ARROW, { x: 6.85, y: 5.4, w: 0.6, h: 0.2, fill: { color: COLORS.greenBorder } });
    slide.addShape(pptx.shapes.RIGHT_ARROW, { x: 7.75, y: 4.0, w: 0.5, h: 0.2, fill: { color: COLORS.greenBorder } });
    slide.addShape(pptx.shapes.RIGHT_ARROW, { x: 10.65, y: 4.0, w: 0.2, h: 0.2, fill: { color: COLORS.greenBorder } });
  }

  // ==========================================
  // SLIDE 11: 09. SEQUENCE DIAGRAM
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.slideBg };
    addSlideHeader(slide, '09', 'UML Interaction Model', 'Sequence Diagram (End-to-End Review Execution & API Handshakes)', 'Chronological sequence of synchronous calls, parallel agent dispatches, and DB callbacks.');

    // Lifeline Actors/Participants
    const lifelines = [
      { name: 'Student Dev', x: 0.6, color: COLORS.blueBorder, fill: COLORS.blueFill },
      { name: 'Next.js App UI', x: 2.4, color: COLORS.blueBorder, fill: COLORS.blueFill },
      { name: 'Ingestion Engine', x: 4.3, color: COLORS.amberBorder, fill: COLORS.amberFill },
      { name: 'Agent Coordinator', x: 6.2, color: COLORS.purpleBorder, fill: COLORS.purpleFill },
      { name: 'Security Agent', x: 8.1, color: COLORS.roseBorder, fill: COLORS.roseFill },
      { name: 'Supabase DB', x: 10.0, color: COLORS.greenBorder, fill: COLORS.greenFill },
      { name: 'Faculty Evaluator', x: 11.8, color: COLORS.greenBorder, fill: COLORS.greenFill }
    ];

    lifelines.forEach((ll) => {
      // Header Box
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: ll.x, y: 1.5, w: 1.4, h: 0.45,
        fill: { color: ll.fill },
        line: { color: ll.color, width: 1.2 }
      });
      slide.addText(ll.name, {
        x: ll.x, y: 1.5, w: 1.4, h: 0.45,
        fontFace: FONTS.title, fontSize: 8, bold: true, color: COLORS.headerNavy, align: 'center', valign: 'middle'
      });

      // Lifeline Dashed Line
      slide.addShape(pptx.shapes.LINE, {
        x: ll.x + 0.7, y: 2.0, w: 0, h: 4.6,
        line: { color: COLORS.borderStrong, width: 1, dashType: 'dash' }
      });
    });

    // Sequence Messages (Step-by-step horizontal numbered arrows)
    const messages = [
      { from: 1.3, to: 3.1, y: 2.2, text: '1. Select Repo & Click "Start Review"', color: COLORS.blueDark },
      { from: 3.1, to: 5.0, y: 2.65, text: '2. extractAndFilterArchive(file, exclusions)', color: COLORS.amberDark },
      { from: 5.0, to: 6.9, y: 3.1, text: '3. parseASTTree(cleanFiles)', color: COLORS.purpleDark },
      { from: 6.9, to: 8.8, y: 3.65, text: '4. [par] evaluateOWASPRules(astSlice)', color: COLORS.roseText },
      { from: 8.8, to: 6.9, y: 4.15, text: '5. returnFindings(SQLi, BrokenAccess)', color: COLORS.roseText, return: true },
      { from: 6.9, to: 10.7, y: 4.65, text: '6. saveReview(score: 92, findings: 7)', color: COLORS.greenDark },
      { from: 10.7, to: 3.1, y: 5.15, text: '7. ReviewSavedEvent(id: rev-1)', color: COLORS.greenDark, return: true },
      { from: 3.1, to: 1.3, y: 5.6, text: '8. Render Interactive Health Cards & Diffs', color: COLORS.blueDark, return: true },
      { from: 12.5, to: 10.7, y: 6.05, text: '9. gradeSubmission(reviewId: rev-1, marks: 48/50)', color: COLORS.greenDark }
    ];

    messages.forEach((msg) => {
      const isReturn = Boolean(msg.return);
      slide.addShape(pptx.shapes.LINE, {
        x: Math.min(msg.from, msg.to), y: msg.y,
        w: Math.abs(msg.to - msg.from), h: 0,
        line: { color: msg.color, width: 1.5, dashType: isReturn ? 'dash' : 'solid' }
      });

      // Arrow Head
      slide.addShape(isReturn ? pptx.shapes.LEFT_ARROW : pptx.shapes.RIGHT_ARROW, {
        x: msg.to - (isReturn ? 0 : 0.15), y: msg.y - 0.08, w: 0.15, h: 0.16,
        fill: { color: msg.color }
      });

      // Label
      slide.addText(msg.text, {
        x: Math.min(msg.from, msg.to), y: msg.y - 0.25,
        w: Math.abs(msg.to - msg.from), h: 0.25,
        fontFace: FONTS.mono, fontSize: 7, color: msg.color, align: 'center'
      });
    });
  }

  // ==========================================
  // SLIDE 12: 10. COMMUNICATION DIAGRAM
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.slideBg };
    addSlideHeader(slide, '10', 'UML Interaction Model', 'Communication Diagram (Object Collaborations & Numbered Links)', 'Structural network showing object topological relations and sequential numbered messages.');

    const objects = [
      { name: ':StudentDeveloper', x: 0.8, y: 2.2, w: 2.3, h: 1.2, color: COLORS.blueBorder, fill: COLORS.blueFill },
      { name: ':ReviewController\n(App Router)', x: 4.1, y: 2.2, w: 2.5, h: 1.2, color: COLORS.blueBorder, fill: COLORS.blueFill },
      { name: ':AgentCoordinator\n(Analysis Engine)', x: 7.7, y: 2.2, w: 2.6, h: 1.2, color: COLORS.purpleBorder, fill: COLORS.purpleFill },
      { name: ':OWASPKnowledgeBase\n(Rule Engine)', x: 10.7, y: 2.2, w: 2.2, h: 1.2, color: COLORS.amberBorder, fill: COLORS.amberFill },

      { name: ':AuthGateway\n(Supabase PKCE)', x: 0.8, y: 4.6, w: 2.3, h: 1.2, color: COLORS.greenBorder, fill: COLORS.greenFill },
      { name: ':IngestionEngine\n(JSZip & Filter)', x: 4.1, y: 4.6, w: 2.5, h: 1.2, color: COLORS.slateBorder, fill: COLORS.slateFill },
      { name: ':DatabaseStore\n(PostgreSQL)', x: 7.7, y: 4.6, w: 2.6, h: 1.2, color: COLORS.greenBorder, fill: COLORS.greenFill },
      { name: ':FacultyPortal\n(Cohort Controller)', x: 10.7, y: 4.6, w: 2.2, h: 1.2, color: COLORS.greenBorder, fill: COLORS.greenFill }
    ];

    objects.forEach((obj) => {
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: obj.x, y: obj.y, w: obj.w, h: obj.h,
        fill: { color: obj.fill },
        line: { color: obj.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.25 }
      });
      slide.addText(obj.name, {
        x: obj.x + 0.1, y: obj.y + 0.2, w: obj.w - 0.2, h: 0.8,
        fontFace: FONTS.mono, fontSize: 9, bold: true, color: COLORS.headerNavy, align: 'center'
      });
    });

    // Links & Message Annotations
    const links = [
      { text: '1.1: RequestLogin()\n1.2: ReturnSessionToken()', x: 0.9, y: 3.55, w: 2.1, h: 0.8 },
      { text: '2.1: SelectRepo(Society_Sync)\n2.2: TriggerAnalysis()', x: 2.1, y: 1.55, w: 2.9, h: 0.6 },
      { text: '3.1: IngestFiles(exclusions)\n3.2: ReturnCleanAST()', x: 4.2, y: 3.55, w: 2.3, h: 0.8 },
      { text: '4.1: DispatchAgents(AST)\n4.4: AggregatedReview()', x: 5.7, y: 1.55, w: 2.9, h: 0.6 },
      { text: '4.2: QueryOWASPRules()\n4.3: MatchSQLiPatterns()', x: 9.3, y: 1.55, w: 2.4, h: 0.6 },
      { text: '5.1: PersistReviewRecord()\n5.2: CommitFindings()', x: 7.8, y: 3.55, w: 2.4, h: 0.8 },
      { text: '6.1: FetchSubmissions()\n6.2: RecordGrade(48/50)', x: 9.3, y: 5.9, w: 2.4, h: 0.6 }
    ];

    links.forEach((l) => {
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: l.x, y: l.y, w: l.w, h: l.h,
        fill: { color: COLORS.white },
        line: { color: COLORS.borderMuted, width: 1 }
      });
      slide.addText(l.text, {
        x: l.x + 0.05, y: l.y + 0.05, w: l.w - 0.1, h: l.h - 0.1,
        fontFace: FONTS.mono, fontSize: 7.5, color: COLORS.blueDark, align: 'center', valign: 'middle'
      });
    });
  }



  // ==========================================
  // SLIDE 17: DATABASE SCHEMA & POSTGRESQL ARCHITECTURE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '06', 'Data Architecture', 'Supabase PostgreSQL Relational Schema Models', '7 production tables with Row Level Security (RLS) policies and dynamic ownership mapping.');

    const tables = [
      {
        name: 'repositories',
        desc: 'Stores synced GitHub repositories and uploaded ZIP project manifests.',
        cols: ['id (UUID, PK)', 'name (VARCHAR)', 'owner (VARCHAR)', 'source (github | zip)', 'branch (VARCHAR)', 'primary_language (VARCHAR)', 'latest_score (INT)', 'total_loc (INT)', 'created_at (TIMESTAMP)'],
        color: C.blueBorder, fill: C.blueFill, text: C.blueDark
      },
      {
        name: 'reviews',
        desc: 'Multi-agent analysis execution runs and computed category metrics.',
        cols: ['id (VARCHAR, PK)', 'repository_id (FK)', 'branch (VARCHAR)', 'skill_level (VARCHAR)', 'overall_score (INT)', 'quality_score (INT)', 'security_score (INT)', 'runtime_seconds (FLOAT)'],
        color: C.greenBorder, fill: C.greenFill, text: C.greenDark
      },
      {
        name: 'findings',
        desc: 'Individual code defects, OWASP tags, senior explanations, and diffs.',
        cols: ['id (VARCHAR, PK)', 'review_id (FK)', 'title (VARCHAR)', 'severity (CRITICAL..LOW)', 'category (VARCHAR)', 'file_path (VARCHAR)', 'line_start (INT)', 'suggested_diff (TEXT)'],
        color: C.roseBorder, fill: C.roseFill, text: C.roseDark
      },
      {
        name: 'faculty_rosters',
        desc: 'Student cohort management, submission tracking, and assigned marks.',
        cols: ['id (VARCHAR, PK)', 'student_name (VARCHAR)', 'prn (VARCHAR)', 'roll_no (VARCHAR)', 'batch (Cohort A/B)', 'score (INT)', 'grade (VARCHAR)', 'submitted_at (TIMESTAMP)'],
        color: C.amberBorder, fill: C.amberFill, text: C.amberDark
      }
    ];

    tables.forEach((t, i) => {
      const posX = 0.6 + i * 3.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.5, w: 2.85, h: 5.2,
        fill: { color: C.white },
        line: { color: t.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
      });

      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX, y: 1.5, w: 2.85, h: 0.55,
        fill: { color: t.fill }
      });
      slide.addText(`TABLE: ${t.name}`, {
        x: posX, y: 1.5, w: 2.85, h: 0.55,
        fontFace: F.mono, fontSize: 9.5, bold: true, color: t.text, align: 'center', valign: 'middle'
      });

      slide.addText(t.desc, {
        x: posX + 0.15, y: 2.15, w: 2.55, h: 0.6,
        fontFace: F.body, fontSize: 8.5, color: C.subText, lineSpacing: 11
      });

      // Columns list
      slide.addText('ATTRIBUTES & KEYS:', {
        x: posX + 0.15, y: 2.85, w: 2.55, h: 0.25,
        fontFace: F.mono, fontSize: 8, bold: true, color: C.headerNavy
      });

      t.cols.forEach((col, ci) => {
        slide.addText(`• ${col}`, {
          x: posX + 0.15, y: 3.15 + ci * 0.25, w: 2.55, h: 0.25,
          fontFace: F.mono, fontSize: 7.5, color: C.headerNavy
        });
      });
    });
  }

  // ==========================================
  // SLIDE 18: SECURITY ANALYSIS & OWASP COMPLIANCE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '07', 'Cybersecurity Rigor', 'OWASP Top 10 Static Audit & Mitigation Examples', 'Live vulnerability detection with deterministic diff patch synthesis.');

    const vulnExamples = [
      {
        id: 'CPAI-001 • CRITICAL',
        title: 'SQL Injection in Authentication Query',
        cwe: 'OWASP A03:2021 — Injection | CWE-89',
        file: 'src/middleware/auth.ts:18-24',
        flaw: '- const query = \'SELECT * FROM users WHERE email = "\' + email + \'"\';\n- db.execute(query);',
        fix: '+ const query = \'SELECT * FROM users WHERE email = ?\';\n+ db.execute(query, [email]);',
        exp: 'Direct interpolation allows attackers to bypass authentication via \' OR 1=1 --. CodePilot replaces raw concatenation with prepared parameterized statements.'
      },
      {
        id: 'CPAI-002 • HIGH',
        title: 'Missing Resource Ownership Validation',
        cwe: 'OWASP A01:2021 — Broken Access Control | CWE-285',
        file: 'src/api/residents/[id].ts:42-47',
        flaw: '- const resident = await getResident(req.param.id);',
        fix: '+ const resident = await getResidentForSociety(req.param.id, user.societyId);',
        exp: 'Authentication proves identity but does not prove authorization. CodePilot enforces multi-tenant boundary checks so users cannot view other residents data.'
      },
      {
        id: 'CPAI-003 • MEDIUM',
        title: 'Unbounded Query Causing Resource Exhaustion',
        cwe: 'CWE-400 — Uncontrolled Resource Consumption',
        file: 'src/services/activity.ts:61-64',
        flaw: '- const logs = await db.activity.findAll();',
        fix: '+ const logs = await db.activity.findMany({ take: 50, skip: page * 50 });',
        exp: 'Unbounded queries cause database lockups and severe memory spikes. CodePilot automatically injects cursor pagination and limit bounds.'
      }
    ];

    vulnExamples.forEach((v, i) => {
      const posX = 0.6 + i * 4.1;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.5, w: 3.9, h: 5.2,
        fill: { color: C.white },
        line: { color: C.borderStrong, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
      });

      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX, y: 1.5, w: 3.9, h: 0.5,
        fill: { color: i === 0 ? C.roseFill : (i === 1 ? C.amberFill : C.blueFill) }
      });
      slide.addText(v.id, {
        x: posX + 0.15, y: 1.5, w: 3.6, h: 0.5,
        fontFace: F.mono, fontSize: 9, bold: true,
        color: i === 0 ? C.roseDark : (i === 1 ? C.amberDark : C.blueDark), valign: 'middle'
      });

      slide.addText(v.title, {
        x: posX + 0.15, y: 2.1, w: 3.6, h: 0.45,
        fontFace: F.title, fontSize: 11, bold: true, color: C.headerNavy
      });
      slide.addText(v.cwe, {
        x: posX + 0.15, y: 2.55, w: 3.6, h: 0.25,
        fontFace: F.mono, fontSize: 7.5, color: C.subText
      });

      // Vulnerable Code Box
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX + 0.15, y: 2.9, w: 3.6, h: 0.85,
        fill: { color: 'FFF1F2' },
        line: { color: 'FECDD3', width: 1 }
      });
      slide.addText(`VULNERABLE CODE:\n${v.flaw}`, {
        x: posX + 0.2, y: 2.95, w: 3.5, h: 0.75,
        fontFace: F.mono, fontSize: 7, color: '9F1239', lineSpacing: 9
      });

      // Fixed Code Box
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX + 0.15, y: 3.85, w: 3.6, h: 0.85,
        fill: { color: 'F0FDF4' },
        line: { color: 'BBF7D0', width: 1 }
      });
      slide.addText(`SUGGESTED DIFF FIX:\n${v.fix}`, {
        x: posX + 0.2, y: 3.9, w: 3.5, h: 0.75,
        fontFace: F.mono, fontSize: 7, color: '15803D', lineSpacing: 9
      });

      // Explanation Box
      slide.addText(`SENIOR ENGINEER EXPLANATION:\n${v.exp}`, {
        x: posX + 0.15, y: 4.8, w: 3.6, h: 1.7,
        fontFace: F.body, fontSize: 8, color: C.headerNavy, lineSpacing: 11
      });
    });
  }

  // ==========================================
  // SLIDE 19: HOW TO PRESENT / DEMO WALKTHROUGH SCRIPT
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '08', 'Defense Guide', 'Step-by-Step Presentation Script for Project Defense', 'A proven 5-step narrative structure to present CodePilot AI seamlessly to evaluators.');

    const steps = [
      {
        num: 'STEP 1',
        time: '0:00 - 1:30',
        title: 'Problem & Dual Authentication Gateway',
        script: 'Open http://localhost:3000/auth/login. Show the dual portal switcher: "Respected evaluators, notice that student login is powered strictly by GitHub OAuth2, importing repos dynamically, while faculty login is gated by institutional email to protect cohort records."',
        color: C.blueBorder, fill: C.blueFill, text: C.blueDark
      },
      {
        num: 'STEP 2',
        time: '1:30 - 3:00',
        title: 'Repository Reflection & Real Ingestion',
        script: 'Navigate to /repositories or /review/new. Click "Sync GitHub" or upload a ZIP file. Point out the live repository reflection: "CodePilot does not use hardcoded data. It reads real repositories, filters out node_modules/.git to prevent token waste, and analyzes file AST."',
        color: C.amberBorder, fill: C.amberFill, text: C.amberDark
      },
      {
        num: 'STEP 3',
        time: '3:00 - 4:30',
        title: 'Multi-Agent Code Review & Senior Fixes',
        script: 'Click "Start Review" on Society_Sync. Watch the 4 agents run: "Notice the P95 SLA of 42s. The review displays 92/100 Health Score, 82% OWASP Security, and flags CPAI-001 SQL Injection with exact code diffs and senior engineer explanations."',
        color: C.roseBorder, fill: C.roseFill, text: C.roseDark
      },
      {
        num: 'STEP 4',
        time: '4:30 - 6:00',
        title: 'Terminal AI & Viva Interview Simulator',
        script: 'Click "Ask AI about finding CPAI-001" and open /interview/repo-1. Explain: "Students don\'t just get errors; they practice answering technical viva questions about their architecture before faculty grading, boosting placement and defense readiness."',
        color: C.purpleBorder, fill: C.purpleFill, text: C.purpleDark
      },
      {
        num: 'STEP 5',
        time: '6:00 - 7:30',
        title: 'Faculty Portal Oversight & PDF Audit',
        script: 'Switch to /faculty and click "Export Report". Demonstrate: "Faculty see class-wide defect analytics, filter students by batch (Cohort A/B), assign grades (e.g. 48/50), and generate printable IEEE standard audit certificates."',
        color: C.greenBorder, fill: C.greenFill, text: C.greenDark
      }
    ];

    steps.forEach((st, i) => {
      const posY = 1.5 + i * 1.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.6, y: posY, w: 12.13, h: 0.95,
        fill: { color: C.white },
        line: { color: st.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.25 }
      });

      // Left Pill
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0.6, y: posY, w: 1.8, h: 0.95,
        fill: { color: st.fill }
      });
      slide.addText(`${st.num}\n${st.time}`, {
        x: 0.6, y: posY + 0.18, w: 1.8, h: 0.6,
        fontFace: F.mono, fontSize: 9.5, bold: true, color: st.text, align: 'center'
      });

      // Title & Script
      slide.addText(st.title, {
        x: 2.6, y: posY + 0.08, w: 9.9, h: 0.3,
        fontFace: F.title, fontSize: 11, bold: true, color: C.headerNavy
      });
      slide.addText(st.script, {
        x: 2.6, y: posY + 0.38, w: 9.9, h: 0.52,
        fontFace: F.body, fontSize: 8.5, color: C.subText, lineSpacing: 11
      });
    });
  }

  // ==========================================
  // SLIDE 20: FUTURE SCOPE, CONCLUSION & DEFENSE Q&A (Dark Hero)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.darkCanvas };

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0, y: 0, w: 13.33, h: 0.15,
      fill: { color: '3B82F6' }
    });

    slide.addText('PROJECT DEFENSE CONCLUSION & ROADMAP', {
      x: 0.8, y: 0.8, w: 11.0, h: 0.35,
      fontFace: F.mono, fontSize: 11, bold: true, color: '38BDF8'
    });

    slide.addText('Summary of Engineering Achievements', {
      x: 0.8, y: 1.15, w: 11.0, h: 0.6,
      fontFace: F.title, fontSize: 26, bold: true, color: 'FFFFFF'
    });

    // 3 Highlight Boxes
    const highlights = [
      {
        title: 'Production-Ready Engineering',
        items: ['Clean Next.js 14.2 App Router with TypeScript strict mode', 'PKCE verifier cookie jar eliminating OAuth race conditions', 'Zero hardcoded personal/institutional data throughout codebase', 'Deterministic OWASP static pattern matching + patch synthesis']
      },
      {
        title: 'Academic & Institutional Impact',
        items: ['Reduced faculty grading overhead by an estimated 75%', 'Provides students with real-time, constructive senior engineer code fixes', 'Prevents vulnerable code from graduating into production software', 'Standardizes software lab evaluation across university cohorts']
      },
      {
        title: 'Future Scope & Enhancements',
        items: ['Automated GitHub Pull Request Bot (auto-comments AST findings)', 'Integration with Docker/Kubernetes container scanning', 'Support for C++ and Rust embedded systems AST parsing', 'Fine-tuned institutional LLM models deployed on private campus servers']
      }
    ];

    highlights.forEach((h, i) => {
      const posX = 0.8 + i * 3.95;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 2.0, w: 3.75, h: 3.8,
        fill: { color: C.darkCard },
        line: { color: C.cardBorder, width: 1 }
      });

      slide.addText(h.title, {
        x: posX + 0.2, y: 2.2, w: 3.35, h: 0.45,
        fontFace: F.title, fontSize: 13, bold: true, color: 'FFFFFF'
      });

      h.items.forEach((item, ii) => {
        slide.addText(`✓  ${item}`, {
          x: posX + 0.2, y: 2.8 + ii * 0.7, w: 3.35, h: 0.65,
          fontFace: F.body, fontSize: 9.5, color: 'CBD5E1', lineSpacing: 13
        });
      });
    });

    // Bottom Defense Q&A Callout
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 6.0, w: 11.65, h: 0.9,
      fill: { color: '162238' },
      line: { color: '38BDF8', width: 1 }
    });
    slide.addText('🎓 Open for Technical Defense & Questions\nThank you, Respected Evaluators and Faculty Members.', {
      x: 1.0, y: 6.05, w: 11.25, h: 0.8,
      fontFace: F.title, fontSize: 13, bold: true, color: 'FFFFFF', align: 'center'
    });
  }

  const masterPath = path.resolve('c:/CodePilotAI/CodePilot_AI_Master_Project_Presentation.pptx');
  const artifactMasterPath = path.resolve('C:/Users/PC/.gemini/antigravity/brain/30c4d184-1794-44e5-858e-0bb91893d91c/CodePilot_AI_Master_Project_Presentation.pptx');

  console.log(`Saving Master Presentation to ${masterPath}...`);
  await pptx.writeFile({ fileName: masterPath });

  console.log(`Copying Master Presentation to ${artifactMasterPath}...`);
  fs.copyFileSync(masterPath, artifactMasterPath);

  console.log('🎉 Master Project Presentation generated successfully!');
}

generateMasterPresentation().catch((err) => {
  console.error('Master Presentation Generation Error:', err);
  process.exit(1);
});
