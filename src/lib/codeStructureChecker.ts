export type CheckCategory = 'structure' | 'format';
export type CheckSeverity = 'pass' | 'warning' | 'error';

export interface CodeAuditFinding {
  id: string;
  category: CheckCategory;
  severity: CheckSeverity;
  line?: number;
  rule: string;
  message: string;
  suggestion: string;
}

export interface CodeAuditMetrics {
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  functionCount: number;
  maxFunctionLines: number;
  maxNestingDepth: number;
  maxLineLength: number;
}

export interface CodeAuditReport {
  fileName: string;
  language: string;
  overallScore: number;
  structureScore: number;
  formatScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  metrics: CodeAuditMetrics;
  findings: CodeAuditFinding[];
}

const MAX_RECOMMENDED_LINE_LENGTH = 100;
const MAX_RECOMMENDED_FUNCTION_LINES = 45;
const MAX_RECOMMENDED_NESTING = 4;

/**
 * Deterministic static checker for code structure and formatting compliance.
 * Designed for output-based software engineering capstones.
 */
export function analyzeCodeStructureAndFormat(
  content: string,
  fileName: string = 'untitled.luau',
  language: string = 'luau'
): CodeAuditReport {
  const normalized = content.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const findings: CodeAuditFinding[] = [];

  let codeLines = 0;
  let commentLines = 0;
  let blankLines = 0;
  let functionCount = 0;
  let maxFunctionLines = 0;
  let maxNestingDepth = 0;
  let maxLineLength = 0;

  let tabIndentedLines = 0;
  let spaceIndentedLines = 0;
  let oddSpaceIndentLines: number[] = [];
  let trailingSpaceLines: number[] = [];
  let longLines: number[] = [];
  let consecutiveBlanks = 0;
  let maxConsecutiveBlanks = 0;
  let todoLines: number[] = [];

  let currentDepth = 0;
  let activeFunctionStart: number | null = null;
  const indentUnit = language === 'json' ? 2 : 4;

  // JSON-specific structure check
  if (language === 'json' || fileName.endsWith('.json')) {
    try {
      const parsed = JSON.parse(content);
      findings.push({
        id: 'struct-json-valid',
        category: 'structure',
        severity: 'pass',
        rule: 'json-syntax-structure',
        message: 'Valid JSON document structure with well-formed root node.',
        suggestion: 'Keep configuration keys consistently ordered.'
      });
      if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length === 0) {
        findings.push({
          id: 'struct-json-empty',
          category: 'structure',
          severity: 'warning',
          rule: 'json-non-empty',
          message: 'JSON root object is empty.',
          suggestion: 'Populate required configuration fields.'
        });
      }
    } catch (err: any) {
      findings.push({
        id: 'struct-json-invalid',
        category: 'structure',
        severity: 'error',
        line: 1,
        rule: 'json-syntax-structure',
        message: `Invalid JSON structure: ${err?.message || 'Parse error'}`,
        suggestion: 'Fix syntax, trailing commas, or unquoted keys.'
      });
    }
  }

  lines.forEach((rawLine, index) => {
    const lineNum = index + 1;
    const trimmed = rawLine.trim();

    if (rawLine.length > maxLineLength) {
      maxLineLength = rawLine.length;
    }

    // Check trailing whitespace
    if (/[ \t]+$/.test(rawLine)) {
      trailingSpaceLines.push(lineNum);
    }

    // Check line length
    if (rawLine.length > MAX_RECOMMENDED_LINE_LENGTH) {
      longLines.push(lineNum);
    }

    // Blank line tracking
    if (trimmed.length === 0) {
      blankLines++;
      consecutiveBlanks++;
      if (consecutiveBlanks > maxConsecutiveBlanks) {
        maxConsecutiveBlanks = consecutiveBlanks;
      }
      return;
    }
    consecutiveBlanks = 0;

    // Comment line tracking
    const isComment =
      trimmed.startsWith('--') ||
      trimmed.startsWith('//') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*');

    if (isComment) {
      commentLines++;
      if (/\b(TODO|FIXME|HACK)\b/i.test(trimmed)) {
        todoLines.push(lineNum);
      }
      return;
    }

    codeLines++;

    // Indentation check
    const leadingMatch = rawLine.match(/^([ \t]+)/);
    if (leadingMatch) {
      const ws = leadingMatch[1];
      if (ws.includes('\t')) tabIndentedLines++;
      if (ws.includes(' ')) {
        spaceIndentedLines++;
        const spaceCount = ws.replace(/\t/g, '').length;
        if (spaceCount % 2 !== 0) {
          oddSpaceIndentLines.push(lineNum);
        }
      }
    }

    // Function & block nesting analysis for Luau / Lua / JS / TS
    const opensFunction = /\b(function|def)\b/.test(trimmed) || /=>\s*\{?$/.test(trimmed);
    if (opensFunction) {
      functionCount++;
      if (activeFunctionStart === null) {
        activeFunctionStart = lineNum;
      }
    }

    const blockOpeners = (
      trimmed.match(/\b(function|if|for|while|repeat|do)\b|\{\s*$/g) || []
    ).length;
    const blockClosers = (
      trimmed.match(/\b(end|until)\b|^\s*\}/g) || []
    ).length;

    currentDepth = Math.max(0, currentDepth + blockOpeners - blockClosers);
    if (currentDepth > maxNestingDepth) {
      maxNestingDepth = currentDepth;
    }

    if (activeFunctionStart !== null && /\b(end)\b|^\s*\}/.test(trimmed) && currentDepth === 0) {
      const fnLen = lineNum - activeFunctionStart + 1;
      if (fnLen > maxFunctionLines) {
        maxFunctionLines = fnLen;
      }
      activeFunctionStart = null;
    }
  });

  // ── 1. STRUCTURE CHECKS ──
  const isCodeFile = ['luau', 'lua', 'ts', 'tsx', 'js', 'py'].includes(language);

  if (isCodeFile) {
    // Module export / return pattern check
    const hasModuleReturn =
      /\breturn\s+[A-Za-z_][A-Za-z0-9_]*\s*$/.test(normalized.trim()) ||
      /\bexport\s+(default|const|function|interface|type|class)\b/.test(normalized);

    if (hasModuleReturn) {
      findings.push({
        id: 'struct-module-export',
        category: 'structure',
        severity: 'pass',
        rule: 'module-export-boundary',
        message: 'Clean module structure with explicit export/return boundary.',
        suggestion: 'Maintain single-responsibility exports per file.'
      });
    } else if (codeLines > 5 && !fileName.includes('init')) {
      findings.push({
        id: 'struct-module-export-missing',
        category: 'structure',
        severity: 'warning',
        line: lines.length,
        rule: 'module-export-boundary',
        message: 'No explicit module table return or export statement found at end of file.',
        suggestion: 'Wrap reusable functions in a module table and return it at the bottom of the script.'
      });
    }

    // Type annotations / strict typing check
    const hasTypeAnnotations =
      /--!strict/.test(normalized) ||
      /\btype\s+[A-Za-z_]/.test(normalized) ||
      /:\s*(string|number|boolean|any|void|Record|Array|[A-Z][A-Za-z0-9_]*)/.test(normalized);

    if (hasTypeAnnotations) {
      findings.push({
        id: 'struct-type-safety',
        category: 'structure',
        severity: 'pass',
        rule: 'type-annotations',
        message: 'Explicit type definitions or parameter/return annotations detected.',
        suggestion: 'Continue enforcing strict type contracts on public functions.'
      });
    } else if (functionCount > 0) {
      findings.push({
        id: 'struct-type-safety-missing',
        category: 'structure',
        severity: 'warning',
        line: 1,
        rule: 'type-annotations',
        message: 'Functions lack explicit parameter or return type annotations.',
        suggestion: 'Add parameter and return type signatures (e.g., `function foo(x: number): string`) for safer static verification.'
      });
    }

    // Nesting complexity check
    if (maxNestingDepth > MAX_RECOMMENDED_NESTING) {
      findings.push({
        id: 'struct-deep-nesting',
        category: 'structure',
        severity: 'error',
        rule: 'max-nesting-depth',
        message: `Maximum block nesting depth is ${maxNestingDepth} (recommended <= ${MAX_RECOMMENDED_NESTING}).`,
        suggestion: 'Use early guard clauses (`if not valid then return end`) to flatten nested conditionals.'
      });
    } else {
      findings.push({
        id: 'struct-nesting-ok',
        category: 'structure',
        severity: 'pass',
        rule: 'max-nesting-depth',
        message: `Control-flow nesting depth (${maxNestingDepth}) is within clean modularity limits (<= ${MAX_RECOMMENDED_NESTING}).`,
        suggestion: 'Keep functions flat and readable.'
      });
    }

    // Function length check
    if (maxFunctionLines > MAX_RECOMMENDED_FUNCTION_LINES) {
      findings.push({
        id: 'struct-fn-length',
        category: 'structure',
        severity: 'warning',
        rule: 'function-cohesion',
        message: `Longest function spans ${maxFunctionLines} lines (recommended <= ${MAX_RECOMMENDED_FUNCTION_LINES}).`,
        suggestion: 'Decompose large functions into focused helper routines.'
      });
    }

    // Header / documentation comment check
    if (commentLines === 0 && codeLines > 8) {
      findings.push({
        id: 'struct-header-comment',
        category: 'structure',
        severity: 'warning',
        line: 1,
        rule: 'module-header-doc',
        message: 'File has no header or inline documentation comments.',
        suggestion: 'Add a brief module header comment describing the file purpose and structure.'
      });
    } else if (commentLines > 0) {
      findings.push({
        id: 'struct-header-comment-ok',
        category: 'structure',
        severity: 'pass',
        rule: 'module-header-doc',
        message: `Documentation comments present (${commentLines} comment ${commentLines === 1 ? 'line' : 'lines'}).`,
        suggestion: 'Keep comments aligned with structural changes.'
      });
    }
  }

  if (todoLines.length > 0) {
    findings.push({
      id: 'struct-unresolved-todos',
      category: 'structure',
      severity: 'warning',
      line: todoLines[0],
      rule: 'no-unresolved-todo',
      message: `${todoLines.length} unresolved TODO/FIXME marker(s) found (first at line ${todoLines[0]}).`,
      suggestion: 'Convert open TODO markers into tracked Kanban sprint tickets.'
    });
  }

  // ── 2. FORMAT CHECKS ──
  if (tabIndentedLines > 0 && spaceIndentedLines > 0) {
    findings.push({
      id: 'fmt-mixed-indent',
      category: 'format',
      severity: 'error',
      rule: 'consistent-indentation',
      message: `Mixed indentation detected (${spaceIndentedLines} space-indented vs ${tabIndentedLines} tab-indented lines).`,
      suggestion: `Standardize on ${indentUnit}-space indentation across the entire file.`
    });
  } else if (oddSpaceIndentLines.length > 0) {
    findings.push({
      id: 'fmt-odd-indent',
      category: 'format',
      severity: 'warning',
      line: oddSpaceIndentLines[0],
      rule: 'indentation-alignment',
      message: `${oddSpaceIndentLines.length} line(s) have misaligned odd-space indentation (e.g., line ${oddSpaceIndentLines[0]}).`,
      suggestion: `Align all blocks to multiples of ${indentUnit} spaces.`
    });
  } else {
    findings.push({
      id: 'fmt-indent-ok',
      category: 'format',
      severity: 'pass',
      rule: 'consistent-indentation',
      message: 'Indentation style is consistent across all blocks.',
      suggestion: 'Continue using consistent space indentation.'
    });
  }

  if (trailingSpaceLines.length > 0) {
    findings.push({
      id: 'fmt-trailing-spaces',
      category: 'format',
      severity: 'warning',
      line: trailingSpaceLines[0],
      rule: 'no-trailing-whitespace',
      message: `Trailing whitespace detected on ${trailingSpaceLines.length} line(s) (first at line ${trailingSpaceLines[0]}).`,
      suggestion: 'Run Auto-Format to strip trailing spaces at line endings.'
    });
  } else {
    findings.push({
      id: 'fmt-trailing-spaces-ok',
      category: 'format',
      severity: 'pass',
      rule: 'no-trailing-whitespace',
      message: 'Zero trailing whitespace characters found.',
      suggestion: 'Clean line endings maintained.'
    });
  }

  if (longLines.length > 0) {
    findings.push({
      id: 'fmt-line-length',
      category: 'format',
      severity: 'warning',
      line: longLines[0],
      rule: 'max-line-length',
      message: `${longLines.length} line(s) exceed ${MAX_RECOMMENDED_LINE_LENGTH} characters (max: ${maxLineLength} chars at line ${longLines[0]}).`,
      suggestion: `Wrap long expressions or string literals to stay within ${MAX_RECOMMENDED_LINE_LENGTH} columns.`
    });
  } else {
    findings.push({
      id: 'fmt-line-length-ok',
      category: 'format',
      severity: 'pass',
      rule: 'max-line-length',
      message: `All lines fit within ${MAX_RECOMMENDED_LINE_LENGTH} characters (max: ${maxLineLength}).`,
      suggestion: 'Line width formatting is clean.'
    });
  }

  if (maxConsecutiveBlanks > 2) {
    findings.push({
      id: 'fmt-blank-lines',
      category: 'format',
      severity: 'warning',
      rule: 'no-multiple-empty-lines',
      message: `Found ${maxConsecutiveBlanks} consecutive blank lines (max recommended is 2).`,
      suggestion: 'Collapse extra blank lines to keep vertical spacing uniform.'
    });
  }

  if (content.length > 0 && !normalized.endsWith('\n')) {
    findings.push({
      id: 'fmt-eof-newline',
      category: 'format',
      severity: 'warning',
      line: lines.length,
      rule: 'eol-last',
      message: 'File does not end with a trailing newline character.',
      suggestion: 'Add a newline at the end of the file for POSIX/Git diff compliance.'
    });
  }

  // Score calculation
  const structureFindings = findings.filter(f => f.category === 'structure');
  const formatFindings = findings.filter(f => f.category === 'format');

  const computeCategoryScore = (list: CodeAuditFinding[]) => {
    let score = 100;
    for (const item of list) {
      if (item.severity === 'error') score -= 22;
      if (item.severity === 'warning') score -= 9;
    }
    return Math.max(0, Math.min(100, score));
  };

  const structureScore = computeCategoryScore(structureFindings);
  const formatScore = computeCategoryScore(formatFindings);
  const overallScore = Math.round(structureScore * 0.55 + formatScore * 0.45);

  const grade: CodeAuditReport['grade'] =
    overallScore >= 95
      ? 'A+'
      : overallScore >= 85
      ? 'A'
      : overallScore >= 75
      ? 'B'
      : overallScore >= 60
      ? 'C'
      : 'D';

  return {
    fileName,
    language,
    overallScore,
    structureScore,
    formatScore,
    grade,
    metrics: {
      totalLines: lines.length,
      codeLines,
      commentLines,
      blankLines,
      functionCount,
      maxFunctionLines,
      maxNestingDepth,
      maxLineLength
    },
    findings
  };
}

/**
 * Formats code structure & whitespace deterministically:
 * - Normalizes CRLF to LF
 * - Pretty-prints JSON if valid
 * - Replaces tabs with standard spaces
 * - Strips trailing whitespace on every line
 * - Collapses >2 consecutive blank lines
 * - Ensures a single trailing newline at EOF
 */
export function formatCodeStructure(content: string, language: string = 'luau'): string {
  if (!content.trim()) return '\n';

  if (language === 'json') {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2) + '\n';
    } catch {
      // fall through to line-based cleanup if JSON has syntax errors
    }
  }

  const tabReplacement = language === 'json' ? '  ' : '    ';
  const rawLines = content.replace(/\r\n/g, '\n').split('\n');
  const cleanedLines: string[] = [];
  let blankStreak = 0;

  for (const rawLine of rawLines) {
    // Strip trailing whitespace and normalize leading tabs
    const withoutTrailing = rawLine.replace(/[ \t]+$/, '');
    const normalizedIndent = withoutTrailing.replace(/^\t+/, match =>
      tabReplacement.repeat(match.length)
    );

    if (normalizedIndent.trim().length === 0) {
      blankStreak++;
      if (blankStreak <= 2) {
        cleanedLines.push('');
      }
    } else {
      blankStreak = 0;
      cleanedLines.push(normalizedIndent);
    }
  }

  return cleanedLines.join('\n').trimEnd() + '\n';
}
