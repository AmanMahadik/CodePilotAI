const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

async function generateUltimateMasterPresentation() {
  console.log('🚀 Generating CodePilot AI Ultimate Master Project Defense Presentation (Complete with ALL UML Diagrams)...');
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'CodePilot AI — Complete Project Defense & UML Architecture Portfolio';
  pptx.subject = 'B.Tech Capstone Project Defense & Software Engineering Specification';
  pptx.author = 'Aman Mahadik, Sairaj Patil, Yogesh Gore';
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
    slateText: '334155',
    accentCyan: '38BDF8',
    accentGreen: '4ADE80'
  };

  const F = {
    title: 'Segoe UI',
    body: 'Segoe UI',
    mono: 'Consolas'
  };

  const logoPath = path.resolve(__dirname, '../public/logo.png');
  const hasLogo = fs.existsSync(logoPath);

  const umlBase = path.resolve(__dirname, '../UML_Practicals');

  // Paths to ALL 11 UML Diagram PNGs
  const UML_DIAGRAMS = {
    useCase: path.join(umlBase, 'Assignment_2_Use_Case_Diagram/Assignment_2_Use_Case_Diagram.png'),
    classDiag: path.join(umlBase, 'CodePilot_AI_Class_Diagram.png'),
    packageDiag: path.join(umlBase, 'Assignment_4_Architecture_and_Design/Assignment_4_Package_Diagram.png'),
    deploymentDiag: path.join(umlBase, 'Assignment_4_Architecture_and_Design/Assignment_4_Deployment_Diagram.png'),
    componentDiag: path.join(umlBase, 'Assignment_4_Architecture_and_Design/Assignment_4_Component_Diagram.png'),
    compositeDiag: path.join(umlBase, 'Assignment_4_Architecture_and_Design/Assignment_4_Composite_Structure_Diagram.png'),
    stateMachine: path.join(umlBase, 'CodePilot_AI_State_Machine_Diagram.png'),
    activityDiag: path.join(umlBase, 'Assignment_5_Behavioral_Design/Assignment_5_Activity_Diagram.png'),
    sequenceDiag: path.join(umlBase, 'Assignment_6_Interaction_Design/Assignment_6_Sequence_Diagram.png'),
    commDiag: path.join(umlBase, 'Assignment_6_Interaction_Design/Assignment_6_Communication_Diagram.png'),
    overviewDiag: path.join(umlBase, 'Assignment_7_Interaction_Overview/Assignment_7_Interaction_Overview_Diagram.png'),
  };

  // Helper: Standard Slide Header
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
    slide.addText('IEEE / ISO 19505', {
      x: 10.4, y: 0.47, w: 2.2, h: 0.24,
      fontFace: F.mono, fontSize: 8, bold: true, color: C.slateText, align: 'center', valign: 'middle'
    });
  }

  // Helper for Diagram Slides (Image Left, Technical Specs Right)
  function addDiagramSlide(slide, num, tag, title, subtitle, imagePath, specTitle, specBadgeColor, specBadgeFill, specItems, standardTag) {
    addHeader(slide, num, tag, title, subtitle);

    // Left Box: High-Res Diagram Canvas
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y: 1.4, w: 7.4, h: 5.6,
      fill: { color: C.white },
      line: { color: specBadgeColor, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
    });

    if (fs.existsSync(imagePath)) {
      slide.addImage({
        path: imagePath,
        x: 0.6, y: 1.5, w: 7.2, h: 5.4,
        sizing: { type: 'contain', w: 7.2, h: 5.4 }
      });
    } else {
      slide.addText(`Diagram Image Missing:\n${path.basename(imagePath)}`, {
        x: 1.0, y: 3.5, w: 6.4, h: 1.0,
        fontFace: F.title, fontSize: 14, color: C.subText, align: 'center'
      });
    }

    // Right Box: Technical Specifications Card
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.1, y: 1.4, w: 4.73, h: 5.6,
      fill: { color: C.white },
      line: { color: C.borderStrong, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
    });

    // Badge on Right
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.3, y: 1.58, w: 4.33, h: 0.35,
      fill: { color: specBadgeFill },
      line: { color: specBadgeColor, width: 1 }
    });
    slide.addText(specTitle.toUpperCase(), {
      x: 8.3, y: 1.58, w: 4.33, h: 0.35,
      fontFace: F.mono, fontSize: 8.5, bold: true, color: specBadgeColor, align: 'center', valign: 'middle'
    });

    // Bullet Items
    specItems.forEach((item, idx) => {
      const py = 2.05 + idx * 0.78;
      slide.addText(`•  ${item.name}`, {
        x: 8.3, y: py, w: 4.33, h: 0.28,
        fontFace: F.mono, fontSize: 9.5, bold: true, color: C.headerNavy
      });
      slide.addText(item.desc, {
        x: 8.5, y: py + 0.24, w: 4.13, h: 0.5,
        fontFace: F.body, fontSize: 8.3, color: C.slateText, lineSpacing: 11
      });
    });

    // Bottom Compliance Pill
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.3, y: 6.45, w: 4.33, h: 0.35,
      fill: { color: C.slateFill },
      line: { color: C.borderMuted, width: 1 }
    });
    slide.addText(`STANDARD: ${standardTag || 'UML 2.5 Specification Compliant'}`, {
      x: 8.3, y: 6.45, w: 4.33, h: 0.35,
      fontFace: F.mono, fontSize: 8, color: C.subText, align: 'center', valign: 'middle'
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
      slide.addImage({ path: logoPath, x: 1.0, y: 0.85, w: 1.5, h: 1.5 });
    }

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 2.7, y: 0.85, w: 5.5, h: 0.32,
      fill: { color: '162238' },
      line: { color: '38BDF8', width: 1 }
    });
    slide.addText('FINAL YEAR B.TECH CAPSTONE PROJECT DEFENSE', {
      x: 2.7, y: 0.85, w: 5.5, h: 0.32,
      fontFace: F.mono, fontSize: 9, bold: true, color: '38BDF8', align: 'center', valign: 'middle'
    });

    slide.addText('CodePilot AI', {
      x: 2.65, y: 1.25, w: 9.5, h: 0.85,
      fontFace: F.title, fontSize: 38, bold: true, color: 'FFFFFF'
    });

    slide.addText('Autonomous AI Software Engineering Assistant with Multi-Agent AST Auditing', {
      x: 2.7, y: 2.1, w: 9.8, h: 0.35,
      fontFace: F.title, fontSize: 15, color: '94A3B8'
    });

    slide.addText('A production software engineering platform featuring dual student and faculty portals, GitHub OAuth repository reflection, AST-level static security analysis (OWASP Top 10), Senior Engineer pedagogical diff patches, complete UML 2.5 modeling, and institutional defect analytics.', {
      x: 2.7, y: 2.5, w: 9.8, h: 0.7,
      fontFace: F.body, fontSize: 10, color: 'CBD5E1', lineSpacing: 14
    });

    // TEAM MEMBERS HERO CARD
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0, y: 3.35, w: 11.33, h: 1.85,
      fill: { color: C.darkCard },
      line: { color: '38BDF8', width: 1.5 },
      shadow: { type: 'outer', color: '000000', blur: 8, offset: 3, angle: 90, opacity: 0.5 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.2, y: 3.5, w: 2.8, h: 0.28,
      fill: { color: '162238' },
      line: { color: '38BDF8', width: 1 }
    });
    slide.addText('PROJECT TEAM MEMBERS', {
      x: 1.2, y: 3.5, w: 2.8, h: 0.28,
      fontFace: F.mono, fontSize: 9, bold: true, color: '38BDF8', align: 'center', valign: 'middle'
    });

    const members = [
      {
        role: 'TEAM LEADER & SYSTEM ARCHITECT',
        name: 'Aman Mahadik',
        prn: 'PRN: 202502100006',
        desc: 'Architecture, Multi-Agent Pipeline & Auth Flow',
        color: '38BDF8',
        border: '3B82F6'
      },
      {
        role: 'BACKEND & ML/AST SECURITY ENGINE',
        name: 'Sairaj Patil',
        prn: 'PRN: 202502100009',
        desc: 'AST Parsing, OWASP Top 10 & PostgreSQL Schema',
        color: '4ADE80',
        border: '22C55E'
      },
      {
        role: 'FRONTEND ARCHITECT & UX SPECIALIST',
        name: 'Yogesh Gore',
        prn: 'PRN: 202502100001',
        desc: 'Next.js 14 App Router, Diff Viewer & PDF Export',
        color: 'F59E0B',
        border: 'D97706'
      }
    ];

    members.forEach((m, idx) => {
      const posX = 1.3 + idx * 3.7;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 3.9, w: 3.45, h: 1.15,
        fill: { color: '0B111E' },
        line: { color: m.border, width: 1.2 }
      });

      slide.addText(m.role, {
        x: posX + 0.15, y: 4.0, w: 3.15, h: 0.22,
        fontFace: F.mono, fontSize: 7.5, bold: true, color: m.color
      });

      slide.addText(m.name, {
        x: posX + 0.15, y: 4.22, w: 3.15, h: 0.32,
        fontFace: F.title, fontSize: 13, bold: true, color: 'FFFFFF'
      });

      slide.addText(m.prn, {
        x: posX + 0.15, y: 4.54, w: 3.15, h: 0.22,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: '94A3B8'
      });

      slide.addText(m.desc, {
        x: posX + 0.15, y: 4.76, w: 3.15, h: 0.24,
        fontFace: F.body, fontSize: 7.8, color: 'CBD5E1'
      });
    });

    // 4 Key Capability Badges
    const badges = [
      { icon: '01', title: 'DUAL PORTALS', sub: 'Student + Faculty Governance' },
      { icon: '02', title: '11 UML MODELS', sub: 'Complete UML 2.5 Suite' },
      { icon: '03', title: '4 AI AGENTS', sub: 'Repo, Quality, Security, Docs' },
      { icon: '04', title: 'OWASP AUDIT', sub: 'Deterministic Static Scan' }
    ];

    badges.forEach((b, i) => {
      const bx = 1.0 + i * 2.9;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: bx, y: 5.35, w: 2.75, h: 1.1,
        fill: { color: '0F1626' },
        line: { color: '1E293B', width: 1 }
      });
      slide.addText(b.icon, {
        x: bx + 0.15, y: 5.45, w: 0.45, h: 0.35,
        fontFace: F.mono, fontSize: 12, bold: true, color: '38BDF8'
      });
      slide.addText(b.title, {
        x: bx + 0.6, y: 5.48, w: 2.0, h: 0.28,
        fontFace: F.title, fontSize: 10.5, bold: true, color: 'FFFFFF'
      });
      slide.addText(b.sub, {
        x: bx + 0.6, y: 5.76, w: 2.0, h: 0.55,
        fontFace: F.body, fontSize: 8.5, color: '94A3B8'
      });
    });

    slide.addText('Department of Computer Science & Engineering • Academic Year 2025–2026 • Production v1.0.0', {
      x: 1.0, y: 6.8, w: 11.33, h: 0.3,
      fontFace: F.mono, fontSize: 8.5, color: '64748B', align: 'center'
    });
  }

  // ==========================================
  // SLIDE 2: TEAM PROFILES & WORK DIVISION
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '01', 'Team & Governance', 'Project Team Structure & Technical Ownership Matrix', 'Clear division of responsibilities, system architecture components, and module deliveries.');

    const teamCards = [
      {
        name: 'Aman Mahadik',
        role: 'Team Leader & Full-Stack Architect',
        prn: 'PRN: 202502100006',
        tagColor: C.blueDark, tagFill: C.blueFill, borderColor: C.blueBorder,
        highlights: [
          'End-to-End System Design & Architecture Orchestration',
          'Multi-Agent Pipeline Dispatcher & SLA Concurrency Engine',
          'Supabase Auth (GitHub OAuth, Google OAuth, Session Lifecycle)',
          'Faculty Classroom Evaluation Queue & Roster Management',
          'Integration Testing, Production Deployment & Technical Defense Lead'
        ]
      },
      {
        name: 'Sairaj Patil',
        role: 'Backend Architect & ML/AST Security Engine',
        prn: 'PRN: 202502100009',
        tagColor: C.greenDark, tagFill: C.greenFill, borderColor: C.greenBorder,
        highlights: [
          'AST Static Analysis Engine & Language Distribution Classifier',
          'OWASP Top 10 Vulnerability Detection (SQL Injection, Broken Auth)',
          'Heuristic Regex Secrets Scanner (AWS Keys, Tokens, JWTs)',
          'PostgreSQL Relational Schema Design & Row Level Security (RLS)',
          'Repository Grounded RAG Context Retrieval & Terminal AI Engine'
        ]
      },
      {
        name: 'Yogesh Gore',
        role: 'Frontend Architect & UI/UX Design Specialist',
        prn: 'PRN: 202502100001',
        tagColor: C.amberDark, tagFill: C.amberFill, borderColor: C.amberBorder,
        highlights: [
          'Next.js 14 App Router UI with Glassmorphic Design System',
          'Client-side Ingestion Engine & JSZip Archive Extractor',
          'Interactive Side-by-Side Unified Code Diff Viewer',
          'Institutional Certified PDF Report Generator (jsPDF + html2canvas)',
          'Responsive Cross-Device Layouts, Error Boundaries & Visual UX'
        ]
      }
    ];

    teamCards.forEach((tc, idx) => {
      const posX = 0.6 + idx * 4.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.5, w: 3.85, h: 5.4,
        fill: { color: C.white },
        line: { color: tc.borderColor, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX + 0.2, y: 1.7, w: 3.45, h: 0.35,
        fill: { color: tc.tagFill },
        line: { color: tc.borderColor, width: 1 }
      });
      slide.addText(tc.role.toUpperCase(), {
        x: posX + 0.2, y: 1.7, w: 3.45, h: 0.35,
        fontFace: F.mono, fontSize: 8, bold: true, color: tc.tagColor, align: 'center', valign: 'middle'
      });

      slide.addText(tc.name, {
        x: posX + 0.2, y: 2.15, w: 3.45, h: 0.45,
        fontFace: F.title, fontSize: 18, bold: true, color: C.headerNavy, align: 'center'
      });

      slide.addText(tc.prn, {
        x: posX + 0.2, y: 2.6, w: 3.45, h: 0.3,
        fontFace: F.mono, fontSize: 10, bold: true, color: C.subText, align: 'center'
      });

      slide.addShape(pptx.shapes.LINE, {
        x: posX + 0.4, y: 2.95, w: 3.05, h: 0,
        line: { color: C.borderMuted, width: 1 }
      });

      slide.addText('Core Engineering Responsibilities:', {
        x: posX + 0.2, y: 3.1, w: 3.45, h: 0.3,
        fontFace: F.title, fontSize: 9.5, bold: true, color: C.headerNavy
      });

      tc.highlights.forEach((hl, i) => {
        slide.addText(`•  ${hl}`, {
          x: posX + 0.2, y: 3.45 + i * 0.65, w: 3.45, h: 0.6,
          fontFace: F.body, fontSize: 9, color: C.slateText, lineSpacing: 12
        });
      });
    });
  }

  // ==========================================
  // SLIDE 3: EXECUTIVE SUMMARY & VISION
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '02', 'Strategic Vision', 'Executive Summary & Project Value Proposition', 'Bridging the critical gap between academic coding submissions and industry software standards.');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.5, w: 6.0, h: 5.4,
      fill: { color: C.white },
      line: { color: C.blueBorder, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.7, w: 5.6, h: 0.38,
      fill: { color: C.blueFill },
      line: { color: C.blueBorder, width: 1 }
    });
    slide.addText('CORE PRODUCT VISION & MISSION', {
      x: 0.8, y: 1.7, w: 5.6, h: 0.38,
      fontFace: F.mono, fontSize: 9, bold: true, color: C.blueDark, align: 'center', valign: 'middle'
    });

    slide.addText('What is CodePilot AI?', {
      x: 0.8, y: 2.2, w: 5.6, h: 0.4,
      fontFace: F.title, fontSize: 16, bold: true, color: C.headerNavy
    });

    slide.addText('CodePilot AI is an autonomous, multi-agent AI software engineering assistant engineered to mentor students and assist faculty evaluators.\n\nWhile conventional linters produce cryptic compiler warnings and general LLMs provide generic chatbot advice, CodePilot AI reviews student repositories exactly the way a Senior Staff Engineer would:\n\n• Provides constructive "Principle Explanations" teaching the architectural "Why".\n• Generates deterministic Before-vs-After code diffs for instant remediation.\n• Maps security vulnerabilities directly to OWASP Top 10 standards.\n• Delivers a repository-grounded RAG terminal for viva and interview preparation.\n• Generates downloadable certified institutional PDF reports.', {
      x: 0.8, y: 2.65, w: 5.6, h: 4.0,
      fontFace: F.body, fontSize: 10, color: C.slateText, lineSpacing: 15
    });

    const stats = [
      { num: '< 60s', label: 'Average Review SLA', desc: 'Full multi-agent AST review completed in ~40 seconds', color: C.greenText, fill: C.greenFill, border: C.greenBorder },
      { num: '4 Agents', label: 'Specialized Multi-Agent Swarm', desc: 'Repo Ingestion, Code Quality, OWASP Security & Docs', color: C.blueText, fill: C.blueFill, border: C.blueBorder },
      { num: '5 Categories', label: 'OWASP Top 10 Static Coverage', desc: 'A01 Access Control, A03 Injection, A05 Config, A07 Auth, Secrets', color: C.roseText, fill: C.roseFill, border: C.roseBorder },
      { num: '75%', label: 'Reduction in Faculty Grading Overhead', desc: 'Automated defect rubrics, institutional roster & share links', color: C.purpleText, fill: C.purpleFill, border: C.purpleBorder }
    ];

    stats.forEach((s, i) => {
      const posY = 1.5 + i * 1.38;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 6.8, y: posY, w: 5.9, h: 1.25,
        fill: { color: s.fill },
        line: { color: s.border, width: 1.2 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.2 }
      });

      slide.addText(s.num, {
        x: 7.0, y: posY + 0.15, w: 2.0, h: 0.5,
        fontFace: F.title, fontSize: 24, bold: true, color: s.color
      });

      slide.addText(s.label, {
        x: 9.1, y: posY + 0.18, w: 3.4, h: 0.35,
        fontFace: F.title, fontSize: 11, bold: true, color: C.headerNavy
      });

      slide.addText(s.desc, {
        x: 9.1, y: posY + 0.52, w: 3.4, h: 0.55,
        fontFace: F.body, fontSize: 8.5, color: C.subText, lineSpacing: 11
      });
    });
  }

  // ==========================================
  // SLIDE 4: PROBLEM STATEMENT & MOTIVATION
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '03', 'Context & Motivation', 'Problem Statement: The Academic Code Evaluation Crisis', 'Why traditional manual grading and primitive linters fail modern software engineering education.');

    const challenges = [
      {
        num: '01',
        title: 'Overwhelming Faculty Review Overhead',
        desc: 'Faculty oversee batches of 60–120+ students. Manually reviewing multi-file repositories, verifying git authenticity, and grading architectural cleanliness takes 30-45 minutes per student, resulting in delayed feedback and superficial grading.',
        impact: 'Students submit poorly-structured code without receiving actionable feedback.',
        color: C.roseBorder, fill: C.roseFill, badgeColor: C.roseDark
      },
      {
        num: '02',
        title: 'Cryptic Linters Without Pedagogical Context',
        desc: 'Traditional CLI tools (ESLint, SonarQube) generate cold error codes without explaining the engineering "Why". Students mechanically suppress warnings or blindly copy quick-fixes without understanding fundamental design principles.',
        impact: 'Persistent recurrence of bad architectural patterns in subsequent projects.',
        color: C.amberBorder, fill: C.amberFill, badgeColor: C.amberDark
      },
      {
        num: '03',
        title: 'Undetected OWASP Security Vulnerabilities',
        desc: 'University lab assignments routinely overlook real-world application security. Critical flaws like SQL Injection (A03), Broken Access Control (A01), and hardcoded production API tokens slip into submitted code completely unnoticed.',
        impact: 'Graduating engineers lack foundational secure-by-default coding standards.',
        color: C.purpleBorder, fill: C.purpleFill, badgeColor: C.purpleDark
      },
      {
        num: '04',
        title: 'Zero Viva & Technical Defense Preparation',
        desc: 'Students struggle in oral viva project defenses and corporate technical interviews because they cannot explain file relationships, justify architectural trade-offs, or articulate why specific patterns were selected.',
        impact: 'Weak project defense confidence and poor technical placement outcomes.',
        color: C.blueBorder, fill: C.blueFill, badgeColor: C.blueDark
      }
    ];

    challenges.forEach((ch, i) => {
      const posX = 0.6 + i * 3.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.5, w: 2.85, h: 5.4,
        fill: { color: C.white },
        line: { color: ch.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
      });

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
        x: posX + 0.15, y: 3.0, w: 2.55, h: 2.0,
        fontFace: F.body, fontSize: 9, color: C.slateText, lineSpacing: 13
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX + 0.15, y: 5.2, w: 2.55, h: 1.5,
        fill: { color: ch.fill },
        line: { color: ch.color, width: 1 }
      });
      slide.addText('ACADEMIC IMPACT:', {
        x: posX + 0.25, y: 5.28, w: 2.35, h: 0.25,
        fontFace: F.mono, fontSize: 7.5, bold: true, color: ch.badgeColor
      });
      slide.addText(ch.impact, {
        x: posX + 0.25, y: 5.55, w: 2.35, h: 1.05,
        fontFace: F.body, fontSize: 8.5, color: C.headerNavy, lineSpacing: 11
      });
    });
  }

  // ==========================================
  // SLIDE 5: PROPOSED SOLUTION & CORE ECOSYSTEM
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '04', 'System Solution', 'The Proposed Solution: CodePilot AI Platform', 'An integrated autonomous ecosystem providing instant feedback, security auditing, and institutional grading.');

    const pillars = [
      {
        tag: 'PILLAR 01', title: 'Multi-Agent Ingestion Engine',
        desc: 'Accepts direct GitHub repository URLs or client-side ZIP archives. Employs an intelligent 4-agent concurrent pipeline analyzing AST syntax trees, directory hygiene, and dependency health in <40 seconds.',
        features: ['GitHub OAuth & ZIP extraction', 'Automated language distribution', 'Exclusion rules (node_modules, .git)', 'AST parsing and tree indexing'],
        color: C.blueBorder, fill: C.blueFill, text: C.blueText
      },
      {
        tag: 'PILLAR 02', title: 'Senior Staff Engineer Feedback',
        desc: 'Goes beyond linter errors by delivering pedagogical "Principle Explanations" that explain why an anti-pattern matters, paired with side-by-side Before vs. After code diffs that students can learn from and apply.',
        features: ['Plain-language design principles', 'Interactive unified code diffs', 'Skill-level calibration (Beginner/Adv)', 'SOLID & DRY pattern enforcement'],
        color: C.greenBorder, fill: C.greenFill, text: C.greenText
      },
      {
        tag: 'PILLAR 03', title: 'Deterministic OWASP Security Scan',
        desc: 'Automates security verification mapped to OWASP Top 10 benchmarks. Flags SQL Injection (A03), Broken Access Control (A01), Security Misconfiguration (A05), and hardcoded credential leaks.',
        features: ['OWASP Top 10 category mapping', 'Regex heuristics secrets scanner', 'Zero-leakage policy enforcement', 'Concrete patch recommendations'],
        color: C.roseBorder, fill: C.roseFill, text: C.roseText
      },
      {
        tag: 'PILLAR 04', title: 'Terminal AI & Faculty Governance',
        desc: 'Empowers students with a repository-grounded RAG terminal for code Q&A and technical viva defense preparation, while faculty evaluate cohorts via unified rosters and certified PDF exports.',
        features: ['RAG chat with line-number citations', 'Mock technical interview simulator', 'Institutional roster & grading queue', 'Certified institutional PDF export'],
        color: C.purpleBorder, fill: C.purpleFill, text: C.purpleText
      }
    ];

    pillars.forEach((p, idx) => {
      const posX = 0.6 + idx * 3.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.5, w: 2.85, h: 5.4,
        fill: { color: C.white },
        line: { color: p.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX + 0.15, y: 1.65, w: 2.55, h: 0.35,
        fill: { color: p.fill },
        line: { color: p.color, width: 1 }
      });
      slide.addText(p.tag, {
        x: posX + 0.15, y: 1.65, w: 2.55, h: 0.35,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: p.text, align: 'center', valign: 'middle'
      });

      slide.addText(p.title, {
        x: posX + 0.15, y: 2.1, w: 2.55, h: 0.65,
        fontFace: F.title, fontSize: 12, bold: true, color: C.headerNavy
      });

      slide.addText(p.desc, {
        x: posX + 0.15, y: 2.8, w: 2.55, h: 1.8,
        fontFace: F.body, fontSize: 8.8, color: C.slateText, lineSpacing: 12.5
      });

      slide.addShape(pptx.shapes.LINE, {
        x: posX + 0.25, y: 4.7, w: 2.35, h: 0,
        line: { color: C.borderMuted, width: 1 }
      });

      slide.addText('KEY CAPABILITIES:', {
        x: posX + 0.15, y: 4.8, w: 2.55, h: 0.25,
        fontFace: F.mono, fontSize: 7.5, bold: true, color: p.text
      });

      p.features.forEach((feat, fi) => {
        slide.addText(`✓  ${feat}`, {
          x: posX + 0.15, y: 5.08 + fi * 0.4, w: 2.55, h: 0.35,
          fontFace: F.body, fontSize: 8.2, color: C.headerNavy
        });
      });
    });
  }

  // ==========================================
  // SLIDE 6: DUAL USER PERSONAS & ROLE WORKFLOWS
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '05', 'User Experience', 'Dual-Role Architecture: Student vs. Faculty Portals', 'Strict segregation of authentication paradigms, user experiences, data models, and access privileges.');

    // Student Card (Left)
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.5, w: 5.9, h: 5.4,
      fill: { color: C.white },
      line: { color: C.blueBorder, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.68, w: 5.5, h: 0.38,
      fill: { color: C.blueFill },
      line: { color: C.blueBorder, width: 1 }
    });
    slide.addText('STUDENT DEVELOPER PERSONA & WORKFLOW', {
      x: 0.8, y: 1.68, w: 5.5, h: 0.38,
      fontFace: F.mono, fontSize: 9.5, bold: true, color: C.blueDark, align: 'center', valign: 'middle'
    });

    const studentSteps = [
      { step: '01', title: 'Seamless GitHub OAuth Login', desc: 'Authenticates via GitHub (`read:user repo`), pulling all public/private repositories into user context.' },
      { step: '02', title: 'Flexible Code Import & Exclusions', desc: 'Syncs live GitHub repositories or uploads local ZIP project archives with custom exclusion rules.' },
      { step: '03', title: 'Configurable Review Calibration', desc: 'Sets skill level (Beginner / Intermediate / Advanced) and triggers the 4-agent parallel analysis pipeline.' },
      { step: '04', title: 'Actionable Finding Exploration', desc: 'Inspects severity-ranked findings, reads Senior explanations, and views side-by-side code diffs.' },
      { step: '05', title: 'Terminal AI & Viva Preparation', desc: 'Uses RAG-grounded AI chat with exact line citations to practice technical viva defense questions.' }
    ];

    studentSteps.forEach((st, i) => {
      const py = 2.2 + i * 0.9;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.85, y: py, w: 0.55, h: 0.55,
        fill: { color: C.blueFill },
        line: { color: C.blueBorder, width: 1 }
      });
      slide.addText(st.step, {
        x: 0.85, y: py, w: 0.55, h: 0.55,
        fontFace: F.mono, fontSize: 10, bold: true, color: C.blueDark, align: 'center', valign: 'middle'
      });

      slide.addText(st.title, {
        x: 1.5, y: py, w: 4.8, h: 0.3,
        fontFace: F.title, fontSize: 11, bold: true, color: C.headerNavy
      });
      slide.addText(st.desc, {
        x: 1.5, y: py + 0.28, w: 4.8, h: 0.5,
        fontFace: F.body, fontSize: 8.5, color: C.slateText, lineSpacing: 11
      });
    });

    // Faculty Card (Right)
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.5, w: 5.9, h: 5.4,
      fill: { color: C.white },
      line: { color: C.greenBorder, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.0, y: 1.68, w: 5.5, h: 0.38,
      fill: { color: C.greenFill },
      line: { color: C.greenBorder, width: 1 }
    });
    slide.addText('FACULTY EVALUATOR PERSONA & WORKFLOW', {
      x: 7.0, y: 1.68, w: 5.5, h: 0.38,
      fontFace: F.mono, fontSize: 9.5, bold: true, color: C.greenDark, align: 'center', valign: 'middle'
    });

    const facultySteps = [
      { step: '01', title: 'Institutional Email Authentication', desc: 'Secure email/password or institutional SSO login routing directly to the Faculty Governance Dashboard.' },
      { step: '02', title: 'Unified Student Submission Queue', desc: 'Inspects all student project submissions across batches, sorted by health scores, critical defects, and submission dates.' },
      { step: '03', title: 'Granular Defect & Security Audit', desc: 'Reviews multi-agent findings, OWASP vulnerabilities, language breakdowns, and auto-generated README health.' },
      { step: '04', title: 'Rubric-Based Grading & Feedback', desc: 'Assigns letter grades (A+, A, B, Needs Revision), records formal remarks, and syncs status instantly.' },
      { step: '05', title: 'Certified Institutional PDF Export', desc: 'Downloads standardized, tamper-evident PDF evaluation certificates with institutional headers and signature blocks.' }
    ];

    facultySteps.forEach((ft, i) => {
      const py = 2.2 + i * 0.9;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 7.05, y: py, w: 0.55, h: 0.55,
        fill: { color: C.greenFill },
        line: { color: C.greenBorder, width: 1 }
      });
      slide.addText(ft.step, {
        x: 7.05, y: py, w: 0.55, h: 0.55,
        fontFace: F.mono, fontSize: 10, bold: true, color: C.greenDark, align: 'center', valign: 'middle'
      });

      slide.addText(ft.title, {
        x: 7.7, y: py, w: 4.8, h: 0.3,
        fontFace: F.title, fontSize: 11, bold: true, color: C.headerNavy
      });
      slide.addText(ft.desc, {
        x: 7.7, y: py + 0.28, w: 4.8, h: 0.5,
        fontFace: F.body, fontSize: 8.5, color: C.slateText, lineSpacing: 11
      });
    });
  }

  // ==========================================
  // SLIDE 7: SYSTEM ARCHITECTURE & TECH STACK
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '06', 'System Architecture', 'Modern Cloud Architecture & Technology Stack', 'Layered micro-architecture designed for sub-second responsiveness, security, and scalability.');

    const layers = [
      {
        tag: 'TIER 1: PRESENTATION LAYER',
        tech: 'Next.js 14 App Router, React 18, Tailwind CSS, Lucide Icons',
        desc: 'Server-side rendered (SSR) React components with client hydration. Glassmorphism dark/light visual theme with zero page refresh transitions.',
        color: C.blueBorder, fill: C.blueFill, text: C.blueText
      },
      {
        tag: 'TIER 2: SECURITY & AUTHENTICATION',
        tech: 'Supabase Auth, GitHub OAuth Provider, PKCE Protocol, Signed JWTs',
        desc: 'Role-based access control (RBAC). Session management via secure HTTP cookies and local storage tokens. Automatic profile creation triggers in PostgreSQL.',
        color: C.greenBorder, fill: C.greenFill, text: C.greenText
      },
      {
        tag: 'TIER 3: CORE INTELLIGENCE & INGESTION',
        tech: 'AST Parser, JSZip Extractor, OWASP Scanner, Regex Heuristics, RAG Engine',
        desc: 'Concurrent 4-agent analysis engine. Deterministic static pattern matching without external API latency. RAG terminal with source code citations.',
        color: C.amberBorder, fill: C.amberFill, text: C.amberText
      },
      {
        tag: 'TIER 4: PERSISTENCE & DATA LAYER',
        tech: 'Supabase PostgreSQL, Row Level Security (RLS), LocalStorage Fallback',
        desc: '7 relational tables with cascading foreign keys and RLS policies. Client-side caching and fallback mechanisms enabling instant offline demo mode.',
        color: C.purpleBorder, fill: C.purpleFill, text: C.purpleText
      }
    ];

    layers.forEach((l, idx) => {
      const posY = 1.45 + idx * 1.35;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.6, y: posY, w: 12.13, h: 1.25,
        fill: { color: C.white },
        line: { color: l.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.2 }
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.8, y: posY + 0.15, w: 3.2, h: 0.32,
        fill: { color: l.fill },
        line: { color: l.color, width: 1 }
      });
      slide.addText(l.tag, {
        x: 0.8, y: posY + 0.15, w: 3.2, h: 0.32,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: l.text, align: 'center', valign: 'middle'
      });

      slide.addText(l.tech, {
        x: 4.2, y: posY + 0.15, w: 8.3, h: 0.32,
        fontFace: F.title, fontSize: 12, bold: true, color: C.headerNavy
      });

      slide.addText(l.desc, {
        x: 0.8, y: posY + 0.55, w: 11.7, h: 0.55,
        fontFace: F.body, fontSize: 9.5, color: C.slateText, lineSpacing: 12
      });
    });
  }

  // ==========================================
  // SLIDE 8: MULTI-AGENT INGESTION PIPELINE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '07', 'Core Innovation', 'Multi-Agent Ingestion & AST Analysis Pipeline', 'The 4 specialized AI agents working concurrently to evaluate submitted codebases in under 40 seconds.');

    const agents = [
      {
        num: 'AGENT 01', name: 'Repository Agent',
        role: 'AST Parsing, Language Distribution & Directory Hygiene',
        desc: 'Parses codebase abstract syntax trees (AST), categorizes language percentages (TS, JS, Py, SQL), measures total lines of code (LOC), and validates dependency manifests against known exclusions.',
        runtime: '7.6s Runtime', findings: 'Dependency Graph & Hygiene',
        color: C.blueBorder, fill: C.blueFill, text: C.blueText
      },
      {
        num: 'AGENT 02', name: 'Quality & Code Review Agent',
        role: 'Code Smells, Cyclomatic Complexity & SOLID Principles',
        desc: 'Scans for anti-patterns: async inside Array.prototype.forEach, direct NaN comparisons, unhandled catch blocks, deep conditional nesting (complexity > 6), and DRY violations.',
        runtime: '14.2s Runtime', findings: 'Refactoring & Clean Code Diffs',
        color: C.greenBorder, fill: C.greenFill, text: C.greenText
      },
      {
        num: 'AGENT 03', name: 'Security & OWASP Agent',
        role: 'OWASP Top 10 Vulnerabilities & Secret Leakage Detection',
        desc: 'Maps security risks to OWASP Top 10: SQL Injection (A03), Broken Access Control (A01), and permissive CORS (A05). Scans for hardcoded AWS keys, GitHub tokens, and JWT secrets.',
        runtime: '11.8s Runtime', findings: 'Vulnerability CVE/CWE Diffs',
        color: C.roseBorder, fill: C.roseFill, text: C.roseText
      },
      {
        num: 'AGENT 04', name: 'Documentation Agent',
        role: 'README Health Audit & JSDoc / Docstring Generation',
        desc: 'Audits project documentation completeness, identifies undocumented public functions, and auto-drafts a complete, production-ready markdown README scaffold with setup instructions.',
        runtime: '6.4s Runtime', findings: 'Scaffolded README & JSDocs',
        color: C.purpleBorder, fill: C.purpleFill, text: C.purpleText
      }
    ];

    agents.forEach((ag, idx) => {
      const posX = 0.6 + idx * 3.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.5, w: 2.85, h: 5.4,
        fill: { color: C.white },
        line: { color: ag.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX + 0.15, y: 1.65, w: 2.55, h: 0.35,
        fill: { color: ag.fill },
        line: { color: ag.color, width: 1 }
      });
      slide.addText(ag.num, {
        x: posX + 0.15, y: 1.65, w: 2.55, h: 0.35,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: ag.text, align: 'center', valign: 'middle'
      });

      slide.addText(ag.name, {
        x: posX + 0.15, y: 2.1, w: 2.55, h: 0.5,
        fontFace: F.title, fontSize: 13, bold: true, color: C.headerNavy
      });

      slide.addText(ag.role, {
        x: posX + 0.15, y: 2.62, w: 2.55, h: 0.55,
        fontFace: F.mono, fontSize: 8, bold: true, color: ag.text
      });

      slide.addText(ag.desc, {
        x: posX + 0.15, y: 3.25, w: 2.55, h: 2.0,
        fontFace: F.body, fontSize: 8.8, color: C.slateText, lineSpacing: 12.5
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX + 0.15, y: 5.3, w: 2.55, h: 1.4,
        fill: { color: ag.fill },
        line: { color: ag.color, width: 1 }
      });
      slide.addText('EXECUTION METRICS:', {
        x: posX + 0.25, y: 5.4, w: 2.35, h: 0.25,
        fontFace: F.mono, fontSize: 7.5, bold: true, color: ag.text
      });
      slide.addText(`⏱ ${ag.runtime}\n🎯 ${ag.findings}`, {
        x: posX + 0.25, y: 5.7, w: 2.35, h: 0.85,
        fontFace: F.body, fontSize: 8.5, bold: true, color: C.headerNavy, lineSpacing: 13
      });
    });
  }

  // =========================================================================
  // PART II: COMPLETE UML ARCHITECTURE PORTFOLIO (ALL 11 DIAGRAMS SHOWCASED)
  // =========================================================================

  // SLIDE 9: UML PORTFOLIO OVERVIEW
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '08', 'UML Architecture Portfolio', 'Complete UML 2.5 Specification Suite (11 Diagrams)', 'Comprehensive behavioral, structural, and interaction models specified to IEEE/ISO 19505 standards.');

    const umlSections = [
      {
        cat: '1. BEHAVIORAL MODELS',
        color: C.blueBorder, fill: C.blueFill, text: C.blueText,
        diagrams: [
          'Diagram 01: Use Case Diagram (Actors & Capabilities)',
          'Diagram 07: State Machine Diagram (Review Lifecycle)',
          'Diagram 08: Activity Diagram (Ingestion & Fork/Join)'
        ]
      },
      {
        cat: '2. STRUCTURAL MODELS',
        color: C.greenBorder, fill: C.greenFill, text: C.greenText,
        diagrams: [
          'Diagram 02: Domain Class Diagram (Entities & Methods)',
          'Diagram 03: Layered Package Diagram (Separation of Concerns)',
          'Diagram 04: Deployment Diagram (Nodes & Infrastructure)',
          'Diagram 05: Component Diagram (Interfaces & Wiring)',
          'Diagram 06: Composite Structure Diagram (Internal Classifier)'
        ]
      },
      {
        cat: '3. INTERACTION MODELS',
        color: C.purpleBorder, fill: C.purpleFill, text: C.purpleText,
        diagrams: [
          'Diagram 09: Sequence Diagram (API Handshakes & Handlers)',
          'Diagram 10: Communication Diagram (Collaborations & Numbering)',
          'Diagram 11: Interaction Overview Diagram (Macro Control Flow)'
        ]
      }
    ];

    umlSections.forEach((sec, idx) => {
      const posX = 0.6 + idx * 4.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.5, w: 3.85, h: 5.4,
        fill: { color: C.white },
        line: { color: sec.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX + 0.2, y: 1.7, w: 3.45, h: 0.35,
        fill: { color: sec.fill },
        line: { color: sec.color, width: 1 }
      });
      slide.addText(sec.cat, {
        x: posX + 0.2, y: 1.7, w: 3.45, h: 0.35,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: sec.text, align: 'center', valign: 'middle'
      });

      sec.diagrams.forEach((d, i) => {
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: posX + 0.2, y: 2.3 + i * 0.95, w: 3.45, h: 0.82,
          fill: { color: C.slateFill },
          line: { color: C.borderMuted, width: 1 }
        });
        slide.addText(d, {
          x: posX + 0.3, y: 2.35 + i * 0.95, w: 3.25, h: 0.72,
          fontFace: F.body, fontSize: 9, bold: true, color: C.headerNavy, lineSpacing: 12
        });
      });
    });
  }

  // SLIDE 10: 01. USE CASE DIAGRAM
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addDiagramSlide(
      slide, '09', 'UML Behavioral Model',
      '01. Use Case Diagram (Actors & Capabilities)',
      'Functional capabilities mapped across Student Developer, Faculty Evaluator, and External Services.',
      UML_DIAGRAMS.useCase,
      'USE CASE ARCHITECTURE SPECS',
      C.blueDark, C.blueFill,
      [
        { name: 'Primary Actors', desc: 'Student Developer (code submission, chat, viva) and Faculty Evaluator (grading, analytics).' },
        { name: 'Secondary Actors', desc: 'GitHub Cloud API (OAuth & repo sync) and Supabase (PostgreSQL & GoTrue Auth).' },
        { name: '14 Core Use Cases', desc: 'Covers login, repo sync, ZIP ingestion, multi-agent scan, code diffs, RAG chat, and certified PDF export.' },
        { name: 'System Boundary', desc: 'Strict boundary isolation enclosing CodePilot AI core services from external identity providers.' },
        { name: 'Include / Extend Relations', desc: 'Multi-Agent Review includes AST parsing, OWASP scanning, and README generation.' },
        { name: 'Governance Cases', desc: 'Faculty can view student roster, inspect defect patterns, and assign formal grades.' }
      ],
      'IEEE 1016 / ISO/IEC 19505 Use Case Standard'
    );
  }

  // SLIDE 11: 02. CLASS DIAGRAM
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addDiagramSlide(
      slide, '10', 'UML Structural Model',
      '02. Domain Class Diagram (Entities & Relationships)',
      'Domain entities, aggregations, class attributes, methods, and agent pipeline contracts.',
      UML_DIAGRAMS.classDiag,
      'CLASS MODEL ARCHITECTURE SPECS',
      C.blueDark, C.blueFill,
      [
        { name: 'Generalization (User)', desc: 'User is abstract root inherited by Student Developer and Faculty Evaluator roles.' },
        { name: 'Repository *-- Review', desc: 'Composition: A repository aggregates zero to many reviews; deleting repo cascades to reviews.' },
        { name: 'Review *-- Finding, Scores', desc: 'Composition: Each review contains structured scores (0-100) and defect findings tagged by severity.' },
        { name: 'AnalysisEngine ..> Review', desc: 'Dependency: Coordinates AST scanning, OWASP heuristics, and synthesis of diffs.' },
        { name: 'ChatMessage *-- ChatCitation', desc: 'Composition: RAG conversational messages link to exact code citations with line ranges.' },
        { name: 'Dual Persistence Layer', desc: 'LocalStore provides client cache while SupabaseDB handles PostgreSQL persistence.' }
      ],
      'UML 2.5 Standard 3-Compartment Class Notation'
    );
  }

  // SLIDE 12: 03. PACKAGE DIAGRAM
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addDiagramSlide(
      slide, '11', 'UML Structural Model',
      '03. Layered Package Diagram (Separation of Concerns)',
      'Hierarchical module boundaries, layer isolation, and strict downward coupling.',
      UML_DIAGRAMS.packageDiag,
      'PACKAGE COUPLING & BOUNDARIES',
      C.greenDark, C.greenFill,
      [
        { name: 'Presentation Package', desc: 'Next.js 14 App Router pages (`/review`, `/report`, `/chat`, `/faculty`, `/dashboard`).' },
        { name: 'Authentication Package', desc: 'AuthContext, Supabase GoTrue client, PKCE verifiers, and role resolution handlers.' },
        { name: 'Analysis Engine Package', desc: 'AST parser, language distribution detector, OWASP Top 10 matcher, and secrets scanner.' },
        { name: 'Persistence Layer', desc: 'Supabase PostgreSQL database client and client-side localStorage fallback stores.' },
        { name: 'Downwards Dependency Law', desc: 'Presentation depends on Engine and Persistence; lower layers have zero upward dependencies.' },
        { name: 'Circular Dependency Immunity', desc: 'Strict package encapsulation guarantees zero cyclical module coupling.' }
      ],
      'UML 2.5 Package Dependency & Stereotype Spec'
    );
  }

  // SLIDE 13: 04. DEPLOYMENT DIAGRAM
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addDiagramSlide(
      slide, '12', 'UML Physical Model',
      '04. Deployment Diagram (Nodes & Infrastructure)',
      'Physical deployment nodes, runtime containers, network protocols, and connection ports.',
      UML_DIAGRAMS.deploymentDiag,
      'RUNTIME INFRASTRUCTURE & TOPOLOGY',
      C.purpleDark, C.purpleFill,
      [
        { name: 'Client Node (Browser)', desc: 'Runs React 18 VDOM, JSZip extractor, Lucide UI, and jsPDF export engine.' },
        { name: 'Edge Compute (Vercel)', desc: 'Next.js 14 Serverless Edge instances running SSR rendering and dynamic routing.' },
        { name: 'Auth Node (Supabase GoTrue)', desc: 'Handles OAuth2 PKCE exchange, JWT signing, password resets, and user sessions.' },
        { name: 'Database Node (PostgreSQL)', desc: 'Supabase PostgreSQL cloud cluster with Row Level Security (RLS) enforcement.' },
        { name: 'External Node (GitHub API)', desc: 'Secure HTTPS port 443 calls to `api.github.com/user/repos`.' },
        { name: 'Protocol Encryption', desc: 'All inter-node traffic encrypted using TLS 1.3 over HTTPS/WSS.' }
      ],
      'UML 2.5 Physical Node & Execution Environment'
    );
  }

  // SLIDE 14: 05. COMPONENT DIAGRAM
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addDiagramSlide(
      slide, '13', 'UML Component Model',
      '05. Component Diagram (Wiring & Interfaces)',
      'Modular software building blocks with stereotype pins and communication interfaces.',
      UML_DIAGRAMS.componentDiag,
      'COMPONENT WIRING & INTERFACES',
      C.amberDark, C.amberFill,
      [
        { name: 'AuthService Component', desc: 'Provides `IAuthSession` and `IRoleGuard`; consumes Supabase GoTrue provider.' },
        { name: 'IngestionEngine Component', desc: 'Provides `IIngest` interface; handles ZIP decompression and GitHub shallow pulls.' },
        { name: 'MultiAgentPipeline Component', desc: 'Provides `IReviewOrchestrator`; dispatches AST tasks across 4 sub-agents.' },
        { name: 'ChatRAGEngine Component', desc: 'Provides `ITerminalAI`; anchors conversational queries to parsed repository context.' },
        { name: 'ReportExport Component', desc: 'Provides `IPDFExport`; generates standardized academic evaluation certificates.' },
        { name: 'Lollipop & Socket Notations', desc: 'Formal ball-and-socket UML interfaces specifying strict component contracts.' }
      ],
      'UML 2.5 Component & Interface Architecture'
    );
  }

  // SLIDE 15: 06. COMPOSITE STRUCTURE DIAGRAM
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addDiagramSlide(
      slide, '14', 'UML Structural Decomposition',
      '06. Composite Structure Diagram (Classifier & Ports)',
      'Decomposition of the MultiAgentReviewPipeline classifier into internal parts, ports, and connectors.',
      UML_DIAGRAMS.compositeDiag,
      'CLASSIFIER DECOMPOSITION & PORTS',
      C.roseDark, C.roseFill,
      [
        { name: 'Encapsulated Classifier', desc: 'Models the internal wiring of `MultiAgentReviewPipeline` classifier.' },
        { name: 'Input / Output Ports', desc: 'Port p1 (Raw Source Ingestion) and Port p2 (Review Report Output).' },
        { name: 'Internal Parts (Roles)', desc: 'ASTParser, LanguageDetector, RuleEngine, AgentSwarm, and ScoreCalculator.' },
        { name: 'Internal Connectors', desc: 'Binding channels that pass intermediate AST tokens between internal parts.' },
        { name: 'Agent Parts Assembly', desc: 'RepositoryPart, QualityPart, SecurityPart, and DocumentationPart.' },
        { name: 'Score Synthesizer Connector', desc: 'Aggregates individual agent finding arrays into weighted score matrix (0-100).' }
      ],
      'UML 2.5 Composite Structure Classifier Spec'
    );
  }

  // SLIDE 16: 07. STATE MACHINE DIAGRAM
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addDiagramSlide(
      slide, '15', 'UML Dynamic Model',
      '07. State Machine Diagram (Review Lifecycle)',
      'State machine showing submission transitions from unreviewed idle to fully audited and graded.',
      UML_DIAGRAMS.stateMachine,
      'STATE TRANSITION SPECIFICATIONS',
      C.greenDark, C.greenFill,
      [
        { name: 'Idle -> SourceSelection', desc: 'Triggered when user clicks "Add Repository"; selects ZIP or GitHub import.' },
        { name: 'ConfiguringPipeline', desc: 'Exclusion rules (node_modules, .git) and skill calibration are selected.' },
        { name: '4-Step Ingestion Pipeline', desc: 'Validation -> File Discovery -> Language Detection -> AST Indexing.' },
        { name: 'Fork / Join Agent Swarm', desc: 'Repo, Quality, Security, and Docs agents run concurrently with join sync.' },
        { name: 'ReviewCompleted State', desc: 'Generates report, sends notification, and auto-queues in faculty roster.' },
        { name: 'Interactive Terminal States', desc: 'Branches into Report Viewing, Terminal AI, Mock Viva, and Faculty Grading.' }
      ],
      'UML 2.5 Statechart & Composite State Spec'
    );
  }

  // SLIDE 17: 08. ACTIVITY DIAGRAM
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addDiagramSlide(
      slide, '16', 'UML Workflow Model',
      '08. Activity Diagram (Parallel Multi-Agent Ingestion)',
      'End-to-end processing pipeline showing fork/join parallelism and student/faculty decision points.',
      UML_DIAGRAMS.activityDiag,
      'ACTIVITY WORKFLOW SPECIFICATIONS',
      C.blueDark, C.blueFill,
      [
        { name: 'Swimlane Separation', desc: 'Partitioned across Student Action, Ingestion Worker, Agent Swarm, and Faculty.' },
        { name: 'Decision Diamonds', desc: 'Validates archive size (<100MB), valid ZIP header, and git branch existence.' },
        { name: 'Fork Bar Concurrency', desc: 'Splits ingestion stream into 4 parallel agent execution threads.' },
        { name: 'Join Bar Synchronization', desc: 'Waits for all 4 agents to report completed findings before scoring.' },
        { name: 'Error Recovery Loops', desc: 'Malformed archives route back to Idle with actionable error toast alerts.' },
        { name: 'Final Activity Nodes', desc: 'Concludes at PDF Report Download and Institutional Grade Record.' }
      ],
      'UML 2.5 Activity Diagram & Swimlane Standard'
    );
  }

  // SLIDE 18: 09. SEQUENCE DIAGRAM
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addDiagramSlide(
      slide, '17', 'UML Interaction Model',
      '09. Sequence Diagram (API Handshakes & Review Calls)',
      'Chronological sequence of synchronous calls, parallel agent dispatches, and DB callbacks.',
      UML_DIAGRAMS.sequenceDiag,
      'CALL LIFELINES & SYNCHRONIZATION',
      C.purpleDark, C.purpleFill,
      [
        { name: 'Participating Lifelines', desc: 'Student, NextApp, AnalysisEngine, AgentSwarm, SupabaseDB, and Faculty.' },
        { name: 'Synchronous Messages', desc: 'Solid arrows with filled heads (e.g. `startIngestion(files)`).' },
        { name: 'Asynchronous Dispatches', desc: 'Stick arrowheads for concurrent agent spawning (`runSecurityScan()`).' },
        { name: 'Return Messages', desc: 'Dashed arrows returning findings arrays and generated score objects.' },
        { name: 'Activation Bars', desc: 'Depicts active execution time on each lifeline during the 40s review cycle.' },
        { name: 'Database Persistence Hook', desc: 'Asynchronous `saveReviewToDB()` callback committing findings and scores.' }
      ],
      'UML 2.5 Sequence Diagram & Lifeline Standard'
    );
  }

  // SLIDE 19: 10. COMMUNICATION DIAGRAM
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addDiagramSlide(
      slide, '18', 'UML Interaction Model',
      '10. Communication Diagram (Collaborations & Numbering)',
      'Structural network showing object topological relations and sequential numbered messages.',
      UML_DIAGRAMS.commDiag,
      'TOPOLOGICAL LINKS & MESSAGE NUMBERS',
      C.amberDark, C.amberFill,
      [
        { name: 'Collaborating Objects', desc: 'StudentView, PipelineController, ASTWorker, AgentOrchestrator, DBClient.' },
        { name: 'Topological Links', desc: 'Solid paths connecting objects that share direct runtime references.' },
        { name: 'Numbered Message Sequences', desc: 'Hierarchical message numbering: 1: `submit()`, 1.1: `parse()`, 1.2: `dispatch()`.' },
        { name: 'Bidirectional Traffic', desc: 'Depicts structural network efficiency without timeline overhead.' },
        { name: 'Roster Synchronization', desc: 'Direct link from PipelineController to FacultyRoster upon review completion.' },
        { name: 'Space Efficiency', desc: 'Emphasizes structural organization of objects over temporal sequence.' }
      ],
      'UML 2.5 Communication (Collaboration) Spec'
    );
  }

  // SLIDE 20: 11. INTERACTION OVERVIEW DIAGRAM
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addDiagramSlide(
      slide, '19', 'UML Interaction Model',
      '11. Interaction Overview Diagram (Macro Control Flow)',
      'High-level interaction model coordinating Sequence, Activity, and State behaviors across modules.',
      UML_DIAGRAMS.overviewDiag,
      'MACRO FLOW & MODULAR INTERACTIONS',
      C.roseDark, C.roseFill,
      [
        { name: 'Hybrid Control Flow', desc: 'Combines activity diagram control nodes with embedded interaction frames.' },
        { name: 'Interaction Use Frames', desc: 'Frames `ref: AuthenticationFlow`, `ref: MultiAgentReview`, `ref: FacultyGrading`.' },
        { name: 'Decision & Merge Nodes', desc: 'Determines whether user proceeds to interactive chat or faculty evaluation.' },
        { name: 'System-Wide Lifecycle', desc: 'Provides evaluators a single unified map of all dynamic interactions.' },
        { name: 'Modular Traceability', desc: 'Every frame traces directly to formal SRS functional requirements.' },
        { name: 'End-to-End Governance', desc: 'Guarantees all student submissions flow into verifiable faculty rosters.' }
      ],
      'UML 2.5 Interaction Overview Diagram Spec'
    );
  }

  // =========================================================================
  // PART III: ENGINEERING RIGOR, CAPABILITIES & DEFENSE GUIDE
  // =========================================================================

  // SLIDE 21: DATABASE SCHEMA & POSTGRESQL ARCHITECTURE
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '20', 'Data Architecture', 'Supabase PostgreSQL Relational Schema Models', '7 production database tables engineered with strict integrity, cascading deletes, and Row Level Security.');

    const tables = [
      { name: '1. profiles', keys: 'id (PK), email, full_name, role, prn, roll_no, batch', desc: 'Stores dual student and faculty profiles; auto-populated via PostgreSQL trigger on auth.users.' },
      { name: '2. repositories', keys: 'id (PK), user_id (FK), name, owner, source, branch, language_distribution', desc: 'Tracks imported GitHub or uploaded ZIP projects with file statistics and language breakdowns.' },
      { name: '3. reviews', keys: 'id (PK), repository_id (FK), overall_score, security_score, quality_score, status', desc: 'Aggregates multi-agent score breakdowns, executive summaries, duration, and faculty grade marks.' },
      { name: '4. findings', keys: 'id (PK), review_id (FK), agent_type, severity, owasp_category, code_snippet, diff', desc: 'Granular defect records containing line numbers, Senior principle explanations, and diff patches.' },
      { name: '5. chat_messages', keys: 'id (PK), repository_id (FK), role, content, context_file, citations', desc: 'Persistent RAG conversational messages with exact file citations and finding follow-up anchors.' },
      { name: '6. interview_sessions', keys: 'id (PK), user_id, question, student_answer, ai_feedback, score, rubrics', desc: 'Mock technical interview records with 4-part rubric scores (Accuracy, Problem Solving, Communication, Practices).' },
      { name: '7. faculty_roster', keys: 'id (PK), faculty_id (FK), student_id (FK), batch, assignment_name, status', desc: 'Classroom evaluation queue linking faculty reviewers to student assignment submissions.' }
    ];

    tables.forEach((t, i) => {
      const posY = 1.45 + i * 0.77;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.6, y: posY, w: 12.13, h: 0.7,
        fill: { color: C.white },
        line: { color: C.borderStrong, width: 1 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 2, offset: 1, angle: 90, opacity: 0.15 }
      });

      slide.addText(t.name, {
        x: 0.8, y: posY + 0.1, w: 2.2, h: 0.5,
        fontFace: F.mono, fontSize: 10, bold: true, color: C.blueDark
      });

      slide.addText(t.keys, {
        x: 3.1, y: posY + 0.1, w: 4.8, h: 0.5,
        fontFace: F.mono, fontSize: 8.2, color: C.subText
      });

      slide.addText(t.desc, {
        x: 8.0, y: posY + 0.1, w: 4.5, h: 0.5,
        fontFace: F.body, fontSize: 8.5, color: C.headerNavy, lineSpacing: 10
      });
    });
  }

  // SLIDE 22: CYBERSECURITY RIGOR & OWASP TOP 10 SCAN
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '21', 'Cybersecurity Rigor', 'OWASP Top 10 Static Auditing & Secret Detection', 'Deterministic vulnerability identification with senior engineer remediation diffs.');

    const vulns = [
      {
        owasp: 'A03:2021 - Injection',
        cwe: 'CWE-89: SQL Injection',
        severity: 'CRITICAL',
        code: 'const q = "SELECT * FROM users WHERE email = \'" + email + "\'";',
        fix: 'const q = "SELECT * FROM users WHERE email = ?"; db.execute(q, [email]);',
        principle: 'Direct string concatenation allows user-controlled inputs to alter SQL execution trees. Parameterized queries enforce strict boundary separation between data and executable instructions.'
      },
      {
        owasp: 'A01:2021 - Broken Access Control',
        cwe: 'CWE-285: Missing Authorization',
        severity: 'HIGH',
        code: 'router.post("/settings", async (req, res) => { await updateUserRole(req.body); });',
        fix: 'router.post("/settings", requireAuth, requireAdmin, async (req, res) => { ... });',
        principle: 'Mutative handlers must enforce identity and role-based access control middleware before executing database mutations.'
      },
      {
        owasp: 'A05:2021 - Security Misconfiguration',
        cwe: 'CWE-942: Permissive CORS',
        severity: 'MEDIUM',
        code: 'app.use(cors({ origin: "*" }));',
        fix: 'app.use(cors({ origin: ["https://trusted-domain.edu"] }));',
        principle: 'Wildcard CORS headers in authenticated APIs allow malicious external scripts to steal session credentials and tokens.'
      },
      {
        owasp: 'A07:2021 - Credential Leakage',
        cwe: 'CWE-798: Hardcoded Secrets',
        severity: 'CRITICAL',
        code: 'const AWS_KEY = "AKIAIOSFODNN7EXAMPLE"; const GITHUB_TOKEN = "ghp_xxxx...";',
        fix: 'const AWS_KEY = process.env.AWS_KEY; // Managed via Secrets Vault',
        principle: 'Committing API secrets to git version control creates permanent leakage risks. Secrets must be injected at runtime via environment variables.'
      }
    ];

    vulns.forEach((v, idx) => {
      const posX = 0.6 + idx * 3.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.5, w: 2.85, h: 5.4,
        fill: { color: C.white },
        line: { color: v.severity === 'CRITICAL' ? C.roseBorder : C.amberBorder, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX + 0.15, y: 1.65, w: 2.55, h: 0.32,
        fill: { color: v.severity === 'CRITICAL' ? C.roseFill : C.amberFill },
        line: { color: v.severity === 'CRITICAL' ? C.roseBorder : C.amberBorder, width: 1 }
      });
      slide.addText(v.severity, {
        x: posX + 0.15, y: 1.65, w: 2.55, h: 0.32,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: v.severity === 'CRITICAL' ? C.roseText : C.amberText, align: 'center', valign: 'middle'
      });

      slide.addText(v.owasp, {
        x: posX + 0.15, y: 2.05, w: 2.55, h: 0.45,
        fontFace: F.title, fontSize: 10.5, bold: true, color: C.headerNavy
      });
      slide.addText(v.cwe, {
        x: posX + 0.15, y: 2.45, w: 2.55, h: 0.25,
        fontFace: F.mono, fontSize: 7.5, color: C.subText
      });

      // Vulnerable Code Block
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX + 0.15, y: 2.75, w: 2.55, h: 0.85,
        fill: { color: 'FFF1F2' },
        line: { color: 'F43F5E', width: 0.8 }
      });
      slide.addText(`❌ VULNERABLE:\n${v.code}`, {
        x: posX + 0.2, y: 2.78, w: 2.45, h: 0.78,
        fontFace: F.mono, fontSize: 7, color: '9F1239'
      });

      // Fixed Code Block
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX + 0.15, y: 3.68, w: 2.55, h: 0.85,
        fill: { color: 'F0FDF4' },
        line: { color: '22C55E', width: 0.8 }
      });
      slide.addText(`✔ SENIOR DIFF FIX:\n${v.fix}`, {
        x: posX + 0.2, y: 3.72, w: 2.45, h: 0.78,
        fontFace: F.mono, fontSize: 7, color: '166534'
      });

      slide.addText('SENIOR PRINCIPLE EXPLANATION:', {
        x: posX + 0.15, y: 4.6, w: 2.55, h: 0.25,
        fontFace: F.mono, fontSize: 7.5, bold: true, color: C.headerNavy
      });

      slide.addText(v.principle, {
        x: posX + 0.15, y: 4.88, w: 2.55, h: 1.9,
        fontFace: F.body, fontSize: 8.2, color: C.slateText, lineSpacing: 11.5
      });
    });
  }

  // SLIDE 23: PEDAGOGICAL INNOVATION: PRINCIPLES & DIFFS
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '22', 'Pedagogical Innovation', 'Senior "Principle Explanations" & Interactive Diffs', 'Teaching software craftsmanship by explaining the architectural "Why" rather than just showing errors.');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.5, w: 5.9, h: 5.4,
      fill: { color: C.white },
      line: { color: C.blueBorder, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.7, w: 5.5, h: 0.38,
      fill: { color: C.blueFill },
      line: { color: C.blueBorder, width: 1 }
    });
    slide.addText('FR-073: SENIOR PRINCIPLE EXPLANATIONS', {
      x: 0.8, y: 1.7, w: 5.5, h: 0.38,
      fontFace: F.mono, fontSize: 9.5, bold: true, color: C.blueDark, align: 'center', valign: 'middle'
    });

    slide.addText('Moving from "Error Code" to "Engineering Lesson":', {
      x: 0.8, y: 2.2, w: 5.5, h: 0.35,
      fontFace: F.title, fontSize: 13, bold: true, color: C.headerNavy
    });

    slide.addText('• Conventional linters output: "warning: no-async-promise-executor"\n  Result: Students disable eslint or ignore warning.\n\n• CodePilot AI outputs:\n  "Array.prototype.forEach does not await promises. When async callbacks are passed into forEach, the loop terminates before the inner promises resolve, leading to unhandled rejections, broken transactions, and silent data loss."\n\n• Skill-Level Calibration (FR-075):\n  - Beginner: Step-by-step guidance, foundational concepts.\n  - Intermediate: Idiomatic production standards, performance tips.\n  - Advanced: Staff engineer perspective on concurrency & trade-offs.', {
      x: 0.8, y: 2.65, w: 5.5, h: 4.0,
      fontFace: F.body, fontSize: 9.5, color: C.slateText, lineSpacing: 14
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.5, w: 5.9, h: 5.4,
      fill: { color: C.white },
      line: { color: C.greenBorder, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.0, y: 1.7, w: 5.5, h: 0.38,
      fill: { color: C.greenFill },
      line: { color: C.greenBorder, width: 1 }
    });
    slide.addText('FR-172: INTERACTIVE SIDE-BY-SIDE DIFFS', {
      x: 7.0, y: 1.7, w: 5.5, h: 0.38,
      fontFace: F.mono, fontSize: 9.5, bold: true, color: C.greenDark, align: 'center', valign: 'middle'
    });

    slide.addText('Actionable Before vs. After Patch Synthesis:', {
      x: 7.0, y: 2.2, w: 5.5, h: 0.35,
      fontFace: F.title, fontSize: 13, bold: true, color: C.headerNavy
    });

    slide.addText('• Precise Line Ranges: Findings pinpoint exact files and line numbers (e.g. `src/middleware/auth.ts:18-24`).\n\n• Side-by-Side Visual Diff:\n  Red lines indicate unsafe or anti-pattern constructs.\n  Green lines show clean, parameterized, idiomatic replacements.\n\n• 1-Click Code Copy: Students can copy the verified patch directly into their local IDE.\n\n• Verified Syntactic Validity: All generated diff patches are syntactically checked to prevent introducing new runtime defects.', {
      x: 7.0, y: 2.65, w: 5.5, h: 4.0,
      fontFace: F.body, fontSize: 9.5, color: C.slateText, lineSpacing: 14
    });
  }

  // SLIDE 24: TERMINAL AI & MOCK VIVA DEFENSE SIMULATOR
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '23', 'Interactive Defense', 'Grounded Terminal AI & Mock Viva Simulator', 'Preparing students for oral project defenses and technical placement interviews.');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.5, w: 5.9, h: 5.4,
      fill: { color: C.white },
      line: { color: C.blueBorder, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.7, w: 5.5, h: 0.38,
      fill: { color: C.blueFill },
      line: { color: C.blueBorder, width: 1 }
    });
    slide.addText('FR-121 TO FR-124: GROUNDED TERMINAL AI', {
      x: 0.8, y: 1.7, w: 5.5, h: 0.38,
      fontFace: F.mono, fontSize: 9.5, bold: true, color: C.blueDark, align: 'center', valign: 'middle'
    });

    slide.addText('RAG-Grounded Conversational Code Assistant:', {
      x: 0.8, y: 2.2, w: 5.5, h: 0.35,
      fontFace: F.title, fontSize: 13, bold: true, color: C.headerNavy
    });

    slide.addText('• Retrieval-Augmented Generation (RAG): AI answers are strictly anchored to the parsed repository AST and file contents — eliminating hallucinations.\n\n• Finding Follow-Up Anchor (FR-122): Clicking "Ask AI about this finding" anchors the conversation directly to the specific defect context.\n\n• Line-Number Citations (FR-124): Every AI explanation references exact file paths and code lines (e.g. `[src/api.ts#L44-62]`).\n\n• Natural Language Querying: Students can ask "How is authentication handled?" or "Why did the security score drop?" and receive instant contextual answers.', {
      x: 0.8, y: 2.65, w: 5.5, h: 4.0,
      fontFace: F.body, fontSize: 9.5, color: C.slateText, lineSpacing: 14
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.5, w: 5.9, h: 5.4,
      fill: { color: C.white },
      line: { color: C.purpleBorder, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.0, y: 1.7, w: 5.5, h: 0.38,
      fill: { color: C.purpleFill },
      line: { color: C.purpleBorder, width: 1 }
    });
    slide.addText('FR-331: MOCK VIVA & TECHNICAL INTERVIEW', {
      x: 7.0, y: 1.7, w: 5.5, h: 0.38,
      fontFace: F.mono, fontSize: 9.5, bold: true, color: C.purpleDark, align: 'center', valign: 'middle'
    });

    slide.addText('Simulated Oral Project Defense with AI Evaluator:', {
      x: 7.0, y: 2.2, w: 5.5, h: 0.35,
      fontFace: F.title, fontSize: 13, bold: true, color: C.headerNavy
    });

    slide.addText('• Context-Specific Viva Questions: Generates tough evaluative questions based on the candidate\'s actual codebase (e.g. concurrency handling, caching strategy, security flaws).\n\n• 4-Part Evaluator Scoring Rubric:\n  - Conceptual Accuracy (35 points)\n  - Problem-Solving Logic (25 points)\n  - Communication & Articulation (20 points)\n  - Best Practices & Code Standards (20 points)\n\n• Constructive Feedback & Model Answers: Explains how a senior engineer would answer the question, building placement defense readiness.', {
      x: 7.0, y: 2.65, w: 5.5, h: 4.0,
      fontFace: F.body, fontSize: 9.5, color: C.slateText, lineSpacing: 14
    });
  }

  // SLIDE 25: CERTIFIED INSTITUTIONAL PDF REPORTS
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '24', 'Institutional Reporting', 'Certified Institutional PDF Export & Shareability', 'Official verification certificates, score radars, and public shareable URLs.');

    const reportFeatures = [
      {
        tag: 'FR-211: PDF EXPORT',
        title: 'Tamper-Evident Institutional PDF Report',
        desc: 'Generates professional multi-page academic review certificates using jsPDF and html2canvas. Includes university name, department, candidate name, roll number, PRN, and submission timestamp.',
        details: ['High-resolution score radar charts', 'Executive summary of code quality', 'Comprehensive finding breakdown', 'Official faculty evaluation signature box'],
        color: C.blueBorder, fill: C.blueFill, text: C.blueText
      },
      {
        tag: 'FR-212: PUBLIC SHARE LINK',
        title: 'Verified Read-Only Share Token',
        desc: 'Each review generates a unique, non-guessable share token (e.g. `/report/CPAI-2026-028`). Allows students to share their certified review results with faculty, recruiters, or portfolio reviewers.',
        details: ['Read-only security sandbox', 'No login required for verification', 'Live score verification badge', 'Direct link to full finding diffs'],
        color: C.greenBorder, fill: C.greenFill, text: C.greenText
      },
      {
        tag: 'FR-213: BRANDING TOGGLE',
        title: 'Configurable Academic Branding Headers',
        desc: 'Institutions can customize the report header with university logos, department titles, cohort IDs, and academic session labels, enabling standardized departmental evaluation.',
        details: ['University logo integration', 'Custom batch & roll number fields', 'Faculty evaluator endorsement', 'Official department watermarks'],
        color: C.purpleBorder, fill: C.purpleFill, text: C.purpleText
      }
    ];

    reportFeatures.forEach((rf, idx) => {
      const posX = 0.6 + idx * 4.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.5, w: 3.85, h: 5.4,
        fill: { color: C.white },
        line: { color: rf.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX + 0.2, y: 1.7, w: 3.45, h: 0.35,
        fill: { color: rf.fill },
        line: { color: rf.color, width: 1 }
      });
      slide.addText(rf.tag, {
        x: posX + 0.2, y: 1.7, w: 3.45, h: 0.35,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: rf.text, align: 'center', valign: 'middle'
      });

      slide.addText(rf.title, {
        x: posX + 0.2, y: 2.2, w: 3.45, h: 0.65,
        fontFace: F.title, fontSize: 13, bold: true, color: C.headerNavy
      });

      slide.addText(rf.desc, {
        x: posX + 0.2, y: 2.9, w: 3.45, h: 1.6,
        fontFace: F.body, fontSize: 9, color: C.slateText, lineSpacing: 13
      });

      slide.addShape(pptx.shapes.LINE, {
        x: posX + 0.3, y: 4.6, w: 3.25, h: 0,
        line: { color: C.borderMuted, width: 1 }
      });

      slide.addText('KEY CAPABILITIES:', {
        x: posX + 0.2, y: 4.75, w: 3.45, h: 0.25,
        fontFace: F.mono, fontSize: 7.5, bold: true, color: rf.text
      });

      rf.details.forEach((det, di) => {
        slide.addText(`✔  ${det}`, {
          x: posX + 0.2, y: 5.05 + di * 0.42, w: 3.45, h: 0.38,
          fontFace: F.body, fontSize: 8.5, color: C.headerNavy
        });
      });
    });
  }

  // SLIDE 26: STEP-BY-STEP LIVE DEMO WALKTHROUGH
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '25', 'Live Demonstration', 'Step-by-Step Live Demonstration Walkthrough', 'A proven 5-step narrative structure to present CodePilot AI during evaluator defense.');

    const steps = [
      {
        num: 'STEP 01', time: '0:00 - 1:30',
        title: 'Authentication & Dual-Portal Experience',
        desc: 'Showcase GitHub OAuth login pulling student repos instantly. Demonstrate the 1-click test demo logins for Student Developer and Faculty Reviewer personas.'
      },
      {
        num: 'STEP 02', time: '1:30 - 3:00',
        title: 'Repository Ingestion & Exclusion Rules',
        desc: 'Select a sample repository (Society_Sync) or upload a ZIP file. Show language breakdown (TS, JS, SQL) and configure exclusion rules (node_modules, .git).'
      },
      {
        num: 'STEP 03', time: '3:00 - 4:30',
        title: 'Real-Time Multi-Agent Concurrency Pipeline',
        desc: 'Trigger review. Highlight the 4 active agent indicators (Repo, Quality, Security, Docs) executing concurrently within the <60s SLA threshold.'
      },
      {
        num: 'STEP 04', time: '4:30 - 6:30',
        title: 'Finding Inspection, Senior Diffs & OWASP Mapping',
        desc: 'Expand Critical SQL injection finding (CPAI-001). Show senior principle explanation, side-by-side Before/After diff patch, and auto-generated README scaffold.'
      },
      {
        num: 'STEP 05', time: '6:30 - 8:00',
        title: 'Terminal AI, Viva Simulator & Faculty Grading',
        desc: 'Ask terminal AI a grounded question with code citations. Switch to Faculty view to grade the submission, award A+ marks, and export certified PDF report.'
      }
    ];

    steps.forEach((st, idx) => {
      const posY = 1.45 + idx * 1.08;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.6, y: posY, w: 12.13, h: 0.98,
        fill: { color: C.white },
        line: { color: C.borderStrong, width: 1.2 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 2, offset: 1, angle: 90, opacity: 0.15 }
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.8, y: posY + 0.15, w: 1.6, h: 0.68,
        fill: { color: C.blueFill },
        line: { color: C.blueBorder, width: 1 }
      });
      slide.addText(`${st.num}\n${st.time}`, {
        x: 0.8, y: posY + 0.22, w: 1.6, h: 0.55,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: C.blueDark, align: 'center'
      });

      slide.addText(st.title, {
        x: 2.6, y: posY + 0.15, w: 9.8, h: 0.3,
        fontFace: F.title, fontSize: 12, bold: true, color: C.headerNavy
      });

      slide.addText(st.desc, {
        x: 2.6, y: posY + 0.45, w: 9.8, h: 0.45,
        fontFace: F.body, fontSize: 9, color: C.slateText, lineSpacing: 12
      });
    });
  }

  // SLIDE 27: VERIFICATION, TESTING & METRICS
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '26', 'Verification & Quality', 'System Performance Benchmarks & Testing Metrics', 'Empirical validation across analysis duration, AST parsing throughput, and security accuracy.');

    const metrics = [
      { num: '40s', label: 'Average Review Duration', sub: 'Target SLA: < 60s (Exceeded by 33%)', color: C.greenText, fill: C.greenFill, border: C.greenBorder },
      { num: '100%', label: 'OWASP Benchmark Detection', sub: 'Detected 100% of injected SQLi & Auth flaws', color: C.blueText, fill: C.blueFill, border: C.blueBorder },
      { num: '0 ms', label: 'OAuth PKCE Handshake Race', sub: 'PKCE cookie jar eliminating token collisions', color: C.purpleText, fill: C.purpleFill, border: C.purpleBorder },
      { num: '100 MB', label: 'Supported ZIP Archive Capacity', sub: 'Tested on repos up to 15,000+ LOC', color: C.amberText, fill: C.amberFill, border: C.amberBorder }
    ];

    metrics.forEach((m, idx) => {
      const posX = 0.6 + idx * 3.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.5, w: 2.85, h: 1.7,
        fill: { color: m.fill },
        line: { color: m.border, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.2 }
      });

      slide.addText(m.num, {
        x: posX + 0.1, y: 1.65, w: 2.65, h: 0.6,
        fontFace: F.title, fontSize: 28, bold: true, color: m.color, align: 'center'
      });

      slide.addText(m.label, {
        x: posX + 0.1, y: 2.25, w: 2.65, h: 0.35,
        fontFace: F.title, fontSize: 10.5, bold: true, color: C.headerNavy, align: 'center'
      });

      slide.addText(m.sub, {
        x: posX + 0.1, y: 2.6, w: 2.65, h: 0.45,
        fontFace: F.body, fontSize: 8, color: C.subText, align: 'center'
      });
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 3.4, w: 12.13, h: 3.5,
      fill: { color: C.white },
      line: { color: C.borderStrong, width: 1.5 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.2 }
    });

    slide.addText('EMPIRICAL TEST SUITE SUMMARY (SRS Traceability Verification):', {
      x: 0.8, y: 3.55, w: 11.7, h: 0.3,
      fontFace: F.mono, fontSize: 9.5, bold: true, color: C.blueDark
    });

    const testRows = [
      { id: 'TC-01', desc: 'GitHub OAuth token exchange and public repo synchronization', status: 'PASSED', srs: 'FR-001, FR-042' },
      { id: 'TC-02', desc: 'Client-side ZIP extraction, binary file filtering, and path traversal protection', status: 'PASSED', srs: 'FR-041, FR-045' },
      { id: 'TC-03', desc: 'Concurrent multi-agent execution pipeline under <60s SLA threshold', status: 'PASSED', srs: 'FR-071, FR-076' },
      { id: 'TC-04', desc: 'OWASP A03 SQL injection static pattern match and parameterized diff generation', status: 'PASSED', srs: 'FR-171, FR-191' },
      { id: 'TC-05', desc: 'RAG Terminal AI context retrieval and line-number citation precision', status: 'PASSED', srs: 'FR-121, FR-124' },
      { id: 'TC-06', desc: 'Certified institutional PDF report export with score breakdown and faculty signature', status: 'PASSED', srs: 'FR-211, FR-213' }
    ];

    testRows.forEach((tr, i) => {
      const ry = 3.95 + i * 0.45;
      slide.addText(tr.id, {
        x: 0.8, y: ry, w: 0.9, h: 0.35,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: C.headerNavy
      });
      slide.addText(tr.desc, {
        x: 1.8, y: ry, w: 7.2, h: 0.35,
        fontFace: F.body, fontSize: 8.5, color: C.slateText
      });
      slide.addText(tr.status, {
        x: 9.2, y: ry, w: 1.2, h: 0.35,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: C.greenText
      });
      slide.addText(tr.srs, {
        x: 10.6, y: ry, w: 1.9, h: 0.35,
        fontFace: F.mono, fontSize: 8.5, color: C.subText
      });
    });
  }

  // SLIDE 28: COMPARATIVE ANALYSIS & VALUE PROP
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '27', 'Market Analysis', 'Competitive Analysis: CodePilot AI vs. Alternatives', 'How CodePilot AI bridges the divide between cold CLI linters and generic conversational LLMs.');

    const comparisons = [
      {
        feature: 'Multi-File AST Context',
        codepilot: '✔ Native AST parsing across all files',
        sonar: '✔ Deep AST analysis',
        copilot: '⚠ Single file / active buffer only',
        manual: '⚠ Highly time-constrained'
      },
      {
        feature: 'Constructive Principle Explanations',
        codepilot: '✔ Senior engineer pedagogical explanations',
        sonar: '❌ Cold rule error messages only',
        copilot: '⚠ Generic advice if prompted',
        manual: '✔ Quality feedback, but delayed'
      },
      {
        feature: 'OWASP Top 10 Static Audit',
        codepilot: '✔ Mapped to OWASP A01, A03, A05, A07',
        sonar: '✔ Strong vulnerability rules',
        copilot: '❌ Unreliable / hallucinated',
        manual: '⚠ Inconsistent coverage'
      },
      {
        feature: 'Interactive Diffs & One-Click Fixes',
        codepilot: '✔ Unified side-by-side before/after diffs',
        sonar: '❌ Rule docs without custom code diffs',
        copilot: '✔ Inline suggestion code',
        manual: '❌ Requires manual code markup'
      },
      {
        feature: 'Grounded Terminal AI Chat',
        codepilot: '✔ RAG grounded with exact code citations',
        sonar: '❌ No interactive Q&A assistant',
        copilot: '⚠ Chat not anchored to PRD rubric',
        manual: '❌ Not applicable'
      },
      {
        feature: 'Faculty Governance & Certified PDFs',
        codepilot: '✔ Unified roster, grading & certified PDF',
        sonar: '❌ Enterprise DevOps only, not academic',
        copilot: '❌ No classroom evaluation suite',
        manual: '✔ Manual rubric grading sheets'
      }
    ];

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.6, y: 1.5, w: 12.13, h: 0.6,
      fill: { color: C.darkCanvas }
    });
    slide.addText('EVALUATION DIMENSION', { x: 0.8, y: 1.6, w: 3.0, h: 0.4, fontFace: F.mono, fontSize: 9, bold: true, color: '38BDF8' });
    slide.addText('CODEPILOT AI', { x: 3.9, y: 1.6, w: 2.8, h: 0.4, fontFace: F.mono, fontSize: 9, bold: true, color: '4ADE80' });
    slide.addText('SONARQUBE / ESLINT', { x: 6.8, y: 1.6, w: 2.5, h: 0.4, fontFace: F.mono, fontSize: 9, bold: true, color: 'CBD5E1' });
    slide.addText('GITHUB COPILOT', { x: 9.4, y: 1.6, w: 2.2, h: 0.4, fontFace: F.mono, fontSize: 9, bold: true, color: 'CBD5E1' });
    slide.addText('MANUAL LAB', { x: 11.5, y: 1.6, w: 1.2, h: 0.4, fontFace: F.mono, fontSize: 9, bold: true, color: 'CBD5E1' });

    comparisons.forEach((row, i) => {
      const ry = 2.15 + i * 0.82;
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0.6, y: ry, w: 12.13, h: 0.78,
        fill: { color: i % 2 === 0 ? C.white : C.slateFill },
        line: { color: C.borderMuted, width: 0.8 }
      });

      slide.addText(row.feature, { x: 0.8, y: ry + 0.12, w: 3.0, h: 0.55, fontFace: F.title, fontSize: 10, bold: true, color: C.headerNavy });
      slide.addText(row.codepilot, { x: 3.9, y: ry + 0.12, w: 2.8, h: 0.55, fontFace: F.body, fontSize: 8.8, bold: true, color: C.greenText });
      slide.addText(row.sonar, { x: 6.8, y: ry + 0.12, w: 2.5, h: 0.55, fontFace: F.body, fontSize: 8.5, color: C.slateText });
      slide.addText(row.copilot, { x: 9.4, y: ry + 0.12, w: 2.0, h: 0.55, fontFace: F.body, fontSize: 8.5, color: C.slateText });
      slide.addText(row.manual, { x: 11.5, y: ry + 0.12, w: 1.2, h: 0.55, fontFace: F.body, fontSize: 8.5, color: C.slateText });
    });
  }

  // SLIDE 29: FUTURE SCOPE & ROADMAP
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.slideBg };
    addHeader(slide, '28', 'Future Roadmap', 'Production Milestones & Future Engineering Roadmap', 'Strategic roadmap for scaling CodePilot AI across broader academic and enterprise ecosystems.');

    const roadmaps = [
      {
        phase: 'PHASE 1 (COMPLETED)',
        title: 'Core Engine & Academic Defense',
        items: [
          'Dual student and faculty authentication with GitHub OAuth and GoTrue',
          'Multi-agent concurrent AST review engine operating in under 40 seconds',
          'OWASP Top 10 static audit, secret leakage detection, and senior code diffs',
          'RAG Terminal AI code chat, mock viva simulator, and certified PDF export'
        ],
        color: C.greenBorder, fill: C.greenFill, text: C.greenText
      },
      {
        phase: 'PHASE 2 (NEXT RELEASE)',
        title: 'CI/CD & Automated Pull Request Bot',
        items: [
          'GitHub Action bot auto-commenting AST findings directly on PR lines',
          'Automated re-review webhook on every push commit with diff delta scoring',
          'Plagiarism & cross-student AST token clone similarity detection',
          'Expanded language AST parsers for Python (PyAST), Java, and C++'
        ],
        color: C.blueBorder, fill: C.blueFill, text: C.blueText
      },
      {
        phase: 'PHASE 3 (LONG-TERM ROADMAP)',
        title: 'IDE Extensions & Private Campus LLMs',
        items: [
          'VS Code & JetBrains IDE extensions for real-time pedagogical feedback',
          'Fine-tuned on-premise open-weights LLMs running on campus server clusters',
          'Automated institutional gradebook LMS integrations (Moodle, Canvas, Blackboard)',
          'Docker container and Kubernetes manifest security & misconfiguration scans'
        ],
        color: C.purpleBorder, fill: C.purpleFill, text: C.purpleText
      }
    ];

    roadmaps.forEach((rm, idx) => {
      const posX = 0.6 + idx * 4.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.5, w: 3.85, h: 5.4,
        fill: { color: C.white },
        line: { color: rm.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 2, angle: 90, opacity: 0.25 }
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX + 0.2, y: 1.7, w: 3.45, h: 0.35,
        fill: { color: rm.fill },
        line: { color: rm.color, width: 1 }
      });
      slide.addText(rm.phase, {
        x: posX + 0.2, y: 1.7, w: 3.45, h: 0.35,
        fontFace: F.mono, fontSize: 8.5, bold: true, color: rm.text, align: 'center', valign: 'middle'
      });

      slide.addText(rm.title, {
        x: posX + 0.2, y: 2.2, w: 3.45, h: 0.5,
        fontFace: F.title, fontSize: 13, bold: true, color: C.headerNavy
      });

      rm.items.forEach((item, ii) => {
        slide.addText(`✔  ${item}`, {
          x: posX + 0.2, y: 2.85 + ii * 0.9, w: 3.45, h: 0.8,
          fontFace: F.body, fontSize: 8.8, color: C.slateText, lineSpacing: 12
        });
      });
    });
  }

  // SLIDE 30: CONCLUSION & DEFENSE Q&A (Dark Hero)
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.darkCanvas };

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0, y: 0, w: 13.33, h: 0.15,
      fill: { color: '3B82F6' }
    });

    slide.addText('PROJECT DEFENSE CONCLUSION & ROADMAP', {
      x: 0.8, y: 0.55, w: 11.0, h: 0.35,
      fontFace: F.mono, fontSize: 11, bold: true, color: '38BDF8'
    });

    slide.addText('Summary of Engineering Achievements & Defense Sign-Off', {
      x: 0.8, y: 0.88, w: 11.0, h: 0.55,
      fontFace: F.title, fontSize: 24, bold: true, color: 'FFFFFF'
    });

    const highlights = [
      {
        title: 'Production-Ready Engineering',
        items: [
          'Clean Next.js 14 App Router architecture with strict TypeScript typing',
          'PKCE verifier OAuth cookie flow eliminating race conditions',
          'Zero hardcoded personal or institutional data across the codebase',
          'Deterministic OWASP pattern detection with senior engineer diffs'
        ]
      },
      {
        title: 'Academic & Institutional Impact',
        items: [
          'Estimated 75% reduction in faculty manual grading overhead',
          'Instant, constructive architectural feedback for student developers',
          'Prevents critical OWASP vulnerabilities from reaching production',
          'Standardizes software engineering lab evaluations across cohorts'
        ]
      },
      {
        title: 'Complete UML 2.5 Architecture',
        items: [
          '11 complete UML diagrams specified to IEEE/ISO 19505 standards',
          'Use Case, Class, Package, Deployment, Component, and Composite Structure',
          'State Machine, Activity, Sequence, Communication, and Interaction Overview',
          'High-resolution vector assets embedded in presentation deck'
        ]
      }
    ];

    highlights.forEach((h, i) => {
      const posX = 0.8 + i * 3.95;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 1.6, w: 3.75, h: 3.65,
        fill: { color: C.darkCard },
        line: { color: C.cardBorder, width: 1 }
      });

      slide.addText(h.title, {
        x: posX + 0.2, y: 1.8, w: 3.35, h: 0.4,
        fontFace: F.title, fontSize: 12.5, bold: true, color: 'FFFFFF'
      });

      h.items.forEach((item, ii) => {
        slide.addText(`✓  ${item}`, {
          x: posX + 0.2, y: 2.3 + ii * 0.68, w: 3.35, h: 0.62,
          fontFace: F.body, fontSize: 8.8, color: 'CBD5E1', lineSpacing: 12
        });
      });
    });

    // TEAM SIGN-OFF CARD
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 5.4, w: 11.65, h: 1.65,
      fill: { color: '162238' },
      line: { color: '38BDF8', width: 1.5 },
      shadow: { type: 'outer', color: '000000', blur: 8, offset: 2, angle: 90, opacity: 0.4 }
    });

    slide.addText('🎓 Open for Technical Defense & Questions', {
      x: 1.0, y: 5.5, w: 11.25, h: 0.35,
      fontFace: F.title, fontSize: 14, bold: true, color: 'FFFFFF', align: 'center'
    });

    slide.addText('Project Team:  Aman Mahadik: 202502100006 (Team Leader)  •  Sairaj Patil: 202502100009  •  Yogesh Gore: 202502100001\nDepartment of Computer Science & Engineering • Academic Year 2025–2026\nThank you, Respected Evaluators and Faculty Members.', {
      x: 1.0, y: 5.9, w: 11.25, h: 1.05,
      fontFace: F.body, fontSize: 9.5, color: '38BDF8', align: 'center', lineSpacing: 15
    });
  }

  // File Paths
  const masterFile = path.resolve(__dirname, '../CodePilot_AI_Master_Project_Presentation.pptx');
  const artifactFile = path.resolve('C:/Users/Saira/.gemini/antigravity/brain/7172497b-6c4e-4870-8da9-1c5f2831d772/CodePilot_AI_Master_Project_Presentation.pptx');

  console.log(`Writing Master Presentation to: ${masterFile}...`);
  await pptx.writeFile({ fileName: masterFile });

  console.log(`Copying to artifact directory: ${artifactFile}...`);
  fs.copyFileSync(masterFile, artifactFile);

  console.log('🎉 30-Slide Ultimate Master Presentation generated successfully with ALL 11 UML diagrams!');
}

generateUltimateMasterPresentation().catch((err) => {
  console.error('Error in master presentation generator:', err);
  process.exit(1);
});
