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
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent,
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
        // High-fidelity starter prediction forecasts
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
            createdAt: new Date().toISOString()
          },
          {
            id: 'pred_sample_2',
            title: 'Which Team Will Win "Best System Architecture" at the Capstone Expo? 🏆',
            description: 'Annual faculty and industry panel awards for most robust cloud and embedded systems.',
            category: 'awards',
            options: [
              { id: 'opt_a1', label: 'Project t9 (Multi-Device Workflow Engine)', votesCount: 45, color: '#8b5cf6' },
              { id: 'opt_a2', label: 'AgriSense IoT (Autonomous Drone Yield)', votesCount: 31, color: '#10b981' },
              { id: 'opt_a3', label: 'HealthTrack AI (Computer Vision Diagnostics)', votesCount: 28, color: '#f59e0b' }
            ],
            totalVotes: 104,
            status: 'active',
            deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            id: 'pred_sample_3',
            title: 'Will Sprint 3 Deliverables Reach 100% Completion by Friday? ⚡',
            description: 'Tracking pull requests, unit tests, and hardware prototype assembly.',
            category: 'milestone',
            projectId: project?.id,
            projectTitle: project?.title || 't9',
            options: [
              { id: 'opt_s1', label: 'Yes - On or Ahead of Time', votesCount: 29, color: '#10b981' },
              { id: 'opt_s2', label: 'Slight Delay (1-2 Days Extension)', votesCount: 11, color: '#f59e0b' }
            ],
            totalVotes: 40,
            status: 'active',
            deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
            createdAt: new Date().toISOString()
          }
        ];
        setPredictions(samplePredictions);
      }

      if (boardData && boardData.length > 0) {
        setLeaderboard(boardData);
      } else {
        setLeaderboard([
          {
            userId: 'usr_top_1',
            username: 'keshie_byte',
            nickname: 'Keshie-byte',
            role: 'lead',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            points: 1240,
            totalPredictions: 14,
            correctPredictions: 11,
            accuracyPercentage: 79,
            badge: 'Defense Master'
          },
          {
            userId: 'usr_top_2',
            username: 'marc_regulacion',
            nickname: 'Marc Andrei Regulacion',
            role: 'lead',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            points: 980,
            totalPredictions: 12,
            correctPredictions: 9,
            accuracyPercentage: 75,
            badge: 'Sprint Prophet'
          },
          {
            userId: 'usr_top_3',
            username: 'adviser_sarah',
            nickname: 'Engr. Sarah Mendoza',
            role: 'adviser',
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            points: 750,
            totalPredictions: 8,
            correctPredictions: 7,
            accuracyPercentage: 88,
            badge: 'Senior Oracle'
          }
        ]);
      }
    } catch (e) {
      console.warn('Error loading predictions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeUserId]);

  const handleVote = async (predictionId: string, optionId: string) => {
    // Optimistic UI Vote update
    setPredictions(prev => prev.map(p => {
      if (p.id === predictionId) {
        const prevVoted = p.userVotedOptionId;
        const updatedOptions = p.options.map(opt => {
          if (opt.id === optionId) return { ...opt, votesCount: opt.votesCount + 1 };
          if (opt.id === prevVoted) return { ...opt, votesCount: Math.max(0, opt.votesCount - 1) };
          return opt;
        });
        const total = prevVoted ? p.totalVotes : p.totalVotes + 1;
        return {
          ...p,
          options: updatedOptions,
          totalVotes: total,
          userVotedOptionId: optionId
        };
      }
      return p;
    }));

    toast.success('Prediction Cast!', {
      description: 'Your vote has been recorded in real time.'
    });

    try {
      await castPredictionVote(predictionId, activeUserId, optionId);
    } catch (e) {
      console.warn('Failed to persist vote:', e);
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
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Hero Header */}
      <div className="border-b border-border bg-card/40 backdrop-blur-md px-4 sm:px-8 py-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                <Trophy className="w-3 h-3 text-amber-500" />
                Crowd Intelligence Hub
              </span>
              <span className="text-xs text-muted-foreground">• Milestone & Defense Accuracy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Capstone Defense & Milestone Predictions
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Forecast sprint completions, title & final defense approvals, and vote for Best Capstone Expo winners.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Forecast</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6">
        {/* Tab Filter Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-border/60">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'all' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            <Vote className="w-4 h-4" />
            <span>All Forecasts</span>
          </button>
          <button
            onClick={() => setActiveTab('defense')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'defense' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Defense Outcomes</span>
          </button>
          <button
            onClick={() => setActiveTab('milestone')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'milestone' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Sprints & Milestones</span>
          </button>
          <button
            onClick={() => setActiveTab('awards')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'awards' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Capstone Expo Awards</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'leaderboard' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Predictor Leaderboard</span>
          </button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p>Loading prediction markets...</p>
          </div>
        ) : activeTab === 'leaderboard' ? (
          /* Leaderboard Table View */
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border/80 flex items-center justify-between bg-card/60">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="text-base font-bold text-foreground">Top Capstone Analysts & Predictors</h3>
              </div>
              <span className="text-xs text-muted-foreground">Updated in real time</span>
            </div>

            <div className="divide-y divide-border/60">
              {leaderboard.map((user, rank) => (
                <div key={user.userId} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      rank === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/40' :
                      rank === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/40' :
                      rank === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      #{rank + 1}
                    </div>

                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nickname || user.username)}&background=10b981&color=fff`}
                      alt={user.nickname || user.username}
                      className="w-10 h-10 rounded-full border border-border object-cover"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {user.nickname || user.username}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {user.badge}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                        <span>{user.correctPredictions} / {user.totalPredictions} Correct</span>
                        <span>•</span>
                        <span className="text-emerald-500 font-semibold">{user.accuracyPercentage}% Accuracy</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-foreground">{user.points}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Predictions Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPredictions.map((pred) => (
              <div 
                key={pred.id}
                className="bg-card border border-border rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:border-primary/40 transition-all"
              >
                <div>
                  {/* Category & Status Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary border border-border/60 text-muted-foreground flex items-center gap-1">
                      {pred.category === 'defense' && <GraduationCap className="w-3 h-3 text-indigo-400" />}
                      {pred.category === 'awards' && <Award className="w-3 h-3 text-amber-400" />}
                      {pred.category === 'milestone' && <Target className="w-3 h-3 text-emerald-400" />}
                      <span>{pred.category}</span>
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Closes {new Date(pred.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-foreground mb-1.5 leading-snug">
                    {pred.title}
                  </h3>
                  {pred.description && (
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      {pred.description}
                    </p>
                  )}

                  {/* Options & Progress Bars */}
                  <div className="space-y-2.5 my-4">
                    {pred.options.map((option) => {
                      const percentage = pred.totalVotes > 0 
                        ? Math.round((option.votesCount / pred.totalVotes) * 100) 
                        : 0;
                      const isVoted = pred.userVotedOptionId === option.id;

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleVote(pred.id, option.id)}
                          className={`w-full relative overflow-hidden rounded-xl border p-3 text-left transition-all group ${
                            isVoted 
                              ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30' 
                              : 'border-border/80 bg-secondary/30 hover:border-border hover:bg-secondary/60'
                          }`}
                        >
                          {/* Percentage fill bar */}
                          <div 
                            className="absolute top-0 bottom-0 left-0 bg-primary/15 transition-all duration-500 pointer-events-none"
                            style={{ width: `${percentage}%` }}
                          />

                          <div className="relative z-10 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              {isVoted && (
                                <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                              <span className={`text-xs font-semibold ${isVoted ? 'text-primary' : 'text-foreground'}`}>
                                {option.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 text-xs">
                              <span className="font-bold text-foreground">{percentage}%</span>
                              <span className="text-[10px] text-muted-foreground">({option.votesCount})</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer info */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{pred.totalVotes} Total Predictions</span>
                  </div>

                  {pred.projectTitle && (
                    <span className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-medium text-foreground">
                      {pred.projectTitle}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Forecast Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden">
            <button
              onClick={() => setIsNewModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Create Milestone / Defense Forecast</h2>
            </div>

            <form onSubmit={handleCreateForecast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Forecast Question Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Will Project t9 Pass Proposal Defense on Sept 12?"
                  required
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'defense', label: 'Defense Outcome' },
                    { id: 'milestone', label: 'Sprint Milestone' },
                    { id: 'awards', label: 'Capstone Award' }
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setNewCategory(cat.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        newCategory === cat.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary/40 text-muted-foreground border-border/60 hover:text-foreground'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Prediction Choices / Options
                </label>
                <div className="space-y-2">
                  {newOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewOptions(prev => prev.map((item, i) => i === idx ? val : item));
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Deadline Date
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <span>Publishing...</span> : <span>Publish Forecast</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
