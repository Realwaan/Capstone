import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Plus, 
  Search, 
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
  HelpCircle,
  CheckCircle,
  CornerDownRight
} from 'lucide-react';
import { CommunityThread, CommunityReply } from '../types';
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
        const sampleReplies: CommunityReply[] = [
          {
            id: 'rep_sample_1',
            threadId: thread.id,
            authorId: 'usr_sarah',
            authorName: 'Engr. Sarah Mendoza',
            authorRole: 'Faculty Adviser',
            authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            content: 'Great insight! Also make sure your system architecture diagram includes database connection pools.',
            likesCount: 5,
            hasLiked: false,
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
          },
          {
            id: 'rep_sample_2',
            threadId: thread.id,
            authorId: 'usr_marc',
            authorName: 'Marc Andrei',
            authorRole: 'Student Lead',
            authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            content: 'Thanks for this! We will apply this rubric to our title defense presentation.',
            likesCount: 2,
            hasLiked: true,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        setThreadReplies(sampleReplies);
      }
    } catch (e) {
      console.warn('Error fetching replies:', e);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleToggleLike = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;

    const newLiked = !thread.hasLiked;
    const newCount = newLiked ? thread.likesCount + 1 : Math.max(0, thread.likesCount - 1);

    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, hasLiked: newLiked, likesCount: newCount } : t));
    if (activeThreadDetail && activeThreadDetail.id === threadId) {
      setActiveThreadDetail(prev => prev ? { ...prev, hasLiked: newLiked, likesCount: newCount } : null);
    }

    try {
      await toggleCommunityThreadLike(threadId, activeUserId);
    } catch {
      // Revert if error
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, hasLiked: !newLiked, likesCount: thread.likesCount } : t));
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please enter a thread title and content.');
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
    } catch {
      toast.error('Failed to post reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

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
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)', paddingBottom: '90px' }}>
      
      {/* Hero Header Section */}
      <div style={{ 
        borderBottom: '1px solid var(--border-subtle)', 
        background: 'var(--bg-card)', 
        backdropFilter: 'blur(16px)',
        padding: '24px 24px 20px 24px' 
      }}>
        <div style={{ 
          maxWidth: '1080px', 
          margin: '0 auto', 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px' 
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: 'var(--radius-full)', 
                fontSize: '0.68rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                background: 'var(--primary-light)', 
                color: 'var(--primary)',
                border: '1px solid rgba(48, 209, 88, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={11} />
                Live Capstone Network
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>• Real-time discussions & advice</span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Capstone Community Hub
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0', maxWidth: '580px' }}>
              Exchange defense tactics, manuscript benchmarks, and tech stack solutions with peer researchers and advisers.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Quick stats badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '6px 14px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>{threads.length}</div>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Discussions</div>
              </div>
              <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalLikes}</div>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Likes</div>
              </div>
              <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalComments}</div>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Replies</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsNewThreadOpen(true)}
              className="btn btn-primary"
              style={{
                height: '36px',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <Plus size={15} />
              <span>Start Discussion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '20px 20px 0 20px' }}>
        
        {/* Search, Filter Tabs & Sort Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '420px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search discussions, topics, or authors..."
                style={{
                  width: '100%',
                  height: '34px',
                  paddingLeft: '34px',
                  paddingRight: '12px',
                  fontSize: '0.8rem',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Sort Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--bg-elevated)',
              padding: '3px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-card)'
            }}>
              <button
                type="button"
                onClick={() => setSortBy('latest')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontWeight: sortBy === 'latest' ? 700 : 500,
                  borderRadius: 'var(--radius-md)',
                  background: sortBy === 'latest' ? 'var(--bg-card)' : 'transparent',
                  color: sortBy === 'latest' ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: sortBy === 'latest' ? '1px solid var(--border-card)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <Clock size={12} />
                <span>Latest</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy('hot')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontWeight: sortBy === 'hot' ? 700 : 500,
                  borderRadius: 'var(--radius-md)',
                  background: sortBy === 'hot' ? 'var(--bg-card)' : 'transparent',
                  color: sortBy === 'hot' ? '#f59e0b' : 'var(--text-muted)',
                  border: sortBy === 'hot' ? '1px solid var(--border-card)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <Flame size={12} />
                <span>Hot</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy('likes')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontWeight: sortBy === 'likes' ? 700 : 500,
                  borderRadius: 'var(--radius-md)',
                  background: sortBy === 'likes' ? 'var(--bg-card)' : 'transparent',
                  color: sortBy === 'likes' ? '#f43f5e' : 'var(--text-muted)',
                  border: sortBy === 'likes' ? '1px solid var(--border-card)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <Heart size={12} />
                <span>Most Liked</span>
              </button>
            </div>
          </div>

          {/* Topic Tags Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {COMMUNITY_TAGS.map((tag) => {
              const TagIcon = tag.icon;
              const isSelected = selectedTag === tag.id;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTag(tag.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 700 : 500,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-card)',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 140ms ease'
                  }}
                >
                  <TagIcon size={12} />
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Discussion Threads List */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <div className="spin" style={{ width: '28px', height: '28px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px auto' }} />
            <p>Loading community discussions...</p>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <MessageSquare size={38} style={{ color: 'var(--text-muted)', opacity: 0.4, margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>No discussions found</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '6px 0 16px 0' }}>
              Be the first to share a question or thesis insight with the capstone network.
            </p>
            <button
              type="button"
              onClick={() => setIsNewThreadOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.76rem', padding: '6px 14px' }}
            >
              Start First Discussion
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => handleOpenDetail(thread)}
                style={{
                  background: thread.isPinned ? 'rgba(48, 209, 88, 0.04)' : 'var(--bg-card)',
                  border: thread.isPinned ? '1px solid rgba(48, 209, 88, 0.35)' : '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 160ms ease'
                }}
              >
                {/* Author Info Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={thread.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.authorName)}&background=10b981&color=fff&bold=true`}
                      alt={thread.authorName}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid var(--border-subtle)',
                        flexShrink: 0
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {thread.authorName}
                        </span>
                        {thread.authorRole && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)'
                          }}>
                            {thread.authorRole}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {new Date(thread.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {thread.isPinned && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#f59e0b',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      border: '1px solid rgba(245, 158, 11, 0.25)'
                    }}>
                      <Pin size={11} />
                      Pinned
                    </span>
                  )}
                </div>

                {/* Title & Body Preview */}
                <h3 style={{
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: '0 0 6px 0',
                  lineHeight: 1.35
                }}>
                  {thread.title}
                </h3>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  margin: '0 0 12px 0',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {thread.content}
                </p>

                {/* Tags & Action Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {thread.tags.map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                    {thread.projectTitle && (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        border: '1px solid rgba(48, 209, 88, 0.25)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <Layers size={10} />
                        {thread.projectTitle}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(thread.id, e)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: thread.hasLiked ? 'rgba(244, 63, 94, 0.12)' : 'transparent',
                        color: thread.hasLiked ? '#f43f5e' : 'var(--text-muted)',
                        border: thread.hasLiked ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid transparent',
                        transition: 'all 140ms ease'
                      }}
                    >
                      <Heart size={13} fill={thread.hasLiked ? '#f43f5e' : 'none'} />
                      <span>{thread.likesCount}</span>
                    </button>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 8px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)'
                    }}>
                      <MessageCircle size={13} />
                      <span>{thread.repliesCount}</span>
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
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '560px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            padding: '24px',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsNewThreadOpen(false)}
              className="btn btn-ghost btn-icon"
              style={{ position: 'absolute', top: '16px', right: '16px' }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Start Community Discussion
              </h2>
            </div>

            <form onSubmit={handleCreateThread} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Tips for Passing Title Defense or ISO 25010 Checklist"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.84rem',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Topic Category Tags
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['DefensePrep', 'ThesisManuscript', 'WebAndApp', 'AIAndData', 'HardwareIoT', 'TipsAndAdvice'].map((tag) => {
                    const active = newTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setNewTags(newTags.filter(t => t !== tag));
                          } else {
                            setNewTags([...newTags, tag]);
                          }
                        }}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: active ? 700 : 500,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-md)',
                          background: active ? 'var(--primary-light)' : 'var(--bg-app)',
                          color: active ? 'var(--primary)' : 'var(--text-muted)',
                          border: active ? '1px solid rgba(48, 209, 88, 0.4)' : '1px solid var(--border-card)',
                          cursor: 'pointer'
                        }}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {project && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={linkProject}
                    onChange={(e) => setLinkProject(e.target.checked)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>Tag active project workspace: <strong>{project.title}</strong></span>
                </label>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Discussion Content
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share details, problem baseline, question, or research advice..."
                  rows={5}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '0.82rem',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setIsNewThreadOpen(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingThread}
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 700, padding: '0 16px', height: '34px' }}
                >
                  {isSubmittingThread ? 'Publishing...' : 'Publish Thread'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discussion Details & Comments Modal Drawer */}
      {activeThreadDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-card)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={activeThreadDetail.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeThreadDetail.authorName)}&background=10b981&color=fff&bold=true`}
                  alt={activeThreadDetail.authorName}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {activeThreadDetail.authorName}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {activeThreadDetail.authorRole || 'Researcher'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveThreadDetail(null)}
                className="btn btn-ghost btn-icon"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Scroll Container */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
                {activeThreadDetail.title}
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px 0', whiteSpace: 'pre-wrap' }}>
                {activeThreadDetail.content}
              </p>

              {/* Likes and stats */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '16px'
              }}>
                <button
                  type="button"
                  onClick={(e) => handleToggleLike(activeThreadDetail.id, e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    background: activeThreadDetail.hasLiked ? 'rgba(244, 63, 94, 0.12)' : 'var(--bg-app)',
                    color: activeThreadDetail.hasLiked ? '#f43f5e' : 'var(--text-muted)',
                    border: activeThreadDetail.hasLiked ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid var(--border-card)',
                    cursor: 'pointer'
                  }}
                >
                  <Heart size={13} fill={activeThreadDetail.hasLiked ? '#f43f5e' : 'none'} />
                  <span>{activeThreadDetail.likesCount} Likes</span>
                </button>

                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {threadReplies.length} Comments
                </span>
              </div>

              {/* Replies list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {isLoadingReplies ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Loading comments...
                  </div>
                ) : threadReplies.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No comments yet. Be the first to reply!
                  </div>
                ) : (
                  threadReplies.map((rep) => (
                    <div
                      key={rep.id}
                      style={{
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-card)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '12px 14px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <img
                          src={rep.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rep.authorName)}&background=10b981&color=fff&bold=true`}
                          alt={rep.authorName}
                          style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {rep.authorName}
                        </span>
                        {rep.authorRole && (
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', padding: '0 4px', background: 'var(--bg-elevated)', borderRadius: '4px' }}>
                            {rep.authorRole}
                          </span>
                        )}
                        <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {new Date(rep.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                        {rep.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comment Composer Footer */}
            <form onSubmit={handlePostReply} style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              display: 'flex',
              gap: '8px'
            }}>
              <input
                type="text"
                value={newReplyContent}
                onChange={(e) => setNewReplyContent(e.target.value)}
                placeholder="Write a comment or advice..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isSubmittingReply || !newReplyContent.trim()}
                className="btn btn-primary btn-sm"
                style={{ height: '34px', padding: '0 14px', fontWeight: 700, gap: '4px' }}
              >
                <Send size={13} />
                <span>Reply</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
