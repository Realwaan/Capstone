import { RevisionItem } from '../../types';

export interface RevisionStats {
  total: number;
  verified: number;
  resolved: number;
  inProgress: number;
  pending: number;
  actionRequired: number;
  complianceRate: number; // 0 to 100
}

/**
 * Calculates defense compliance statistics across all logged revisions.
 */
export function calculateRevisionCompliance(revisions: RevisionItem[]): RevisionStats {
  const total = revisions.length;
  if (total === 0) {
    return {
      total: 0,
      verified: 0,
      resolved: 0,
      inProgress: 0,
      pending: 0,
      actionRequired: 0,
      complianceRate: 100,
    };
  }

  const verified = revisions.filter((r) => r.status === 'verified').length;
  const resolved = revisions.filter((r) => r.status === 'resolved').length;
  const inProgress = revisions.filter((r) => r.status === 'in_progress').length;
  const pending = revisions.filter((r) => r.status === 'pending').length;
  const actionRequired = pending + inProgress;

  // Verified + Resolved counts as addressed directives
  const complianceRate = Math.round(((verified + resolved) / total) * 100);

  return {
    total,
    verified,
    resolved,
    inProgress,
    pending,
    actionRequired,
    complianceRate,
  };
}

/**
 * Filters revisions by search keyword and status filter.
 */
export function filterRevisions(
  revisions: RevisionItem[],
  query: string,
  statusFilter: string
): RevisionItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return revisions.filter((rev) => {
    // Status filter matching
    if (statusFilter !== 'all') {
      if (statusFilter === 'action_required') {
        if (rev.status !== 'pending' && rev.status !== 'in_progress') {
          return false;
        }
      } else if (rev.status !== statusFilter) {
        return false;
      }
    }

    // Query matching
    if (normalizedQuery) {
      const matchSource = rev.source?.toLowerCase().includes(normalizedQuery);
      const matchChapter = rev.chapterOrComponent?.toLowerCase().includes(normalizedQuery);
      const matchComment = rev.comment?.toLowerCase().includes(normalizedQuery);
      const matchAction = rev.actionTaken?.toLowerCase().includes(normalizedQuery);
      const matchId = rev.id?.toLowerCase().includes(normalizedQuery);

      if (!matchSource && !matchChapter && !matchComment && !matchAction && !matchId) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Generates an academic compliance matrix markdown table for thesis defense.
 */
export function generateRevisionMarkdownMatrix(revisions: RevisionItem[], projectTitle?: string): string {
  const stats = calculateRevisionCompliance(revisions);
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const header = [
    `# Adviser & Panel Revision Compliance Matrix`,
    `**Project:** ${projectTitle || 'Capstone Project'}`,
    `**Generated:** ${dateStr}`,
    `**Defense Readiness Compliance:** ${stats.complianceRate}% (${stats.verified + stats.resolved}/${stats.total} Directives Addressed)`,
    ``,
    `| Ref ID | Affected Chapter / Module | Panel / Adviser Directive | Status | Action Taken / Code Resolution | Verification Sign-off |`,
    `| :--- | :--- | :--- | :--- | :--- | :--- |`,
  ];

  const rows = revisions.map((rev) => {
    const statusLabel =
      rev.status === 'verified'
        ? '🟢 Verified'
        : rev.status === 'resolved'
        ? '🔵 Resolved'
        : rev.status === 'in_progress'
        ? '🟡 In Progress'
        : '🔴 Action Required';

    const safeComment = (rev.comment || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const safeAction = (rev.actionTaken || 'Pending team action').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const signOff = rev.verifiedBy ? `${rev.verifiedBy} (${rev.resolvedDate || rev.date})` : 'Pending review';

    return `| #${rev.id.slice(0, 8)} | ${rev.chapterOrComponent} | "${safeComment}" (${rev.source}) | ${statusLabel} | ${safeAction} | ${signOff} |`;
  });

  return [...header, ...rows, ''].join('\n');
}
