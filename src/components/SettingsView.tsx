import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { PermissionLevel, Role } from '../types';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  ShieldCheck, 
  Calendar, 
  Users, 
  Lock,
  UserCheck,
  ShieldAlert,
  Database,
  Cloud,
  RefreshCw,
  Copy,
  ExternalLink,
  Sparkles,
  Key,
  MessageSquare,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { getGeminiApiKey, setGeminiApiKey, isGeminiConfigured } from '../lib/gemini';
import { getGitHubToken, setGitHubToken } from '../lib/github';
import { getDiscordWebhookUrl, setDiscordWebhookUrl, isDiscordConfigured, testDiscordWebhook } from '../lib/discord';

export const SettingsView: React.FC = () => {
  const { 
    project, 
    members,
    isOwner,
    canManageSettings,
    updateProjectInfo, 
    updateMemberPermission,
    updateMemberRole,
    resetData, 
    exportDataJSON, 
    importDataJSON,
    isDatabaseConnected,
    syncToSupabase,
    syncGitHubData
  } = useProject();

  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(getGeminiApiKey());
  const [geminiConnected, setGeminiConnected] = useState(isGeminiConfigured());
  const [githubTokenInput, setGithubTokenInput] = useState(getGitHubToken());
  const [githubTokenActive, setGithubTokenActive] = useState(!!getGitHubToken());
  const [discordWebhookInput, setDiscordWebhookInput] = useState(getDiscordWebhookUrl());
  const [discordConnected, setDiscordConnected] = useState(isDiscordConfigured());
  const [isTestingDiscord, setIsTestingDiscord] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [subtitle, setSubtitle] = useState(project.subtitle);
  const [teamName, setTeamName] = useState(project.teamName);
  const [targetDefenseDate, setTargetDefenseDate] = useState(project.targetDefenseDate);
  const [adviserName, setAdviserName] = useState(project.adviser.name);
  const [adviserEmail, setAdviserEmail] = useState(project.adviser.email);
  const [department, setDepartment] = useState(project.adviser.department);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageSettings) return;

    updateProjectInfo({
      title,
      subtitle,
      teamName,
      targetDefenseDate,
      adviser: {
        name: adviserName,
        email: adviserEmail,
        department
      }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExport = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CapStoneFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJSON(content);
      if (success) {
        setImportStatus('Backup data imported successfully!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Error: Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Project Settings & Access Control</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Manage team member permission levels, project metadata, target defense timeline & backups
        </p>
      </div>

      {!isOwner && (
        <div style={{ background: 'var(--warning-bg)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', fontSize: '0.82rem' }}>
          <Lock size={16} />
          <span><strong>Member Mode:</strong> You are currently viewing as a team member. Project settings and destructive actions are restricted to the <strong>Team Leader (Owner)</strong>.</span>
        </div>
      )}

      {savedSuccess && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.85rem' }}>
          <Check size={18} />
          <span>Project settings saved successfully!</span>
        </div>
      )}

      {importStatus && (
        <div style={{ background: 'var(--info-bg)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--info)', fontSize: '0.85rem' }}>
          <Check size={18} />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Team Roles & Permissions Matrix (Owner Control) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Team Member Permissions & Access Matrix</h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Configure role titles and access permissions across your 5 student members and 1 faculty adviser
            </p>
          </div>
          <span className="badge badge-primary">
            <ShieldCheck size={12} />
            <span>Role-Based Access (RBAC)</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {members.map(member => (
            <div 
              key={member.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1.5fr',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} 
                />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {member.email}
                  </div>
                </div>
              </div>

              {/* Role Title Input */}
              <div>
                <input 
                  type="text" 
                  value={member.roleTitle} 
                  disabled={!isOwner}
                  onChange={(e) => updateMemberRole(member.id, member.role, e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                />
              </div>

              {/* Permission Level Selector */}
              <div>
                <select 
                  value={member.permissionLevel}
                  disabled={!isOwner || member.id === 'm1'}
                  onChange={(e) => updateMemberPermission(member.id, e.target.value as PermissionLevel)}
                  className="input-field"
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  <option value="owner">👑 Full Control (Owner)</option>
                  <option value="member">👤 Member Access (Standard)</option>
                  <option value="adviser">👨‍🏫 Adviser (Review & Sign-Off)</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General Settings Form */}
      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          General Capstone Information
        </h3>

        <div>
          <label className="input-label">Project Title</label>
          <input 
            type="text" 
            value={title} 
            disabled={!canManageSettings}
            onChange={(e) => setTitle(e.target.value)} 
            className="input-field" 
            required 
          />
        </div>

        <div>
          <label className="input-label">Project Subtitle / Scope Summary</label>
          <textarea 
            value={subtitle} 
            disabled={!canManageSettings}
            onChange={(e) => setSubtitle(e.target.value)} 
            className="input-field" 
            rows={3} 
          />
        </div>

        <div className="grid-cols-2">
          <div>
            <label className="input-label">Team Name / Group ID</label>
            <input 
              type="text" 
              value={teamName} 
              disabled={!canManageSettings}
              onChange={(e) => setTeamName(e.target.value)} 
              className="input-field" 
            />
          </div>

          <div>
            <label className="input-label">Target Final Defense Date</label>
            <input 
              type="date" 
              value={targetDefenseDate} 
              disabled={!canManageSettings}
              onChange={(e) => setTargetDefenseDate(e.target.value)} 
              className="input-field" 
              required 
            />
          </div>
        </div>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginTop: '10px' }}>
          Adviser & Department Credentials
        </h3>

        <div className="grid-cols-3">
          <div>
            <label className="input-label">Faculty Adviser Name</label>
            <input 
              type="text" 
              value={adviserName} 
              disabled={!canManageSettings}
              onChange={(e) => setAdviserName(e.target.value)} 
              className="input-field" 
            />
          </div>
          <div>
            <label className="input-label">Adviser Email</label>
            <input 
              type="email" 
              value={adviserEmail} 
              disabled={!canManageSettings}
              onChange={(e) => setAdviserEmail(e.target.value)} 
              className="input-field" 
            />
          </div>
          <div>
            <label className="input-label">Academic Department</label>
            <input 
              type="text" 
              value={department} 
              disabled={!canManageSettings}
              onChange={(e) => setDepartment(e.target.value)} 
              className="input-field" 
            />
          </div>
        </div>

        {canManageSettings && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ gap: '8px' }}>
              <Save size={16} />
              <span>Save Settings</span>
            </button>
          </div>
        )}
      </form>

      {/* Supabase PostgreSQL Cloud Database & Real-Time Sync */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} style={{ color: isDatabaseConnected ? '#10b981' : 'var(--text-muted)' }} />
              <span>Supabase Cloud Database & Real-Time Sync</span>
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Centralized PostgreSQL cloud database with live multi-user real-time collaboration
            </p>
          </div>
          <span 
            className="badge" 
            style={{ 
              background: isDatabaseConnected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-elevated)',
              color: isDatabaseConnected ? 'var(--success)' : 'var(--text-muted)',
              border: `1px solid ${isDatabaseConnected ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
              gap: '6px'
            }}
          >
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: isDatabaseConnected ? '#10b981' : '#6b7280',
              boxShadow: isDatabaseConnected ? '0 0 8px #10b981' : 'none'
            }} />
            <span>{isDatabaseConnected ? 'Supabase Connected' : 'Local Storage Mode'}</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ 
            background: 'var(--bg-elevated)', 
            padding: '14px 16px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
              <Cloud size={15} style={{ color: 'var(--primary)' }} />
              <span>Quick Supabase Setup Instructions:</span>
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-muted)' }}>
              <li>Create a free database project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>supabase.com</a>.</li>
              <li>Open your project's <strong>SQL Editor</strong> and run the tables script from <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: '4px' }}>supabase/schema.sql</code>.</li>
              <li>Add your credentials into your root <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: '4px' }}>.env</code> file:
                <pre style={{ 
                  background: 'var(--bg-surface)', 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  marginTop: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--text-primary)',
                  overflowX: 'auto'
                }}>
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key`}
                </pre>
              </li>
            </ol>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '6px' }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Push Local State to Supabase</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Upload current team members, tasks, phases, and revisions to your Supabase PostgreSQL cloud database.
              </div>
            </div>
            <button 
              onClick={async () => {
                setIsSyncing(true);
                await syncToSupabase();
                setIsSyncing(false);
              }}
              disabled={isSyncing}
              className="btn btn-primary btn-sm" 
              style={{ gap: '6px' }}
            >
              <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Local Data to Supabase'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Google Gemini Free AI Assistant */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: geminiConnected ? '#a855f7' : 'var(--text-muted)' }} />
              <span>Google Gemini Free AI Assistant</span>
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              100% Free AI integration ($0, no credit card) for task breakdown, standup polishing & executive briefing reports
            </p>
          </div>
          <span 
            className="badge" 
            style={{ 
              background: geminiConnected ? 'rgba(168, 85, 247, 0.12)' : 'var(--bg-elevated)',
              color: geminiConnected ? '#a855f7' : 'var(--text-muted)',
              border: `1px solid ${geminiConnected ? 'rgba(168, 85, 247, 0.3)' : 'var(--border-subtle)'}`,
              gap: '6px'
            }}
          >
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: geminiConnected ? '#a855f7' : '#6b7280',
              boxShadow: geminiConnected ? '0 0 8px #a855f7' : 'none'
            }} />
            <span>{geminiConnected ? 'Gemini 1.5 Flash Connected' : 'Offline Heuristics Mode'}</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ 
            background: 'var(--bg-elevated)', 
            padding: '14px 16px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
              <Key size={15} style={{ color: '#a855f7' }} />
              <span>How to get your free Gemini API Key (30 Seconds):</span>
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-muted)' }}>
              <li>Open <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7', textDecoration: 'underline', fontWeight: 600 }}>aistudio.google.com <ExternalLink size={11} style={{ display: 'inline' }} /></a> and sign in with any Google account.</li>
              <li>Click <strong>"Get API key"</strong> &rarr; <strong>"Create API key"</strong> (100% Free, no credit card required).</li>
              <li>Paste the API key below or into your <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: '4px' }}>.env</code> file as <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: '4px' }}>VITE_GEMINI_API_KEY</code>.</li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="password"
              value={geminiKeyInput}
              onChange={(e) => setGeminiKeyInput(e.target.value)}
              placeholder="Paste your Gemini API Key here (AIzaSy...)"
              className="input-field"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
            />
            <button
              type="button"
              onClick={() => {
                setGeminiApiKey(geminiKeyInput);
                const connected = isGeminiConfigured();
                setGeminiConnected(connected);
                if (connected) {
                  toast.success('Gemini API Key saved! AI features active 🪄');
                } else {
                  toast.info('API Key cleared. Using offline heuristic mode.');
                }
              }}
              className="btn btn-primary btn-sm"
              style={{ minWidth: '100px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none' }}
            >
              <span>Save Key</span>
            </button>
          </div>
        </div>
      </div>

      {/* GitHub Personal Access Token & Private Repository Access */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} style={{ color: githubTokenActive ? 'var(--primary)' : 'var(--text-muted)' }} />
              <span>GitHub Personal Access Token (Private Repositories)</span>
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Required for syncing Private repositories (e.g. <code>Realwaan/USCCE</code>) and increasing API rate limit from 60 to 5,000 requests/hr
            </p>
          </div>
          <span 
            className="badge" 
            style={{ 
              background: githubTokenActive ? 'rgba(48, 209, 88, 0.12)' : 'var(--bg-elevated)',
              color: githubTokenActive ? 'var(--primary)' : 'var(--text-muted)',
              border: `1px solid ${githubTokenActive ? 'rgba(48, 209, 88, 0.3)' : 'var(--border-subtle)'}`,
              gap: '6px'
            }}
          >
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: githubTokenActive ? 'var(--primary)' : '#6b7280',
              boxShadow: githubTokenActive ? '0 0 8px var(--primary)' : 'none'
            }} />
            <span>{githubTokenActive ? 'PAT Token Active (5,000 req/hr)' : 'Public Mode (60 req/hr)'}</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ 
            background: 'var(--bg-elevated)', 
            padding: '14px 16px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
              <span>How to generate your free GitHub Personal Access Token (30 Seconds):</span>
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-muted)' }}>
              <li>Open <a href="https://github.com/settings/tokens/new?scopes=repo&description=CapStoneFlow" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}>github.com/settings/tokens/new <ExternalLink size={11} style={{ display: 'inline' }} /></a>.</li>
              <li>Check the <strong>"repo"</strong> scope (Full control of private repositories).</li>
              <li>Click <strong>"Generate token"</strong> and paste it below.</li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="password"
              value={githubTokenInput}
              onChange={(e) => setGithubTokenInput(e.target.value)}
              placeholder="Paste your GitHub Token (ghp_...)"
              className="input-field"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
            />
            <button
              type="button"
              onClick={async () => {
                setGitHubToken(githubTokenInput.trim());
                const active = !!githubTokenInput.trim();
                setGithubTokenActive(active);
                if (active) {
                  toast.success('GitHub Token Saved', {
                    description: 'Private repository access enabled'
                  });
                  await syncGitHubData();
                } else {
                  toast.info('GitHub Token cleared. Switched to public mode.');
                }
              }}
              className="btn btn-primary btn-sm"
              style={{ minWidth: '100px' }}
            >
              <span>Save Token</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discord Webhook Live Notification Hub */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} style={{ color: discordConnected ? '#5865F2' : 'var(--text-muted)' }} />
              <span>Discord Webhook Channel Broadcast</span>
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Broadcast tickets claimed (/claim), PR reviews (/resolved), daily sprint standups, and adviser sign-offs directly to your Discord server
            </p>
          </div>
          <span 
            className="badge" 
            style={{ 
              background: discordConnected ? 'rgba(88, 101, 242, 0.12)' : 'var(--bg-elevated)',
              color: discordConnected ? '#5865F2' : 'var(--text-muted)',
              border: `1px solid ${discordConnected ? 'rgba(88, 101, 242, 0.3)' : 'var(--border-subtle)'}`,
              gap: '6px'
            }}
          >
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: discordConnected ? '#5865F2' : '#6b7280',
              boxShadow: discordConnected ? '0 0 8px #5865F2' : 'none'
            }} />
            <span>{discordConnected ? 'Discord Broadcast Active' : 'Not Connected'}</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ 
            background: 'var(--bg-elevated)', 
            padding: '14px 16px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
              <span>How to create a Discord Webhook (30 Seconds):</span>
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-muted)' }}>
              <li>In Discord, right-click your team's text channel (e.g. <code>#capstone-feed</code>) &rarr; <strong>Edit Channel</strong>.</li>
              <li>Navigate to <strong>Integrations</strong> &rarr; <strong>Webhooks</strong> &rarr; Click <strong>"New Webhook"</strong>.</li>
              <li>Click <strong>"Copy Webhook URL"</strong> and paste it below.</li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="text"
              value={discordWebhookInput}
              onChange={(e) => setDiscordWebhookInput(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="input-field"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', flex: 1, minWidth: '240px' }}
            />
            <button
              type="button"
              onClick={() => {
                setDiscordWebhookUrl(discordWebhookInput.trim());
                const configured = isDiscordConfigured();
                setDiscordConnected(configured);
                if (configured) {
                  toast.success('Discord Webhook Saved', {
                    description: 'Channel notifications are now live'
                  });
                } else {
                  toast.info('Discord Webhook cleared. Switched to offline mode.');
                }
              }}
              className="btn btn-primary btn-sm"
              style={{ minWidth: '100px', background: '#5865F2', border: 'none' }}
            >
              <span>Save Webhook</span>
            </button>
            <button
              type="button"
              disabled={!discordWebhookInput.trim() || isTestingDiscord}
              onClick={async () => {
                setIsTestingDiscord(true);
                const res = await testDiscordWebhook(discordWebhookInput.trim());
                setIsTestingDiscord(false);
                if (res.success) {
                  toast.success('Test Message Sent', { description: res.message });
                } else {
                  toast.error('Test Failed', { description: res.message });
                }
              }}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <Send size={13} />
              <span>{isTestingDiscord ? 'Sending...' : 'Test Ping'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backup, Export & Reset Section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          Data Portability & Workspace Snapshots
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Export Project Snapshot</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Download a complete JSON backup of all tasks, milestones, manuscript chapters, and revision matrices.
            </div>
          </div>
          <button onClick={handleExport} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <Download size={15} />
            <span>Export JSON Backup</span>
          </button>
        </div>

        {isOwner && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Import Project Snapshot</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Restore tasks and chapters from a previously exported CapStoneFlow backup file.
                </div>
              </div>
              <label className="btn btn-secondary btn-sm" style={{ gap: '6px', cursor: 'pointer' }}>
                <Upload size={15} />
                <span>Upload Backup File</span>
                <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--danger)' }}>Reset Workspace Data</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Clear all tasks, standups, and revisions to restart with a clean slate.
                </div>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm('Reset all project tasks and chapters to a blank template?')) {
                    resetData();
                  }
                }} 
                className="btn btn-secondary btn-sm" 
                style={{ gap: '6px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <RotateCcw size={15} />
                <span>Reset Workspace</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
