import { supabase, isSupabaseConfigured } from './supabase';
import { cleanProjectTitle } from './projectGenerator';
import { 
  CapstoneProject, 
  TeamMember, 
  Task, 
  TaskAttachment,
  TicketEvent,
  MilestonePhase, 
  StandupEntry, 
  RevisionItem, 
  ActivityLog,
  ManuscriptChapter 
} from '../types';

export interface SupabaseHydrationResult {
  project?: CapstoneProject;
  members?: TeamMember[];
  phases?: MilestonePhase[];
  tasks?: Task[];
  standups?: StandupEntry[];
  revisions?: RevisionItem[];
  activityLogs?: ActivityLog[];
  chapters?: ManuscriptChapter[];
}

export const parseJsonArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
};

export const mapSupabaseTaskRow = (t: any, subtasks: { id: string; title: string; completed: boolean }[] = []): Task => ({
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
  whatToFix: parseJsonArray<string>(t.what_to_fix),
  acceptanceCriteria: parseJsonArray<{ id: string; text: string; completed: boolean }>(t.acceptance_criteria),
  relatedFiles: parseJsonArray<string>(t.related_files),
  attachments: parseJsonArray<TaskAttachment>(t.attachments),
  tags: parseJsonArray<string>(t.tags),
  claimedAt: t.claimed_at,
  claimedByUsername: t.claimed_by_username,
  prUrl: t.pr_url,
  resolvedAt: t.resolved_at,
  resolvedByUsername: t.resolved_by_username,
  peerReviewedAt: t.peer_reviewed_at,
  peerReviewedByUsername: t.peer_reviewed_by_username,
  adviserReviewedAt: t.adviser_reviewed_at,
  adviserReviewedByUsername: t.adviser_reviewed_by_username,
  reviewedAt: t.reviewed_at,
  reviewedByUsername: t.reviewed_by_username,
  closedAt: t.closed_at,
  closedByUsername: t.closed_by_username,
  ticketEvents: parseJsonArray<TicketEvent>(t.ticket_events),
  discordTicket: t.discord_ticket || undefined,
  createdAt: t.created_at,
  updatedAt: t.updated_at,
  subtasks
});

export const mapSupabaseMemberRow = (m: any): TeamMember => ({
  id: m.id,
  name: m.name,
  email: m.email,
  role: m.role,
  roleTitle: m.role_title,
  permissionLevel: m.permission_level,
  avatar: m.avatar,
  color: m.color || '#10b981',
  githubUsername: m.github_username
});

export const mapSupabasePhaseRow = (
  p: any, 
  deliverables: { id: string; title: string; completed: boolean; requiredForDefense: boolean }[] = []
): MilestonePhase => ({
  id: p.id,
  title: p.title,
  description: p.description || '',
  targetDate: p.target_date,
  status: p.status,
  progressPercentage: p.progress_percentage || 0,
  keyDeliverables: deliverables,
  adviserSignOff: p.adviser_sign_off,
  signedOffDate: p.signed_off_date,
  signedOffBy: p.signed_off_by,
  consultationNotes: p.consultation_notes || undefined,
  proofUrl: p.proof_url || undefined
});

export const mapSupabaseChapterRow = (c: any): ManuscriptChapter => ({
  id: c.id,
  chapterNumber: c.chapter_number,
  title: c.title,
  subtitle: c.subtitle || '',
  wordCount: c.word_count || 0,
  targetWordCount: c.target_word_count || 3000,
  docUrl: c.doc_url || '',
  latexUrl: c.latex_url || '',
  lastUpdated: c.last_updated || new Date().toISOString(),
  sections: c.sections ? parseJsonArray<any>(c.sections) : [],
  adviserStatus: c.adviser_status || 'not_submitted',
  draftContent: c.draft_content || '',
  rrlEntries: c.rrl_entries ? parseJsonArray<any>(c.rrl_entries) : [],
  isoEvaluations: c.iso_evaluations ? parseJsonArray<any>(c.iso_evaluations) : []
});

export const mapSupabaseStandupRow = (s: any): StandupEntry => ({
  id: s.id,
  memberId: s.member_id,
  date: s.date,
  yesterdayAccomplished: s.yesterday_accomplished || s.yesterday || '',
  todayPlan: s.today_plan || s.today || '',
  blockers: s.blockers || ''
});

export const mapSupabaseRevisionRow = (r: any): RevisionItem => ({
  id: r.id,
  source: r.source,
  comment: r.comment,
  chapterOrComponent: r.chapter_or_component || r.chapter_or_module || 'General',
  actionTaken: r.action_taken || '',
  status: r.status,
  resolvedDate: r.resolved_date,
  verifiedBy: r.verified_by,
  date: r.date
});

export const mapSupabaseProjectRow = (p: any): CapstoneProject => ({
  id: p.id,
  title: p.title,
  subtitle: p.subtitle,
  teamName: p.team_name,
  targetDefenseDate: p.target_defense_date,
  proposalDefenseDate: p.proposal_defense_date,
  currentPhaseId: p.current_phase_id,
  overallProgress: p.overall_progress,
  githubRepoUrl: p.github_repo_url,
  adviser: {
    name: p.adviser_name,
    email: p.adviser_email,
    department: p.adviser_department
  },
  panelMembers: p.panel_members ? parseJsonArray<any>(p.panel_members) : [],
  inviteCode: p.invite_code || undefined,
  trackType: p.track_type || 'full_coding',
  hasManuscript: p.has_manuscript ?? false,
  organization: p.organization || 'College of Computer Studies',
  region: p.region || 'ap-southeast-1'
});

export const fetchProjectByInviteCode = async (inviteCode: string): Promise<CapstoneProject | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const raw = inviteCode.trim();
    // Extract CF-XXXXXX or clean code from formats like "CF-G8YSW4", "[CF-G8YSW4]", "G8YSW4", "https://...?join=CF-G8YSW4"
    const match = raw.match(/CF-[A-Z0-9]{4,12}/i);
    const clean = (match ? match[0] : raw.replace(/[\[\]]/g, '').split('&')[0].split('-')[0].trim()).toUpperCase();
    const withPrefix = clean.startsWith('CF-') ? clean : `CF-${clean}`;
    const pureCode = clean.replace(/^CF-/, '');

    // Strategy 1: Direct exact match on invite_code with prefix
    const { data: byWithPrefix } = await supabase
      .from('projects')
      .select('*')
      .ilike('invite_code', withPrefix)
      .limit(1)
      .maybeSingle();

    if (byWithPrefix) {
      return mapSupabaseProjectRow(byWithPrefix);
    }

    // Strategy 2: Direct match on invite_code without prefix
    const { data: byClean } = await supabase
      .from('projects')
      .select('*')
      .ilike('invite_code', clean)
      .limit(1)
      .maybeSingle();

    if (byClean) {
      return mapSupabaseProjectRow(byClean);
    }

    // Strategy 3: Substring match on invite_code
    if (pureCode.length >= 3) {
      const { data: bySub } = await supabase
        .from('projects')
        .select('*')
        .ilike('invite_code', `%${pureCode}%`)
        .limit(1)
        .maybeSingle();

      if (bySub) {
        return mapSupabaseProjectRow(bySub);
      }
    }

    // Strategy 4: Match on project ID
    const { data: byId } = await supabase
      .from('projects')
      .select('*')
      .or(`id.eq.${raw},id.ilike.${clean}`)
      .limit(1)
      .maybeSingle();

    if (byId) {
      return mapSupabaseProjectRow(byId);
    }

    // Strategy 5: Full scan of projects sorted by recent update
    const { data: allProjs } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (allProjs && allProjs.length > 0) {
      const found = allProjs.find((p: any) => {
        const pInvite = (p.invite_code || '').toUpperCase();
        const pId = (p.id || '').toUpperCase();
        const pTitle = (p.title || '').toUpperCase();
        return pInvite === clean || 
               pInvite === withPrefix || 
               (pureCode.length >= 3 && pInvite.includes(pureCode)) ||
               pId === clean ||
               pId === raw.toUpperCase() ||
               pId.endsWith(pureCode) ||
               (pureCode.length >= 4 && pTitle.includes(pureCode));
      });
      if (found) return mapSupabaseProjectRow(found);
    }

    return null;
  } catch (e) {
    console.warn('[supabaseSync] fetchProjectByInviteCode error:', e);
    return null;
  }
};

export const fetchAllProjectsFromSupabase = async (): Promise<CapstoneProject[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      if (error) console.warn('[supabaseSync] fetchAllProjects error:', error);
      return [];
    }

    return data.map(mapSupabaseProjectRow);
  } catch (e) {
    console.warn('[supabaseSync] fetchAllProjects failed:', e);
    return [];
  }
};

// Membership-scoped discovery: only projects whose roster contains this
// identity. Client-side scoping is required until real RLS ships (Phase 1).
export const fetchMembershipProjectsFromSupabase = async (
  identityLogin?: string,
  identityEmail?: string
): Promise<CapstoneProject[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  const loginLower = identityLogin?.toLowerCase();
  const emailLower = identityEmail?.toLowerCase();
  if (!loginLower && !emailLower) {
    return fetchAllProjectsFromSupabase();
  }

  try {
    const { data: roster, error: rosterError } = await supabase
      .from('team_members')
      .select('project_id, github_username, email')
      .limit(1000);

    if (rosterError || !roster) {
      if (rosterError) console.warn('[supabaseSync] fetchMembershipProjects roster error:', rosterError);
      return fetchAllProjectsFromSupabase();
    }

    const projectIds = Array.from(new Set(
      roster
        .map(row => {
          const rowLogin = (row.github_username || '').toLowerCase();
          const rowEmail = (row.email || '').toLowerCase();
          const matches =
            (loginLower && rowLogin && rowLogin === loginLower) ||
            (emailLower && rowEmail && rowEmail === emailLower);
          return matches ? row.project_id : null;
        })
        .filter((id): id is string => Boolean(id))
    ));

    if (projectIds.length === 0) {
      return fetchAllProjectsFromSupabase();
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data || data.length === 0) {
      return fetchAllProjectsFromSupabase();
    }

    return data.map(mapSupabaseProjectRow);
  } catch (e) {
    console.warn('[supabaseSync] fetchMembershipProjects failed:', e);
    return fetchAllProjectsFromSupabase();
  }
};

export const fetchAllDataFromSupabase = async (targetProjectId?: string): Promise<SupabaseHydrationResult | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    // 1. Resolve targeted project record
    let projQuery = supabase.from('projects').select('*');
    if (targetProjectId) {
      projQuery = projQuery.eq('id', targetProjectId);
    }
    const projRes = await projQuery.limit(1).maybeSingle();

    if (projRes.error && projRes.error.code !== 'PGRST116') {
      console.warn('Supabase fetch error (projects):', projRes.error);
      return null;
    }

    const resolvedProjectId = projRes.data?.id || targetProjectId;

    // 2. Fetch project-scoped entities in parallel
    let membersQuery = supabase.from('team_members').select('*');
    let phasesQuery = supabase.from('milestone_phases').select('*').order('id', { ascending: true });
    let delivQuery = supabase.from('phase_deliverables').select('*');
    let tasksQuery = supabase.from('tasks').select('*').order('created_at', { ascending: false });
    let subtasksQuery = supabase.from('subtasks').select('*');
    let standupsQuery = supabase.from('standups').select('*').order('created_at', { ascending: false });
    let revsQuery = supabase.from('revisions').select('*').order('created_at', { ascending: false });
    let logsQuery = supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(30);
    let chaptersQuery = supabase.from('manuscript_chapters').select('*').order('chapter_number', { ascending: true });

    if (resolvedProjectId) {
      membersQuery = membersQuery.eq('project_id', resolvedProjectId);
      phasesQuery = phasesQuery.eq('project_id', resolvedProjectId);
      tasksQuery = tasksQuery.eq('project_id', resolvedProjectId);
      standupsQuery = standupsQuery.eq('project_id', resolvedProjectId);
      revsQuery = revsQuery.eq('project_id', resolvedProjectId);
      logsQuery = logsQuery.eq('project_id', resolvedProjectId);
      chaptersQuery = chaptersQuery.eq('project_id', resolvedProjectId);
    }

    const [
      membersRes,
      phasesRes,
      delivRes,
      tasksRes,
      subtasksRes,
      standupsRes,
      revsRes,
      logsRes,
      chaptersRes
    ] = await Promise.all([
      membersQuery,
      phasesQuery,
      delivQuery,
      tasksQuery,
      subtasksQuery,
      standupsQuery,
      revsQuery,
      logsQuery,
      chaptersQuery
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

    const phases: MilestonePhase[] | undefined = phasesRes.data?.map(p => 
      mapSupabasePhaseRow(p, deliverablesByPhaseId[p.id] || [])
    );

    const tasks: Task[] | undefined = tasksRes.data?.map(t => 
      mapSupabaseTaskRow(t, subtasksByTaskId[t.id] || [])
    );

    const members: TeamMember[] | undefined = membersRes.data?.map(mapSupabaseMemberRow);

    const project: CapstoneProject | undefined = projRes.data 
      ? mapSupabaseProjectRow(projRes.data)
      : undefined;

    const standups: StandupEntry[] | undefined = standupsRes.data?.map(mapSupabaseStandupRow);

    const revisions: RevisionItem[] | undefined = revsRes.data?.map(mapSupabaseRevisionRow);

    const activityLogs: ActivityLog[] | undefined = logsRes.data?.map(l => ({
      id: l.id,
      timestamp: l.timestamp,
      userId: l.user_id,
      action: l.action,
      target: l.target
    }));

    const chapters: ManuscriptChapter[] | undefined = chaptersRes.data && chaptersRes.data.length > 0
      ? chaptersRes.data.map(mapSupabaseChapterRow)
      : undefined;

    return {
      project,
      members,
      phases,
      tasks,
      standups,
      revisions,
      activityLogs,
      chapters
    };
  } catch (err) {
    console.error('Supabase fetchAllData error:', err);
    return null;
  }
};

export const buildProjectUpsertPayload = (p: CapstoneProject) => ({
  id: p.id || 'capstone-proj-001',
  title: cleanProjectTitle(p.title) || p.title || '',
  subtitle: p.subtitle || '',
  team_name: p.teamName || '',
  target_defense_date: p.targetDefenseDate || '',
  proposal_defense_date: p.proposalDefenseDate || '',
  current_phase_id: p.currentPhaseId || 1,
  overall_progress: p.overallProgress || 0,
  github_repo_url: p.githubRepoUrl || '',
  adviser_name: p.adviser?.name || '',
  adviser_email: p.adviser?.email || '',
  adviser_department: p.adviser?.department || p.organization || '',
  panel_members: p.panelMembers || [],
  invite_code: p.inviteCode || (p.id ? `CF-${p.id.slice(-6).toUpperCase()}` : undefined),
  track_type: p.trackType || 'full_coding',
  has_manuscript: p.hasManuscript ?? false,
  organization: p.organization || '',
  region: p.region || 'ap-southeast-1'
});

export const seedSupabaseDatabase = async (data: {
  project: CapstoneProject;
  members: TeamMember[];
  phases: MilestonePhase[];
  tasks: Task[];
  standups: StandupEntry[];
  revisions: RevisionItem[];
  chapters?: ManuscriptChapter[];
}): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  const projectId = data.project.id || 'capstone-1';

  try {
    // 1. Seed Project (with automatic schema fallback)
    const projPayload = buildProjectUpsertPayload(data.project);
    const { error: projError } = await supabase.from('projects').upsert(projPayload);
    if (projError) {
      console.warn('[supabaseSync] seedSupabaseDatabase project upsert warning:', projError.message);
      const safePayload: any = { ...projPayload };
      delete safePayload.panel_members;
      await supabase.from('projects').upsert(safePayload);
    }

    // 2. Seed Team Members
    if (data.members.length > 0) {
      await supabase.from('team_members').upsert(
        data.members.map(m => ({
          id: m.id,
          project_id: projectId,
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
          project_id: projectId,
          title: p.title,
          description: p.description,
          target_date: p.targetDate,
          status: p.status,
          progress_percentage: p.progressPercentage,
          adviser_sign_off: p.adviserSignOff,
          signed_off_date: p.signedOffDate,
          signed_off_by: p.signedOffBy,
          consultation_notes: p.consultationNotes,
          proof_url: p.proofUrl
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
          project_id: projectId,
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
          what_to_fix: t.whatToFix || [],
          acceptance_criteria: t.acceptanceCriteria || [],
          related_files: t.relatedFiles || [],
          attachments: t.attachments || [],
          tags: t.tags || [],
          claimed_at: t.claimedAt,
          claimed_by_username: t.claimedByUsername,
          pr_url: t.prUrl,
          resolved_at: t.resolvedAt,
          resolved_by_username: t.resolvedByUsername,
          peer_reviewed_at: t.peerReviewedAt,
          peer_reviewed_by_username: t.peerReviewedByUsername,
          adviser_reviewed_at: t.adviserReviewedAt,
          adviser_reviewed_by_username: t.adviserReviewedByUsername,
          reviewed_at: t.reviewedAt,
          reviewed_by_username: t.reviewedByUsername,
          closed_at: t.closedAt,
          closed_by_username: t.closedByUsername,
          ticket_events: t.ticketEvents || []
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

    // 5. Seed Standups (dual column naming compatibility)
    if (data.standups.length > 0) {
      const standupRows = data.standups.map(s => ({
        id: s.id,
        project_id: projectId,
        member_id: s.memberId,
        date: s.date,
        yesterday: s.yesterdayAccomplished,
        yesterday_accomplished: s.yesterdayAccomplished,
        today: s.todayPlan,
        today_plan: s.todayPlan,
        blockers: s.blockers
      }));
      const { error: sErr } = await supabase.from('standups').upsert(standupRows);
      if (sErr) {
        await supabase.from('standups').upsert(data.standups.map(s => ({
          id: s.id,
          project_id: projectId,
          member_id: s.memberId,
          date: s.date,
          yesterday: s.yesterdayAccomplished,
          today: s.todayPlan,
          blockers: s.blockers
        })));
      }
    }

    // 6. Seed Revisions (dual column naming compatibility)
    if (data.revisions.length > 0) {
      const revisionRows = data.revisions.map(r => ({
        id: r.id,
        project_id: projectId,
        source: r.source,
        source_name: r.source,
        comment: r.comment,
        required_action: r.actionTaken || r.comment,
        chapter_or_module: r.chapterOrComponent,
        chapter_or_component: r.chapterOrComponent,
        action_taken: r.actionTaken,
        status: r.status,
        resolved_date: r.resolvedDate,
        verified_by: r.verifiedBy,
        date: r.date
      }));
      const { error: rErr } = await supabase.from('revisions').upsert(revisionRows);
      if (rErr) {
        await supabase.from('revisions').upsert(data.revisions.map(r => ({
          id: r.id,
          project_id: projectId,
          source: r.source,
          source_name: r.source,
          chapter_or_module: r.chapterOrComponent,
          comment: r.comment,
          required_action: r.actionTaken || r.comment,
          status: r.status,
          action_taken: r.actionTaken,
          date: r.date
        })));
      }
    }

    // 7. Seed Manuscript Chapters
    if (data.chapters && data.chapters.length > 0) {
      await supabase.from('manuscript_chapters').upsert(
        data.chapters.map(c => ({
          id: c.id,
          project_id: projectId,
          chapter_number: c.chapterNumber,
          title: c.title,
          subtitle: c.subtitle,
          word_count: c.wordCount,
          target_word_count: c.targetWordCount,
          doc_url: c.docUrl,
          latex_url: c.latexUrl,
          adviser_status: c.adviserStatus,
          sections: c.sections || [],
          draft_content: c.draftContent || '',
          rrl_entries: c.rrlEntries || [],
          iso_evaluations: c.isoEvaluations || []
        }))
      );
    }

    return true;
  } catch (err) {
    console.error('Supabase seed error:', err);
    return false;
  }
};

export const clearAndSeedSupabaseDatabase = async (data: {
  project: CapstoneProject;
  members: TeamMember[];
  phases: MilestonePhase[];
  tasks: Task[];
  standups?: StandupEntry[];
  revisions?: RevisionItem[];
  chapters?: ManuscriptChapter[];
}): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  const projectId = data.project.id || 'capstone-1';

  try {
    // Delete old records scoped to the targeted project
    await Promise.allSettled([
      supabase.from('activity_logs').delete().eq('project_id', projectId),
      supabase.from('revisions').delete().eq('project_id', projectId),
      supabase.from('standups').delete().eq('project_id', projectId),
      supabase.from('tasks').delete().eq('project_id', projectId),
      supabase.from('milestone_phases').delete().eq('project_id', projectId),
      supabase.from('manuscript_chapters').delete().eq('project_id', projectId),
      supabase.from('team_members').delete().eq('project_id', projectId),
      supabase.from('projects').delete().eq('id', projectId)
    ]);

    return await seedSupabaseDatabase({
      project: data.project,
      members: data.members,
      phases: data.phases,
      tasks: data.tasks,
      standups: data.standups || [],
      revisions: data.revisions || [],
      chapters: data.chapters || []
    });
  } catch (err) {
    console.error('Supabase clearAndSeed error:', err);
    return false;
  }
};

export const resolveActiveProjectId = (explicitId?: string): string => {
  if (explicitId && explicitId.trim() && explicitId !== 'capstone-1' && explicitId !== 'global') {
    return explicitId.trim();
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const identityUser = localStorage.getItem('capstoneflow_state_v10_github_user');
      let identity = 'guest';
      if (identityUser) {
        const parsed = JSON.parse(identityUser);
        if (parsed?.login) identity = `gh_${String(parsed.login).toLowerCase()}`;
      } else if (localStorage.getItem('capstoneflow_state_v10_demo_mode') === 'true') {
        identity = 'demo';
      }

      // 1. Scoped active project
      const scopedSaved = localStorage.getItem(`capstoneflow_active_project_id__${identity}`);
      if (scopedSaved && scopedSaved.trim()) return scopedSaved.trim();

      // 2. Direct active project
      const saved = localStorage.getItem('capstoneflow_active_project_id');
      if (saved && saved.trim()) return saved.trim();

      // 3. Scoped project registry first entry
      const scopedRegistry = localStorage.getItem(`capstoneflow_projects_registry_v1__${identity}`);
      if (scopedRegistry) {
        const parsed = JSON.parse(scopedRegistry);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id) {
          return parsed[0].id;
        }
      }

      // 4. Global project registry fallback
      const globalRegistry = localStorage.getItem('capstoneflow_projects_registry_v1');
      if (globalRegistry) {
        const parsed = JSON.parse(globalRegistry);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id) {
          return parsed[0].id;
        }
      }

      // 5. Active project state fallback
      const activeProjectState = localStorage.getItem('capstoneflow_state_v10_project');
      if (activeProjectState) {
        const parsed = JSON.parse(activeProjectState);
        if (parsed?.id) return parsed.id;
      }
    } catch {}
  }
  return explicitId || 'capstone-proj-001';
};

// Real-Time Upsert / Delete Event Handlers for Supabase
export const syncTaskToSupabase = async (task: Task, projectId?: string) => {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const activeId = resolveActiveProjectId(projectId || (task as any).projectId);
    const payload: Record<string, any> = {
      id: task.id,
      project_id: activeId,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      status: task.status,
      assignee_id: task.assigneeId || null,
      phase_id: task.phaseId || 1,
      story_points: task.storyPoints || 3,
      estimated_hours: task.estimatedHours || 8,
      logged_hours: task.loggedHours || 0,
      due_date: task.dueDate,
      deliverable_url: task.deliverableUrl,
      folder: task.folder,
      problem_statement: task.problemStatement,
      what_to_fix: task.whatToFix || [],
      acceptance_criteria: task.acceptanceCriteria || [],
      related_files: task.relatedFiles || [],
      attachments: task.attachments || [],
      tags: task.tags || [],
      claimed_at: task.claimedAt,
      claimed_by_username: task.claimedByUsername,
      pr_url: task.prUrl,
      resolved_at: task.resolvedAt,
      resolved_by_username: task.resolvedByUsername,
      peer_reviewed_at: task.peerReviewedAt,
      peer_reviewed_by_username: task.peerReviewedByUsername,
      adviser_reviewed_at: task.adviserReviewedAt,
      adviser_reviewed_by_username: task.adviserReviewedByUsername,
      reviewed_at: task.reviewedAt,
      reviewed_by_username: task.reviewedByUsername,
      closed_at: task.closedAt,
      closed_by_username: task.closedByUsername,
      ticket_events: task.ticketEvents || [],
      discord_ticket: task.discordTicket || null
    };

    let { error: taskError } = await supabase.from('tasks').upsert(payload);
    if (taskError) {
      console.warn('[supabaseSync] task upsert rejected, verifying project existence:', taskError);
      // Auto-heal: Ensure project parent row exists in Supabase projects table
      await supabase.from('projects').upsert({
        id: activeId,
        title: 'Capstone Project',
        target_defense_date: task.dueDate || '2026-11-30',
        current_phase_id: task.phaseId || 1,
        overall_progress: 0
      });
      const retryRes = await supabase.from('tasks').upsert(payload);
      taskError = retryRes.error;
    }

    if (taskError) {
      console.error('[supabaseSync] task upsert rejected:', taskError);
      return false;
    }

    if (task.subtasks && task.subtasks.length > 0) {
      const { error: subtasksError } = await supabase.from('subtasks').upsert(
        task.subtasks.map(st => ({
          id: st.id,
          task_id: task.id,
          title: st.title,
          completed: st.completed
        }))
      );
      if (subtasksError) {
        console.warn('[supabaseSync] subtasks upsert warning:', subtasksError);
      }
    }
    return true;
  } catch (e) {
    console.warn('Supabase task sync failed:', e);
    return false;
  }
};

export const deleteTaskFromSupabase = async (taskId: string, projectId?: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    let query = supabase.from('tasks').delete().eq('id', taskId);
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    await query;
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

export const syncPhaseToSupabase = async (phase: MilestonePhase, projectId?: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const activeId = resolveActiveProjectId(projectId);
    const payload: Record<string, any> = {
      id: phase.id,
      project_id: activeId,
      title: phase.title,
      description: phase.description,
      target_date: phase.targetDate,
      status: phase.status,
      progress_percentage: phase.progressPercentage,
      adviser_sign_off: phase.adviserSignOff,
      signed_off_date: phase.signedOffDate,
      signed_off_by: phase.signedOffBy,
      consultation_notes: phase.consultationNotes,
      proof_url: phase.proofUrl
    };
    await supabase.from('milestone_phases').upsert(payload);
  } catch (e) {
    console.warn('Supabase phase sync failed:', e);
  }
};

export const deletePhaseFromSupabase = async (phaseId: number, projectId?: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    let query = supabase.from('milestone_phases').delete().eq('id', phaseId);
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    await query;
  } catch (e) {
    console.warn('Supabase phase delete failed:', e);
  }
};

export const syncStandupToSupabase = async (standup: StandupEntry, projectId?: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const activeId = resolveActiveProjectId(projectId);
    const payload: Record<string, any> = {
      id: standup.id,
      project_id: activeId,
      member_id: standup.memberId,
      date: standup.date,
      yesterday: standup.yesterdayAccomplished,
      yesterday_accomplished: standup.yesterdayAccomplished,
      today: standup.todayPlan,
      today_plan: standup.todayPlan,
      blockers: standup.blockers
    };
    const { error } = await supabase.from('standups').upsert(payload);
    if (error) {
      delete payload.yesterday_accomplished;
      delete payload.today_plan;
      await supabase.from('standups').upsert(payload);
    }
  } catch (e) {
    console.warn('Supabase standup sync failed:', e);
  }
};

export const syncRevisionToSupabase = async (revision: RevisionItem, projectId?: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const activeId = resolveActiveProjectId(projectId);
    const payload: Record<string, any> = {
      id: revision.id,
      project_id: activeId,
      source: revision.source,
      source_name: revision.source,
      comment: revision.comment,
      required_action: revision.actionTaken || revision.comment,
      chapter_or_module: revision.chapterOrComponent,
      chapter_or_component: revision.chapterOrComponent,
      action_taken: revision.actionTaken,
      status: revision.status,
      resolved_date: revision.resolvedDate,
      verified_by: revision.verifiedBy,
      date: revision.date
    };
    const { error } = await supabase.from('revisions').upsert(payload);
    if (error) {
      delete payload.chapter_or_component;
      delete payload.resolved_date;
      delete payload.verified_by;
      await supabase.from('revisions').upsert(payload);
    }
  } catch (e) {
    console.warn('Supabase revision sync failed:', e);
  }
};

export const deleteRevisionFromSupabase = async (revisionId: string, projectId?: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    let query = supabase.from('revisions').delete().eq('id', revisionId);
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    await query;
  } catch (e) {
    console.warn('Supabase revision delete failed:', e);
  }
};

export const syncMemberToSupabase = async (member: TeamMember, projectId?: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const activeId = resolveActiveProjectId(projectId);
    const payload: Record<string, any> = {
      id: member.id,
      project_id: activeId,
      name: member.name,
      email: member.email,
      role: member.role,
      role_title: member.roleTitle,
      permission_level: member.permissionLevel,
      avatar: member.avatar,
      color: member.color,
      github_username: member.githubUsername
    };
    await supabase.from('team_members').upsert(payload);
  } catch (e) {
    console.warn('Supabase member sync failed:', e);
  }
};

export const joinCloudProject = async (projectId: string, member: TeamMember): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const memberIdToUse = member.id || `m_${member.githubUsername || Date.now()}`;
    const { error } = await supabase.from('team_members').upsert({
      id: memberIdToUse,
      project_id: projectId,
      name: member.name,
      email: member.email,
      role: member.role,
      role_title: member.roleTitle,
      permission_level: member.permissionLevel,
      avatar: member.avatar,
      color: member.color,
      github_username: member.githubUsername
    });
    return !error;
  } catch (e) {
    console.warn('[supabaseSync] joinCloudProject error:', e);
    return false;
  }
};

export const deleteMemberFromSupabase = async (memberId: string, projectId?: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    let query = supabase.from('team_members').delete().eq('id', memberId);
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    await query;
  } catch (e) {
    console.warn('Supabase member delete failed:', e);
  }
};

export const syncProjectToSupabase = async (project: CapstoneProject) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const payload = buildProjectUpsertPayload(project);
    const { error } = await supabase.from('projects').upsert(payload);
    if (error) {
      console.warn('[supabaseSync] syncProjectToSupabase warning:', error.message);
      const safePayload: any = { ...payload };
      delete safePayload.panel_members;
      const retry = await supabase.from('projects').upsert(safePayload);
      if (retry.error) {
        console.error('[supabaseSync] syncProjectToSupabase retry failed:', retry.error);
      }
    }
  } catch (e) {
    console.warn('Supabase project sync failed:', e);
  }
};

export const syncChapterToSupabase = async (chapter: ManuscriptChapter, projectId?: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const activeId = resolveActiveProjectId(projectId);
    const payload: Record<string, any> = {
      id: chapter.id,
      project_id: activeId,
      chapter_number: chapter.chapterNumber,
      title: chapter.title,
      subtitle: chapter.subtitle,
      word_count: chapter.wordCount,
      target_word_count: chapter.targetWordCount,
      doc_url: chapter.docUrl,
      latex_url: chapter.latexUrl,
      adviser_status: chapter.adviserStatus,
      sections: chapter.sections || [],
      draft_content: chapter.draftContent || '',
      rrl_entries: chapter.rrlEntries || [],
      iso_evaluations: chapter.isoEvaluations || [],
      last_updated: new Date().toISOString()
    };
    await supabase.from('manuscript_chapters').upsert(payload);
  } catch (e) {
    console.warn('Supabase chapter sync failed:', e);
  }
};

export const deleteChapterFromSupabase = async (chapterId: number, projectId?: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const activeId = resolveActiveProjectId(projectId);
    await supabase
      .from('manuscript_chapters')
      .delete()
      .eq('id', chapterId)
      .eq('project_id', activeId);
  } catch (e) {
    console.warn('Supabase chapter delete failed:', e);
  }
};

export const syncActivityLogToSupabase = async (log: ActivityLog, projectId?: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const activeId = resolveActiveProjectId(projectId);
    await supabase.from('activity_logs').upsert({
      id: log.id,
      project_id: activeId,
      user_id: log.userId,
      action: log.action,
      target: log.target,
      timestamp: log.timestamp || new Date().toISOString()
    });
  } catch (e) {
    console.warn('Supabase activity log sync warning:', e);
  }
};

export const deleteProjectFromSupabase = async (projectId: string) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    // 1. Delete associated child records to prevent foreign key errors
    await Promise.allSettled([
      supabase.from('subtasks').delete().eq('project_id', projectId),
      supabase.from('tasks').delete().eq('project_id', projectId),
      supabase.from('standups').delete().eq('project_id', projectId),
      supabase.from('revisions').delete().eq('project_id', projectId),
      supabase.from('team_members').delete().eq('project_id', projectId),
      supabase.from('phase_deliverables').delete().eq('project_id', projectId),
      supabase.from('milestone_phases').delete().eq('project_id', projectId),
      supabase.from('chapter_sections').delete().eq('project_id', projectId),
      supabase.from('manuscript_chapters').delete().eq('project_id', projectId),
      supabase.from('activity_logs').delete().eq('project_id', projectId)
    ]);

    // 2. Delete parent project row
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) {
      console.warn('[supabaseSync] deleteProjectFromSupabase warning:', error.message);
    }
  } catch (e) {
    console.warn('Supabase project delete failed:', e);
  }
};


