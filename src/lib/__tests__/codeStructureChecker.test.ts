import { describe, it, expect } from 'vitest';
import {
  analyzeCodeStructureAndFormat,
  formatCodeStructure
} from '../codeStructureChecker';

describe('Code Structure & Format Checker (Output-Based Capstone)', () => {
  it('scores well-structured and cleanly formatted Luau code highly', () => {
    const cleanLuau = `-- Module: PlayerService
local PlayerService = {}

function PlayerService.formatScore(name: string, score: number): string
    return \`\${name}: \${score}\`
end

return PlayerService
`;

    const report = analyzeCodeStructureAndFormat(cleanLuau, 'PlayerService.luau', 'luau');
    expect(report.overallScore).toBeGreaterThanOrEqual(95);
    expect(report.structureScore).toBe(100);
    expect(report.formatScore).toBe(100);
    expect(report.grade).toBe('A+');
    expect(report.metrics.functionCount).toBe(1);
  });

  it('detects structural and formatting issues accurately', () => {
    const messyCode = `function compute(x)   
\tif x > 0 then
    if x > 1 then
      if x > 2 then
        if x > 3 then
          if x > 4 then
            print(x)
          end
        end
      end
    end
\tend



end`;

    const report = analyzeCodeStructureAndFormat(messyCode, 'messy.luau', 'luau');
    const rules = report.findings.map(f => f.rule);

    expect(report.overallScore).toBeLessThan(80);
    expect(rules).toContain('max-nesting-depth');
    expect(rules).toContain('consistent-indentation');
    expect(rules).toContain('no-trailing-whitespace');
    expect(rules).toContain('no-multiple-empty-lines');
    expect(rules).toContain('eol-last');
  });

  it('auto-formats trailing spaces, tabs, excess blank lines, and EOF newline', () => {
    const unformatted = `local M = {}   \n\tfunction M.run(): boolean\n\t\treturn true   \n\tend\n\n\n\nreturn M`;
    const formatted = formatCodeStructure(unformatted, 'luau');

    expect(formatted.endsWith('\n')).toBe(true);
    expect(formatted).not.toContain('\t');
    expect(formatted).not.toMatch(/[ \t]+\n/);
    expect(formatted).not.toContain('\n\n\n\n');

    const postAudit = analyzeCodeStructureAndFormat(formatted, 'M.luau', 'luau');
    expect(postAudit.formatScore).toBe(100);
  });
});
