import { describe, it, expect } from 'vitest';
import { canUserAccessProject, ACCESS_MODIFIERS } from '../accessControl';
import { CapstoneProject } from '../../types';

describe('OOP Access Level Modifiers & Privacy Enforcement', () => {
  const baseProject: CapstoneProject = {
    id: 'proj_test_001',
    title: 'Precision AgriTech IoT',
    subtitle: 'Automated irrigation and soil telemetry.',
    organization: 'College of Computer Studies',
    accessLevel: 'private',
    createdById: 'usr_pm_lead',
    createdByName: 'Lead PM',
    targetDefenseDate: '2026-11-30',
    currentPhaseId: 1,
    overallProgress: 25,
    teamName: 'AgriTech Team',
    inviteCode: 'CF-TEST99',
    adviser: {
      name: 'Faculty Adviser',
      email: 'adviser@university.edu',
      department: 'Computer Science'
    },
    panelMembers: ['Panel Chair'],
    collaborators: [
      {
        id: 'usr_pm_lead',
        name: 'Lead PM',
        avatar: '',
        role: 'Project Manager',
        permission: 'owner'
      },
      {
        id: 'usr_collab_1',
        name: 'Teammate Dev',
        avatar: '',
        role: 'Frontend Dev',
        permission: 'member'
      }
    ]
  };

  it('should have all 4 OOP access level modifiers defined with metadata', () => {
    expect(ACCESS_MODIFIERS['private']).toBeDefined();
    expect(ACCESS_MODIFIERS['package-private']).toBeDefined();
    expect(ACCESS_MODIFIERS['protected']).toBeDefined();
    expect(ACCESS_MODIFIERS['public']).toBeDefined();

    expect(ACCESS_MODIFIERS['private'].badgeLabel).toContain('private');
    expect(ACCESS_MODIFIERS['package-private'].badgeLabel).toContain('package-private');
    expect(ACCESS_MODIFIERS['protected'].badgeLabel).toContain('protected');
    expect(ACCESS_MODIFIERS['public'].badgeLabel).toContain('public');
  });

  describe('Private Modifier (PM & Invite Only)', () => {
    const privateProject: CapstoneProject = { ...baseProject, accessLevel: 'private' };

    it('allows access to the Project Manager (Creator)', () => {
      const result = canUserAccessProject(privateProject, { id: 'usr_pm_lead' });
      expect(result.canAccess).toBe(true);
      expect(result.requiresInvite).toBe(false);
    });

    it('allows access to explicitly enrolled collaborators', () => {
      const result = canUserAccessProject(privateProject, { id: 'usr_collab_1' });
      expect(result.canAccess).toBe(true);
      expect(result.requiresInvite).toBe(false);
    });

    it('blocks external users who are not invited', () => {
      const result = canUserAccessProject(privateProject, { id: 'usr_external_student' });
      expect(result.canAccess).toBe(false);
      expect(result.requiresInvite).toBe(true);
      expect(result.reason).toContain('Private workspace created by the Project Manager');
    });
  });

  describe('Protected Modifier (Department Scope)', () => {
    const protectedProject: CapstoneProject = { ...baseProject, accessLevel: 'protected' };

    it('allows students from the same department/organization', () => {
      const result = canUserAccessProject(protectedProject, { 
        id: 'usr_cs_student', 
        organization: 'College of Computer Studies' 
      });
      expect(result.canAccess).toBe(true);
      expect(result.requiresInvite).toBe(false);
    });

    it('requires invite for students from different academic departments', () => {
      const result = canUserAccessProject(protectedProject, { 
        id: 'usr_med_student', 
        organization: 'College of Nursing' 
      });
      expect(result.canAccess).toBe(false);
      expect(result.requiresInvite).toBe(true);
    });
  });

  describe('Public Modifier (Open Directory)', () => {
    const publicProject: CapstoneProject = { ...baseProject, accessLevel: 'public' };

    it('allows anyone to access and view live progress', () => {
      const result = canUserAccessProject(publicProject, { id: 'usr_anonymous_viewer' });
      expect(result.canAccess).toBe(true);
      expect(result.requiresInvite).toBe(false);
    });
  });
});
