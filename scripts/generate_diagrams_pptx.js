const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

async function createDiagramsPresentation() {
  console.log('Initializing CodePilot AI Presentation Generator...');
  const pptx = new pptxgen();

  // Configure 16:9 widescreen layout
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'CodePilot AI — UML & System Architecture Portfolio';
  pptx.subject = 'Software Engineering UML & Architectural Diagrams';
  pptx.author = 'CodePilot AI Engineering Team';
  pptx.company = 'Department of Computer Science & Engineering';

  // Lucidchart Theme Colors
  const COLORS = {
    canvasBg: '090D16',       // Deep Dark Navy
    slideBg: 'F8FAFC',        // Lucidchart Clean Slate Canvas
    headerNavy: '0F172A',     // Primary Slate 900
    subText: '64748B',        // Muted Slate 500
    borderMuted: 'E2E8F0',    // Slate 200 Border
    borderStrong: 'CBD5E1',   // Slate 300
    
    // Lucidchart Card Types
    blueFill: 'EFF6FF',
    blueBorder: '3B82F6',
    blueText: '1E40AF',
    blueDark: '1D4ED8',

    greenFill: 'F0FDF4',
    greenBorder: '22C55E',
    greenText: '166534',
    greenDark: '15803D',

    amberFill: 'FFFBEB',
    amberBorder: 'F59E0B',
    amberText: '92400E',
    amberDark: 'B45309',

    purpleFill: 'FAF5FF',
    purpleBorder: 'A855F7',
    purpleText: '6B21A8',
    purpleDark: '7E22CE',

    roseFill: 'FFF1F2',
    roseBorder: 'F43F5E',
    roseText: '9F1239',

    slateFill: 'F1F5F9',
    slateBorder: '94A3B8',
    slateText: '334155',

    white: 'FFFFFF',
    darkCard: '101625',
    cardBorder: '1E293B',
    accentCyan: '38BDF8',
    accentGreen: '4ADE80'
  };

  const FONTS = {
    title: 'Segoe UI',
    body: 'Segoe UI',
    mono: 'Consolas'
  };

  const logoPath = path.resolve('c:/CodePilotAI/public/logo.png');
  const hasLogo = fs.existsSync(logoPath);

  // Helper for diagram slide headers
  function addSlideHeader(slide, number, category, title, description) {
    // Header Bar
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.5, y: 0.35, w: 12.33, h: 0.85,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderMuted, width: 1 },
      shadow: { type: 'outer', color: 'CBD5E1', blur: 3, offset: 1, angle: 90, opacity: 0.25 }
    });

    // Category Pill
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.7, y: 0.47, w: 1.8, h: 0.24,
      fill: { color: COLORS.blueFill },
      line: { color: COLORS.blueBorder, width: 1 }
    });
    slide.addText(category.toUpperCase(), {
      x: 0.7, y: 0.47, w: 1.8, h: 0.24,
      fontFace: FONTS.mono, fontSize: 8.5, bold: true, color: COLORS.blueText, align: 'center', valign: 'middle'
    });

    // Title
    slide.addText(`${number}. ${title}`, {
      x: 2.65, y: 0.42, w: 7.2, h: 0.35,
      fontFace: FONTS.title, fontSize: 16, bold: true, color: COLORS.headerNavy, valign: 'middle'
    });

    // Subtitle
    slide.addText(description, {
      x: 2.65, y: 0.75, w: 7.5, h: 0.35,
      fontFace: FONTS.body, fontSize: 10, color: COLORS.subText, valign: 'top'
    });

    // Lucidchart Compliance Badge
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 10.4, y: 0.47, w: 2.2, h: 0.24,
      fill: { color: COLORS.slateFill },
      line: { color: COLORS.slateBorder, width: 1 }
    });
    slide.addText('LUCIDCHART UML 2.5', {
      x: 10.4, y: 0.47, w: 2.2, h: 0.24,
      fontFace: FONTS.mono, fontSize: 8, bold: true, color: COLORS.slateText, align: 'center', valign: 'middle'
    });
  }

  // ==========================================
  // SLIDE 1: COVER SLIDE (Lucid Dark Hero)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.canvasBg };

    // Background accents
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0, y: 0, w: 13.33, h: 0.15,
      fill: { color: '3B82F6' }
    });

    // Logo
    if (hasLogo) {
      slide.addImage({
        path: logoPath,
        x: 1.2, y: 1.4, w: 1.6, h: 1.6
      });
    }

    // Title & Badges
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 3.1, y: 1.4, w: 3.6, h: 0.32,
      fill: { color: '162238' },
      line: { color: '38BDF8', width: 1 }
    });
    slide.addText('AUTONOMOUS AI SOFTWARE ASSISTANT', {
      x: 3.1, y: 1.4, w: 3.6, h: 0.32,
      fontFace: FONTS.mono, fontSize: 9.5, bold: true, color: '38BDF8', align: 'center', valign: 'middle'
    });

    slide.addText('CodePilot AI', {
      x: 3.0, y: 1.8, w: 9.0, h: 0.9,
      fontFace: FONTS.title, fontSize: 38, bold: true, color: 'FFFFFF'
    });

    slide.addText('Comprehensive UML & System Architecture Portfolio', {
      x: 3.1, y: 2.7, w: 9.0, h: 0.4,
      fontFace: FONTS.title, fontSize: 18, color: '94A3B8'
    });

    slide.addText('Complete suite of 10 formal diagrams modeled to Lucidchart & IEEE / ISO 19505 standards for Autonomous Code Review, Multi-Agent AST Ingestion, OWASP Security Auditing, and Academic Faculty Governance.', {
      x: 3.1, y: 3.2, w: 8.8, h: 0.8,
      fontFace: FONTS.body, fontSize: 11.5, color: 'CBD5E1', lineSpacing: 16
    });

    // 4 Metric / Feature Cards at Bottom
    const features = [
      { num: '10', label: 'UML & System Diagrams', sub: 'Behavioral & Structural' },
      { num: '4', label: 'AI Review Agents', sub: 'Quality, Security, Docs, Repo' },
      { num: 'OWASP', label: 'Top 10 Static Audit', sub: 'CWE & Injection Detection' },
      { num: 'Dual-Role', label: 'Student & Faculty Portal', sub: 'GitHub OAuth + Email Auth' }
    ];

    features.forEach((feat, idx) => {
      const posX = 1.2 + idx * 2.8;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: posX, y: 4.4, w: 2.6, h: 1.8,
        fill: { color: COLORS.darkCard },
        line: { color: COLORS.cardBorder, width: 1 },
        shadow: { type: 'outer', color: '000000', blur: 6, offset: 2, angle: 90, opacity: 0.4 }
      });

      slide.addText(feat.num, {
        x: posX, y: 4.6, w: 2.6, h: 0.5,
        fontFace: FONTS.title, fontSize: 22, bold: true, color: '38BDF8', align: 'center'
      });
      slide.addText(feat.label, {
        x: posX, y: 5.15, w: 2.6, h: 0.4,
        fontFace: FONTS.title, fontSize: 11, bold: true, color: 'FFFFFF', align: 'center'
      });
      slide.addText(feat.sub, {
        x: posX, y: 5.5, w: 2.6, h: 0.4,
        fontFace: FONTS.body, fontSize: 9.5, color: '94A3B8', align: 'center'
      });
    });

    // Footer info
    slide.addText('CodePilot AI Engineering Platform • Version v1.0.0-production • Academic Lab Architecture', {
      x: 1.2, y: 6.7, w: 10.9, h: 0.3,
      fontFace: FONTS.mono, fontSize: 9, color: '64748B'
    });
  }

  // ==========================================
  // SLIDE 2: EXECUTIVE ARCHITECTURE BLUEPRINT
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.slideBg };
    addSlideHeader(slide, 'ARCH', 'System Architecture', 'High-Level System Blueprint & Multi-Tier Topology', 'End-to-end architectural flow connecting users, Next.js frontend, AI agent ensemble, and backend persistence.');

    // 4 Vertical Tiers
    const tiers = [
      {
        title: 'CLIENT TIER',
        color: COLORS.blueBorder,
        fill: COLORS.blueFill,
        textColor: COLORS.blueText,
        x: 0.6,
        items: [
          { title: 'Student Portal (GitHub OAuth)', desc: 'Repo sync, manual handle connect, zip upload dropzone' },
          { title: 'Faculty Portal (Email/Pass)', desc: 'Cohort roster oversight, class defect analytics & grading' },
          { title: 'Interactive Review UI', desc: 'Diff views, senior fix suggestions, health metric cards' },
          { title: 'Terminal AI & Simulator', desc: 'Context-grounded assistant & viva defense practice' }
        ]
      },
      {
        title: 'APPLICATION TIER',
        color: COLORS.purpleBorder,
        fill: COLORS.purpleFill,
        textColor: COLORS.purpleText,
        x: 3.65,
        items: [
          { title: 'Next.js 14 App Router', desc: 'Hybrid SSR & client views with responsive landscape layout' },
          { title: 'Ingestion & Validation Engine', desc: 'JSZip extraction, exclusion rules (.git, node_modules)' },
          { title: 'AST & Language Parser', desc: 'Distribution analyzer (TypeScript, JS, Java, Python)' },
          { title: 'PKCE Session Manager', desc: '@supabase/ssr singleton cookie client for robust auth' }
        ]
      },
      {
        title: 'AI AGENT ENSEMBLE',
        color: COLORS.amberBorder,
        fill: COLORS.amberFill,
        textColor: COLORS.amberText,
        x: 6.7,
        items: [
          { title: 'Repository Ingestion Agent', desc: 'File discovery, tree structure indexing & filtering' },
          { title: 'Quality & Clean Code Agent', desc: 'Linting, complexity evaluation, unbounded query audit' },
          { title: 'Security Agent (OWASP)', desc: 'SQL injection (A03), broken auth (A01), secret detection' },
          { title: 'Documentation & Fix Agent', desc: 'Senior engineer explanations & copyable git patch diffs' }
        ]
      },
      {
        title: 'DATA & STORAGE TIER',
        color: COLORS.greenBorder,
        fill: COLORS.greenFill,
        textColor: COLORS.greenText,
        x: 9.75,
        items: [
          { title: 'Supabase PostgreSQL DB', desc: 'Tables: repositories, reviews, findings, faculty rosters' },
          { title: 'GoTrue Auth Service', desc: 'Role-based JWT claims (student vs faculty evaluator)' },
          { title: 'GitHub Cloud REST API', desc: 'OAuth token auth & public user repositories endpoints' },
          { title: 'Client LocalStorage Cache', desc: 'Sub-second page transitions & offline demo fallback' }
        ]
      }
    ];

    tiers.forEach((tier) => {
      // Tier Container
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: tier.x, y: 1.45, w: 2.9, h: 5.3,
        fill: { color: COLORS.white },
        line: { color: tier.color, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 4, offset: 1, angle: 90, opacity: 0.3 }
      });

      // Tier Header
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: tier.x, y: 1.45, w: 2.9, h: 0.5,
        fill: { color: tier.fill },
        line: { color: tier.color, width: 1 }
      });
      slide.addText(tier.title, {
        x: tier.x, y: 1.45, w: 2.9, h: 0.5,
        fontFace: FONTS.title, fontSize: 11, bold: true, color: tier.textColor, align: 'center', valign: 'middle'
      });

      // Cards inside Tier
      tier.items.forEach((item, i) => {
        const itemY = 2.15 + i * 1.15;
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: tier.x + 0.15, y: itemY, w: 2.6, h: 1.0,
          fill: { color: COLORS.slateFill },
          line: { color: COLORS.borderMuted, width: 1 }
        });

        slide.addText(item.title, {
          x: tier.x + 0.25, y: itemY + 0.08, w: 2.4, h: 0.35,
          fontFace: FONTS.title, fontSize: 9.5, bold: true, color: COLORS.headerNavy
        });
        slide.addText(item.desc, {
          x: tier.x + 0.25, y: itemY + 0.42, w: 2.4, h: 0.52,
          fontFace: FONTS.body, fontSize: 8.5, color: COLORS.subText, lineSpacing: 11
        });
      });
    });

    // Connecting arrows between tiers
    [3.52, 6.57, 9.62].forEach((arrowX) => {
      slide.addShape(pptx.shapes.RIGHT_ARROW, {
        x: arrowX, y: 3.8, w: 0.16, h: 0.28,
        fill: { color: COLORS.blueBorder },
        line: { color: COLORS.blueBorder }
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
  // SLIDE 13: TECHNICAL ARCHITECTURE MATRIX
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.slideBg };
    addSlideHeader(slide, 'SUMMARY', 'Architectural Specification', 'Technical Architecture & Compliance Matrix', 'Comprehensive reference matrix mapping software layers, design patterns, and IEEE standards.');

    const matrixRows = [
      [
        { text: 'Layer / Subsystem', options: { bold: true, color: COLORS.white, fill: { color: COLORS.headerNavy } } },
        { text: 'Primary Technologies', options: { bold: true, color: COLORS.white, fill: { color: COLORS.headerNavy } } },
        { text: 'Design Patterns', options: { bold: true, color: COLORS.white, fill: { color: COLORS.headerNavy } } },
        { text: 'IEEE / Security Standards', options: { bold: true, color: COLORS.white, fill: { color: COLORS.headerNavy } } },
        { text: 'Key Architectural Benefit', options: { bold: true, color: COLORS.white, fill: { color: COLORS.headerNavy } } }
      ],
      [
        { text: 'Presentation UI', options: { bold: true, color: COLORS.blueDark } },
        { text: 'Next.js 14, React 18, Tailwind CSS, Lucide Icons' },
        { text: 'App Router, Component Composite, Context Observer' },
        { text: 'WCAG 2.1 AA, Responsive Landscape' },
        { text: 'Zero layout shift, instant client transitions' }
      ],
      [
        { text: 'Identity & Access', options: { bold: true, color: COLORS.greenDark } },
        { text: '@supabase/ssr v0.5.2, GoTrue, GitHub OAuth2' },
        { text: 'Singleton Client, PKCE Verifier Cookie Jar' },
        { text: 'RFC 7636 (PKCE), OAuth2 Scopes' },
        { text: 'Prevents code verifier race conditions on localhost' }
      ],
      [
        { text: 'Analysis Engine', options: { bold: true, color: COLORS.purpleDark } },
        { text: 'Multi-Agent Ensemble, JSZip, AST Parser' },
        { text: 'Pipe-and-Filter, Strategy, Blackboard, Orchestrator' },
        { text: 'ISO/IEC 25010 Software Quality' },
        { text: 'Parallel 42s review SLA, sub-minute turnaround' }
      ],
      [
        { text: 'Security Audit', options: { bold: true, color: COLORS.roseText } },
        { text: 'Static Rule Matcher, CWE Knowledge Base' },
        { text: 'Visitor Pattern, Rule-Based Expert System' },
        { text: 'OWASP Top 10 (A01, A03), CWE-89, CWE-79' },
        { text: 'Deterministic vulnerability detection + Git diff fixes' }
      ],
      [
        { text: 'Persistence Tier', options: { bold: true, color: COLORS.amberDark } },
        { text: 'PostgreSQL 15, PostgREST, LocalStorage Cache' },
        { text: 'Repository Pattern, Unit of Work, Read-Through Cache' },
        { text: 'ACID Transactions, Row Level Security' },
        { text: 'Dual fallback: cloud Postgres + offline demo preview' }
      ],
      [
        { text: 'Faculty Portal', options: { bold: true, color: COLORS.headerNavy } },
        { text: 'Cohort Roster Filter, Defect Analytics Grid' },
        { text: 'Observer, MVC View Controller' },
        { text: 'FERPA / Student Academic Privacy' },
        { text: 'Automated defect aggregation & batch assignment grading' }
      ]
    ];

    slide.addTable(matrixRows, {
      x: 0.6, y: 1.5, w: 12.13, h: 4.8,
      fontFace: FONTS.body, fontSize: 8.5,
      border: { color: COLORS.borderMuted, width: 1 },
      align: 'left', valign: 'middle',
      rowH: [0.45, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7]
    });
  }

  const outputPath = path.resolve('c:/CodePilotAI/CodePilot_AI_UML_Architecture_Diagrams.pptx');
  const artifactPath = path.resolve('C:/Users/PC/.gemini/antigravity/brain/30c4d184-1794-44e5-858e-0bb91893d91c/CodePilot_AI_UML_Architecture_Diagrams.pptx');

  console.log(`Writing presentation to ${outputPath}...`);
  await pptx.writeFile({ fileName: outputPath });

  console.log(`Copying presentation to artifacts directory ${artifactPath}...`);
  fs.copyFileSync(outputPath, artifactPath);

  console.log('✅ Presentation generated successfully in both locations!');
}

createDiagramsPresentation().catch((err) => {
  console.error('Failed to generate presentation:', err);
  process.exit(1);
});
