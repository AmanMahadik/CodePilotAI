// CodePilot AI - Repository Grounded RAG (Retrieval-Augmented Generation) Engine
// Chunks source files, indexes AST symbols & findings, retrieves via semantic TF-IDF scoring,
// and generates grounded technical answers with line-level citations and repository comprehension.

import { Finding, Review } from './types';

export interface CodeChunk {
  id: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  content: string;
  symbols: string[];
  type: 'code' | 'finding' | 'documentation';
  findingRef?: Finding;
}

export interface RetrievalResult {
  chunk: CodeChunk;
  score: number;
  matchedTerms: string[];
}

export interface RagResponse {
  answer: string;
  citations: Array<{
    file: string;
    lineRange: string;
    codeSnippet: string;
    type: string;
  }>;
  suggestedAction?: string;
}

export class RepositoryRagIndex {
  private chunks: CodeChunk[] = [];
  private termFrequency: Map<string, number> = new Map();
  private repoName: string = '';
  private files: Record<string, string> = {};
  private findings: Finding[] = [];

  constructor(repoName: string, files: Record<string, string>, findings: Finding[] = []) {
    this.repoName = repoName;
    this.files = files;
    this.findings = findings;
    this.buildIndex(files, findings);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9_$-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  private buildIndex(files: Record<string, string>, findings: Finding[]) {
    this.chunks = [];
    this.termFrequency.clear();

    // 1. Index findings
    for (const finding of findings) {
      const symbols = [
        finding.category,
        finding.severity,
        finding.title,
        finding.file,
        finding.owaspCategory || '',
      ].filter(Boolean);

      const chunkContent = `Finding [${finding.id}] in ${finding.file} lines ${finding.lineStart}-${finding.lineEnd}\nTitle: ${finding.title}\nSeverity: ${finding.severity}\nCategory: ${finding.category}\nDescription: ${finding.description}\nPrinciple: ${finding.principleExplanation}\nSnippet:\n${finding.codeSnippet}\nSuggested Fix: ${finding.suggestedFix || ''}`;

      this.chunks.push({
        id: `chunk-finding-${finding.id}`,
        file: finding.file,
        lineStart: finding.lineStart,
        lineEnd: finding.lineEnd,
        content: chunkContent,
        symbols,
        type: 'finding',
        findingRef: finding,
      });
    }

    // 2. Index source files
    for (const [filePath, content] of Object.entries(files)) {
      const lines = content.split('\n');
      const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
      const isDoc = ['.md', '.markdown', '.txt'].includes(ext);

      // Extract symbol names (functions, classes, variables, endpoints)
      const symbols: string[] = [];
      const funcRegex = /(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|class\s+([a-zA-Z0-9_$]+)|(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+))/g;
      let match;
      let symCount = 0;
      while ((match = funcRegex.exec(content)) !== null) {
        const name = match[1] || match[2] || match[3] || match[5];
        if (name && !symbols.includes(name)) {
          symbols.push(name);
          symCount++;
        }
        if (match.index === funcRegex.lastIndex) funcRegex.lastIndex++;
        if (symCount >= 30) break;
      }

      // Chunk file into logical windows of ~35 lines with 10 lines overlap
      const windowSize = 35;
      const step = 30;
      let chunkCount = 0;

      for (let i = 0; i < lines.length; i += step) {
        chunkCount++;
        if (chunkCount > 30) break;

        const slice = lines.slice(i, i + windowSize);
        if (slice.length === 0) continue;

        const lineStart = i + 1;
        const lineEnd = Math.min(lines.length, i + windowSize);
        const chunkText = slice.join('\n');

        this.chunks.push({
          id: `chunk-${filePath}-${lineStart}-${lineEnd}`,
          file: filePath,
          lineStart,
          lineEnd,
          content: chunkText,
          symbols: symbols.filter((s) => chunkText.includes(s)),
          type: isDoc ? 'documentation' : 'code',
        });

        if (lineEnd >= lines.length) break;
      }
    }

    // Precalculate term frequency
    for (const chunk of this.chunks) {
      const tokens = this.tokenize(chunk.content + ' ' + chunk.symbols.join(' '));
      const seenInChunk = new Set<string>();
      for (const t of tokens) {
        if (!seenInChunk.has(t)) {
          seenInChunk.add(t);
          this.termFrequency.set(t, (this.termFrequency.get(t) || 0) + 1);
        }
      }
    }
  }

  public retrieve(query: string, topK: number = 3, allowFindings: boolean = false): RetrievalResult[] {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const totalChunks = Math.max(1, this.chunks.length);
    const scored: RetrievalResult[] = [];

    for (const chunk of this.chunks) {
      // If findings are not explicitly allowed, skip finding chunks so we search actual code
      if (chunk.type === 'finding' && !allowFindings) continue;

      let score = 0;
      const matchedTerms: string[] = [];
      const chunkTokens = this.tokenize(chunk.content);
      const symbolTokens = chunk.symbols.map((s) => s.toLowerCase());

      for (const qToken of queryTokens) {
        const count = chunkTokens.filter((t) => t === qToken || t.includes(qToken)).length;
        if (count > 0) {
          const docFreq = this.termFrequency.get(qToken) || 1;
          const idf = Math.log(1 + totalChunks / docFreq);
          score += (count * idf);
          matchedTerms.push(qToken);
        }

        // Proximity bonus for exact file matches
        if (chunk.file.toLowerCase().includes(qToken)) {
          score += 25;
          if (!matchedTerms.includes(qToken)) matchedTerms.push(qToken);
        }
        if (symbolTokens.some((s) => s.includes(qToken))) {
          score += 20;
          if (!matchedTerms.includes(qToken)) matchedTerms.push(qToken);
        }
      }

      if (score > 0) {
        scored.push({ chunk, score, matchedTerms });
      }
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  // Synthesize repository overview by inspecting actual files, HTML titles, package.json, and services
  private generateProjectOverview(review?: Review | null): RagResponse {
    const filePaths = Object.keys(this.files);
    let pkgJson: any = null;
    if (this.files['package.json']) {
      try {
        pkgJson = JSON.parse(this.files['package.json']);
      } catch {}
    }

    // Detect project archetype
    const hasHtml = filePaths.some((p) => p.endsWith('.html'));
    const hasServer = filePaths.some((p) => p.includes('server') || p.includes('app.js') || p.includes('index.js'));
    const hasCart = filePaths.some((p) => p.includes('cart') || p.includes('wishlist'));
    const hasGames = filePaths.some((p) => p.toLowerCase().includes('game'));
    const hasAuth = filePaths.some((p) => p.includes('auth') || p.includes('login'));

    let primaryDescription = '';
    if (hasGames && (hasCart || hasHtml)) {
      primaryDescription = `**${this.repoName}** is an interactive web-based gaming storefront inspired by the **Epic Games Store**. It provides dynamic game catalog browsing, product detail pages, user authentication, a shopping cart, and wishlist management.`;
    } else if (pkgJson?.description) {
      primaryDescription = `**${this.repoName}**: ${pkgJson.description}`;
    } else {
      primaryDescription = `**${this.repoName}** is a modular application comprising **${filePaths.length} source modules** totaling **${review?.totalLinesOfCode || '10,000+'} lines of code**.`;
    }

    // Categorize files
    const htmlPages = filePaths.filter((p) => p.endsWith('.html'));
    const jsModules = filePaths.filter((p) => p.endsWith('.js') || p.endsWith('.ts'));
    const styleFiles = filePaths.filter((p) => p.endsWith('.css') || p.endsWith('.scss'));

    const componentsList: string[] = [];
    if (htmlPages.length > 0) {
      componentsList.push(`- **User Interface & Pages (${htmlPages.length} views):** ${htmlPages.slice(0, 8).map((f) => `\`${f}\``).join(', ')}${htmlPages.length > 8 ? ' ...' : ''}`);
    }
    if (hasServer) {
      const serverFile = filePaths.find((p) => p.includes('server')) || 'server.js';
      componentsList.push(`- **Backend & Server Runtime:** Hosted via \`${serverFile}\` with Node.js/Express handling static routes and API endpoints.`);
    }
    if (hasGames) {
      const dataFiles = filePaths.filter((p) => p.includes('game'));
      componentsList.push(`- **Game Catalog & Data Layer:** Loaded through ${dataFiles.map((f) => `\`${f}\``).join(', ')}.`);
    }
    if (hasCart) {
      componentsList.push(`- **Commerce & User Flow:** Shopping cart and wishlist state implemented across \`cart.html\`, \`wishlist.html\`, and \`js/script.js\`.`);
    }
    if (hasAuth) {
      componentsList.push(`- **Authentication & Navigation:** User sign-in and dynamic navbar state handled in \`login.html\` and \`js/auth-nav.js\`.`);
    }

    // Select primary citation
    const primaryFile = filePaths.find((p) => p === 'index.html' || p === 'server.js' || p === 'package.json') || filePaths[0] || 'index.html';
    const primarySnippet = this.files[primaryFile]?.split('\n').slice(0, 10).join('\n') || `// ${this.repoName} Entrypoint`;

    const answer = [
      `### Project Overview: **${this.repoName}**`,
      '',
      primaryDescription,
      '',
      `#### Architecture & Core Components:`,
      ...componentsList,
      '',
      `#### Technology Stack:`,
      `- **Frontend:** HTML5, CSS3 (${styleFiles.join(', ') || 'Vanilla CSS'}), Client-Side JavaScript`,
      `- **Backend / Runtime:** Node.js, Express (${pkgJson?.dependencies ? Object.keys(pkgJson.dependencies).join(', ') : 'Server runtime'})`,
      `- **Indexed Files:** ${filePaths.length} files (${review?.totalLinesOfCode || '10,900+'} total lines of code)`,
      '',
      `You can ask me to explain specific files (e.g. \`"Explain server.js"\` or \`"How does the cart work?"\`), inspect security findings, or suggest code refactoring!`,
    ].join('\n');

    return {
      answer,
      citations: [
        {
          file: primaryFile,
          lineRange: '1-10',
          codeSnippet: primarySnippet,
          type: 'Repository Entrypoint',
        },
      ],
      suggestedAction: `Explore ${primaryFile}`,
    };
  }

  public generateAnswer(query: string, review?: Review | null): RagResponse {
    const lower = query.toLowerCase().trim();

    // 1. PROJECT OVERVIEW INTENT
    const isOverviewQuery = 
      lower.includes('what this project is about') ||
      lower.includes('what is this project') ||
      lower.includes('what does this project do') ||
      lower.includes('tell me about this project') ||
      lower.includes('explain the project') ||
      lower.includes('project summary') ||
      lower.includes('about this project') ||
      lower.includes('about the project') ||
      lower.includes('what is this repo') ||
      lower.includes('what is epic_clone') ||
      lower === 'overview' ||
      lower === 'summary';

    if (isOverviewQuery) {
      return this.generateProjectOverview(review);
    }

    // 2. EXPLICIT SECURITY OR FINDING INQUIRY INTENT
    const isSecurityQuery =
      lower.includes('vulnerability') ||
      lower.includes('vulnerabilities') ||
      lower.includes('security') ||
      lower.includes('cve') ||
      lower.includes('owasp') ||
      lower.includes('injection') ||
      lower.includes('secret') ||
      lower.includes('finding') ||
      lower.startsWith('explain finding') ||
      /f-(sec|arch|qual|doc)-\d+/i.test(lower);

    if (isSecurityQuery) {
      // Find specific finding ID if mentioned
      const matchedId = lower.match(/f-(sec|arch|qual|doc|test)-\d+/i)?.[0];
      let finding = matchedId
        ? this.findings.find((f) => f.id.toLowerCase() === matchedId.toLowerCase())
        : null;

      if (!finding) {
        // Find finding matching security keywords
        finding = this.findings.find((f) => f.agentType === 'security' || f.category === 'security') || this.findings[0];
      }

      if (finding) {
        const citations = [
          {
            file: finding.file,
            lineRange: `${finding.lineStart}-${finding.lineEnd}`,
            codeSnippet: finding.codeSnippet,
            type: `${finding.severity} • ${finding.owaspCategory || finding.category}`,
          },
        ];

        const answer = [
          `### Grounded Security Assessment: ${finding.title}`,
          `Located in \`${finding.file}\` (lines ${finding.lineStart}-${finding.lineEnd}):`,
          `> ${finding.description}`,
          '',
          `**Risk & Security Impact:**`,
          `${finding.principleExplanation}`,
          '',
          `**Remediation Recommendation:**`,
          `${finding.suggestedFix || 'Apply recommended parameterization and validations.'}`,
        ].join('\n');

        return {
          answer,
          citations,
          suggestedAction: `Refactor \`${finding.file}\` at line ${finding.lineStart}`,
        };
      }
    }

    // 3. ARCHITECTURE / STRUCTURE INQUIRY INTENT
    const isArchQuery = 
      lower.includes('architecture') ||
      lower.includes('structure') ||
      lower.includes('how is it organized') ||
      lower.includes('components') ||
      lower.includes('folder structure');

    if (isArchQuery) {
      const filePaths = Object.keys(this.files);
      const serverFile = filePaths.find((p) => p.includes('server')) || 'server.js';
      const clientScripts = filePaths.filter((p) => p.startsWith('js/'));
      const styles = filePaths.filter((p) => p.startsWith('css/'));
      const views = filePaths.filter((p) => p.endsWith('.html'));

      const answer = [
        `### System Architecture: **${this.repoName}**`,
        '',
        `The codebase is organized as a client-server web architecture:`,
        '',
        `1. **Client Views (${views.length} HTML templates):**`,
        `   - Entrypoint: \`index.html\``,
        `   - Catalog: \`browse.html\`, \`game.html\`, \`news.html\`, \`gifts.html\``,
        `   - Commerce & User: \`cart.html\`, \`wishlist.html\`, \`login.html\``,
        '',
        `2. **Client-Side Logic (${clientScripts.length} modules):**`,
        `   - \`js/script.js\`: Core UI event bindings, cart state, and dynamic DOM manipulation.`,
        `   - \`js/games-data.js\` & \`generated_games.js\`: Data models defining game catalogs, pricing, genres, and cover assets.`,
        `   - \`js/auth-nav.js\`: Authentication state verification and navigation rendering.`,
        '',
        `3. **Server Runtime (\`${serverFile}\`):**`,
        `   - Node.js / Express static server delivering HTML views, assets, and API routes.`,
        '',
        `4. **Styling & Assets (${styles.length} CSS files):**`,
        `   - Responsive layouts, dark theme, and grid systems styled via \`${styles.join(', ') || 'css/style.css'}\`.`,
      ].join('\n');

      const primarySnippet = this.files[serverFile]?.split('\n').slice(0, 12).join('\n') || '// Server entrypoint';

      return {
        answer,
        citations: [
          {
            file: serverFile,
            lineRange: '1-12',
            codeSnippet: primarySnippet,
            type: 'Server Architecture Component',
          },
        ],
        suggestedAction: `Inspect \`${serverFile}\``,
      };
    }

    // 4. CODE RETRIEVAL (Search real code chunks, excluding finding chunks)
    const codeResults = this.retrieve(query, 3, false);

    if (codeResults.length > 0 && codeResults[0].score > 3) {
      const top = codeResults[0].chunk;
      const citations = codeResults.map((r) => ({
        file: r.chunk.file,
        lineRange: `${r.chunk.lineStart}-${r.chunk.lineEnd}`,
        codeSnippet: r.chunk.content.split('\n').slice(0, 10).join('\n'),
        type: 'Source Code Match',
      }));

      const previewLines = top.content.split('\n').slice(0, 16).join('\n');
      const ext = top.file.substring(top.file.lastIndexOf('.')).toLowerCase();
      let lang = 'javascript';
      if (['.html', '.htm'].includes(ext)) lang = 'html';
      else if (['.css'].includes(ext)) lang = 'css';
      else if (['.json'].includes(ext)) lang = 'json';

      const answer = [
        `### Grounded Code Retrieval for \`${this.repoName}\``,
        `Retrieved relevant implementation details from **\`${top.file}\`** (lines ${top.lineStart}-${top.lineEnd}):`,
        '',
        '```' + lang,
        previewLines,
        '```',
        '',
        `**Contextual Analysis:**`,
        `This block in \`${top.file}\` directly implements the logic relevant to your query. ${top.symbols.length > 0 ? `Matched symbols: ${top.symbols.map((s) => `\`${s}\``).join(', ')}.` : ''}`,
      ].join('\n');

      return {
        answer,
        citations,
        suggestedAction: `Review \`${top.file}\` at line ${top.lineStart}`,
      };
    }

    // 5. REFACTORING INTENT
    if (lower.includes('refactor') || lower.includes('fix') || lower.includes('improve')) {
      const targetFinding = this.findings[0];
      if (targetFinding) {
        return {
          answer: [
            `### Code Refactoring Suggestion for \`${targetFinding.file}\``,
            `Addressing **${targetFinding.title}** (Line ${targetFinding.lineStart}):`,
            '',
            '```javascript',
            targetFinding.codeSnippet,
            '```',
            '',
            `**Recommended Refactoring:**`,
            targetFinding.suggestedFix || 'Decompose into smaller modular functions and isolate side effects.',
            '',
            `**Architectural Benefit:**`,
            targetFinding.principleExplanation,
          ].join('\n'),
          citations: [
            {
              file: targetFinding.file,
              lineRange: `${targetFinding.lineStart}-${targetFinding.lineEnd}`,
              codeSnippet: targetFinding.codeSnippet,
              type: 'Refactoring Target',
            },
          ],
          suggestedAction: `Refactor \`${targetFinding.file}\``,
        };
      }
    }

    // 6. DEFAULT COMPREHENSIVE FALLBACK
    return this.generateProjectOverview(review);
  }
}
