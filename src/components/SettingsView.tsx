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
  ShieldAlert
} from 'lucide-react';

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
    importDataJSON 
  } = useProject();

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
              Configure role titles and access permissions across your 5-member capstone team
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
