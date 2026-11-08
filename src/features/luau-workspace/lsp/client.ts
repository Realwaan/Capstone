/**
 * LSP client abstraction for luau-lsp@1.68.1
 * Mirrors Real's bin/luau-lsp.exe and Madium's Bin/lsp/luau-lsp.exe sidecar.
 * In web mode we don't spawn the binary — we mock the LSP lifecycle and
 * expose the same interface so Tauri (Option B) can swap in a real stdio bridge.
 *
 * Public luau-lsp: https://github.com/JohnnyMorganz/luau-lsp
 */
import type { LspStatus } from '../types';

export type LspClient = {
  status: LspStatus;
  version: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  getDiagnostics: (uri: string, content: string) => Promise<{ message: string; severity: 1 | 2; range: [number, number, number, number] }[]>;
};

export function createMockLspClient(): LspClient {
  let status: LspStatus = 'idle';
  return {
    get status() { return status; },
    version: 'luau-lsp@1.68.1 (mock — swap with real binary in Tauri)',
    async connect() {
      status = 'connecting';
      await new Promise(r => setTimeout(r, 400));
      status = 'ready';
    },
    disconnect() { status = 'idle'; },
    async getDiagnostics(_uri: string, content: string) {
      // Minimal demo: flag `any` usage as a warning — real luau-lsp does full type solving (SolverV2)
      const diags: { message: string; severity: 1 | 2; range: [number, number, number, number] }[] = [];
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (line.includes(': any')) {
          diags.push({ message: 'Avoid `any` — prefer strict Luau types (SolverV2)', severity: 2, range: [i, line.indexOf('any'), i, line.indexOf('any') + 3] });
        }
      });
      return diags;
    },
  };
}

/**
 * Tauri stdio bridge placeholder (Option B).
 * Replace mock with: `Command.sidecar('bin/luau-lsp')` -> JSON-RPC over stdin/stdout.
 * Keep this interface stable so web + native share the same client.
 */
export const LspSidecarConfig = {
  web: { transport: 'mock' as const },
  tauri: { bin: 'bin/luau-lsp', args: ['lsp'], transport: 'stdio' as const },
};
