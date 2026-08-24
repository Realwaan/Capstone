/**
 * CapStoneFlow Realtime WebSocket Hub
 * Centralized subscription manager for PostgreSQL CDC replication,
 * live multiplayer peer presence, and ephemeral broadcasts.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  Task,
  StandupEntry,
  RevisionItem,
  OnlinePresenceUser
} from '../types';
import {
  mapSupabaseTaskRow,
  mapSupabaseStandupRow,
  mapSupabaseRevisionRow
} from './supabaseSync';

export interface PresenceUserInfo {
  memberId: string;
  name: string;
  avatar?: string;
  githubUsername?: string;
  roleTitle?: string;
  onlineAt?: string;
}

export interface SubtaskCDCRecord {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
}

export interface RealtimeSubscriptionOptions {
  projectId: string;
  currentUser?: PresenceUserInfo | null;
  onTaskChange?: (eventType: 'UPSERT' | 'DELETE', task: Task | { id: string }) => void;
  onSubtaskChange?: (eventType: 'UPSERT' | 'DELETE', subtask: SubtaskCDCRecord | { id: string; taskId?: string }) => void;
  onStandupChange?: (eventType: 'UPSERT' | 'DELETE', standup: StandupEntry | { id: string }) => void;
  onRevisionChange?: (eventType: 'UPSERT' | 'DELETE', revision: RevisionItem | { id: string }) => void;
  onPresenceChange?: (users: OnlinePresenceUser[]) => void;
  onStructuralChange?: () => void;
}

export class RealtimeHub {
  private activeChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
  private currentProjectId: string | null = null;

  /**
   * Subscribe to real-time database CDC replication and presence tracking
   */
  public subscribe(options: RealtimeSubscriptionOptions): () => void {
    if (!isSupabaseConfigured() || !supabase) {
      return () => {};
    }

    // Clean up existing channel if re-subscribing
    this.unsubscribe();
    this.currentProjectId = options.projectId;

    try {
      const channel = supabase.channel(`capstone_live_sync_${options.projectId || 'global'}`, {
        config: {
          presence: {
            key: options.currentUser?.memberId || 'guest'
          }
        }
      });

      // 1. Granular Task CDC events
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload: { eventType: string; new: Record<string, any>; old: Record<string, any> }) => {
          if (options.projectId) {
            const rowProjId = payload.new?.project_id || payload.old?.project_id;
            if (rowProjId && rowProjId !== options.projectId) return;
          }
          if (payload.eventType === 'DELETE') {
            if (payload.old?.id && options.onTaskChange) {
              options.onTaskChange('DELETE', { id: payload.old.id });
            }
          } else if (payload.new && options.onTaskChange) {
            try {
              const mappedTask = mapSupabaseTaskRow(payload.new);
              options.onTaskChange('UPSERT', mappedTask);
            } catch (err) {
              console.warn('[RealtimeHub] Failed to map task CDC row; triggering structural refresh', err);
              options.onStructuralChange?.();
            }
          }
        }
      );

      // 2. Granular Subtask CDC events
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks' },
        (payload: { eventType: string; new: Record<string, any>; old: Record<string, any> }) => {
          if (payload.eventType === 'DELETE') {
            if (payload.old?.id && options.onSubtaskChange) {
              options.onSubtaskChange('DELETE', { id: payload.old.id, taskId: payload.old.task_id });
            }
          } else if (payload.new && options.onSubtaskChange) {
            options.onSubtaskChange('UPSERT', {
              id: payload.new.id,
              taskId: payload.new.task_id,
              title: payload.new.title,
              completed: Boolean(payload.new.completed)
            });
          }
        }
      );

      // 3. Granular Standup CDC events
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'standups' },
        (payload: { eventType: string; new: Record<string, any>; old: Record<string, any> }) => {
          if (options.projectId) {
            const rowProjId = payload.new?.project_id || payload.old?.project_id;
            if (rowProjId && rowProjId !== options.projectId) return;
          }
          if (payload.eventType === 'DELETE') {
            if (payload.old?.id && options.onStandupChange) {
              options.onStandupChange('DELETE', { id: payload.old.id });
            }
          } else if (payload.new && options.onStandupChange) {
            try {
              const mappedStandup = mapSupabaseStandupRow(payload.new);
              options.onStandupChange('UPSERT', mappedStandup);
            } catch (err) {
              console.warn('[RealtimeHub] Failed to map standup CDC row:', err);
              options.onStructuralChange?.();
            }
          }
        }
      );

      // 4. Granular Revision CDC events
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'revisions' },
        (payload: { eventType: string; new: Record<string, any>; old: Record<string, any> }) => {
          if (options.projectId) {
            const rowProjId = payload.new?.project_id || payload.old?.project_id;
            if (rowProjId && rowProjId !== options.projectId) return;
          }
          if (payload.eventType === 'DELETE') {
            if (payload.old?.id && options.onRevisionChange) {
              options.onRevisionChange('DELETE', { id: payload.old.id });
            }
          } else if (payload.new && options.onRevisionChange) {
            try {
              const mappedRevision = mapSupabaseRevisionRow(payload.new);
              options.onRevisionChange('UPSERT', mappedRevision);
            } catch (err) {
              console.warn('[RealtimeHub] Failed to map revision CDC row:', err);
              options.onStructuralChange?.();
            }
          }
        }
      );

      // 5. Structural Project / Phase / Member / Manuscript updates
      const triggerStructural = () => options.onStructuralChange?.();
      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, triggerStructural)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, triggerStructural)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'milestone_phases' }, triggerStructural)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'phase_deliverables' }, triggerStructural)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'manuscript_chapters' }, triggerStructural);

      // 5. Peer Presence Tracking
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const present: OnlinePresenceUser[] = [];
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.memberId && !present.some(x => x.memberId === p.memberId)) {
              present.push({
                memberId: p.memberId,
                name: p.name,
                avatar: p.avatar,
                githubUsername: p.githubUsername,
                roleTitle: p.roleTitle,
                onlineAt: p.onlineAt || new Date().toISOString()
              });
            }
          });
        });
        options.onPresenceChange?.(present);
      });

      // 6. Subscribe and track presence
      channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED' && options.currentUser?.memberId) {
          await channel.track({
            memberId: options.currentUser.memberId,
            name: options.currentUser.name,
            avatar: options.currentUser.avatar,
            githubUsername: options.currentUser.githubUsername,
            roleTitle: options.currentUser.roleTitle,
            onlineAt: new Date().toISOString()
          });
        }
      });

      this.activeChannel = channel;
    } catch (err) {
      console.warn('[RealtimeHub] Failed to initialize realtime channel:', err);
    }

    return () => this.unsubscribe();
  }

  /**
   * Unsubscribe and cleanup active channel
   */
  public unsubscribe(): void {
    if (this.activeChannel && supabase) {
      supabase.removeChannel(this.activeChannel);
      this.activeChannel = null;
      this.currentProjectId = null;
    }
  }
}

export const realtimeHub = new RealtimeHub();
