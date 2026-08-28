export type Role = 'leader' | 'developer' | 'qa' | 'researcher' | 'adviser' | 'coordinator';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'peer_review' | 'adviser_review' | 'done';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface DiscordTicketLink {
  taskId?: string;
  guildId: string;
  channelId: string;
  threadId?: string;
  messageId?: string;
  channelUrl: string;
  reused?: boolean;
  syncStatus: 'pending' | 'synced' | 'error';
  lastSyncedAt?: string;
  lastError?: string;
}

export type TaskCategory = 'code' | 'feature' | 'backend' | 'frontend' | 'database' | 'testing' | 'devops' | 'architecture' | 'design' | 'docs';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TicketEvent {
  id: string;
  type: 'claimed' | 'unclaimed' | 'resolved' | 'peer_reviewed' | 'adviser_approved' | 'reviewed' | 'closed' | 'reopened';
  username: string;
  timestamp: string;
  oldStatus: string;
  newStatus: string;
  note?: string;
  prUrl?: string;
}

export type PermissionLevel = 'owner' | 'member' | 'adviser';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleTitle: string;
  permissionLevel: PermissionLevel;
  avatar: string;
  color: string;
  githubUsername?: string;
  lastActive?: string;
}

export interface OnlinePresenceUser {
  memberId: string;
  name: string;
  avatar: string;
  githubUsername?: string;
  roleTitle: string;
  onlineAt: string;
  currentView?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assigneeId: string;
  storyPoints: number;
  estimatedHours: number;
  loggedHours: number;
  dueDate: string;
  subtasks: Subtask[];
  deliverableUrl?: string;
  githubIssueNumber?: number;
  githubPrNumber?: number;
  phaseId: number;
  createdAt: string;
  updatedAt: string;
  attachments?: TaskAttachment[];
  tags?: string[];
  accessModifier?: AccessModifier;
  
  // Ticket Specification & Discord-style Claim System
  problemStatement?: string;
  whatToFix?: string[];
  acceptanceCriteria?: { id: string; text: string; completed: boolean }[];
  relatedFiles?: string[];
  folder?: string;
  createdByUsername?: string;
  claimedAt?: string;
  claimedByUsername?: string;
  prUrl?: string;
  resolvedAt?: string;
  resolvedByUsername?: string;
  peerReviewedAt?: string;
  peerReviewedByUsername?: string;
  adviserReviewedAt?: string;
  adviserReviewedByUsername?: string;
  reviewedAt?: string;
  reviewedByUsername?: string;
  closedAt?: string;
  closedByUsername?: string;
  ticketEvents?: TicketEvent[];
  discordTicket?: DiscordTicketLink;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  fileType?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface PhaseDeliverable {
  id: string;
  title: string;
  completed: boolean;
  requiredForDefense: boolean;
  attachments?: TaskAttachment[];
}

export interface MilestonePhase {
  id: number;
  title: string;
  description: string;
  targetDate: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  progressPercentage: number;
  keyDeliverables: PhaseDeliverable[];
  adviserSignOff: boolean;
  signedOffDate?: string;
  signedOffBy?: string;
  consultationNotes?: string;
  proofUrl?: string;
}

export interface ChapterSection {
  id: string;
  title: string;
  status: 'not_started' | 'drafting' | 'peer_review' | 'adviser_approved';
  pageEstimate: string;
  completed: boolean;
}

export interface ManuscriptChapter {
  id: number;
  chapterNumber: number;
  title: string;
  subtitle: string;
  wordCount: number;
  targetWordCount: number;
  docUrl: string;
  latexUrl?: string;
  lastUpdated: string;
  sections: ChapterSection[];
  adviserStatus: 'needs_revision' | 'in_review' | 'approved' | 'not_submitted';
  draftContent?: string;
  rrlEntries?: any[];
  isoEvaluations?: any[];
}

export interface RevisionItem {
  id: string;
  date: string;
  source: string;
  comment: string;
  chapterOrComponent: string;
  actionTaken: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'verified';
  resolvedDate?: string;
  verifiedBy?: string;
}

export interface StandupEntry {
  id: string;
  memberId: string;
  date: string;
  yesterdayAccomplished: string;
  todayPlan: string;
  blockers: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  target: string;
  icon?: string;
}

export type ProjectStatus = 'active' | 'provisioning' | 'paused' | 'archived';

export type AccessModifier = 'public' | 'protected' | 'package-private' | 'private';

export type ProjectTemplatePreset = 'agile_software' | 'full_coding' | 'hardware_iot' | 'capstone_master' | 'blank_database';

export interface CapstoneProject {
  id: string;
  title: string;
  subtitle: string;
  organization?: string;
  region?: string;
  status?: ProjectStatus;
  accessLevel?: AccessModifier;
  createdById?: string;
  createdByName?: string;
  trackType?: 'full_coding' | 'software_engineering' | 'hardware_iot' | 'research_manuscript';
  hasManuscript?: boolean;
  inviteCode?: string;
  userRole?: 'owner' | 'editor' | 'member' | 'adviser' | 'viewer';
  isOwner?: boolean;
  memberCount?: number;
  collaborators?: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
    permission: 'owner' | 'editor' | 'member' | 'adviser' | 'viewer';
  }>;
  anonKey?: string;
  serviceRoleKey?: string;
  projectUrl?: string;
  databasePassword?: string;
  dbConnectionUri?: string;
  createdAt?: string;
  targetDefenseDate: string;
  proposalDefenseDate?: string;
  currentPhaseId: number;
  overallProgress: number;
  teamName: string;
  githubRepoUrl?: string;
  adviser: {
    name: string;
    email: string;
    department: string;
  };
  panelMembers: string[];
}

export interface NewProjectPayload {
  title: string;
  subtitle?: string;
  organization: string;
  region: string;
  accessLevel?: AccessModifier;
  trackType?: 'full_coding' | 'software_engineering' | 'hardware_iot' | 'research_manuscript';
  hasManuscript?: boolean;
  databasePassword?: string;
  templatePreset: ProjectTemplatePreset;
  targetDefenseDate: string;
  proposalDefenseDate?: string;
  teamName?: string;
  githubRepoUrl?: string;
  adviserName?: string;
  adviserEmail?: string;
  adviserDepartment?: string;
  ownerName?: string;
}

export interface GitHubUser {
  id: number | string;
  login: string;
  name: string;
  avatar_url: string;
  email?: string;
  bio?: string;
  html_url: string;
  public_repos?: number;
  connectedAt: string;
}

export interface GitHubCommit {
  sha: string;
  shortSha?: string;
  message: string;
  description?: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  date: string;
  url: string;
  branch?: string;
  verified?: boolean;
  stats?: {
    additions: number;
    deletions: number;
    totalFiles: number;
  };
  changedFiles?: Array<{
    filename: string;
    status: 'added' | 'modified' | 'deleted';
    additions: number;
    deletions: number;
    patch?: string;
  }>;
  linkedTaskId?: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  author: string;
  authorAvatar?: string;
  html_url: string;
  branch: string;
  targetBranch: string;
  createdAt: string;
  reviewStatus?: 'approved' | 'changes_requested' | 'pending';
  linkedTaskId?: string;
}

// User Profile (Supabase Auth & Community Identity)
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  nickname?: string;
  avatarUrl?: string;
  role: 'student' | 'lead' | 'adviser' | 'panelist' | 'admin';
  bio?: string;
  organization?: string;
  createdAt?: string;
}

// Community Threads & Discussions
export interface CommunityThread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  authorRole?: string;
  tags: string[];
  projectId?: string;
  projectTitle?: string;
  isPinned?: boolean;
  likesCount: number;
  repliesCount: number;
  hasLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Community Replies / Comments
export interface CommunityReply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  authorRole?: string;
  parentId?: string;
  content: string;
  likesCount: number;
  hasLiked?: boolean;
  createdAt: string;
}

// Capstone Milestone & Defense Predictions / Polls
export interface PredictionOption {
  id: string;
  label: string;
  votesCount: number;
  color?: string;
}

export interface Prediction {
  id: string;
  title: string;
  description?: string;
  category: 'milestone' | 'defense' | 'awards' | 'sprint' | 'general';
  projectId?: string;
  projectTitle?: string;
  authorId?: string;
  authorName?: string;
  options: PredictionOption[];
  totalVotes: number;
  userVotedOptionId?: string;
  status: 'active' | 'closed' | 'resolved';
  correctOptionId?: string;
  deadline: string;
  createdAt: string;
}

export interface PredictionVote {
  id: string;
  predictionId: string;
  userId: string;
  selectedOptionId: string;
  createdAt: string;
}

export interface PredictionLeaderboardEntry {
  userId: string;
  username: string;
  nickname?: string;
  avatarUrl?: string;
  role?: string;
  points: number;
  totalPredictions: number;
  correctPredictions: number;
  accuracyPercentage: number;
  badge: string;
}

