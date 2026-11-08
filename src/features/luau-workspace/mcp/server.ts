/**
 * MCP stub — mirrors Real's bin/real-mcp.exe
 * Provides the same tool surface without proprietary code.
 * Use @modelcontextprotocol/sdk when wiring to a real host later.
 */
export type McpToolDef = { name: string; description: string; inputSchema: Record<string, unknown> };

export const mcpTools: McpToolDef[] = [
  { name: 'workspace.list_files', description: 'List workspace/scripts/autoexec files', inputSchema: { type: 'object', properties: { folder: { type: 'string' } } } },
  { name: 'workspace.read_file', description: 'Read a file by path', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
  { name: 'workspace.write_file', description: 'Write/create a file', inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] } },
  { name: 'lsp.diagnostics', description: 'Run luau-lsp diagnostics on a file', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
  { name: 'autoexec.run', description: 'Run autoexec/init.luau in sandbox', inputSchema: { type: 'object', properties: {} } },
];

export function createMockMcpServer() {
  const logs: string[] = [];
  return {
    tools: mcpTools,
    logs,
    async callTool(name: string, args: Record<string, unknown>) {
      const entry = `[mcp] ${name} ${JSON.stringify(args)}`;
      logs.push(entry);
      // Mock responses
      if (name === 'autoexec.run') return { ok: true, output: '[autoexec] workspace ready (mock)' };
      if (name === 'lsp.diagnostics') return { ok: true, diagnostics: [] };
      return { ok: true, echoed: args };
    },
  };
}
