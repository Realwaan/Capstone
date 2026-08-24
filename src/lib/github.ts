import { GitHubCommit, GitHubPullRequest } from '../types';

export const DEFAULT_GITHUB_REPO_URL = import.meta.env.VITE_GITHUB_REPO_URL || '';
export const DEFAULT_GITHUB_OWNER = '';
export const DEFAULT_GITHUB_REPO = '';

const GITHUB_TOKEN_KEY = 'capstoneflow_github_token';

export const getGitHubToken = (): string => {
  const envToken = import.meta.env.VITE_GITHUB_TOKEN || import.meta.env.VITE_GITHUB_PAT;
  if (typeof envToken === 'string' && envToken.trim() !== '' && !envToken.includes('placeholder') && !envToken.includes('your-github')) {
    return envToken.trim();
  }
  const stored = localStorage.getItem(GITHUB_TOKEN_KEY);
  return stored ? stored.trim() : '';
};

export const setGitHubToken = (token: string) => {
  if (token && token.trim()) {
    localStorage.setItem(GITHUB_TOKEN_KEY, token.trim());
  } else {
    localStorage.removeItem(GITHUB_TOKEN_KEY);
  }
};

export interface ParsedRepo {
  owner: string;
  repo: string;
}

export const parseGitHubRepoUrl = (url?: string): ParsedRepo | null => {
  if (!url || !url.trim()) {
    return null;
  }
  const clean = url.trim().replace(/\.git$/, '');

  // Handle "owner/repo"
  if (/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(clean)) {
    const [owner, repo] = clean.split('/');
    return { owner, repo };
  }

  // Handle "https://github.com/owner/repo" or "http://..."
  const httpMatch = clean.match(/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)/i);
  if (httpMatch) {
    return { owner: httpMatch[1], repo: httpMatch[2] };
  }

  // Handle SSH "git@github.com:owner/repo"
  const sshMatch = clean.match(/github\.com:([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)/i);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }

  return null;
};

const getHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json'
  };
  const token = getGitHubToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export interface RepoDetails {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  language: string;
  isPrivate: boolean;
  updatedAt: string;
  htmlUrl: string;
}

export interface SyncRepoResult {
  success: boolean;
  statusCode: number;
  errorMessage?: string;
  repoDetails?: RepoDetails | null;
  commits: GitHubCommit[];
  pullRequests: GitHubPullRequest[];
  branches: string[];
}

export const syncRepositoryData = async (owner: string, repo: string): Promise<SyncRepoResult> => {
  const hasToken = !!getGitHubToken();

  try {
    // 1. Fetch Repository Details
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: getHeaders()
    });

    if (!repoRes.ok) {
      const status = repoRes.status;
      let msg = 'Failed to fetch repository.';
      if (status === 404) {
        msg = hasToken
          ? `Repository "${owner}/${repo}" was not found on GitHub. Please check the spelling.`
          : `Repository "${owner}/${repo}" is either PRIVATE or was not found. If this repository is private, please provide a GitHub Personal Access Token (PAT) with "repo" scope.`;
      } else if (status === 401) {
        msg = 'Invalid GitHub Personal Access Token. Please check or regenerate your token.';
      } else if (status === 403) {
        msg = 'GitHub API rate limit exceeded (60 req/hr). Add a free Personal Access Token to get 5,000 req/hr.';
      }

      return {
        success: false,
        statusCode: status,
        errorMessage: msg,
        commits: [],
        pullRequests: [],
        branches: []
      };
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    const repoDetails: RepoDetails = {
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description || '',
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      openIssues: repoData.open_issues_count || 0,
      defaultBranch,
      language: repoData.language || 'TypeScript',
      isPrivate: repoData.private || false,
      updatedAt: repoData.updated_at,
      htmlUrl: repoData.html_url
    };

    // 2. Fetch Commits, PRs, and Branches in Parallel
    const [commitsRes, prsRes, branchesRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(defaultBranch)}&per_page=30`, {
        headers: getHeaders()
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=20`, {
        headers: getHeaders()
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=20`, {
        headers: getHeaders()
      })
    ]);

    let commits: GitHubCommit[] = [];
    if (commitsRes.ok) {
      const commitData = await commitsRes.json();
      if (Array.isArray(commitData)) {
        commits = commitData.map((item: any) => {
          const fullMessage = item.commit?.message || 'No commit message';
          const lines = fullMessage.split('\n');
          const title = lines[0];
          const desc = lines.slice(1).join('\n').trim();
          const authorLogin = item.author?.login || item.commit?.author?.name || 'Developer';
          const cleanLogin = authorLogin.replace(/^@+/, '');
          const avatarUrl = item.author?.avatar_url || `https://github.com/${cleanLogin}.png`;

          return {
            sha: item.sha,
            shortSha: item.sha.substring(0, 7),
            message: title,
            description: desc || undefined,
            authorName: item.commit?.author?.name || cleanLogin,
            authorUsername: cleanLogin,
            authorAvatar: avatarUrl,
            date: item.commit?.author?.date || new Date().toISOString(),
            url: item.html_url,
            branch: defaultBranch,
            verified: item.commit?.verification?.verified || false
          };
        });
      }
    } else if (commitsRes.status === 409) {
      // Empty repository (no commits yet)
      commits = [];
    }

    let pullRequests: GitHubPullRequest[] = [];
    if (prsRes.ok) {
      const prData = await prsRes.json();
      if (Array.isArray(prData)) {
        pullRequests = prData.map((pr: any) => {
          let state: 'open' | 'closed' | 'merged' = 'open';
          if (pr.merged_at) {
            state = 'merged';
          } else if (pr.state === 'closed') {
            state = 'closed';
          }
          const authorLogin = pr.user?.login || 'Developer';
          const cleanLogin = authorLogin.replace(/^@+/, '');
          return {
            number: pr.number,
            title: pr.title,
            state,
            author: cleanLogin,
            authorAvatar: pr.user?.avatar_url || `https://github.com/${cleanLogin}.png`,
            html_url: pr.html_url,
            branch: pr.head?.ref || 'feature',
            targetBranch: pr.base?.ref || defaultBranch,
            createdAt: pr.created_at,
            reviewStatus: state === 'merged' ? 'approved' : 'pending'
          };
        });
      }
    }

    let branches: string[] = [defaultBranch];
    if (branchesRes.ok) {
      const bData = await branchesRes.json();
      if (Array.isArray(bData)) {
        branches = bData.map((b: any) => b.name);
      }
    }

    return {
      success: true,
      statusCode: 200,
      repoDetails,
      commits,
      pullRequests,
      branches
    };
  } catch (err: any) {
    return {
      success: false,
      statusCode: 500,
      errorMessage: err.message || 'Network error while contacting GitHub API.',
      commits: [],
      pullRequests: [],
      branches: []
    };
  }
};

/**
 * Fetches accurate commit details including exact file changes, diff stats, and file patches.
 */
export const fetchCommitDetails = async (
  owner: string, 
  repo: string, 
  sha: string
): Promise<{
  stats: { additions: number; deletions: number; totalFiles: number };
  changedFiles: Array<{
    filename: string;
    status: 'added' | 'modified' | 'deleted';
    additions: number;
    deletions: number;
    patch?: string;
  }>;
} | null> => {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, {
      headers: getHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const stats = {
        additions: data.stats?.additions ?? 0,
        deletions: data.stats?.deletions ?? 0,
        totalFiles: data.files?.length ?? (data.stats?.total ?? 0)
      };
      const changedFiles = (data.files || []).map((f: any) => ({
        filename: f.filename,
        status: (f.status === 'removed' ? 'deleted' : f.status) as 'added' | 'modified' | 'deleted',
        additions: f.additions ?? 0,
        deletions: f.deletions ?? 0,
        patch: f.patch
      }));
      return { stats, changedFiles };
    }
  } catch (e) {
    console.error('Failed to fetch commit details from GitHub API:', e);
  }
  return null;
};

