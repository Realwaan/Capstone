import { describe, it, expect } from 'vitest';
import { 
  CommunityThread, 
  CommunityReply, 
  Prediction, 
  UserProfile 
} from '../../types';

describe('Community & Predictions Data Models', () => {
  it('validates CommunityThread construction and properties', () => {
    const thread: CommunityThread = {
      id: 'th_test_1',
      title: 'Testing Defense Readiness Checklist',
      content: 'Make sure all IEEE references are formatted properly.',
      authorId: 'usr_author_1',
      authorName: 'Alex Santos',
      authorRole: 'Student Lead',
      tags: ['DefensePrep', 'ThesisManuscript'],
      likesCount: 5,
      repliesCount: 2,
      hasLiked: true,
      createdAt: new Date().toISOString()
    };

    expect(thread.id).toBe('th_test_1');
    expect(thread.tags).toContain('DefensePrep');
    expect(thread.likesCount).toBe(5);
    expect(thread.hasLiked).toBe(true);
  });

  it('validates CommunityReply structure', () => {
    const reply: CommunityReply = {
      id: 'rep_1',
      threadId: 'th_test_1',
      authorId: 'usr_author_2',
      authorName: 'Engr. Sarah',
      authorRole: 'Faculty Adviser',
      content: 'Agreed. Check Chapter 3 methodology as well.',
      likesCount: 2,
      hasLiked: false,
      createdAt: new Date().toISOString()
    };

    expect(reply.threadId).toBe('th_test_1');
    expect(reply.likesCount).toBe(2);
  });

  it('validates Prediction and percentage calculations', () => {
    const prediction: Prediction = {
      id: 'pred_1',
      title: 'Will Sprint 3 complete on time?',
      category: 'milestone',
      options: [
        { id: 'opt_1', label: 'Yes', votesCount: 30, color: '#10b981' },
        { id: 'opt_2', label: 'No', votesCount: 10, color: '#f43f5e' }
      ],
      totalVotes: 40,
      status: 'active',
      deadline: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString()
    };

    const opt1Percentage = Math.round((prediction.options[0].votesCount / prediction.totalVotes) * 100);
    const opt2Percentage = Math.round((prediction.options[1].votesCount / prediction.totalVotes) * 100);

    expect(opt1Percentage).toBe(75);
    expect(opt2Percentage).toBe(25);
  });

  it('validates UserProfile model', () => {
    const profile: UserProfile = {
      id: 'usr_123',
      email: 'student@cit.edu',
      username: 'alex_dev',
      nickname: 'Alex',
      role: 'student'
    };

    expect(profile.email.endsWith('@cit.edu')).toBe(true);
    expect(profile.role).toBe('student');
  });
});
