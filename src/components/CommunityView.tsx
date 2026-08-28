import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Plus, 
  Search, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  Tag, 
  Pin, 
  Send, 
  X, 
  MessageCircle,
  Award,
  Layers,
  GraduationCap,
  Flame,
  Filter,
  CheckCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { CommunityThread, CommunityReply, UserProfile } from '../types';
import { 
  fetchCommunityThreads, 
  createCommunityThread, 
  toggleCommunityThreadLike,
  fetchThreadReplies,
  createThreadReply
} from '../lib/supabaseSync';
import { useProject } from '../context/ProjectContext';
import { toast } from 'sonner';

const COMMUNITY_TAGS = [
  { id: 'all', label: 'All Topics', icon: Layers },
  { id: 'defense', label: '#DefensePrep', icon: GraduationCap },
  { id: 'manuscript', label: '#ThesisManuscript', icon: Tag },
  { id: 'web', label: '#WebAndApp', icon: Layers },
  { id: 'ai', label: '#AIAndData', icon: Sparkles },
  { id: 'iot', label: '#HardwareIoT', icon: Award },
  { id: 'advice', label: '#TipsAndAdvice', icon: HelpCircle }
];

export const CommunityView: React.FC = () => {
  const { currentMember, project, githubUser } = useProject();

  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'hot' | 'likes'>('latest');

  // Modal & Detail state
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);
  const [activeThreadDetail, setActiveThreadDetail] = useState<CommunityThread | null>(null);
  const [threadReplies, setThreadReplies] = useState<CommunityReply[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // New Thread Form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState<string[]>(['DefensePrep']);
  const [linkProject, setLinkProject] = useState(true);
  const [isSubmittingThread, setIsSubmittingThread] = useState(false);

  // Active current user ID
  const activeUserId = currentMember?.id || `usr_guest_${Date.now()}`;
  const activeUserName = currentMember?.name || (githubUser?.name || 'Community Member');
  const activeUserAvatar = currentMember?.avatar || (githubUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeUserName)}&background=10b981&color=fff&bold=true`);
  const activeUserRole = currentMember?.roleTitle || 'Capstone Researcher';

  const loadThreads = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCommunityThreads(activeUserId);
      if (data && data.length > 0) {
        setThreads(data);
      } else {
        // Mock sample threads for instant rich presentation if DB is fresh
        const sampleThreads: CommunityThread[] = [
          {
            id: 'th_sample_1',
            title: 'Tips for passing Capstone Title & Proposal Defense on first try 🎓',
            content: 'Make sure your problem statement has verifiable metrics. The panel often asks: "What specific baseline are you comparing against?" Don\'t just say "it makes things faster", state "reduces turnaround time by 35% based on existing manual logs". Good luck everyone!',
            authorId: 'usr_sample_lead',
            authorName: 'Engr. Sarah Mendoza',
            authorRole: 'Faculty Adviser',
            authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            tags: ['DefensePrep', 'TipsAndAdvice'],
            isPinned: true,
            likesCount: 24,
            repliesCount: 8,
            hasLiked: false,
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
          },
          {
            id: 'th_sample_2',
            title: 'How our team automated Chapter 4 ISO 25010 Evaluation charts 📊',
            content: 'We integrated automated user survey response parsing into our live dashboard. It generates the mean score, standard deviation, and ISO sub-characteristic radar chart directly for our manuscript!',
            authorId: 'usr_sample_2',
            authorName: 'Marc Andrei Regulacion',
            authorRole: 'Project Lead',
            authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            tags: ['ThesisManuscript', 'WebAndApp'],
            likesCount: 16,
            repliesCount: 3,
            hasLiked: true,
            createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
          },
          {
            id: 'th_sample_3',
            title: 'Best practices for Real-Time IoT telemetry sync without socket memory leaks',
            content: 'If you are using ESP32 with Supabase / WebSockets, ensure you throttle packet transmission to 200ms intervals. Here is our debounce pattern...',
            authorId: 'usr_sample_3',
            authorName: 'Keshie-byte',
            authorRole: 'IoT Specialist',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            tags: ['HardwareIoT', 'AIAndData'],
            likesCount: 19,
            repliesCount: 5,
            hasLiked: false,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setThreads(sampleThreads);
      }
    } catch (e) {
      console.warn('Error loading threads:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [activeUserId]);

  const handleOpenDetail = async (thread: CommunityThread) => {
    setActiveThreadDetail(thread);
    setIsLoadingReplies(true);
    try {
      const replies = await fetchThreadReplies(thread.id, activeUserId);
      if (replies && replies.length > 0) {
        setThreadReplies(replies);
      } else {
        // Sample starter replies
        setThreadReplies([
          {
            id: `rep_${thread.id}_1`,
            threadId: thread.id,
            authorId: 'usr_peer_1',
            authorName: 'David Chen',
            authorRole: 'Software Developer',
            authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            content: 'Super helpful insight! We will be updating our slide deck with verifiable baseline benchmarks before Tuesday.',
            likesCount: 4,
            hasLiked: false,
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
          }
        ]);
      }
    } catch (e) {
      console.warn('Failed to load replies:', e);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleToggleLike = async (threadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Optimistic UI update
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        const nextLiked = !t.hasLiked;
        return {
          ...t,
          hasLiked: nextLiked,
          likesCount: nextLiked ? t.likesCount + 1 : Math.max(0, t.likesCount - 1)
        };
      }
      return t;
    }));

    if (activeThreadDetail && activeThreadDetail.id === threadId) {
      setActiveThreadDetail(prev => prev ? {
        ...prev,
        hasLiked: !prev.hasLiked,
        likesCount: !prev.hasLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1)
      } : null);
    }

    try {
      await toggleCommunityThreadLike(threadId, activeUserId);
    } catch (err) {
      console.warn('Error toggling like:', err);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please enter a title and discussion content.');
      return;
    }

    setIsSubmittingThread(true);
    try {
      const created = await createCommunityThread({
        title: newTitle.trim(),
        content: newContent.trim(),
        authorId: activeUserId,
        authorName: activeUserName,
        authorAvatar: activeUserAvatar,
        authorRole: activeUserRole,
        authorUsername: githubUser?.login,
        tags: newTags,
        projectId: linkProject && project ? project.id : undefined,
        projectTitle: linkProject && project ? project.title : undefined,
        isPinned: false
      });

      const newThreadItem: CommunityThread = created || {
        id: `th_${Date.now()}`,
        title: newTitle.trim(),
        content: newContent.trim(),
        authorId: activeUserId,
        authorName: activeUserName,
        authorAvatar: activeUserAvatar,
        authorRole: activeUserRole,
        authorUsername: githubUser?.login,
        tags: newTags,
        projectId: linkProject && project ? project.id : undefined,
        projectTitle: linkProject && project ? project.title : undefined,
        isPinned: false,
        likesCount: 0,
        repliesCount: 0,
        hasLiked: false,
        createdAt: new Date().toISOString()
      };

      setThreads(prev => [newThreadItem, ...prev]);
      toast.success('Discussion Thread Published!', {
        description: 'Your post is now live across the CapstoneFlow community.'
      });

      setNewTitle('');
      setNewContent('');
      setIsNewThreadOpen(false);
    } catch (err: any) {
      toast.error('Failed to publish thread', { description: err.message });
    } finally {
      setIsSubmittingThread(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadDetail || !newReplyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      const created = await createThreadReply({
        threadId: activeThreadDetail.id,
        authorId: activeUserId,
        authorName: activeUserName,
        authorAvatar: activeUserAvatar,
        authorRole: activeUserRole,
        authorUsername: githubUser?.login,
        content: newReplyContent.trim()
      });

      const newReplyItem: CommunityReply = created || {
        id: `rep_${Date.now()}`,
        threadId: activeThreadDetail.id,
        authorId: activeUserId,
        authorName: activeUserName,
        authorAvatar: activeUserAvatar,
        authorRole: activeUserRole,
        authorUsername: githubUser?.login,
        content: newReplyContent.trim(),
        likesCount: 0,
        hasLiked: false,
        createdAt: new Date().toISOString()
      };

      setThreadReplies(prev => [...prev, newReplyItem]);
      setThreads(prev => prev.map(t => t.id === activeThreadDetail.id ? { ...t, repliesCount: t.repliesCount + 1 } : t));
      setActiveThreadDetail(prev => prev ? { ...prev, repliesCount: prev.repliesCount + 1 } : null);
      setNewReplyContent('');
      toast.success('Comment posted!');
    } catch (err: any) {
      toast.error('Failed to post reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Filter and sort logic
  const filteredThreads = threads.filter(t => {
    const matchesSearch = !searchQuery || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.authorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'all' || 
      t.tags.some(tag => tag.toLowerCase().includes(selectedTag.toLowerCase()) || selectedTag.toLowerCase().includes(tag.toLowerCase()));

    return matchesSearch && matchesTag;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (sortBy === 'likes') return b.likesCount - a.likesCount;
    if (sortBy === 'hot') return (b.likesCount + b.repliesCount * 2) - (a.likesCount + a.repliesCount * 2);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalLikes = threads.reduce((acc, t) => acc + t.likesCount, 0);
  const totalComments = threads.reduce((acc, t) => acc + t.repliesCount, 0);

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Hero Header */}
      <div className="border-b border-border bg-card/40 backdrop-blur-md px-4 sm:px-8 py-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Live Capstone Network
              </span>
              <span className="text-xs text-muted-foreground">• Real-time discussions & advice</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Capstone Community Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Exchange defense tactics, manuscript benchmarks, and tech stack solutions with peer researchers and advisers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick stats */}
            <div className="hidden sm:flex items-center gap-4 bg-secondary/50 border border-border/60 rounded-xl px-4 py-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-foreground">{threads.length}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Discussions</div>
              </div>
              <div className="w-[1px] h-6 bg-border" />
              <div className="text-center">
                <div className="font-bold text-foreground">{totalLikes}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Likes</div>
              </div>
              <div className="w-[1px] h-6 bg-border" />
              <div className="text-center">
                <div className="font-bold text-foreground">{totalComments}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Replies</div>
              </div>
            </div>

            <button
              onClick={() => setIsNewThreadOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span>Start Discussion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6">
        {/* Controls: Search, Topic Tabs, Sort */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search discussions, topics, or authors..."
                className="w-full pl-10 pr-4 py-2 bg-card border border-border/70 rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 bg-secondary/40 p-1 rounded-xl border border-border/60 text-xs">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  sortBy === 'latest' ? 'bg-card text-foreground font-semibold shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Latest</span>
              </button>
              <button
                onClick={() => setSortBy('hot')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  sortBy === 'hot' ? 'bg-card text-foreground font-semibold shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Hot</span>
              </button>
              <button
                onClick={() => setSortBy('likes')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  sortBy === 'likes' ? 'bg-card text-foreground font-semibold shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>Most Liked</span>
              </button>
            </div>
          </div>

          {/* Topic Tags Horizontal Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {COMMUNITY_TAGS.map((tag) => {
              const TagIcon = tag.icon;
              const isSelected = selectedTag === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm font-semibold'
                      : 'bg-card/60 text-muted-foreground hover:text-foreground border-border hover:bg-secondary/60'
                  }`}
                >
                  <TagIcon className="w-3.5 h-3.5" />
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feed List */}
        {isLoading ? (
          <div className="space-y-4 py-8 text-center text-muted-foreground text-sm">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p>Loading community discussions...</p>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="bg-card border border-border/80 rounded-2xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground">No discussions found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              Be the first to share a question or thesis insight with the capstone network.
            </p>
            <button
              onClick={() => setIsNewThreadOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 transition-all"
            >
              Start First Discussion
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => handleOpenDetail(thread)}
                className={`group p-4 sm:p-5 rounded-2xl border bg-card transition-all cursor-pointer hover:border-primary/50 hover:shadow-md ${
                  thread.isPinned 
                    ? 'border-primary/30 bg-primary/[0.02]' 
                    : 'border-border/80 hover:bg-card/90'
                }`}
              >
                {/* Author row & Pinned status */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={thread.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.authorName)}&background=10b981&color=fff`}
                      alt={thread.authorName}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-foreground">
                          {thread.authorName}
                        </span>
                        {thread.authorRole && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground border border-border/40">
                            {thread.authorRole}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(thread.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {thread.isPinned && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Pin className="w-3 h-3" />
                        Pinned
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Preview Content */}
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                  {thread.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                  {thread.content}
                </p>

                {/* Tags & Interaction Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {thread.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary/80 text-muted-foreground border border-border/40"
                      >
                        #{t}
                      </span>
                    ))}
                    {thread.projectTitle && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5" />
                        {thread.projectTitle}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <button
                      onClick={(e) => handleToggleLike(thread.id, e)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                        thread.hasLiked 
                          ? 'text-red-500 bg-red-500/10' 
                          : 'hover:text-red-400 hover:bg-secondary/60'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${thread.hasLiked ? 'fill-current' : ''}`} />
                      <span className="font-semibold">{thread.likesCount}</span>
                    </button>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-secondary/60 transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="font-semibold">{thread.repliesCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Discussion Composer Modal */}
      {isNewThreadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden">
            <button
              onClick={() => setIsNewThreadOpen(false)}
              className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Start Community Discussion</h2>
            </div>

            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Tips for Passing Title Defense or ISO 25010 Evaluation Checklist"
                  required
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Topic Category Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {['DefensePrep', 'ThesisManuscript', 'WebAndApp', 'AIAndData', 'HardwareIoT', 'TipsAndAdvice'].map((tagOption) => {
                    const isSelected = newTags.includes(tagOption);
                    return (
                      <button
                        type="button"
                        key={tagOption}
                        onClick={() => {
                          setNewTags(prev => 
                            isSelected ? prev.filter(t => t !== tagOption) : [...prev, tagOption]
                          );
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary font-semibold'
                            : 'bg-secondary/40 text-muted-foreground border-border/60 hover:text-foreground'
                        }`}
                      >
                        #{tagOption}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Discussion Content / Breakdown
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your technical question, sprint breakthrough, or capstone defense tips..."
                  required
                  rows={5}
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                />
              </div>

              {project && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="linkProj"
                    checked={linkProject}
                    onChange={(e) => setLinkProject(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="linkProj" className="text-xs text-muted-foreground cursor-pointer">
                    Tag current project: <span className="font-semibold text-foreground">{project.title}</span>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewThreadOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingThread}
                  className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {isSubmittingThread ? <span>Publishing...</span> : <span>Publish Discussion</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thread Detail & Replies Modal / Drawer */}
      {activeThreadDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-7 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <img
                  src={activeThreadDetail.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeThreadDetail.authorName)}&background=10b981&color=fff`}
                  alt={activeThreadDetail.authorName}
                  className="w-9 h-9 rounded-full border border-border object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {activeThreadDetail.authorName}
                    </span>
                    {activeThreadDetail.authorRole && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground">
                        {activeThreadDetail.authorRole}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Posted {new Date(activeThreadDetail.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveThreadDetail(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="py-4 overflow-y-auto flex-1 space-y-4 pr-1">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  {activeThreadDetail.title}
                </h2>
                <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                  {activeThreadDetail.content}
                </p>
              </div>

              {/* Tags & Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex flex-wrap gap-1.5">
                  {activeThreadDetail.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary text-muted-foreground">
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleToggleLike(activeThreadDetail.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeThreadDetail.hasLiked
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                      : 'bg-secondary text-muted-foreground hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${activeThreadDetail.hasLiked ? 'fill-current' : ''}`} />
                  <span>{activeThreadDetail.likesCount} Likes</span>
                </button>
              </div>

              {/* Replies Section */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Comments ({threadReplies.length})
                  </h4>
                </div>

                {isLoadingReplies ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">Loading comments...</div>
                ) : threadReplies.length === 0 ? (
                  <div className="p-4 rounded-xl bg-secondary/30 text-center text-xs text-muted-foreground">
                    No comments yet. Start the conversation below!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {threadReplies.map((reply) => (
                      <div key={reply.id} className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <img
                              src={reply.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.authorName)}&background=10b981&color=fff`}
                              alt={reply.authorName}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-xs font-semibold text-foreground">{reply.authorName}</span>
                            {reply.authorRole && (
                              <span className="text-[10px] text-muted-foreground">({reply.authorRole})</span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed pl-7">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Comment Composer Footer */}
            <form onSubmit={handlePostReply} className="pt-3 border-t border-border flex gap-2">
              <input
                type="text"
                value={newReplyContent}
                onChange={(e) => setNewReplyContent(e.target.value)}
                placeholder="Write a constructive response or feedback..."
                required
                className="flex-1 px-3.5 py-2.5 bg-secondary/40 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
              <button
                type="submit"
                disabled={isSubmittingReply || !newReplyContent.trim()}
                className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
