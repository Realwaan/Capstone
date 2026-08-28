import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Code
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { upsertUserProfile, fetchProfileById, fetchProfileByUsername } from '../lib/supabaseSync';
import { UserProfile } from '../types';
import { GitHubIcon } from './GitHubIcon';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onAuthSuccess?: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'lead' | 'adviser' | 'panelist'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const identifier = emailOrUsername.trim();
      let targetEmail = identifier;

      // If entered a username instead of email, resolve email from profiles
      if (!identifier.includes('@')) {
        const foundProfile = await fetchProfileByUsername(identifier);
        if (!foundProfile) {
          setError('No user account found with that username.');
          setIsLoading(false);
          return;
        }
        targetEmail = foundProfile.email;
      }

      if (isSupabaseConfigured() && supabase) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password
        });

        if (authError) {
          setError(authError.message || 'Invalid email or password.');
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const profile = await fetchProfileById(data.user.id);
          const activeProfile: UserProfile = profile || {
            id: data.user.id,
            email: data.user.email || targetEmail,
            username: identifier.includes('@') ? targetEmail.split('@')[0] : identifier,
            nickname: identifier.includes('@') ? targetEmail.split('@')[0] : identifier,
            role: 'student',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(identifier)}&background=10b981&color=fff&bold=true`
          };

          toast.success(`Welcome back, ${activeProfile.nickname || activeProfile.username}!`);
          if (onAuthSuccess) onAuthSuccess(activeProfile);
          onClose();
        }
      } else {
        // Offline / Local Simulation
        const localId = `usr_${identifier.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const localProfile: UserProfile = {
          id: localId,
          email: identifier.includes('@') ? identifier : `${identifier}@student.edu`,
          username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
          nickname: identifier.includes('@') ? identifier.split('@')[0] : identifier,
          role: 'student',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(identifier)}&background=10b981&color=fff&bold=true`
        };
        toast.success(`Signed in as ${localProfile.nickname}`);
        if (onAuthSuccess) onAuthSuccess(localProfile);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Username must be at least 3 alphanumeric characters.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        // Check if username is already taken
        const existing = await fetchProfileByUsername(cleanUsername);
        if (existing) {
          setError('Username is already taken. Please choose another.');
          setIsLoading(false);
          return;
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password
        });

        if (authError) {
          setError(authError.message || 'Registration failed.');
          setIsLoading(false);
          return;
        }

        const userId = data.user?.id || `usr_${cleanUsername}_${Date.now()}`;
        const newProfile: UserProfile = {
          id: userId,
          email: cleanEmail,
          username: cleanUsername,
          nickname: nickname.trim() || cleanUsername,
          role,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nickname || cleanUsername)}&background=10b981&color=fff&bold=true`
        };

        await upsertUserProfile(newProfile);
        toast.success('Account created successfully!', {
          description: `Welcome to CapstoneFlow, ${newProfile.nickname}!`
        });

        if (onAuthSuccess) onAuthSuccess(newProfile);
        onClose();
      } else {
        // Offline / Local Simulation
        const localId = `usr_${cleanUsername}_${Date.now()}`;
        const newProfile: UserProfile = {
          id: localId,
          email: cleanEmail,
          username: cleanUsername,
          nickname: nickname.trim() || cleanUsername,
          role,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nickname || cleanUsername)}&background=10b981&color=fff&bold=true`
        };
        toast.success('Account created (Offline Mode)', {
          description: `Welcome, ${newProfile.nickname}!`
        });
        if (onAuthSuccess) onAuthSuccess(newProfile);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Error creating account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubOAuth = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!clientId) {
      toast.info('GitHub OAuth ID is not configured. Please use Email/Username sign-in.');
      return;
    }
    const redirectUri = `${window.location.origin}/`;
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('capstone_oauth_state', state);
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email%20repo&state=${state}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8"
        style={{ background: 'var(--card-bg, #111827)', borderColor: 'var(--border, rgba(255,255,255,0.1))' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {mode === 'signin' ? 'Welcome Back' : 'Create Workspace Account'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {mode === 'signin' ? 'Sign in to access your capstones, community, and predictions' : 'Join CapstoneFlow for realtime collaboration & defense readiness'}
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-secondary/50 rounded-xl mb-6 border border-border/40">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'signin' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'signup' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="student@cit.edu or alex_dev"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/70 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/70 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex_dev"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-secondary/30 border border-border/70 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Display Name
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Alex Santos"
                  className="w-full px-3 py-2 bg-secondary/30 border border-border/70 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                Institutional / University Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@cit.edu"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-secondary/30 border border-border/70 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                Role in Capstone Program
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                    role === 'student'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/60 text-muted-foreground hover:bg-secondary/40'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Student Developer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('lead')}
                  className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                    role === 'lead'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/60 text-muted-foreground hover:bg-secondary/40'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Project Lead</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('adviser')}
                  className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                    role === 'adviser'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/60 text-muted-foreground hover:bg-secondary/40'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Faculty Adviser</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('panelist')}
                  className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                    role === 'panelist'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/60 text-muted-foreground hover:bg-secondary/40'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Defense Panelist</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  required
                  className="w-full px-3 py-2 bg-secondary/30 border border-border/70 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="w-full px-3 py-2 bg-secondary/30 border border-border/70 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 mt-2"
            >
              {isLoading ? <span>Creating Account...</span> : <span>Create Account & Join</span>}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground text-[10px] tracking-wider">
              Or Continue With
            </span>
          </div>
        </div>

        {/* GitHub OAuth Button */}
        <button
          type="button"
          onClick={handleGitHubOAuth}
          className="w-full py-2.5 px-4 bg-secondary/60 hover:bg-secondary border border-border text-foreground font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm"
        >
          <GitHubIcon className="w-4 h-4 fill-current" />
          <span>Connect with GitHub Account</span>
        </button>
      </div>
    </div>
  );
};
