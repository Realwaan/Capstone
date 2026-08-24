/**
 * CapStoneFlow Granular RBAC Permissions Hook (Enterprise Scalability)
 * Controls feature accessibility based on student, lead, adviser, and panel roles.
 */

import { useProject } from '../context/ProjectContext';

export type ActionCapability = 
  | 'create_task'
  | 'edit_task'
  | 'delete_task'
  | 'claim_task'
  | 'submit_standup'
  | 'create_revision'
  | 'approve_revision'
  | 'edit_milestones'
  | 'invite_members'
  | 'delete_project'
  | 'export_manuscript';

export const usePermissions = () => {
  const { project, currentMember, currentRole } = useProject();

  const userRole = (currentRole || currentMember?.role || project?.userRole || 'member').toLowerCase();
  const roleTitle = (currentMember?.roleTitle || '').toLowerCase();
  const isLeaderOrManager = Boolean(
    project?.isOwner ||
    currentMember?.permissionLevel === 'owner' ||
    userRole === 'owner' ||
    userRole === 'leader' ||
    /manager|lead|architect|head|director|admin/i.test(roleTitle)
  );
  const isOwner = isLeaderOrManager;
  const isAdviser = userRole === 'adviser' || userRole === 'reviewer';

  /**
   * Check whether the active user has capability for a specific action
   */
  const can = (action: ActionCapability): boolean => {
    switch (action) {
      case 'delete_project':
        return isLeaderOrManager;

      case 'approve_revision':
        return isAdviser || isOwner;

      case 'edit_milestones':
        return isOwner || isAdviser;

      case 'invite_members':
        return isOwner || userRole === 'editor' || userRole === 'leader';

      case 'delete_task':
        return isOwner || userRole === 'editor';

      case 'create_task':
      case 'edit_task':
      case 'claim_task':
      case 'submit_standup':
      case 'create_revision':
      case 'export_manuscript':
        return true; // All authenticated project collaborators can perform basic sprint operations

      default:
        return true;
    }
  };

  return {
    can,
    userRole,
    isOwner,
    isLeaderOrManager,
    isAdviser
  };
};
