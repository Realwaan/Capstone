import { AccessModifier, CapstoneProject, TeamMember } from '../types';

export interface AccessModifierMeta {
  id: AccessModifier;
  label: string;
  codeName: string;
  badgeLabel: string;
  iconName: 'Lock' | 'Package' | 'Shield' | 'Globe';
  color: string;
  bgLight: string;
  borderLight: string;
  summary: string;
  scopeDescription: string;
  ruleExplanation: string;
}

export const ACCESS_MODIFIERS: Record<AccessModifier, AccessModifierMeta> = {
  'private': {
    id: 'private',
    label: 'Private (Creator / PM & Invite Only)',
    codeName: 'private',
    badgeLabel: '🔒 private',
    iconName: 'Lock',
    color: '#f43f5e',
    bgLight: 'rgba(244, 63, 94, 0.12)',
    borderLight: 'rgba(244, 63, 94, 0.3)',
    summary: 'Strictly restricted to Project Manager and explicitly invited members.',
    scopeDescription: 'Hidden from public directory. Other students/faculty cannot access or view without the Project Invite Code.',
    ruleExplanation: 'Only the project creator and team members with the unique invite code can join or view this workspace.'
  },
  'package-private': {
    id: 'package-private',
    label: 'Package-Private (Cohort / Section Internal)',
    codeName: 'package-private',
    badgeLabel: '📦 package-private',
    iconName: 'Package',
    color: '#3b82f6',
    bgLight: 'rgba(59, 130, 246, 0.12)',
    borderLight: 'rgba(59, 130, 246, 0.3)',
    summary: 'Visible to members within your capstone section, course cohort, or adviser cluster.',
    scopeDescription: 'Accessible to enrolled classmates and faculty in your immediate cohort package; hidden from general directory.',
    ruleExplanation: 'Classmates in your course section can browse the project and request collaborator access.'
  },
  'protected': {
    id: 'protected',
    label: 'Protected (College / Department Scope)',
    codeName: 'protected',
    badgeLabel: '🛡️ protected',
    iconName: 'Shield',
    color: '#f59e0b',
    bgLight: 'rgba(245, 158, 11, 0.12)',
    borderLight: 'rgba(245, 158, 11, 0.3)',
    summary: 'Restricted to authenticated students and faculty within your Department or College.',
    scopeDescription: 'Visible to members belonging to the same academic organization (e.g. College of Computer Studies).',
    ruleExplanation: 'Verified university organization members can view project overview and defense milestones.'
  },
  'public': {
    id: 'public',
    label: 'Public (Open University Directory)',
    codeName: 'public',
    badgeLabel: '🔓 public',
    iconName: 'Globe',
    color: '#10b981',
    bgLight: 'rgba(16, 185, 129, 0.12)',
    borderLight: 'rgba(16, 185, 129, 0.3)',
    summary: 'Discoverable and open to all students, university reviewers, and external viewers.',
    scopeDescription: 'Fully public in the institutional directory, portfolio showcase, and peer discovery.',
    ruleExplanation: 'Anyone with the workspace link can view live progress, deliverables, and architecture.'
  }
};

/**
 * Checks if a user has access to view/enter a project based on its access level modifier.
 */
export const canUserAccessProject = (
  project: CapstoneProject,
  user?: { id?: string; email?: string; organization?: string },
  joinedProjectIds: string[] = []
): { canAccess: boolean; requiresInvite: boolean; reason: string } => {
  const accessLevel = project.accessLevel || 'private';

  // 1. If user is owner/creator or already joined in localStorage
  if (project.isOwner || (user?.id && project.createdById === user.id) || joinedProjectIds.includes(project.id)) {
    return { canAccess: true, requiresInvite: false, reason: 'You are the Project Manager or an enrolled collaborator.' };
  }

  // 2. If user is listed in project collaborators
  if (user?.id && project.collaborators?.some(c => c.id === user.id)) {
    return { canAccess: true, requiresInvite: false, reason: 'You are an authorized collaborator on this project.' };
  }

  // 3. Evaluate Access Level Modifier
  switch (accessLevel) {
    case 'public':
      return { canAccess: true, requiresInvite: false, reason: 'This project is public to all students and faculty.' };

    case 'protected':
      if (user?.organization && project.organization && user.organization.toLowerCase() === project.organization.toLowerCase()) {
        return { canAccess: true, requiresInvite: false, reason: `Accessible under department protection (${project.organization}).` };
      }
      return { canAccess: false, requiresInvite: true, reason: `Restricted to members of ${project.organization || 'the academic department'}. Invite code required for external access.` };

    case 'package-private':
      return { canAccess: false, requiresInvite: true, reason: 'Package-private workspace: Accessible to same course cohort / section. Enter project invite code to join.' };

    case 'private':
    default:
      return { 
        canAccess: false, 
        requiresInvite: true, 
        reason: 'Private workspace created by the Project Manager. Accessible strictly via invite code or direct invitation.' 
      };
  }
};
