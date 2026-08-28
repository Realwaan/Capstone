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
  ManuscriptChapter,
  UserProfile,
  CommunityThread,
  CommunityReply,
  Prediction,
  PredictionOption,
  PredictionVote,
  PredictionLeaderboardEntry
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

export const fetchAllTeamMembersFromSupabase = async (): Promise<Record<string, TeamMember[]>> => {
  if (!isSupabaseConfigured() || !supabase) return {};
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .limit(1000);

    if (error || !data) return {};

    const map: Record<string, TeamMember[]> = {};
    for (const row of data) {
      const projId = row.project_id;
      if (!projId) continue;
      if (!map[projId]) map[projId] = [];
      map[projId].push(mapSupabaseMemberRow(row));
    }
    return map;
  } catch (e) {
    console.warn('[supabaseSync] fetchAllTeamMembersFromSupabase error:', e);
    return {};
  }
};

export const fetchMembershipProjectsFromSupabase = async (
  identityLogin?: string,
  identityEmail?: string
): Promise<CapstoneProject[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  const loginLower = identityLogin?.toLowerCase().replace(/^@/, '');
  const emailLower = identityEmail?.toLowerCase();
  if (!loginLower && !emailLower) {
    return fetchAllProjectsFromSupabase();
  }

  try {
    const [rosterRes, allProjectsRes] = await Promise.all([
      supabase.from('team_members').select('project_id, github_username, email').limit(1000),
      supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(100)
    ]);

    const matchingProjectIds = new Set<string>();

    if (rosterRes.data) {
      for (const row of rosterRes.data) {
        const rowLogin = (row.github_username || '').toLowerCase().replace(/^@/, '');
        const rowEmail = (row.email || '').toLowerCase();
        if ((loginLower && rowLogin && rowLogin === loginLower) || (emailLower && rowEmail && rowEmail === emailLower)) {
          if (row.project_id) matchingProjectIds.add(row.project_id);
        }
      }
    }

    if (allProjectsRes.data) {
      for (const row of allProjectsRes.data) {
        const collaborators = Array.isArray(row.collaborators) ? row.collaborators : [];
        const isCollaborator = collaborators.some((c: any) => {
          const cName = (c.name || '').toLowerCase().replace(/^@/, '');
          const cUsername = (c.githubUsername || '').toLowerCase().replace(/^@/, '');
          return (loginLower && (cName === loginLower || cUsername === loginLower));
        });
        if (isCollaborator) {
          matchingProjectIds.add(row.id);
        }
      }
    }

    if (matchingProjectIds.size > 0 && allProjectsRes.data) {
      const filtered = allProjectsRes.data.filter(p => matchingProjectIds.has(p.id));
      if (filtered.length > 0) {
        return filtered.map(mapSupabaseProjectRow);
      }
    }

    if (allProjectsRes.data && allProjectsRes.data.length > 0) {
      return allProjectsRes.data.map(mapSupabaseProjectRow);
    }

    return [];
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

// ============================================================================
// 1. User Profiles & Supabase Auth Sync (cituintramurals-2026 pattern)
// ============================================================================

export const fetchProfileById = async (userId: string): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      nickname: data.nickname || data.username,
      avatarUrl: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nickname || data.username)}&background=10b981&color=fff&bold=true`,
      role: data.role || 'student',
      bio: data.bio || '',
      organization: data.organization || '',
      createdAt: data.created_at
    };
  } catch (e) {
    console.warn('[supabaseSync] fetchProfileById error:', e);
    return null;
  }
};

export const fetchProfileByUsername = async (username: string): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', username.trim())
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      nickname: data.nickname || data.username,
      avatarUrl: data.avatar_url,
      role: data.role || 'student',
      bio: data.bio || '',
      organization: data.organization || '',
      createdAt: data.created_at
    };
  } catch (e) {
    console.warn('[supabaseSync] fetchProfileByUsername error:', e);
    return null;
  }
};

export const upsertUserProfile = async (profile: UserProfile): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      email: profile.email,
      username: profile.username,
      nickname: profile.nickname || profile.username,
      avatar_url: profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nickname || profile.username)}&background=10b981&color=fff&bold=true`,
      role: profile.role || 'student',
      bio: profile.bio || '',
      organization: profile.organization || '',
      updated_at: new Date().toISOString()
    });
    return !error;
  } catch (e) {
    console.warn('[supabaseSync] upsertUserProfile error:', e);
    return false;
  }
};

// ============================================================================
// 2. Community Discussion Threads & Comments (cituintramurals-2026 pattern)
// ============================================================================

export const fetchCommunityThreads = async (currentUserId?: string): Promise<CommunityThread[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data: threadsData, error: threadsError } = await supabase
      .from('community_threads')
      .select('*')
      .order('created_at', { ascending: false });

    if (threadsError || !threadsData) return [];

    // Fetch author profiles
    const authorIds = Array.from(new Set(threadsData.map(t => t.author_id).filter(Boolean)));
    const { data: profilesData } = authorIds.length > 0
      ? await supabase.from('profiles').select('*').in('id', authorIds)
      : { data: [] };

    const profilesMap = new Map<string, any>((profilesData || []).map(p => [p.id, p]));

    // Fetch user likes if logged in
    let likedThreadIds = new Set<string>();
    if (currentUserId) {
      const { data: likesData } = await supabase
        .from('community_likes')
        .select('thread_id')
        .eq('user_id', currentUserId);
      if (likesData) {
        likedThreadIds = new Set(likesData.map(l => l.thread_id));
      }
    }

    return threadsData.map((t: any) => {
      const author = profilesMap.get(t.author_id);
      return {
        id: t.id,
        title: t.title,
        content: t.content,
        authorId: t.author_id,
        authorName: author?.nickname || author?.username || 'Team Member',
        authorUsername: author?.username,
        authorAvatar: author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.nickname || 'User')}&background=10b981&color=fff&bold=true`,
        authorRole: author?.role || 'student',
        tags: Array.isArray(t.tags) ? t.tags : (t.tags ? [t.tags] : []),
        projectId: t.project_id,
        isPinned: t.is_pinned || false,
        likesCount: t.likes_count || 0,
        repliesCount: t.replies_count || 0,
        hasLiked: likedThreadIds.has(t.id),
        createdAt: t.created_at,
        updatedAt: t.updated_at
      };
    });
  } catch (e) {
    console.warn('[supabaseSync] fetchCommunityThreads error:', e);
    return [];
  }
};

export const createCommunityThread = async (
  thread: Omit<CommunityThread, 'id' | 'likesCount' | 'repliesCount' | 'createdAt'>
): Promise<CommunityThread | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const threadId = `th_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newThreadRow = {
      id: threadId,
      title: thread.title,
      content: thread.content,
      author_id: thread.authorId,
      tags: thread.tags || [],
      project_id: thread.projectId || null,
      is_pinned: thread.isPinned || false,
      likes_count: 0,
      replies_count: 0,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('community_threads').insert(newThreadRow);
    if (error) {
      console.warn('[supabaseSync] createCommunityThread error:', error.message);
      return null;
    }

    return {
      ...thread,
      id: threadId,
      likesCount: 0,
      repliesCount: 0,
      hasLiked: false,
      createdAt: newThreadRow.created_at
    };
  } catch (e) {
    console.warn('[supabaseSync] createCommunityThread failed:', e);
    return null;
  }
};

export const toggleCommunityThreadLike = async (
  threadId: string,
  userId: string
): Promise<{ hasLiked: boolean; newLikesCount: number }> => {
  if (!isSupabaseConfigured() || !supabase) return { hasLiked: false, newLikesCount: 0 };
  try {
    // Check if like exists
    const { data: existing } = await supabase
      .from('community_likes')
      .select('id')
      .eq('thread_id', threadId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // Remove like
      await supabase.from('community_likes').delete().eq('id', existing.id);
      const { data: thread } = await supabase
        .from('community_threads')
        .select('likes_count')
        .eq('id', threadId)
        .single();
      const nextCount = Math.max(0, (thread?.likes_count || 1) - 1);
      await supabase.from('community_threads').update({ likes_count: nextCount }).eq('id', threadId);
      return { hasLiked: false, newLikesCount: nextCount };
    } else {
      // Add like
      await supabase.from('community_likes').insert({
        id: `like_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        thread_id: threadId,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      const { data: thread } = await supabase
        .from('community_threads')
        .select('likes_count')
        .eq('id', threadId)
        .single();
      const nextCount = (thread?.likes_count || 0) + 1;
      await supabase.from('community_threads').update({ likes_count: nextCount }).eq('id', threadId);
      return { hasLiked: true, newLikesCount: nextCount };
    }
  } catch (e) {
    console.warn('[supabaseSync] toggleCommunityThreadLike error:', e);
    return { hasLiked: false, newLikesCount: 0 };
  }
};

export const fetchThreadReplies = async (threadId: string, currentUserId?: string): Promise<CommunityReply[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data: repliesData, error } = await supabase
      .from('community_replies')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error || !repliesData) return [];

    const authorIds = Array.from(new Set(repliesData.map(r => r.author_id).filter(Boolean)));
    const { data: profilesData } = authorIds.length > 0
      ? await supabase.from('profiles').select('*').in('id', authorIds)
      : { data: [] };

    const profilesMap = new Map<string, any>((profilesData || []).map(p => [p.id, p]));

    let likedReplyIds = new Set<string>();
    if (currentUserId) {
      const { data: replyLikes } = await supabase
        .from('community_reply_likes')
        .select('reply_id')
        .eq('user_id', currentUserId);
      if (replyLikes) {
        likedReplyIds = new Set(replyLikes.map(l => l.reply_id));
      }
    }

    return repliesData.map((r: any) => {
      const author = profilesMap.get(r.author_id);
      return {
        id: r.id,
        threadId: r.thread_id,
        authorId: r.author_id,
        authorName: author?.nickname || author?.username || 'Team Member',
        authorUsername: author?.username,
        authorAvatar: author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.nickname || 'User')}&background=10b981&color=fff&bold=true`,
        authorRole: author?.role || 'student',
        parentId: r.parent_id,
        content: r.content,
        likesCount: r.likes_count || 0,
        hasLiked: likedReplyIds.has(r.id),
        createdAt: r.created_at
      };
    });
  } catch (e) {
    console.warn('[supabaseSync] fetchThreadReplies error:', e);
    return [];
  }
};

export const createThreadReply = async (
  reply: Omit<CommunityReply, 'id' | 'likesCount' | 'createdAt'>
): Promise<CommunityReply | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const replyId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReplyRow = {
      id: replyId,
      thread_id: reply.threadId,
      author_id: reply.authorId,
      parent_id: reply.parentId || null,
      content: reply.content,
      likes_count: 0,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('community_replies').insert(newReplyRow);
    if (error) {
      console.warn('[supabaseSync] createThreadReply error:', error.message);
      return null;
    }

    // Increment replies_count on thread
    const { data: thread } = await supabase
      .from('community_threads')
      .select('replies_count')
      .eq('id', reply.threadId)
      .single();
    if (thread) {
      await supabase
        .from('community_threads')
        .update({ replies_count: (thread.replies_count || 0) + 1 })
        .eq('id', reply.threadId);
    }

    return {
      ...reply,
      id: replyId,
      likesCount: 0,
      hasLiked: false,
      createdAt: newReplyRow.created_at
    };
  } catch (e) {
    console.warn('[supabaseSync] createThreadReply failed:', e);
    return null;
  }
};

// ============================================================================
// 3. Capstone Defense & Milestone Predictions Hub (cituintramurals-2026 pattern)
// ============================================================================

export const fetchPredictions = async (currentUserId?: string): Promise<Prediction[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data: predictionsData, error } = await supabase
      .from('predictions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !predictionsData) return [];

    // Fetch user votes if logged in
    let userVotesMap = new Map<string, string>();
    if (currentUserId) {
      const { data: votesData } = await supabase
        .from('prediction_votes')
        .select('prediction_id, selected_option_id')
        .eq('user_id', currentUserId);
      if (votesData) {
        userVotesMap = new Map(votesData.map(v => [v.prediction_id, v.selected_option_id]));
      }
    }

    // Fetch total votes per prediction
    const { data: allVotes } = await supabase.from('prediction_votes').select('prediction_id, selected_option_id');

    const votesByPredAndOption = new Map<string, number>();
    const totalVotesByPred = new Map<string, number>();

    (allVotes || []).forEach(v => {
      totalVotesByPred.set(v.prediction_id, (totalVotesByPred.get(v.prediction_id) || 0) + 1);
      const key = `${v.prediction_id}_${v.selected_option_id}`;
      votesByPredAndOption.set(key, (votesByPredAndOption.get(key) || 0) + 1);
    });

    return predictionsData.map((p: any) => {
      const rawOptions = parseJsonArray<any>(p.options);
      const options: PredictionOption[] = rawOptions.map((opt: any) => ({
        id: opt.id || String(opt),
        label: opt.label || String(opt),
        votesCount: votesByPredAndOption.get(`${p.id}_${opt.id || opt}`) || opt.votesCount || 0,
        color: opt.color || '#10b981'
      }));

      return {
        id: p.id,
        title: p.title,
        description: p.description || '',
        category: p.category || 'milestone',
        projectId: p.project_id,
        authorId: p.author_id,
        options,
        totalVotes: totalVotesByPred.get(p.id) || 0,
        userVotedOptionId: userVotesMap.get(p.id),
        status: p.status || 'active',
        correctOptionId: p.correct_option_id,
        deadline: p.deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
        createdAt: p.created_at
      };
    });
  } catch (e) {
    console.warn('[supabaseSync] fetchPredictions error:', e);
    return [];
  }
};

export const createPrediction = async (
  pred: Omit<Prediction, 'id' | 'totalVotes' | 'createdAt'>
): Promise<Prediction | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const predId = `pred_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newPredRow = {
      id: predId,
      title: pred.title,
      description: pred.description || '',
      category: pred.category || 'milestone',
      project_id: pred.projectId || null,
      author_id: pred.authorId || null,
      options: pred.options || [],
      status: pred.status || 'active',
      correct_option_id: pred.correctOptionId || null,
      deadline: pred.deadline,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('predictions').insert(newPredRow);
    if (error) {
      console.warn('[supabaseSync] createPrediction error:', error.message);
      return null;
    }

    return {
      ...pred,
      id: predId,
      totalVotes: 0,
      createdAt: newPredRow.created_at
    };
  } catch (e) {
    console.warn('[supabaseSync] createPrediction failed:', e);
    return null;
  }
};

export const castPredictionVote = async (
  predictionId: string,
  userId: string,
  selectedOptionId: string
): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const voteId = `vote_${predictionId}_${userId}`;
    const { error } = await supabase.from('prediction_votes').upsert({
      id: voteId,
      prediction_id: predictionId,
      user_id: userId,
      selected_option_id: selectedOptionId,
      created_at: new Date().toISOString()
    });

    return !error;
  } catch (e) {
    console.warn('[supabaseSync] castPredictionVote error:', e);
    return false;
  }
};

export const fetchPredictionLeaderboard = async (): Promise<PredictionLeaderboardEntry[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: votes } = await supabase.from('prediction_votes').select('*');
    const { data: predictions } = await supabase.from('predictions').select('*');

    if (!profiles || profiles.length === 0) return [];

    const predMap = new Map<string, any>((predictions || []).map(p => [p.id, p]));

    const userStats = new Map<string, { total: number; correct: number }>();
    (votes || []).forEach(v => {
      const current = userStats.get(v.user_id) || { total: 0, correct: 0 };
      current.total += 1;
      const pred = predMap.get(v.prediction_id);
      if (pred && pred.status === 'resolved' && pred.correct_option_id === v.selected_option_id) {
        current.correct += 1;
      }
      userStats.set(v.user_id, current);
    });

    return profiles.map(p => {
      const stats = userStats.get(p.id) || { total: 0, correct: 0 };
      const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      const points = stats.correct * 100 + stats.total * 10;
      
      let badge = 'Novice Predictor';
      if (stats.correct >= 10) badge = 'Defense Master';
      else if (stats.correct >= 5) badge = 'Sprint Prophet';
      else if (stats.total >= 3) badge = 'Active Analyst';

      return {
        userId: p.id,
        username: p.username,
        nickname: p.nickname || p.username,
        avatarUrl: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nickname || p.username)}&background=10b981&color=fff&bold=true`,
        role: p.role,
        points,
        totalPredictions: stats.total,
        correctPredictions: stats.correct,
        accuracyPercentage: accuracy,
        badge
      };
    }).sort((a, b) => b.points - a.points);
  } catch (e) {
    console.warn('[supabaseSync] fetchPredictionLeaderboard error:', e);
    return [];
  }
};



