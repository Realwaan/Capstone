import { describe, it, expect } from 'vitest';
import { RevisionItem } from '../../types';
import {
  calculateRevisionCompliance,
  filterRevisions,
  generateRevisionMarkdownMatrix,
} from '../domain/revisions';

describe('Revisions Domain Logic & Compliance Calculations', () => {
  const mockRevisions: RevisionItem[] = [
    {
      id: 'rev-001-xyz',
      date: '2026-08-20',
      source: 'Dr. Santos (Lead Adviser)',
      chapterOrComponent: 'Chapter 3: Methodology',
      comment: 'Clarify dataset augmentation pipeline and train-val-test split ratios.',
      actionTaken: 'Updated section 3.3 with 70-15-15 split details and torchvision transforms.',
      status: 'verified',
      verifiedBy: 'Dr. Santos',
      resolvedDate: '2026-08-22',
    },
    {
      id: 'rev-002-abc',
      date: '2026-08-22',
      source: 'Panel Member Prof. Reyes',
      chapterOrComponent: 'Chapter 4: Results & Discussion',
      comment: 'Include confusion matrix for multi-class classification evaluation.',
      actionTaken: 'Generated matplotlib confusion matrix and added figure 4.6.',
      status: 'resolved',
    },
    {
      id: 'rev-003-def',
      date: '2026-08-24',
      source: 'Panel Chair Dr. Mendoza',
      chapterOrComponent: 'Architecture & Inference API',
      comment: 'Provide latency benchmark comparisons across CPU vs GPU inference.',
      actionTaken: 'Profiling inference latency across batch sizes 1, 4, 16.',
      status: 'in_progress',
    },
    {
      id: 'rev-004-ghi',
      date: '2026-08-26',
      source: 'Adviser',
      chapterOrComponent: 'Chapter 1: Problem Formulation',
      comment: 'Align specific objectives with the research questions verbatim.',
      actionTaken: '',
      status: 'pending',
    },
  ];

  it('calculates compliance stats accurately', () => {
    const stats = calculateRevisionCompliance(mockRevisions);

    expect(stats.total).toBe(4);
    expect(stats.verified).toBe(1);
    expect(stats.resolved).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.pending).toBe(1);
    expect(stats.actionRequired).toBe(2); // pending + in_progress
    // (1 verified + 1 resolved) / 4 = 50%
    expect(stats.complianceRate).toBe(50);
  });

  it('handles empty revisions array safely with 100% initial rate', () => {
    const stats = calculateRevisionCompliance([]);
    expect(stats.total).toBe(0);
    expect(stats.complianceRate).toBe(100);
  });

  it('filters revisions by status correctly', () => {
    const verifiedOnly = filterRevisions(mockRevisions, '', 'verified');
    expect(verifiedOnly).toHaveLength(1);
    expect(verifiedOnly[0].id).toBe('rev-001-xyz');

    const actionRequiredOnly = filterRevisions(mockRevisions, '', 'action_required');
    expect(actionRequiredOnly).toHaveLength(2);
    expect(actionRequiredOnly.map((r) => r.status)).toEqual(['in_progress', 'pending']);
  });

  it('filters revisions by search query across multiple fields', () => {
    // Search by adviser
    const adviserSearch = filterRevisions(mockRevisions, 'Santos', 'all');
    expect(adviserSearch).toHaveLength(1);

    // Search by chapter
    const chapterSearch = filterRevisions(mockRevisions, 'Chapter 4', 'all');
    expect(chapterSearch).toHaveLength(1);
    expect(chapterSearch[0].id).toBe('rev-002-abc');

    // Search by directive keyword
    const latencySearch = filterRevisions(mockRevisions, 'latency', 'all');
    expect(latencySearch).toHaveLength(1);
    expect(latencySearch[0].id).toBe('rev-003-def');
  });

  it('generates a clean markdown compliance matrix table', () => {
    const markdown = generateRevisionMarkdownMatrix(mockRevisions, 'AI Crop Diagnostics');
    expect(markdown).toContain('# Adviser & Panel Revision Compliance Matrix');
    expect(markdown).toContain('**Project:** AI Crop Diagnostics');
    expect(markdown).toContain('**Defense Readiness Compliance:** 50%');
    expect(markdown).toContain('Clarify dataset augmentation pipeline');
    expect(markdown).toContain('🟢 Verified');
    expect(markdown).toContain('🔵 Resolved');
    expect(markdown).toContain('🟡 In Progress');
    expect(markdown).toContain('🔴 Action Required');
  });
});
