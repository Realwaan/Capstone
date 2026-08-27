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
  onProjectDeleted?: (projectId: string, projectTitle?: string, deletedBy?: string) => void;
}

export class RealtimeHub {
  private activeChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
  private globalChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
  private activeOptions: RealtimeSubscriptionOptions | null = null;
  private currentProjectId: string | null = null;
  public readonly peerId: string = `peer_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

  /**
   * Broadcast an ephemeral or data mutation event directly to all connected peers
   */
  public async broadcast(event: string, payload: Record<string, any>): Promise<boolean> {
    const enrichedPayload = {
      ...payload,
      _senderPeerId: this.peerId,
      _timestamp: Date.now()
    };

    let sent = false;
    if (this.activeChannel) {
      try {
        const res = await this.activeChannel.send({
          type: 'broadcast',
          event,
          payload: enrichedPayload
        });
        if (res === 'ok') sent = true;
      } catch (err) {
        console.warn('[RealtimeHub] Active channel broadcast send failed:', err);
      }
    }

    if (this.globalChannel) {
      try {
        const res = await this.globalChannel.send({
          type: 'broadcast',
          event,
          payload: enrichedPayload
        });
        if (res === 'ok') sent = true;
      } catch (err) {
        console.warn('[RealtimeHub] Global channel broadcast send failed:', err);
      }
    }

    return sent;
  }

  /**
   * Broadcast a project deletion event across active project and global channel
   */
  public async broadcastProjectDeleted(projectId: string, projectTitle?: string, deletedBy?: string): Promise<boolean> {
    return this.broadcast('project_deleted', {
      projectId,
      projectTitle,
      deletedBy
    });
  }

  /**
   * Subscribe to real-time database CDC replication, broadcast channels, and presence tracking
   */
  public subscribe(options: RealtimeSubscriptionOptions): () => void {
    if (!isSupabaseConfigured() || !supabase) {
      return () => {};
    }

    this.activeOptions = options;
    this.currentProjectId = options.projectId;

    // Clean up existing project channel if re-subscribing
    this.unsubscribeProjectChannel();

    try {
      // 1. Subscribe to Global Events Channel (persistent cross-project listener)
      if (!this.globalChannel) {
        const globalChan = supabase.channel('capstone_global_events', {
          config: {
            broadcast: { self: false, ack: true }
          }
        });

        // Global Task Broadcast Handler
        globalChan.on('broadcast', { event: 'task_change' }, (msg: any) => {
          const { eventType, task, projectId, _senderPeerId } = msg.payload || {};
          if (_senderPeerId === this.peerId) return;
          const currentProj = this.activeOptions?.projectId;
          if (!currentProj || !projectId || projectId === currentProj || task?.project_id === currentProj || task?.projectId === currentProj) {
            if (eventType === 'DELETE') {
              if (task?.id && this.activeOptions?.onTaskChange) this.activeOptions.onTaskChange('DELETE', { id: task.id });
            } else if (task && this.activeOptions?.onTaskChange) {
              this.activeOptions.onTaskChange('UPSERT', task);
            }
          }
        });

        // Global Subtask Broadcast Handler
        globalChan.on('broadcast', { event: 'subtask_change' }, (msg: any) => {
          const { eventType, subtask, projectId, _senderPeerId } = msg.payload || {};
          if (_senderPeerId === this.peerId) return;
          const currentProj = this.activeOptions?.projectId;
          if (!currentProj || !projectId || projectId === currentProj) {
            if (this.activeOptions?.onSubtaskChange && subtask) {
              this.activeOptions.onSubtaskChange(eventType, subtask);
            }
          }
        });

        // Global Standup Broadcast Handler
        globalChan.on('broadcast', { event: 'standup_change' }, (msg: any) => {
          const { eventType, standup, projectId, _senderPeerId } = msg.payload || {};
          if (_senderPeerId === this.peerId) return;
          const currentProj = this.activeOptions?.projectId;
          if (!currentProj || !projectId || projectId === currentProj) {
            if (eventType === 'DELETE') {
              if (standup?.id && this.activeOptions?.onStandupChange) this.activeOptions.onStandupChange('DELETE', { id: standup.id });
            } else if (standup && this.activeOptions?.onStandupChange) {
              this.activeOptions.onStandupChange('UPSERT', standup);
            }
          }
        });

        // Global Revision Broadcast Handler
        globalChan.on('broadcast', { event: 'revision_change' }, (msg: any) => {
          const { eventType, revision, projectId, _senderPeerId } = msg.payload || {};
          if (_senderPeerId === this.peerId) return;
          const currentProj = this.activeOptions?.projectId;
          if (!currentProj || !projectId || projectId === currentProj) {
            if (eventType === 'DELETE') {
              if (revision?.id && this.activeOptions?.onRevisionChange) this.activeOptions.onRevisionChange('DELETE', { id: revision.id });
            } else if (revision && this.activeOptions?.onRevisionChange) {
              this.activeOptions.onRevisionChange('UPSERT', revision);
            }
          }
        });

        // Global Structural Change Handler
        globalChan.on('broadcast', { event: 'structural_change' }, (msg: any) => {
          const { projectId, _senderPeerId } = msg.payload || {};
          if (_senderPeerId === this.peerId) return;
          const currentProj = this.activeOptions?.projectId;
          if (!currentProj || !projectId || projectId === currentProj) {
            this.activeOptions?.onStructuralChange?.();
          }
        });

        // Global Project Deletion Handler
        globalChan.on('broadcast', { event: 'project_deleted' }, (msg: any) => {
          const { projectId, projectTitle, deletedBy, _senderPeerId } = msg.payload || {};
          if (_senderPeerId === this.peerId) return;
          if (projectId && this.activeOptions?.onProjectDeleted) {
            this.activeOptions.onProjectDeleted(projectId, projectTitle, deletedBy);
          }
        });

        globalChan.on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'projects' },
          (payload: { old: Record<string, any> }) => {
            if (payload.old?.id && this.activeOptions?.onProjectDeleted) {
              this.activeOptions.onProjectDeleted(payload.old.id, payload.old.title);
            }
          }
        );

        globalChan.subscribe();
        this.globalChannel = globalChan;
      }

      // 2. Subscribe to Project-Scoped Channel
      const channel = supabase.channel(`capstone_live_sync_${options.projectId || 'global'}`, {
        config: {
          presence: {
            key: options.currentUser?.memberId || 'guest'
          },
          broadcast: {
            self: false,
            ack: true
          }
        }
      });

      // ==========================================
      // LAYER 1: Immediate WebSocket Peer Broadcasts (< 50ms)
      // ==========================================
      channel.on('broadcast', { event: 'task_change' }, (msg: any) => {
        const { eventType, task, _senderPeerId } = msg.payload || {};
        if (_senderPeerId === this.peerId) return;
        if (eventType === 'DELETE') {
          if (task?.id && this.activeOptions?.onTaskChange) this.activeOptions.onTaskChange('DELETE', { id: task.id });
        } else if (task && this.activeOptions?.onTaskChange) {
          this.activeOptions.onTaskChange('UPSERT', task);
        }
      });

      channel.on('broadcast', { event: 'subtask_change' }, (msg: any) => {
        const { eventType, subtask, _senderPeerId } = msg.payload || {};
        if (_senderPeerId === this.peerId) return;
        if (this.activeOptions?.onSubtaskChange && subtask) {
          this.activeOptions.onSubtaskChange(eventType, subtask);
        }
      });

      channel.on('broadcast', { event: 'standup_change' }, (msg: any) => {
        const { eventType, standup, _senderPeerId } = msg.payload || {};
        if (_senderPeerId === this.peerId) return;
        if (eventType === 'DELETE') {
          if (standup?.id && this.activeOptions?.onStandupChange) this.activeOptions.onStandupChange('DELETE', { id: standup.id });
        } else if (standup && this.activeOptions?.onStandupChange) {
          this.activeOptions.onStandupChange('UPSERT', standup);
        }
      });

      channel.on('broadcast', { event: 'revision_change' }, (msg: any) => {
        const { eventType, revision, _senderPeerId } = msg.payload || {};
        if (_senderPeerId === this.peerId) return;
        if (eventType === 'DELETE') {
          if (revision?.id && this.activeOptions?.onRevisionChange) this.activeOptions.onRevisionChange('DELETE', { id: revision.id });
        } else if (revision && this.activeOptions?.onRevisionChange) {
          this.activeOptions.onRevisionChange('UPSERT', revision);
        }
      });

      channel.on('broadcast', { event: 'structural_change' }, (msg: any) => {
        const { _senderPeerId } = msg.payload || {};
        if (_senderPeerId === this.peerId) return;
        this.activeOptions?.onStructuralChange?.();
      });

      channel.on('broadcast', { event: 'project_deleted' }, (msg: any) => {
        const { projectId, projectTitle, deletedBy, _senderPeerId } = msg.payload || {};
        if (_senderPeerId === this.peerId) return;
        if (projectId && this.activeOptions?.onProjectDeleted) {
          this.activeOptions.onProjectDeleted(projectId, projectTitle, deletedBy);
        }
      });

      // ==========================================
      // LAYER 2: PostgreSQL CDC WAL Replication (Server Database Triggered)
      // ==========================================
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload: { eventType: string; new: Record<string, any>; old: Record<string, any> }) => {
          const currentProj = this.activeOptions?.projectId;
          if (currentProj) {
            const rowProjId = payload.new?.project_id || payload.old?.project_id;
            if (rowProjId && rowProjId !== currentProj) return;
          }
          if (payload.eventType === 'DELETE') {
            if (payload.old?.id && this.activeOptions?.onTaskChange) {
              this.activeOptions.onTaskChange('DELETE', { id: payload.old.id });
            }
          } else if (payload.new && this.activeOptions?.onTaskChange) {
            try {
              const mappedTask = mapSupabaseTaskRow(payload.new);
              this.activeOptions.onTaskChange('UPSERT', mappedTask);
            } catch (err) {
              console.warn('[RealtimeHub] Failed to map task CDC row; triggering structural refresh', err);
              this.activeOptions?.onStructuralChange?.();
            }
          }
        }
      );

      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks' },
        (payload: { eventType: string; new: Record<string, any>; old: Record<string, any> }) => {
          if (payload.eventType === 'DELETE') {
            if (payload.old?.id && this.activeOptions?.onSubtaskChange) {
              this.activeOptions.onSubtaskChange('DELETE', { id: payload.old.id, taskId: payload.old.task_id });
            }
          } else if (payload.new && this.activeOptions?.onSubtaskChange) {
            this.activeOptions.onSubtaskChange('UPSERT', {
              id: payload.new.id,
              taskId: payload.new.task_id,
              title: payload.new.title,
              completed: Boolean(payload.new.completed)
            });
          }
        }
      );

      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'standups' },
        (payload: { eventType: string; new: Record<string, any>; old: Record<string, any> }) => {
          const currentProj = this.activeOptions?.projectId;
          if (currentProj) {
            const rowProjId = payload.new?.project_id || payload.old?.project_id;
            if (rowProjId && rowProjId !== currentProj) return;
          }
          if (payload.eventType === 'DELETE') {
            if (payload.old?.id && this.activeOptions?.onStandupChange) {
              this.activeOptions.onStandupChange('DELETE', { id: payload.old.id });
            }
          } else if (payload.new && this.activeOptions?.onStandupChange) {
            try {
              const mappedStandup = mapSupabaseStandupRow(payload.new);
              this.activeOptions.onStandupChange('UPSERT', mappedStandup);
            } catch (err) {
              console.warn('[RealtimeHub] Failed to map standup CDC row:', err);
              this.activeOptions?.onStructuralChange?.();
            }
          }
        }
      );

      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'revisions' },
        (payload: { eventType: string; new: Record<string, any>; old: Record<string, any> }) => {
          const currentProj = this.activeOptions?.projectId;
          if (currentProj) {
            const rowProjId = payload.new?.project_id || payload.old?.project_id;
            if (rowProjId && rowProjId !== currentProj) return;
          }
          if (payload.eventType === 'DELETE') {
            if (payload.old?.id && this.activeOptions?.onRevisionChange) {
              this.activeOptions.onRevisionChange('DELETE', { id: payload.old.id });
            }
          } else if (payload.new && this.activeOptions?.onRevisionChange) {
            try {
              const mappedRevision = mapSupabaseRevisionRow(payload.new);
              this.activeOptions.onRevisionChange('UPSERT', mappedRevision);
            } catch (err) {
              console.warn('[RealtimeHub] Failed to map revision CDC row:', err);
              this.activeOptions?.onStructuralChange?.();
            }
          }
        }
      );

      channel.on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'projects' },
        (payload: { old: Record<string, any> }) => {
          if (payload.old?.id && this.activeOptions?.onProjectDeleted) {
            this.activeOptions.onProjectDeleted(payload.old.id, payload.old.title);
          }
        }
      );

      const triggerStructural = () => this.activeOptions?.onStructuralChange?.();
      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, triggerStructural)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, triggerStructural)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'milestone_phases' }, triggerStructural)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'phase_deliverables' }, triggerStructural)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'manuscript_chapters' }, triggerStructural);

      // ==========================================
      // LAYER 3: Peer Presence Tracking
      // ==========================================
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
        this.activeOptions?.onPresenceChange?.(present);
      });

      // Subscribe and track presence
      channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED' && this.activeOptions?.currentUser?.memberId) {
          await channel.track({
            memberId: this.activeOptions.currentUser.memberId,
            name: this.activeOptions.currentUser.name,
            avatar: this.activeOptions.currentUser.avatar,
            githubUsername: this.activeOptions.currentUser.githubUsername,
            roleTitle: this.activeOptions.currentUser.roleTitle,
            onlineAt: new Date().toISOString()
          });
        }
      });

      this.activeChannel = channel;
    } catch (err) {
      console.warn('[RealtimeHub] Failed to initialize realtime channel:', err);
    }

    return () => this.unsubscribeProjectChannel();
  }

  /**
   * Unsubscribe project-specific channel
   */
  public unsubscribeProjectChannel(): void {
    if (this.activeChannel && supabase) {
      supabase.removeChannel(this.activeChannel);
      this.activeChannel = null;
      this.currentProjectId = null;
    }
  }

  /**
   * Unsubscribe and cleanup all channels
   */
  public unsubscribe(): void {
    this.unsubscribeProjectChannel();
    if (this.globalChannel && supabase) {
      supabase.removeChannel(this.globalChannel);
      this.globalChannel = null;
    }
  }
}

export const realtimeHub = new RealtimeHub();
