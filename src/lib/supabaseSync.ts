import { supabase, isSupabaseConfigured } from './supabase';
import { 
  CapstoneProject, 
  TeamMember, 
  Task, 
  MilestonePhase, 
  StandupEntry, 
  RevisionItem, 
  ActivityLog 
} from '../types';

export interface SupabaseHydrationResult {
  project?: CapstoneProject;
  members?: TeamMember[];
  phases?: MilestonePhase[];
  tasks?: Task[];
  standups?: StandupEntry[];
  revisions?: RevisionItem[];
  activityLogs?: ActivityLog[];
}

export const fetchAllDataFromSupabase = async (): Promise<SupabaseHydrationResult | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const [
      projRes,
      membersRes,
      phasesRes,
      delivRes,
      tasksRes,
      subtasksRes,
      standupsRes,
      revsRes,
      logsRes
    ] = await Promise.all([
      supabase.from('projects').select('*').limit(1).maybeSingle(),
      supabase.from('team_members').select('*'),
      supabase.from('milestone_phases').select('*').order('id', { ascending: true }),
      supabase.from('phase_deliverables').select('*'),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('subtasks').select('*'),
      supabase.from('standups').select('*').order('created_at', { ascending: false }),
      supabase.from('revisions').select('*').order('created_at', { ascending: false }),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(30)
    ]);

    if (projRes.error && projRes.error.code !== 'PGRST116') {
      console.warn('Supabase fetch error (projects):', projRes.error);
      return null;
    }

    const subtasksByTaskId: Record<string, { id: string; title: string; completed: boolean }[]> = {};
    if (subtasksRes.data) {
      for (const st of subtasksRes.data) {
        if (!subtasksByTaskId[st.task_id]) subtasksByTaskId[st.task_id] = [];
        subtasksByTaskId[st.task_id].push({
          id: st.id,
          title: st.title,
          completed: st.completed
        });
      }
    }

    const deliverablesByPhaseId: Record<number, { id: string; title: string; completed: boolean; requiredForDefense: boolean }[]> = {};
    if (delivRes.data) {
      for (const d of delivRes.data) {
        if (!deliverablesByPhaseId[d.phase_id]) deliverablesByPhaseId[d.phase_id] = [];
        deliverablesByPhaseId[d.phase_id].push({
          id: d.id,
          title: d.title,
          completed: d.completed,
          requiredForDefense: d.required_for_defense
        });
      }
    }

    const phases: MilestonePhase[] | undefined = phasesRes.data?.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description || '',
      targetDate: p.target_date,
      status: p.status,
      progressPercentage: p.progress_percentage || 0,
      keyDeliverables: deliverablesByPhaseId[p.id] || [],
      adviserSignOff: p.adviser_sign_off,
      signedOffDate: p.signed_off_date
    }));

    const tasks: Task[] | undefined = tasksRes.data?.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      category: t.category,
      priority: t.priority,
      status: t.status,
      assigneeId: t.assignee_id || '',
      phaseId: t.phase_id,
      storyPoints: t.story_points,
      estimatedHours: t.estimated_hours,
      loggedHours: t.logged_hours,
      dueDate: t.due_date,
      deliverableUrl: t.deliverable_url,
      folder: t.folder,
      problemStatement: t.problem_statement,
      prUrl: t.pr_url,
      resolvedAt: t.resolved_at,
      resolvedByUsername: t.resolved_by_username,
      reviewedAt: t.reviewed_at,
      reviewedByUsername: t.reviewed_by_username,
      closedAt: t.closed_at,
      closedByUsername: t.closed_by_username,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      subtasks: subtasksByTaskId[t.id] || []
    }));

    const members: TeamMember[] | undefined = membersRes.data?.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      roleTitle: m.role_title,
      permissionLevel: m.permission_level,
      avatar: m.avatar,
      color: m.color || '#10b981',
      githubUsername: m.github_username
    }));

    let project: CapstoneProject | undefined = undefined;
    if (projRes.data) {
      project = {
        id: projRes.data.id,
        title: projRes.data.title,
        subtitle: projRes.data.subtitle,
        teamName: projRes.data.team_name,
        targetDefenseDate: projRes.data.target_defense_date,
        proposalDefenseDate: projRes.data.proposal_defense_date,
        currentPhaseId: projRes.data.current_phase_id,
        overallProgress: projRes.data.overall_progress,
        githubRepoUrl: projRes.data.github_repo_url,
        adviser: {
          name: projRes.data.adviser_name,
          email: projRes.data.adviser_email,
          department: projRes.data.adviser_department
        },
        panelMembers: projRes.data.panel_members ? JSON.parse(projRes.data.panel_members) : []
      };
    }

    const standups: StandupEntry[] | undefined = standupsRes.data?.map(s => ({
      id: s.id,
      memberId: s.member_id,
      date: s.date,
      yesterdayAccomplished: s.yesterday_accomplished || s.yesterday || '',
      todayPlan: s.today_plan || s.today || '',
      blockers: s.blockers || ''
    }));

    const revisions: RevisionItem[] | undefined = revsRes.data?.map(r => ({
      id: r.id,
      source: r.source,
      comment: r.comment,
      chapterOrComponent: r.chapter_or_component || r.chapter_or_module || 'General',
      actionTaken: r.action_taken || '',
      status: r.status,
      resolvedDate: r.resolved_date,
      verifiedBy: r.verified_by,
      date: r.date
    }));

    const activityLogs: ActivityLog[] | undefined = logsRes.data?.map(l => ({
      id: l.id,
      timestamp: l.timestamp,
      userId: l.user_id,
      action: l.action,
      target: l.target
    }));

    return {
      project,
      members,
      phases,
      tasks,
      standups,
      revisions,
      activityLogs
    };
  } catch (err) {
    console.error('Supabase fetchAllData error:', err);
    return null;
  }
};

export const seedSupabaseDatabase = async (data: {
  project: CapstoneProject;
  members: TeamMember[];
  phases: MilestonePhase[];
  tasks: Task[];
  standups: StandupEntry[];
  revisions: RevisionItem[];
}): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    // 1. Seed Project
    await supabase.from('projects').upsert({
      id: data.project.id || 'capstone-1',
      title: data.project.title,
      subtitle: data.project.subtitle,
      team_name: data.project.teamName,
      target_defense_date: data.project.targetDefenseDate,
      proposal_defense_date: data.project.proposalDefenseDate,
      current_phase_id: data.project.currentPhaseId,
      overall_progress: data.project.overallProgress,
      github_repo_url: data.project.githubRepoUrl,
      adviser_name: data.project.adviser.name,
      adviser_email: data.project.adviser.email,
      adviser_department: data.project.adviser.department,
      panel_members: JSON.stringify(data.project.panelMembers || [])
    });

    // 2. Seed Team Members
    if (data.members.length > 0) {
      await supabase.from('team_members').upsert(
        data.members.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          role_title: m.roleTitle,
          permission_level: m.permissionLevel,
          avatar: m.avatar,
          color: m.color,
          github_username: m.githubUsername
        }))
      );
    }

    // 3. Seed Milestone Phases & Deliverables
    if (data.phases.length > 0) {
      await supabase.from('milestone_phases').upsert(
        data.phases.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          target_date: p.targetDate,
          status: p.status,
          progress_percentage: p.progressPercentage,
          adviser_sign_off: p.adviserSignOff,
          signed_off_date: p.signedOffDate
        }))
      );

      const allDeliverables = data.phases.flatMap(p => 
        p.keyDeliverables.map(d => ({
          id: d.id,
          phase_id: p.id,
          title: d.title,
          completed: d.completed,
          required_for_defense: d.requiredForDefense
        }))
      );

      if (allDeliverables.length > 0) {
        await supabase.from('phase_deliverables').upsert(allDeliverables);
      }
    }

    // 4. Seed Tasks & Subtasks
    if (data.tasks.length > 0) {
      await supabase.from('tasks').upsert(
        data.tasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          category: t.category,
          priority: t.priority,
          status: t.status,
          assignee_id: t.assigneeId || null,
          phase_id: t.phaseId,
          story_points: t.storyPoints,
          estimated_hours: t.estimatedHours,
          logged_hours: t.loggedHours,
          due_date: t.dueDate,
          deliverable_url: t.deliverableUrl,
          folder: t.folder,
          problem_statement: t.problemStatement,
          pr_url: t.prUrl,
          resolved_at: t.resolvedAt,
          resolved_by_username: t.resolvedByUsername,
          reviewed_at: t.reviewedAt,
          reviewed_by_username: t.reviewedByUsername,
          closed_at: t.closedAt,
          closed_by_username: t.closedByUsername
        }))
      );

      const allSubtasks = data.tasks.flatMap(t => 
        (t.subtasks || []).map(st => ({
          id: st.id,
          task_id: t.id,
          title: st.title,
          completed: st.completed
        }))
      );

      if (allSubtasks.length > 0) {
        await supabase.from('subtasks').upsert(allSubtasks);
      }
    }

    // 5. Seed Standups
    if (data.standups.length > 0) {
      await supabase.from('standups').upsert(
        data.standups.map(s => ({
          id: s.id,
          member_id: s.memberId,
          date: s.date,
          yesterday_accomplished: s.yesterdayAccomplished,
          today_plan: s.todayPlan,
          blockers: s.blockers
        }))
      );
    }

    // 6. Seed Revisions
    if (data.revisions.length > 0) {
      await supabase.from('revisions').upsert(
        data.revisions.map(r => ({
          id: r.id,
          source: r.source,
          comment: r.comment,
          chapter_or_component: r.chapterOrComponent,
          action_taken: r.actionTaken,
          status: r.status,
          resolved_date: r.resolvedDate,
          verified_by: r.verifiedBy,
          date: r.date
        }))
      );
    }

    return true;
  } catch (err) {
    console.error('Supabase seed error:', err);
    return false;
  }
};

// Real-Time Upsert / Delete Event Handlers for Supabase
export const syncTaskToSupabase = async (task: Task) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('tasks').upsert({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      status: task.status,
      assignee_id: task.assigneeId || null,
      phase_id: task.phaseId,
      story_points: task.storyPoints,
      estimated_hours: task.estimatedHours,
      logged_hours: task.loggedHours,
      due_date: task.dueDate,
      deliverable_url: task.deliverableUrl,
      folder: task.folder,
      problem_statement: task.problemStatement,
      pr_url: task.prUrl,
      resolved_at: task.resolvedAt,
      resolved_by_username: task.resolvedByUsername,
      reviewed_at: task.reviewedAt,
      reviewed_by_username: task.reviewedByUsername,
      closed_at: task.closedAt,
      closed_by_username: task.closedByUsername
    });

    if (task.subtasks && task.subtasks.length > 0) {
      await supabase.from('subtasks').upsert(
        task.subtasks.map(st => ({
          id: st.id,
          task_id: task.id,
          title: st.title,
          completed: st.completed
        }))
      );
    }
  } catch (e) {
    console.warn('Supabase task sync failed:', e);
  }
};

export const deleteTaskFromSupabase = async (taskId: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('tasks').delete().eq('id', taskId);
  } catch (e) {
    console.warn('Supabase task delete failed:', e);
  }
};

export const syncDeliverableToSupabase = async (phaseId: number, deliverable: { id: string; title: string; completed: boolean; requiredForDefense: boolean }) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('phase_deliverables').upsert({
      id: deliverable.id,
      phase_id: phaseId,
      title: deliverable.title,
      completed: deliverable.completed,
      required_for_defense: deliverable.requiredForDefense
    });
  } catch (e) {
    console.warn('Supabase deliverable sync failed:', e);
  }
};

export const deleteDeliverableFromSupabase = async (deliverableId: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('phase_deliverables').delete().eq('id', deliverableId);
  } catch (e) {
    console.warn('Supabase deliverable delete failed:', e);
  }
};

export const syncPhaseToSupabase = async (phase: MilestonePhase) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('milestone_phases').upsert({
      id: phase.id,
      title: phase.title,
      description: phase.description,
      target_date: phase.targetDate,
      status: phase.status,
      progress_percentage: phase.progressPercentage,
      adviser_sign_off: phase.adviserSignOff,
      signed_off_date: phase.signedOffDate
    });
  } catch (e) {
    console.warn('Supabase phase sync failed:', e);
  }
};

export const deletePhaseFromSupabase = async (phaseId: number) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('milestone_phases').delete().eq('id', phaseId);
  } catch (e) {
    console.warn('Supabase phase delete failed:', e);
  }
};

export const syncStandupToSupabase = async (standup: StandupEntry) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('standups').upsert({
      id: standup.id,
      member_id: standup.memberId,
      date: standup.date,
      yesterday_accomplished: standup.yesterdayAccomplished,
      today_plan: standup.todayPlan,
      blockers: standup.blockers
    });
  } catch (e) {
    console.warn('Supabase standup sync failed:', e);
  }
};

export const syncRevisionToSupabase = async (revision: RevisionItem) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('revisions').upsert({
      id: revision.id,
      source: revision.source,
      comment: revision.comment,
      chapter_or_component: revision.chapterOrComponent,
      action_taken: revision.actionTaken,
      status: revision.status,
      resolved_date: revision.resolvedDate,
      verified_by: revision.verifiedBy,
      date: revision.date
    });
  } catch (e) {
    console.warn('Supabase revision sync failed:', e);
  }
};

export const deleteRevisionFromSupabase = async (revisionId: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('revisions').delete().eq('id', revisionId);
  } catch (e) {
    console.warn('Supabase revision delete failed:', e);
  }
};
