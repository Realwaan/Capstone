import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { PermissionLevel, AccessModifier } from '../types';
import { 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  ShieldCheck, 
  Users, 
  Lock,
  Package,
  Shield,
  Globe,
  Database, 
  Cloud, 
  RefreshCw, 
  ExternalLink, 
  Sparkles, 
  Key, 
  MessageSquare, 
  Send,
  Plus,
  Trash2,
  FolderGit2,
  GraduationCap,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { getSupabaseUrl, getSupabaseAnonKey, setSupabaseCredentials, isSupabaseConfigured } from '../lib/supabase';
import { getGeminiApiKey, setGeminiApiKey, isGeminiConfigured } from '../lib/gemini';
import { getGitHubToken, setGitHubToken, parseGitHubRepoUrl } from '../lib/github';
import { getDiscordWebhookUrl, setDiscordWebhookUrl, isDiscordConfigured, testDiscordWebhook } from '../lib/discord';
import { cleanProjectTitle } from '../lib/projectGenerator';
import { DeleteProjectModal } from './DeleteProjectModal';

export const SettingsView: React.FC = () => {
  const { 
    project, 
    projects,
    activeProjectId,
    members,
    currentMember,
    isOwner,
    canManageSettings,
    updateProjectInfo, 
    updateMemberPermission,
    updateMemberRole,
    addMemberByGitHub,
    removeMember,
    deleteProject,
    resetData, 
    exportDataJSON, 
    importDataJSON,
    syncGitHubData,
    setGitHubRepo,
    isMemberOnline
  } = useProject();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Gemini State
  const [geminiKeyInput, setGeminiKeyInput] = useState(getGeminiApiKey());
  const [geminiConnected, setGeminiConnected] = useState(isGeminiConfigured());
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // GitHub State
  const [githubTokenInput, setGithubTokenInput] = useState(getGitHubToken());
  const [githubTokenActive, setGithubTokenActive] = useState(!!getGitHubToken());
  const [showGithubToken, setShowGithubToken] = useState(false);

  // Discord State
  const [discordWebhookInput, setDiscordWebhookInput] = useState(getDiscordWebhookUrl());
  const [discordConnected, setDiscordConnected] = useState(isDiscordConfigured());
  const [isTestingDiscord, setIsTestingDiscord] = useState(false);

  // Form Fields Synced from Project State
  const [title, setTitle] = useState(cleanProjectTitle(project.title) || project.title);
  const [subtitle, setSubtitle] = useState(project.subtitle);
  const [accessLevel, setAccessLevel] = useState<AccessModifier>(project.accessLevel || 'private');
  const [teamName, setTeamName] = useState(project.teamName);
  const [targetDefenseDate, setTargetDefenseDate] = useState(project.targetDefenseDate);
  const [proposalDefenseDate, setProposalDefenseDate] = useState(project.proposalDefenseDate || '');
  const [githubRepoUrl, setGithubRepoUrlInput] = useState(project.githubRepoUrl || '');
  const [adviserName, setAdviserName] = useState(project.adviser?.name || '');
  const [adviserEmail, setAdviserEmail] = useState(project.adviser?.email || '');
  const [department, setDepartment] = useState(project.adviser?.department || '');
  const [panelMembers, setPanelMembers] = useState<string[]>(project.panelMembers || []);
  const [newPanelMember, setNewPanelMember] = useState('');

  // Add Member Modal State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [newMemberRoleTitle, setNewMemberRoleTitle] = useState('Frontend & UI/UX Developer');
  const [isAddingMember, setIsAddingMember] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Keep Form in Sync with Project State
  useEffect(() => {
    setTitle(cleanProjectTitle(project.title) || project.title);
    setSubtitle(project.subtitle);
    setAccessLevel(project.accessLevel || 'private');
    setTeamName(project.teamName);
    setTargetDefenseDate(project.targetDefenseDate);
    setProposalDefenseDate(project.proposalDefenseDate || '');
    setGithubRepoUrlInput(project.githubRepoUrl || '');
    setAdviserName(project.adviser?.name || '');
    setAdviserEmail(project.adviser?.email || '');
    setDepartment(project.adviser?.department || '');
    setPanelMembers(project.panelMembers || []);
  }, [project]);

  // Dynamic Member Counts
  const studentMembers = members.filter(m => m.role !== 'adviser');
  const adviserMembers = members.filter(m => m.role === 'adviser');

  // Dynamic Repository Name
  const parsedRepo = project.githubRepoUrl ? parseGitHubRepoUrl(project.githubRepoUrl) : null;
  const displayRepoSlug = parsedRepo ? `${parsedRepo.owner}/${parsedRepo.repo}` : 'your-org/your-repo';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageSettings) {
      toast.error('Permission Denied', {
        description: 'Only the project lead (Owner) can update project settings.'
      });
      return;
    }

    const sanitizedTitle = cleanProjectTitle(title) || title.trim();

    updateProjectInfo({
      title: sanitizedTitle,
      subtitle,
      accessLevel,
      teamName,
      targetDefenseDate,
      proposalDefenseDate: proposalDefenseDate || undefined,
      githubRepoUrl: githubRepoUrl.trim() || undefined,
      adviser: {
        name: adviserName,
        email: adviserEmail,
        department
      },
      panelMembers
    });

    if (githubRepoUrl.trim() && githubRepoUrl.trim() !== project.githubRepoUrl) {
      setGitHubRepo(githubRepoUrl.trim());
      syncGitHubData(githubRepoUrl.trim());
    }

    setSavedSuccess(true);
    toast.success('Settings Saved', {
      description: 'Project metadata and access configuration updated successfully.'
    });
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddPanelMember = () => {
    if (!newPanelMember.trim()) return;
    setPanelMembers(prev => [...prev, newPanelMember.trim()]);
    setNewPanelMember('');
  };

  const handleRemovePanelMember = (index: number) => {
    setPanelMembers(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberUsername.trim()) return;
    setIsAddingMember(true);
    const success = await addMemberByGitHub(newMemberUsername.trim(), newMemberRoleTitle);
    setIsAddingMember(false);
    if (success) {
      toast.success('Team Member Added', {
        description: `@${newMemberUsername.trim()} added to the roster.`
      });
      setNewMemberUsername('');
      setIsAddMemberOpen(false);
    } else {
      toast.error('Failed to Add Member', {
        description: 'Could not resolve GitHub profile.'
      });
    }
  };

  const handleExport = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CapStoneFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Backup Exported', { description: 'JSON snapshot saved to downloads.' });
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
        toast.success('Backup Restored', { description: 'All project data synchronized from backup.' });
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Error: Invalid backup file format.');
        toast.error('Import Failed', { description: 'The uploaded file is not a valid CapStoneFlow JSON backup.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Project Settings & Access Control</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Manage team member permission levels, project metadata, target defense timeline & cloud database connections
        </p>
      </div>

      {!isOwner && (
        <div style={{ 
          background: 'var(--warning-bg)', 
          border: '1px solid rgba(245, 158, 11, 0.3)', 
          padding: '12px 16px', 
          borderRadius: 'var(--radius-md)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--warning)', 
          fontSize: '0.82rem' 
        }}>
          <Lock size={16} />
          <span><strong>Member Mode:</strong> You are currently viewing as a team member. Workspace settings and destructive actions are restricted to the <strong>Team Leader (Owner)</strong>.</span>
        </div>
      )}

      {savedSuccess && (
        <div style={{ 
          background: 'var(--success-bg)', 
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          padding: '12px 16px', 
          borderRadius: 'var(--radius-md)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--success)', 
          fontSize: '0.85rem' 
        }}>
          <Check size={18} />
          <span>Project settings saved and synced successfully!</span>
        </div>
      )}

      {importStatus && (
        <div style={{ 
          background: 'var(--info-bg)', 
          border: '1px solid rgba(6, 182, 212, 0.3)', 
          padding: '12px 16px', 
          borderRadius: 'var(--radius-md)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--info)', 
          fontSize: '0.85rem' 
        }}>
          <Check size={18} />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Team Roles & Permissions Matrix */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Team Member Permissions & Access Matrix</h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Configure role titles and access permissions across your {studentMembers.length} student {studentMembers.length === 1 ? 'member' : 'members'} and {adviserMembers.length} faculty {adviserMembers.length === 1 ? 'adviser' : 'advisers'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-primary">
              <ShieldCheck size={12} />
              <span>Role-Based Access (RBAC)</span>
            </span>
            {isOwner && (
              <button 
                type="button" 
                onClick={() => setIsAddMemberOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px' }}
              >
                <Plus size={14} />
                <span>Add Member</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Member Modal */}
        {isAddMemberOpen && (
          <div className="modal-backdrop" onClick={() => setIsAddMemberOpen(false)} style={{ zIndex: 1200 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Add Member via GitHub</h3>
                </div>
                <button onClick={() => setIsAddMemberOpen(false)} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddMemberSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="input-label">GitHub Username *</label>
                  <input
                    type="text"
                    value={newMemberUsername}
                    onChange={e => setNewMemberUsername(e.target.value)}
                    placeholder="e.g. octocat"
                    className="input-field"
                    required
                    autoFocus
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Avatar and display name will be imported automatically from GitHub.
                  </span>
                </div>

                <div>
                  <label className="input-label">Initial Role Title</label>
                  <input
                    type="text"
                    value={newMemberRoleTitle}
                    onChange={e => setNewMemberRoleTitle(e.target.value)}
                    placeholder="e.g. Fullstack Developer"
                    className="input-field"
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button type="button" onClick={() => setIsAddMemberOpen(false)} className="btn btn-ghost btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={isAddingMember} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
                    <Plus size={14} />
                    <span>{isAddingMember ? 'Resolving...' : 'Add to Workspace'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {members.map(member => {
            const isCurrentSession = member.id === currentMember?.id;
            const isAdviserRole = member.role === 'adviser';

            return (
              <div 
                key={member.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(200px, 2fr) minmax(140px, 1.4fr) minmax(130px, 1.3fr) auto',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: 'var(--bg-elevated)',
                  border: isCurrentSession ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img 
                      src={member.avatar || `https://github.com/${member.githubUsername || 'ghost'}.png`} 
                      alt={member.name} 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '6px', 
                        objectFit: 'cover',
                        border: isMemberOnline(member.id) ? '1.5px solid #10b981' : '1px solid var(--border-subtle)'
                      }} 
                    />
                    <span 
                      style={{
                        position: 'absolute',
                        bottom: '-1px',
                        right: '-1px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isMemberOnline(member.id) ? '#10b981' : '#6b7280',
                        border: '1px solid var(--bg-surface)',
                        boxShadow: isMemberOnline(member.id) ? '0 0 6px #10b981' : 'none'
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {member.name}
                      </span>
                      {isCurrentSession && (
                        <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                          You
                        </span>
                      )}
                      <span className={`badge ${isMemberOnline(member.id) ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.55rem', padding: '1px 4px' }}>
                        {isMemberOnline(member.id) ? '🟢' : '⚪'}
                      </span>
                      {member.githubUsername && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-accent)', fontFamily: 'var(--font-mono)' }}>
                          @{member.githubUsername}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                    disabled={!isOwner || isCurrentSession}
                    onChange={(e) => updateMemberPermission(member.id, e.target.value as PermissionLevel)}
                    className="input-field"
                    style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                  >
                    <option value="owner">👑 Full Control (Owner)</option>
                    <option value="member">👤 Member Access (Standard)</option>
                    <option value="adviser">👨‍🏫 Adviser (Review & Sign-Off)</option>
                  </select>
                </div>

                {/* Remove Member Action */}
                <div>
                  {isOwner && !isCurrentSession && !isAdviserRole ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Remove ${member.name} from the workspace roster?`)) {
                          removeMember(member.id);
                        }
                      }}
                      className="btn btn-ghost btn-icon"
                      style={{ color: 'var(--danger)', width: '28px', height: '28px' }}
                      title="Remove Member"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <div style={{ width: '28px', height: '28px' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Settings Form */}
      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            General Capstone Information
          </h3>
          <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
            Academic Governance
          </span>
        </div>

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
            rows={2} 
          />
        </div>

        {/* Project Access Level */}
        <div>
          <label className="input-label">Project Access Level</label>
          <select
            value={accessLevel}
            disabled={!canManageSettings}
            onChange={e => setAccessLevel(e.target.value as AccessModifier)}
            className="input-field"
            style={{ height: '38px', fontSize: '0.85rem' }}
          >
            <option value="private">Private (PM & Invited Collaborators Only)</option>
            <option value="package-private">Package-Private (Course Cohort & Section Scope)</option>
            <option value="protected">Protected (Department Scope)</option>
            <option value="public">Public (Open Directory)</option>
          </select>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {accessLevel === 'private' 
              ? 'Private workspace. Only invited collaborators with the invite code can access.'
              : accessLevel === 'package-private'
              ? 'Accessible within your course section / cohort cluster.'
              : accessLevel === 'protected'
              ? 'Accessible within your college department.'
              : 'Openly discoverable in the directory.'}
          </div>

          {/* Quick Invite Code Copy for PM */}
          {accessLevel === 'private' && (
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Private Project Invite Code: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{project.inviteCode || 'CF-ALPHA1'}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(project.inviteCode || 'CF-ALPHA1');
                  toast.success('Invite code copied to clipboard');
                }}
                className="btn btn-secondary btn-sm"
                style={{ height: '26px', fontSize: '0.7rem' }}
              >
                Copy Code
              </button>
            </div>
          )}
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
            <label className="input-label">Linked GitHub Repository</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={githubRepoUrl} 
                disabled={!canManageSettings}
                onChange={(e) => setGithubRepoUrlInput(e.target.value)} 
                placeholder="e.g. https://github.com/owner/repo or owner/repo" 
                className="input-field" 
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
              />
            </div>
          </div>
        </div>

        <div className="grid-cols-2">
          <div>
            <label className="input-label">Proposal Defense Date</label>
            <input 
              type="date" 
              value={proposalDefenseDate} 
              disabled={!canManageSettings}
              onChange={(e) => setProposalDefenseDate(e.target.value)} 
              className="input-field" 
            />
          </div>

          <div>
            <label className="input-label">Target Final Defense Date *</label>
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

        {/* Adviser & Department Credentials */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginTop: '10px' }}>
          Faculty Adviser & Department Credentials
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

        {/* Defense Panel Members */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          <label className="input-label">Defense Panel Evaluators</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {panelMembers.map((panel, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={panel}
                  disabled={!canManageSettings}
                  onChange={(e) => {
                    const updated = [...panelMembers];
                    updated[idx] = e.target.value;
                    setPanelMembers(updated);
                  }}
                  className="input-field"
                  style={{ fontSize: '0.8rem' }}
                />
                {canManageSettings && (
                  <button
                    type="button"
                    onClick={() => handleRemovePanelMember(idx)}
                    className="btn btn-ghost btn-icon"
                    style={{ color: 'var(--danger)', width: '28px', height: '28px' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            {canManageSettings && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input
                  type="text"
                  value={newPanelMember}
                  onChange={e => setNewPanelMember(e.target.value)}
                  placeholder="e.g. Industry Panelist / External Evaluator"
                  className="input-field"
                  style={{ fontSize: '0.8rem' }}
                />
                <button
                  type="button"
                  onClick={handleAddPanelMember}
                  className="btn btn-secondary btn-sm"
                  style={{ minWidth: '100px', gap: '4px' }}
                >
                  <Plus size={14} />
                  <span>Add Panel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {canManageSettings && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="submit" className="btn btn-primary" style={{ gap: '8px' }}>
              <Save size={16} />
              <span>Save & Apply Settings</span>
            </button>
          </div>
        )}
      </form>

      {/* Google Gemini Free AI Assistant */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
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

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <input 
                type={showGeminiKey ? 'text' : 'password'}
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                placeholder="Paste your Gemini API Key here (AIzaSy...)"
                className="input-field"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', paddingRight: '36px' }}
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showGeminiKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setGeminiApiKey(geminiKeyInput.trim());
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} style={{ color: githubTokenActive ? 'var(--primary)' : 'var(--text-muted)' }} />
              <span>GitHub Personal Access Token (Private Repositories)</span>
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Required for syncing private repository (<code>{displayRepoSlug}</code>) and increasing API rate limit from 60 to 5,000 requests/hr
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
              <span>How to generate your GitHub Personal Access Token (30 Seconds):</span>
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-muted)' }}>
              <li>Open <a href="https://github.com/settings/tokens/new?scopes=repo&description=CapStoneFlow" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}>github.com/settings/tokens/new <ExternalLink size={11} style={{ display: 'inline' }} /></a>.</li>
              <li>Check the <strong>"repo"</strong> scope (Full control of private repositories).</li>
              <li>Click <strong>"Generate token"</strong> and paste it below.</li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <input 
                type={showGithubToken ? 'text' : 'password'}
                value={githubTokenInput}
                onChange={(e) => setGithubTokenInput(e.target.value)}
                placeholder="Paste your GitHub Token (ghp_...)"
                className="input-field"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', paddingRight: '36px' }}
              />
              <button
                type="button"
                onClick={() => setShowGithubToken(!showGithubToken)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showGithubToken ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
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

      {/* Discord Webhook Channel Broadcast */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
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

            {projects.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--danger)' }}>Delete Capstone Project</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Permanently erase this workspace, milestones, and task matrices. Restricted to Project Leader or Manager.
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)} 
                  className="btn btn-secondary btn-sm" 
                  style={{ gap: '6px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <Trash2 size={15} />
                  <span>Delete Project</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Project Modal (Typed Name Verification) */}
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        project={project}
        onConfirmDelete={(id) => deleteProject(id)}
      />
    </div>
  );
};
