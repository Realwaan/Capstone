import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Plus, 
  Sparkles, 
  Trophy, 
  Users, 
  Vote, 
  X, 
  GraduationCap, 
  Target, 
  Check
} from 'lucide-react';
import { Prediction, PredictionOption, PredictionLeaderboardEntry } from '../types';
import { 
  fetchPredictions, 
  createPrediction, 
  castPredictionVote,
  fetchPredictionLeaderboard 
} from '../lib/supabaseSync';
import { useProject } from '../context/ProjectContext';
import { toast } from 'sonner';

export const PredictionsView: React.FC = () => {
  const { currentMember, project, githubUser } = useProject();

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<PredictionLeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'defense' | 'milestone' | 'awards' | 'leaderboard'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // New Forecast modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<'milestone' | 'defense' | 'awards' | 'sprint'>('defense');
  const [newOptions, setNewOptions] = useState<string[]>(['Yes - 100% Approval', 'Conditional Pass with Minor Revisions', 'Major Revision Required']);
  const [newDeadline, setNewDeadline] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeUserId = currentMember?.id || `usr_guest_${Date.now()}`;
  const activeUserName = currentMember?.name || (githubUser?.name || 'Researcher');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [predsData, boardData] = await Promise.all([
        fetchPredictions(activeUserId),
        fetchPredictionLeaderboard()
      ]);

      if (predsData && predsData.length > 0) {
        setPredictions(predsData);
      } else {
        const samplePredictions: Prediction[] = [
          {
            id: 'pred_sample_1',
            title: 'Will Project t9 Pass the Final Proposal Defense on Target Date? 🎓',
            description: 'Defense panel scheduled for upcoming evaluation. Predict whether the architecture and manuscript readiness will secure unanimous approval.',
            category: 'defense',
            projectId: project?.id,
            projectTitle: project?.title || 't9',
            authorName: 'Engr. Sarah Mendoza',
            options: [
              { id: 'opt_1', label: 'Unanimous Pass (Zero Delays)', votesCount: 38, color: '#10b981' },
              { id: 'opt_2', label: 'Pass with Minor Manuscript Edits', votesCount: 22, color: '#38bdf8' },
              { id: 'opt_3', label: 'Reschedule / Additional Defense', votesCount: 4, color: '#f43f5e' }
            ],
            totalVotes: 64,
            status: 'active',
            deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
          },
          {
            id: 'pred_sample_2',
            title: 'Will Sprint 1 complete 100% of Core Tasks before the Adviser Review? ⚡',
            description: 'Sprint backlog currently has 8 core tasks assigned to development team members.',
            category: 'milestone',
            projectId: project?.id,
            projectTitle: project?.title || 't9',
            authorName: 'Marc Andrei Regulacion',
            options: [
              { id: 'opt_1', label: 'Yes - All Tasks Done', votesCount: 28, color: '#10b981' },
              { id: 'opt_2', label: 'No - Carry Over to Sprint 2', votesCount: 11, color: '#f59e0b' }
            ],
            totalVotes: 39,
            status: 'active',
            deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'pred_sample_3',
            title: 'Capstone Expo 2026: Best System Architecture & Technical Innovation Award 🏆',
            description: 'Vote on which track candidate demonstrated the cleanest distributed architecture and live replication.',
            category: 'awards',
            authorName: 'Evaluation Committee',
            options: [
              { id: 'opt_1', label: 'Team Autonomous Drone AI (CF-DRONE9)', votesCount: 52, color: '#818cf8' },
              { id: 'opt_2', label: 'Team IoT Smart Agritech Matrix', votesCount: 41, color: '#10b981' },
              { id: 'opt_3', label: 'Team MedScan Radiology AI', votesCount: 33, color: '#f43f5e' }
            ],
            totalVotes: 126,
            status: 'active',
            deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
          }
        ];
        setPredictions(samplePredictions);
      }

      if (boardData && boardData.length > 0) {
        setLeaderboard(boardData);
      } else {
        const sampleBoard: PredictionLeaderboardEntry[] = [
          {
            userId: 'usr_sarah',
            username: 'sarah_adviser',
            nickname: 'Engr. Sarah Mendoza',
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            role: 'Faculty Adviser',
            points: 1240,
            accuracyPercentage: 94,
            totalPredictions: 32,
            correctPredictions: 30,
            badge: 'Defense Master'
          },
          {
            userId: 'usr_marc',
            username: 'marc_lead',
            nickname: 'Marc Andrei Regulacion',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: 'Project Lead',
            points: 980,
            accuracyPercentage: 88,
            totalPredictions: 25,
            correctPredictions: 22,
            badge: 'Sprint Prophet'
          },
          {
            userId: 'usr_keshie',
            username: 'keshie_iot',
            nickname: 'Keshie-byte',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            role: 'IoT Specialist',
            points: 820,
            accuracyPercentage: 82,
            totalPredictions: 20,
            correctPredictions: 16,
            badge: 'Senior Oracle'
          }
        ];
        setLeaderboard(sampleBoard);
      }
    } catch (e) {
      console.warn('Error loading prediction forecasts:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeUserId]);

  const handleVote = async (predictionId: string, optionId: string) => {
    const pred = predictions.find(p => p.id === predictionId);
    if (!pred) return;
    if (pred.userVotedOptionId === optionId) return;

    const prevVoted = pred.userVotedOptionId;
    const updatedOptions = pred.options.map(opt => {
      if (opt.id === optionId) return { ...opt, votesCount: opt.votesCount + 1 };
      if (prevVoted && opt.id === prevVoted) return { ...opt, votesCount: Math.max(0, opt.votesCount - 1) };
      return opt;
    });

    const totalVotes = prevVoted ? pred.totalVotes : pred.totalVotes + 1;

    setPredictions(prev => prev.map(p => p.id === predictionId ? {
      ...p,
      options: updatedOptions,
      totalVotes,
      userVotedOptionId: optionId
    } : p));

    toast.success('Prediction Vote Recorded!', {
      description: 'Your forecast has been counted into the community consensus.'
    });

    try {
      await castPredictionVote(predictionId, activeUserId, optionId);
    } catch {
      // Revert if error
      setPredictions(prev => prev.map(p => p.id === predictionId ? pred : p));
      toast.error('Failed to submit prediction vote');
    }
  };

  const handleCreateForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newOptions.filter(o => o.trim()).length < 2) {
      toast.error('Please provide a title and at least 2 options.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedOptions: PredictionOption[] = newOptions
        .filter(o => o.trim())
        .map((label, idx) => ({
          id: `opt_${idx + 1}`,
          label: label.trim(),
          votesCount: 0,
          color: idx === 0 ? '#10b981' : idx === 1 ? '#38bdf8' : idx === 2 ? '#f59e0b' : '#a855f7'
        }));

      const created = await createPrediction({
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
        projectId: project ? project.id : undefined,
        projectTitle: project ? project.title : undefined,
        authorId: activeUserId,
        authorName: activeUserName,
        options: formattedOptions,
        status: 'active',
        deadline: new Date(newDeadline).toISOString()
      });

      const newPredItem: Prediction = created || {
        id: `pred_${Date.now()}`,
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
        projectId: project ? project.id : undefined,
        projectTitle: project ? project.title : undefined,
        authorId: activeUserId,
        authorName: activeUserName,
        options: formattedOptions,
        totalVotes: 0,
        status: 'active',
        deadline: new Date(newDeadline).toISOString(),
        createdAt: new Date().toISOString()
      };

      setPredictions(prev => [newPredItem, ...prev]);
      toast.success('New Forecast Published!', {
        description: 'Team members and peers can now cast their predictions.'
      });

      setNewTitle('');
      setNewDescription('');
      setIsNewModalOpen(false);
    } catch (err: any) {
      toast.error('Failed to create forecast', { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPredictions = predictions.filter(p => {
    if (activeTab === 'defense') return p.category === 'defense';
    if (activeTab === 'milestone') return p.category === 'milestone' || p.category === 'sprint';
    if (activeTab === 'awards') return p.category === 'awards';
    return true;
  });

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
                background: 'rgba(245, 158, 11, 0.12)', 
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Trophy size={11} />
                Milestone & Defense Forecasts
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>• Predict outcomes, earn analyst points</span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Defense Predictions & Leaderboard
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0', maxWidth: '580px' }}>
              Cast forecasts on title defenses, sprint milestone deadlines, and Capstone Expo awards with peer consensus.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
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
              <span>Create Forecast</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '20px 20px 0 20px' }}>
        
        {/* Category Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '16px' }}>
          {[
            { id: 'all', label: 'All Predictions', icon: Target },
            { id: 'defense', label: 'Defense Outlines', icon: GraduationCap },
            { id: 'milestone', label: 'Sprint Milestones', icon: Clock },
            { id: 'awards', label: 'Expo Awards', icon: Award },
            { id: 'leaderboard', label: 'Predictor Leaderboard', icon: Trophy }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.76rem',
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
                <TabIcon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Section */}
        {activeTab === 'leaderboard' ? (
          /* Predictor Leaderboard Table */
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-elevated)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={16} style={{ color: '#f59e0b' }} />
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Top Capstone Predictors
                </h3>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Ranked by consensus accuracy & verified milestones
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 16px' }}>Rank</th>
                    <th style={{ padding: '10px 16px' }}>Analyst</th>
                    <th style={{ padding: '10px 16px' }}>Role</th>
                    <th style={{ padding: '10px 16px' }}>Accuracy</th>
                    <th style={{ padding: '10px 16px' }}>Points</th>
                    <th style={{ padding: '10px 16px' }}>Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, idx) => {
                    const displayName = user.nickname || user.username;
                    return (
                      <tr key={user.userId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--text-muted)' }}>
                          #{idx + 1}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff&bold=true`}
                              alt={displayName}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{user.role || 'Researcher'}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#10b981' }}>{user.accuracyPercentage}%</td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-primary)' }}>{user.points} pts</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            border: '1px solid rgba(48, 209, 88, 0.25)'
                          }}>
                            {user.badge}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Prediction Cards List */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredPredictions.map((pred) => {
              const hasVoted = Boolean(pred.userVotedOptionId);
              return (
                <div
                  key={pred.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Category & Deadline */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: pred.category === 'defense' ? 'rgba(56, 189, 248, 0.12)' : pred.category === 'awards' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(48, 209, 88, 0.12)',
                        color: pred.category === 'defense' ? '#38bdf8' : pred.category === 'awards' ? '#f59e0b' : '#10b981',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        {pred.category}
                      </span>

                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} />
                        Closes {new Date(pred.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                      {pred.title}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.45 }}>
                      {pred.description}
                    </p>

                    {/* Options with Voting Percentages */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {pred.options.map((opt) => {
                        const isVoted = pred.userVotedOptionId === opt.id;
                        const pct = pred.totalVotes > 0 ? Math.round((opt.votesCount / pred.totalVotes) * 100) : 0;

                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleVote(pred.id, opt.id)}
                            style={{
                              position: 'relative',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-md)',
                              background: isVoted ? 'rgba(48, 209, 88, 0.1)' : 'var(--bg-elevated)',
                              border: isVoted ? '1.5px solid var(--primary)' : '1px solid var(--border-card)',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              transition: 'all 140ms ease'
                            }}
                          >
                            {/* Animated progress fill bar */}
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              bottom: 0,
                              width: `${pct}%`,
                              background: opt.color || 'var(--primary)',
                              opacity: 0.18,
                              transition: 'width 400ms ease'
                            }} />

                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isVoted && <Check size={13} style={{ color: 'var(--primary)' }} />}
                                <span style={{ fontSize: '0.78rem', fontWeight: isVoted ? 800 : 600, color: 'var(--text-primary)' }}>
                                  {opt.label}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: opt.color || 'var(--primary)' }}>
                                {pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>{pred.totalVotes} votes cast</span>
                    <span>By {pred.authorName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Forecast Modal */}
      {isNewModalOpen && (
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
            maxWidth: '520px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            padding: '24px',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
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
                background: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Trophy size={16} style={{ color: '#f59e0b' }} />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Create Prediction Forecast
              </h2>
            </div>

            <form onSubmit={handleCreateForecast} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Forecast Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Will Project t9 pass final proposal defense on first try?"
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
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
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
                >
                  <option value="defense">Defense Outcome</option>
                  <option value="milestone">Sprint & Milestone Deadline</option>
                  <option value="awards">Capstone Expo Awards</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide context, metrics, and dates for voters..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Forecast Deadline (Voting Closes)
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 700, padding: '0 16px', height: '34px' }}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Forecast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
