import os
import shutil
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    HRFlowable,
    KeepTogether,
)

PROJECT_DIR = r"d:\Sairaj_Space\Programming_languages\Projects\CodePilotAI"
OUTPUT_PDF = os.path.join(PROJECT_DIR, "CodePilot_AI_Presentation_Script.pdf")
ARTIFACT_PDF = r"C:\Users\Saira\.gemini\antigravity\brain\7172497b-6c4e-4870-8da9-1c5f2831d772\CodePilot_AI_Presentation_Script.pdf"

# Color Palette (Clean Light Print-Friendly Theme)
NAVY = colors.HexColor("#0F172A")
SLATE = colors.HexColor("#334155")
MUTED = colors.HexColor("#64748B")
BORDER = colors.HexColor("#CBD5E1")
BG_LIGHT = colors.HexColor("#F8FAFC")
BG_CUE = colors.HexColor("#EFF6FF")
BORDER_CUE = colors.HexColor("#93C5FD")

# Speaker Colors
AMAN_COLOR = colors.HexColor("#1E40AF")   # Blue / Indigo
AMAN_BG = colors.HexColor("#EFF6FF")
SAIRAJ_COLOR = colors.HexColor("#065F46") # Emerald
SAIRAJ_BG = colors.HexColor("#ECFDF5")
YOGESH_COLOR = colors.HexColor("#6D28D9") # Purple
YOGESH_BG = colors.HexColor("#F5F3FF")


def add_header_footer(canvas, doc):
    canvas.saveState()
    page_num = canvas.getPageNumber()
    width, height = A4

    if page_num > 1:
        # Top subtle header
        canvas.setFont("Helvetica-Bold", 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(18 * mm, height - 12 * mm, "CODEPILOT AI  |  3-PERSON PRESENTATION SCRIPT & TECHNICAL REFERENCE")
        canvas.setStrokeColor(BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(18 * mm, height - 14.5 * mm, width - 18 * mm, height - 14.5 * mm)

    # Bottom footer
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(18 * mm, 14 * mm, width - 18 * mm, 14 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 9.5 * mm, "Team: Aman Mahadik (202502100006) • Sairaj Patil (202502100009) • Yogesh Gore (202502100001)")
    canvas.drawRightString(width - 18 * mm, 9.5 * mm, f"Page {page_num}")
    canvas.restoreState()


def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        title="CodePilot AI - 3-Person Presentation Script",
        author="Aman Mahadik, Sairaj Patil, Yogesh Gore",
    )

    styles = getSampleStyleSheet()

    # Custom Typography
    s_hero_tag = ParagraphStyle(
        "HeroTag", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9,
        textColor=colors.HexColor("#2563EB"), spaceAfter=4, alignment=TA_LEFT
    )
    s_hero_title = ParagraphStyle(
        "HeroTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=24,
        leading=29, textColor=NAVY, spaceAfter=6, alignment=TA_LEFT
    )
    s_hero_sub = ParagraphStyle(
        "HeroSub", parent=styles["Normal"], fontName="Helvetica", fontSize=11,
        leading=16, textColor=SLATE, spaceAfter=12, alignment=TA_LEFT
    )
    s_h1 = ParagraphStyle(
        "H1", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=14.5,
        leading=19, textColor=NAVY, spaceBefore=14, spaceAfter=6
    )
    s_h2 = ParagraphStyle(
        "H2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11.5,
        leading=15, textColor=colors.HexColor("#1E3A8A"), spaceBefore=10, spaceAfter=4
    )
    s_body = ParagraphStyle(
        "Body", parent=styles["Normal"], fontName="Helvetica", fontSize=9.5,
        leading=14, textColor=SLATE, spaceAfter=5, alignment=TA_JUSTIFY
    )
    s_bullet = ParagraphStyle(
        "Bullet", parent=styles["Normal"], fontName="Helvetica", fontSize=9.3,
        leading=13.5, textColor=SLATE, leftIndent=12, spaceAfter=3.5
    )
    s_cue = ParagraphStyle(
        "Cue", parent=styles["Normal"], fontName="Helvetica-BoldOblique", fontSize=8.5,
        leading=12, textColor=colors.HexColor("#1D4ED8")
    )
    s_tbl_hdr = ParagraphStyle(
        "TblHdr", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.5,
        leading=11, textColor=colors.white
    )
    s_tbl_cell = ParagraphStyle(
        "TblCell", parent=styles["Normal"], fontName="Helvetica", fontSize=8.5,
        leading=11.5, textColor=SLATE
    )

    def make_speaker_block(speaker_key, act_label, spoken_paragraphs):
        if speaker_key == "AMAN":
            name = "AMAN MAHADIK  •  Team Leader (202502100006)"
            accent = AMAN_COLOR
            bg = AMAN_BG
        elif speaker_key == "SAIRAJ":
            name = "SAIRAJ PATIL  •  Core Engine & RAG Lead (202502100009)"
            accent = SAIRAJ_COLOR
            bg = SAIRAJ_BG
        else:
            name = "YOGESH GORE  •  Workflow, UI & Viva Systems (202502100001)"
            accent = YOGESH_COLOR
            bg = YOGESH_BG

        s_spk = ParagraphStyle(
            f"Spk_{speaker_key}", parent=styles["Normal"], fontName="Helvetica-Bold",
            fontSize=9, leading=12, textColor=accent
        )
        s_act = ParagraphStyle(
            f"Act_{speaker_key}", parent=styles["Normal"], fontName="Helvetica-Bold",
            fontSize=8, leading=11, textColor=MUTED, alignment=TA_LEFT
        )
        s_dialogue = ParagraphStyle(
            f"Dlg_{speaker_key}", parent=styles["Normal"], fontName="Helvetica",
            fontSize=9.6, leading=14.2, textColor=NAVY, spaceAfter=5, alignment=TA_LEFT
        )

        inner_flowables = [
            Paragraph(name, s_spk),
            Paragraph(act_label, s_act),
            Spacer(1, 3),
        ]
        for p in spoken_paragraphs:
            inner_flowables.append(Paragraph(p, s_dialogue))

        tbl = Table([[inner_flowables]], colWidths=[174 * mm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), bg),
            ("LINEBEFORE", (0, 0), (0, -1), 3.5, accent),
            ("BOX", (0, 0), (-1, -1), 0.4, BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ]))
        return tbl

    def make_cue_box(text):
        tbl = Table([[Paragraph(text, s_cue)]], colWidths=[174 * mm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BG_CUE),
            ("BOX", (0, 0), (-1, -1), 0.6, BORDER_CUE),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        return tbl

    def styled_table(headers, rows, col_widths):
        data = [[Paragraph(h, s_tbl_hdr) for h in headers]]
        for r in rows:
            data.append([Paragraph(c, s_tbl_cell) for c in r])
        t = Table(data, colWidths=col_widths, repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
            ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ]))
        return t

    story = []

    # =========================================================================
    # PAGE 1: COVER & PRESENTATION OVERVIEW
    # =========================================================================
    story.append(Paragraph("COMPLETE PROJECT DEFENSE & PRESENTATION SCRIPT", s_hero_tag))
    story.append(Paragraph("CodePilot AI", s_hero_title))
    story.append(Paragraph(
        "Autonomous Multi-Agent Code Review, OWASP Security Auditing, Repository-Grounded RAG Assistant & Academic Viva Platform",
        s_hero_sub
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=NAVY, spaceAfter=10))

    # Team & Role Assignment Table
    story.append(Paragraph("1. Presenter Team & Speaking Division (~12–15 Minutes Total)", s_h1))
    story.append(styled_table(
        ["Presenter", "PRN / Roll No.", "Role", "Assigned Presentation Sections"],
        [
            ["<b>Aman Mahadik</b>", "202502100006", "Team Leader",
             "Introduction, Problem Statement, Objectives, Dual User Personas, System Architecture, Live Demo Opening & Conclusion / Q&A"],
            ["<b>Sairaj Patil</b>", "202502100009", "Core Engine & RAG Lead",
             "Functional & Non-Functional Requirements, Multi-Agent Static Analysis Engine (AST, OWASP Top 10, Secrets), Dynamic Scoring & Repository-Grounded RAG Engine"],
            ["<b>Yogesh Gore</b>", "202502100001", "Workflow, UI & Viva Lead",
             "End-to-End Project Workflow, UML Architecture Summary, Universal GitHub Auth, Terminal AI Chat, Dynamic Viva Simulator, Faculty Dashboard & PDF Reports"],
        ],
        [34 * mm, 28 * mm, 36 * mm, 76 * mm]
    ))
    story.append(Spacer(1, 8))

    # Project Objectives
    story.append(Paragraph("2. Core Project Objectives", s_h1))
    objectives = [
        "<b>Automate Multi-Dimensional Code Review:</b> Replace manual, subjective code checks with a deterministic 4-agent pipeline (AST, OWASP Security, Code Quality, Documentation & Testing).",
        "<b>Eliminate Security Blind Spots Early:</b> Detect OWASP Top 10 vulnerabilities (SQL Injection, XSS, Command Injection, Unsafe Eval, Weak PRNG, TLS bypass) and hardcoded secrets before deployment.",
        "<b>Provide Repository-Grounded RAG Assistance:</b> Enable developers and students to query their exact codebase using TF-IDF & symbol retrieval with line-level file citations.",
        "<b>Bridge Academic Evaluation & Engineering Rigor:</b> Equip faculty with cohort oversight, automated grading rubrics, and a dynamic Technical Viva Simulator tailored to each student's actual code.",
        "<b>Universal Accessibility:</b> Allow any GitHub user or local ZIP uploader to authenticate, ingest repositories in real time, and export certified institutional audit reports.",
    ]
    for idx, obj in enumerate(objectives, 1):
        story.append(Paragraph(f"<b>O{idx}.</b> {obj}", s_bullet))

    story.append(Spacer(1, 6))

    # Functional Requirements
    story.append(Paragraph("3. Functional Requirements (FR)", s_h1))
    story.append(styled_table(
        ["ID", "Requirement", "Implemented Behavior in CodePilot AI"],
        [
            ["<b>FR-01</b>", "Universal GitHub Auth & Role Routing",
             "Supports any GitHub account via OAuth or GitHub username lookup (/auth/login), plus Faculty & Student role separation."],
            ["<b>FR-02</b>", "Dual Repository Ingestion",
             "Unpacks uploaded .zip archives client-side via JSZip and fetches public GitHub repositories via GitHub Tree API + raw.githubusercontent.com."],
            ["<b>FR-03</b>", "Configurable Exclusion Filtering",
             "Filters node_modules/, .git/, dist/, build/, vendor/, and binary assets before AST & pattern analysis."],
            ["<b>FR-04</b>", "Multi-Agent Static Analysis",
             "Runs 4 specialized agents: Repository AST (>500 LOC check), OWASP Security & Secrets, Code Quality, and Documentation/Test Coverage."],
            ["<b>FR-05</b>", "Dynamic Weighted Scoring",
             "Computes Overall (0–100), Security (35%), Quality (25%), Reliability (20%), and Documentation (20%) scores directly from detected findings."],
            ["<b>FR-06</b>", "Repository-Grounded RAG Chat",
             "Chunks source files & findings into RepositoryRagIndex; classifies intent (Overview, Security, Architecture, Code) and cites exact files & line ranges."],
            ["<b>FR-07</b>", "Dynamic Technical Viva Simulator",
             "Generates custom viva questions from the active repository's real findings and evaluates student answers against expected academic concepts."],
            ["<b>FR-08</b>", "Institutional PDF & Faculty Dashboard",
             "Generates exportable institutional audit reports (/report/[id]) and allows faculty to review cohort submissions and assign grades (/faculty)."],
        ],
        [16 * mm, 48 * mm, 110 * mm]
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: NON-FUNCTIONAL REQUIREMENTS, WORKFLOW & IMPLEMENTED FEATURES
    # =========================================================================
    story.append(Paragraph("4. Non-Functional Requirements (NFR)", s_h1))
    story.append(styled_table(
        ["ID", "Quality Attribute", "Engineering Guarantee & Implementation"],
        [
            ["<b>NFR-01</b>", "Performance & Responsiveness",
             "Zero UI thread freezes: eliminated ReDoS backtracking, uses O(1) string slicing for line/snippet resolution, and yields to the event loop between files."],
            ["<b>NFR-02</b>", "Security & Multi-Tenancy",
             "PostgreSQL Row Level Security (RLS) isolates student data from faculty oversight using verified JWT claims; zero hardcoded credentials."],
            ["<b>NFR-03</b>", "Scalability & Bounded Memory",
             "Caps RAG chunking (max 30 chunks/file) and per-rule matches so repositories with 10,000+ LOC analyze in seconds inside the browser."],
            ["<b>NFR-04</b>", "Reliability & Graceful Fallback",
             "Operates seamlessly even without external LLM/GitHub tokens using deterministic AST/regex scanning and local TF-IDF RAG indexing."],
            ["<b>NFR-05</b>", "Usability & Developer UX",
             "Dark-mode terminal aesthetic with Next.js App Router, real-time 4-stage pipeline logs, one-click file explorer, and copyable code fixes."],
            ["<b>NFR-06</b>", "Maintainability & Type Safety",
             "Strict TypeScript interfaces across Review, Finding, Repository, and RagResponse; compiles cleanly with zero tsc errors."],
        ],
        [18 * mm, 44 * mm, 112 * mm]
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("5. End-to-End System Workflow", s_h1))
    story.append(styled_table(
        ["Stage", "Route / Module", "What Happens Under the Hood"],
        [
            ["<b>1. Auth & Connect</b>", "/auth/login\nauth-context.tsx",
             "User signs in via GitHub OAuth, enters any GitHub username (fetches live profile & repos), or selects Faculty Evaluator mode."],
            ["<b>2. Ingestion</b>", "/review/new\nJSZip / GitHub API",
             "Step 01 validates ZIP or queries GitHub Tree API; Step 02 strips excluded folders & binaries; Step 03 computes language distribution."],
            ["<b>3. 4-Agent Scan</b>", "analysis-engine.ts",
             "Step 04 executes AST size checks, OWASP Top 10 & secrets regex rules, quality/async checks, and README/test checks, saving files + Review."],
            ["<b>4. Audit Review</b>", "/review/[id]",
             "Displays weighted scorecards, severity breakdown (Critical/High/Medium/Low), plain-language principles, and suggested fixes."],
            ["<b>5. RAG Chat</b>", "/chat/[id]\nrag-engine.ts",
             "Indexes all authored files + findings. Classifies query intent and returns grounded explanations with file paths, lines, and code snippets."],
            ["<b>6. Viva & Report</b>", "/interview/[id]\n/report/[id]",
             "Generates repository-specific viva questions, evaluates defense answers, syncs faculty grades, and exports institutional PDF audit reports."],
        ],
        [28 * mm, 38 * mm, 108 * mm]
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("6. Key Implemented Features Summary", s_h1))
    features = [
        "<b>Universal GitHub Integration:</b> Dynamic profile lookup & public repository listing for any GitHub handle (no hardcoded single-user lock).",
        "<b>Real Client-Side ZIP & GitHub Fetching:</b> Unpacks real archives with JSZip and fetches live source trees via raw.githubusercontent.com.",
        "<b>ReDoS-Safe OWASP & Quality Scanner:</b> Detects SQLi, XSS, eval(), command injection, weak PRNG, TLS bypass, hardcoded secrets, empty catch blocks, blocking fs I/O, and >500 LOC files.",
        "<b>Intent-Aware RAG Terminal AI:</b> Distinguishes Project Overview, Architecture, Security Finding, and Code Explanation queries with interactive code citations.",
        "<b>Dynamic Technical Viva & Faculty Oversight:</b> Auto-generates defense questions from real findings, scores student responses by concept coverage, and records grades to the faculty roster.",
    ]
    for f in features:
        story.append(Paragraph(f"• {f}", s_bullet))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3+: FULL 3-PERSON SPOKEN PRESENTATION SCRIPT
    # =========================================================================
    story.append(Paragraph("7. Full 3-Person Spoken Presentation Script", s_h1))
    story.append(Paragraph(
        "Tip for Presenters: Speak at a steady, confident pace (~130 words/min). Pause briefly at each <b>[SLIDE CUE]</b> and make eye contact with the panel during <b>[HANDOFF]</b> transitions.",
        s_body
    ))
    story.append(Spacer(1, 4))

    # --- ACT 1: AMAN ---
    story.append(make_cue_box("[SLIDE CUE: Slides 1–3 — Cover Slide, Team Profiles & Executive Vision]"))
    story.append(Spacer(1, 3))
    story.append(make_speaker_block("AMAN", "ACT 1: OPENING, TEAM INTRODUCTION & VISION (~1.5 mins)", [
        "\"Good morning respected faculty members and judges. I am <b>Aman Mahadik</b>, Team Leader, and joining me today are my teammates <b>Sairaj Patil</b> and <b>Yogesh Gore</b>. Together, we have designed and built <b>CodePilot AI</b> — an autonomous multi-agent code review, OWASP security auditing, repository-grounded RAG assistant, and academic viva platform.\"",
        "\"In both software engineering classrooms and modern development teams, there is a critical gap: students and junior developers often ship code without understanding security vulnerabilities, architectural anti-patterns, or how to defend their design choices. Meanwhile, faculty evaluators spend hours manually reading thousands of lines of code across dozens of student repositories without standardized rubrics.\"",
        "\"CodePilot AI solves both sides of this problem. It transforms any GitHub repository or uploaded ZIP archive into a structured, multi-agent engineering audit, provides an interactive RAG assistant grounded in the student's actual source code, and prepares candidates for their technical viva.\""
    ]))
    story.append(Spacer(1, 6))

    # --- ACT 2: AMAN ---
    story.append(make_cue_box("[SLIDE CUE: Slides 4–7 — Problem Statement, Objectives, Personas & System Architecture]"))
    story.append(Spacer(1, 3))
    story.append(make_speaker_block("AMAN", "ACT 2: OBJECTIVES, DUAL PERSONAS & SYSTEM ARCHITECTURE (~1.5 mins)", [
        "\"Our project is driven by five core objectives: First, to automate multi-dimensional code review using specialized agents. Second, to detect OWASP Top 10 vulnerabilities and leaked secrets early. Third, to provide a repository-grounded RAG chat that cites exact files and line numbers. Fourth, to bridge academic evaluation with a dynamic Viva Simulator. And fifth, to make the platform universally accessible to any GitHub user.\"",
        "\"We designed two distinct user personas: <b>Student Developers</b>, who import repos, review findings, chat with Terminal AI, and practice viva defense; and <b>Faculty Evaluators</b>, who oversee cohort submissions, inspect audit scores, and record official viva marks.\"",
        "\"Architecturally, CodePilot AI is built on Next.js 14 App Router with TypeScript and Tailwind CSS on the frontend, paired with Supabase PostgreSQL and Row Level Security for multi-tenant isolation. To explain our exact functional and non-functional requirements and how the core analysis and RAG engines work under the hood, I'll now hand over to <b>Sairaj</b>.\""
    ]))
    story.append(Spacer(1, 6))

    # --- ACT 3: SAIRAJ ---
    story.append(make_cue_box("[SLIDE CUE: Slides 8, 22 & 23 — Multi-Agent Ingestion Pipeline & OWASP Security Rigor]"))
    story.append(Spacer(1, 3))
    story.append(make_speaker_block("SAIRAJ", "ACT 3: FUNCTIONAL & NON-FUNCTIONAL REQUIREMENTS (~1.5 mins)", [
        "\"Thank you, Aman. I will walk through our system requirements and the core analysis and RAG engines.\"",
        "\"On the <b>Functional Requirements</b> side, CodePilot AI supports eight core capabilities: universal GitHub authentication for any user handle, dual repository ingestion from both ZIP archives and live GitHub URLs, configurable folder exclusions, a 4-agent static analysis pipeline, dynamic weighted scoring, repository-grounded RAG chat, a dynamic viva simulator, and institutional PDF report generation.\"",
        "\"Equally important are our <b>Non-Functional Requirements</b>: First, <b>Performance & Responsiveness</b> — we engineered our scanner to avoid catastrophic regex backtracking (ReDoS), using O(1) string slicing for line resolution and yielding to the browser event loop between files so even 10,000+ line repositories analyze smoothly without freezing the UI. Second, <b>Security</b> via PostgreSQL RLS policies. Third, <b>Reliability</b> — our static analyzer and TF-IDF RAG engine run deterministically client-side without requiring paid external LLM keys. And fourth, strict <b>TypeScript type safety</b>.\""
    ]))
    story.append(Spacer(1, 6))

    # --- ACT 4: SAIRAJ ---
    story.append(make_cue_box("[SLIDE CUE: Slide 8 & 22 — Live Code Ingestion, 4-Agent Engine & Scoring Formula]"))
    story.append(Spacer(1, 3))
    story.append(make_speaker_block("SAIRAJ", "ACT 4: REAL MULTI-AGENT ANALYSIS & REPOSITORY RAG ENGINE (~2 mins)", [
        "\"Let's look at how the analysis engine works. When a user uploads a ZIP, <b>JSZip</b> unpacks every authored source file while filtering out `node_modules`, `.git`, `dist`, `build`, and binary assets. For GitHub imports, we query the GitHub Tree API and fetch live source code via `raw.githubusercontent.com`.\"",
        "\"Next, four specialized agents inspect the actual files: the <b>AST Agent</b> flags monolithic files over 500 lines; the <b>OWASP Security Agent</b> scans for SQL injection, XSS (`dangerouslySetInnerHTML`), `eval()`, shell command injection, weak `Math.random()`, disabled TLS verification, and hardcoded API keys or JWTs; the <b>Code Quality Agent</b> catches empty catch blocks, blocking synchronous `fs` I/O, and excessive TypeScript `any` usage; and the <b>Documentation Agent</b> verifies `README.md` and automated test suites. Scores are then dynamically weighted: 35% Security, 25% Quality, 20% Reliability, and 20% Documentation.\"",
        "\"Finally, all source files and findings are indexed by our <b>RepositoryRagIndex</b>. It chunks files into overlapping line windows, extracts function and route symbols, and uses <b>intent classification plus TF-IDF scoring</b>. When a user asks <i>'what is this project about?'</i>, it synthesizes an overview from `package.json`, HTML views, and server entrypoints. When they ask about a feature or bug, it retrieves the exact code snippet with file and line citations. Now, <b>Yogesh</b> will walk you through the complete user workflow, UML architecture, and implemented features.\""
    ]))
    story.append(Spacer(1, 6))

    # --- ACT 5: YOGESH ---
    story.append(make_cue_box("[SLIDE CUE: Slides 9–20 — UML Portfolio Overview & Behavioral/Structural Diagrams]"))
    story.append(Spacer(1, 3))
    story.append(make_speaker_block("YOGESH", "ACT 5: END-TO-END WORKFLOW & UML ARCHITECTURE (~1.5 mins)", [
        "\"Thank you, Sairaj. To model CodePilot AI rigorously before and during implementation, we designed a complete 11-diagram UML suite covering structural views like Use Case, Class, Package, Component, and Deployment diagrams, alongside behavioral views like State Machine, Activity, and Sequence diagrams.\"",
        "\"Our end-to-end workflow follows six clean stages: <b>Stage 1</b> is Universal Authentication at `/auth/login`, where any student can connect their GitHub handle to load their live repositories, or sign in as a Faculty Evaluator. <b>Stage 2</b> is Repository Ingestion at `/review/new`, featuring real-time terminal logs across validation, filtering, and language detection.\"",
        "\"<b>Stage 3</b> executes the 4-agent pipeline and persists both the findings and raw files. <b>Stage 4</b> opens the interactive Audit Review at `/review/[id]` with severity filters and plain-language principle explanations. <b>Stage 5</b> launches Terminal AI at `/chat/[id]` for RAG-grounded Q&A, and <b>Stage 6</b> transitions to the Viva Simulator and Certified PDF Report.\""
    ]))
    story.append(Spacer(1, 6))

    # --- ACT 6: YOGESH ---
    story.append(make_cue_box("[SLIDE CUE: Slides 24–26 — Terminal AI, Viva Defense Simulator, PDF Reports & Live Demo]"))
    story.append(Spacer(1, 3))
    story.append(make_speaker_block("YOGESH", "ACT 6: IMPLEMENTED FEATURES WALKTHROUGH (~1.5 mins)", [
        "\"Let me highlight three standout implemented features in our UI. First, in <b>Terminal AI (`/chat/[id]`)</b>, the left Explorer panel lists every ingested file from the repository. Clicking any file or typing a question triggers the RAG engine and renders a <b>Grounded RAG Citation</b> card showing the exact file path, line range, and syntax-highlighted code snippet.\"",
        "\"Second, in our <b>Dynamic Technical Viva Simulator (`/interview/[id]`)</b>, questions are no longer static. They are dynamically generated from the active repository's real findings and architecture—for example, showing a candidate their own flagged vulnerability snippet and asking how they would remediate it. When the student submits an answer, the AI Examiner evaluates concept coverage and response depth to assign a rubric-backed score.\"",
        "\"Third, our <b>Institutional Report (`/report/[id]`)</b> and <b>Faculty Dashboard (`/faculty`)</b> let educators review cohort scores, customize institutional headers, record official viva marks, and export a print-ready PDF audit report. I will now hand it back to <b>Aman</b> for our verification results, future scope, and conclusion.\""
    ]))
    story.append(Spacer(1, 6))

    # --- ACT 7: AMAN ---
    story.append(make_cue_box("[SLIDE CUE: Slides 27–30 — Verification, Future Scope & Conclusion]"))
    story.append(Spacer(1, 3))
    story.append(make_speaker_block("AMAN", "ACT 7: VERIFICATION, FUTURE SCOPE & CONCLUSION (~1 min)", [
        "\"Thank you, Yogesh. We verified CodePilot AI end-to-end on real repositories—including multi-file full-stack web apps exceeding 10,000 lines of code—and confirmed zero TypeScript compilation errors, responsive UI execution, accurate OWASP finding detection, and grounded RAG project summaries.\"",
        "\"Looking ahead, our future roadmap includes GitHub Webhook CI/CD pull-request automation, live sandboxed unit-test execution, and multi-language AST plugins for Rust, Go, and C++.\"",
        "\"To conclude, CodePilot AI bridges automated software security with academic mentorship—helping students write cleaner, safer code and defend their engineering decisions with confidence. Thank you all for your time. We are now happy to answer any questions.\""
    ]))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4+: QUICK VIVA & PANEL Q&A CHEAT SHEET
    # =========================================================================
    story.append(Paragraph("8. Panel Q&A Cheat Sheet (Quick Reference During Defense)", s_h1))
    story.append(Paragraph(
        "Use this quick-reference guide if the faculty panel asks follow-up technical questions after the presentation.",
        s_body
    ))
    story.append(Spacer(1, 4))

    story.append(styled_table(
        ["Likely Question", "Suggested Responder", "Key Points to Answer"],
        [
            ["<b>Why did you use multiple agents instead of one single check?</b>",
             "<b>Aman</b>",
             "Follows Single Responsibility Principle: AST size/structure, OWASP security, code quality, and documentation each have isolated rules and scoring weights, making audits deterministic, modular, and explainable."],
            ["<b>How does your RAG engine work without hallucinating?</b>",
             "<b>Sairaj</b>",
             "RepositoryRagIndex chunks actual ingested files into line-numbered windows, extracts function/route symbols, classifies user intent (Overview vs Security vs Code), and scores chunks via TF-IDF + path proximity, always attaching exact file & line citations."],
            ["<b>How did you prevent the browser from freezing on large repositories?</b>",
             "<b>Sairaj</b>",
             "We eliminated ReDoS-prone multiline regexes, replaced iterative line counting with O(1) string slicing, capped matches per rule and chunks per file (30 max), and yielded to the JS event loop between files."],
            ["<b>How can any student use it if GitHub OAuth isn't configured?</b>",
             "<b>Yogesh</b>",
             "We built a dual-path GitHub connector: Supabase GitHub OAuth when configured, plus instant GitHub username lookup via the public GitHub API and direct ZIP archive ingestion via JSZip."],
            ["<b>How does the Viva Simulator adapt to different student projects?</b>",
             "<b>Yogesh</b>",
             "generateDynamicQuestions() reads the active Review's real findings, primary language, and file counts, embedding the student's actual flagged code snippet into the viva prompt and scoring answers against expected concepts."],
        ],
        [52 * mm, 26 * mm, 96 * mm]
    ))

    story.append(Spacer(1, 10))
    story.append(make_cue_box("TIP BEFORE GOING ON STAGE: Open http://localhost:3000/auth/login, connect a GitHub handle, have one repository already reviewed in /review/[id], and keep /chat/[id] and /interview/[id] ready in browser tabs for a seamless 60-second live demo!"))

    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    shutil.copyfile(OUTPUT_PDF, ARTIFACT_PDF)
    print(f"PDF generated successfully:\n- {OUTPUT_PDF}\n- {ARTIFACT_PDF}")


if __name__ == "__main__":
    build_pdf()
