export type WorkspaceFile = {
  id: string;
  name: string;
  path: string;
  language: 'luau' | 'lua' | 'json' | 'markdown' | 'toml';
  content: string;
  modified: boolean;
};

export type WorkspaceFolder = 'workspace' | 'scripts' | 'autoexec' | 'lsp' | 'themes' | 'icons';

export type LspStatus = 'idle' | 'connecting' | 'ready' | 'error';

export type McpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

export type ThemeId = 'dark' | 'light' | 'midnight' | 'real-dark';

export type LuauWorkspaceState = {
  files: WorkspaceFile[];
  activeFileId: string | null;
  lspStatus: LspStatus;
  lspVersion: string;
};
