import React, { useState, useEffect } from 'react';
import { CapstoneProject, Role } from '../types';
import { useProject } from '../context/ProjectContext';
import { createSignedInviteToken } from '../lib/tokenSecurity';
import { syncProjectToSupabase, seedSupabaseDatabase } from '../lib/supabaseSync';
import { 
  UserPlus, 
  Link2, 
  Copy, 
  Check, 
  X, 
  Code, 
  Edit3, 
  GraduationCap, 
  Eye, 
  ShieldCheck, 
  Sparkles,
  Share2,
  Lock,
  Key
} from 'lucide-react';
import { toast } from 'sonner';

interface InviteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: CapstoneProject | null;
}

export const InviteCollaboratorModal: React.FC<InviteCollaboratorModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const { currentMember, members, phases, tasks, standups, revisions, chapters } = useProject();
  const [selectedRole, setSelectedRole] = useState<'developer' | 'editor' | 'adviser' | 'viewer'>('developer');
  const [signedToken, setSignedToken] = useState<string>('');
  const [hasCopiedLink, setHasCopiedLink] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  const inviteCode = project?.inviteCode || (project?.id ? `CF-${project.id.slice(-6).toUpperCase()}` : 'CF-WORKSPACE');

  // Compute signed cryptographic token asynchronously and ensure project is synced in cloud
  useEffect(() => {
    if (project && isOpen) {
      const ensuredProject = {
        ...project,
        inviteCode
      };
      syncProjectToSupabase(ensuredProject);
      seedSupabaseDatabase({
        project: ensuredProject,
        members: members || [],
        phases: phases || [],
        tasks: tasks || [],
        standups: standups || [],
        revisions: revisions || [],
        chapters: chapters || []
      });
      createSignedInviteToken({
        pid: inviteCode,
        title: project.title,
        role: selectedRole,
        iss: currentMember?.id || 'lead_admin',
        org: project.organization || 'College of Computer Studies',
        trackType: project.trackType || 'full_coding',
        adviserName: project.adviser?.name,
        adviserEmail: project.adviser?.email,
        adviserDepartment: project.adviser?.department,
        teamName: project.teamName
      }, 14).then(token => {
        setSignedToken(token);
      });
    }
  }, [project, selectedRole, isOpen, inviteCode, currentMember, members, phases, tasks, standups, revisions, chapters]);

  if (!isOpen || !project) return null;

  // Use published domain or current production origin
  const baseUrl = typeof window !== 'undefined' && window.location.origin.includes('localhost')
    ? 'https://capstoneflow.app'
    : window.location.origin;

  const generatedInviteUrl = signedToken 
    ? `${baseUrl}/#projects?join=${inviteCode}&role=${selectedRole}&token=${signedToken}`
    : `${baseUrl}/#projects?join=${inviteCode}&role=${selectedRole}`;

  const rolesConfig: Array<{
    id: 'developer' | 'editor' | 'adviser' | 'viewer';
    title: string;
    description: string;
    icon: any;
    badge: string;
    presetRole: Role;
  }> = [
    {
      id: 'developer',
      title: 'Developer / Contributor',
      description: 'Can claim sprint tasks, submit PRs, log hours, check off deliverables, and submit standups.',
      icon: Code,
      badge: 'Most Common',
      presetRole: 'developer'
    },
    {
      id: 'editor',
      title: 'Editor / Co-Lead',
      description: 'Can create & assign tasks, manage milestone sprint roadmap, and reorder Kanban matrix.',
      icon: Edit3,
      badge: 'Leadership',
      presetRole: 'leader'
    },
    {
      id: 'adviser',
      title: 'Faculty Adviser / Reviewer',
      description: 'Can grant formal milestone sign-offs, post revision directives, and evaluate defense compliance.',
      icon: GraduationCap,
      badge: 'Academic Panel',
      presetRole: 'adviser'
    },
    {
      id: 'viewer',
      title: 'Observer / Evaluator',
      description: 'Read-only access to inspect sprint activity, milestone progress, and defense readiness.',
      icon: Eye,
      badge: 'Read-Only',
      presetRole: 'researcher'
    }
  ];

  const handleCopyLink = () => {
    if (project) {
      const ensuredProject = { ...project, inviteCode };
      syncProjectToSupabase(ensuredProject);
      seedSupabaseDatabase({
        project: ensuredProject,
        members: members || [],
        phases: phases || [],
        tasks: tasks || [],
        standups: standups || [],
        revisions: revisions || [],
        chapters: chapters || []
      });
    }
    navigator.clipboard.writeText(generatedInviteUrl);
    setHasCopiedLink(true);
    toast.success(`Invite Link Copied (${selectedRole.toUpperCase()})`, {
      description: `Teammates opening this link will automatically join with ${rolesConfig.find(r => r.id === selectedRole)?.title} permissions.`
    });
    setTimeout(() => setHasCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (project) {
      const ensuredProject = { ...project, inviteCode };
      syncProjectToSupabase(ensuredProject);
      seedSupabaseDatabase({
        project: ensuredProject,
        members: members || [],
        phases: phases || [],
        tasks: tasks || [],
        standups: standups || [],
        revisions: revisions || [],
        chapters: chapters || []
      });
    }
    navigator.clipboard.writeText(inviteCode);
    setHasCopiedCode(true);
    toast.success(`Invite Code Copied: ${inviteCode}`, {
      description: `Share this code for direct entry in the Join Project modal.`
    });
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        className="modal-card animate-emil-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '580px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(48, 209, 88, 0.12)',
              border: '1px solid rgba(48, 209, 88, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Share2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                Invite Collaborators
              </h2>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Set access permissions for {project.title}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Step 1: Select Access Level Granted by Lead */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
              1. Choose Access Level to Grant to Invitee *
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {rolesConfig.map(r => {
                const isSelected = selectedRole === r.id;
                const IconComponent = r.icon;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(48, 209, 88, 0.08)' : 'var(--bg-elevated)',
                      border: '1.5px solid',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconComponent size={16} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {r.title.split('/')[0].trim()}
                        </span>
                      </div>
                      <span className={`badge ${isSelected ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                        {r.badge}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>
                      {r.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Generated Published Link Preview & Copy */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              2. Shareable Published Invite Link
            </label>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 8px 6px 12px'
            }}>
              <Link2 size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <input
                type="text"
                readOnly
                value={generatedInviteUrl}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px', height: '30px', padding: '0 12px', flexShrink: 0 }}
              >
                {hasCopiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{hasCopiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <span>Or share direct invite code:</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.72rem', color: 'var(--primary)', padding: '2px 8px', height: '24px', gap: '4px' }}
              >
                {hasCopiedCode ? <Check size={12} /> : <Copy size={12} />}
                <span>{hasCopiedCode ? 'Code Copied' : inviteCode}</span>
              </button>
            </div>
          </div>

          {/* Access & Cryptographic Security Callout Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(48, 209, 88, 0.06)',
            border: '1px solid rgba(48, 209, 88, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <ShieldCheck size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Cryptographically Signed Token:</strong>
                <span className="badge badge-primary" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                  HMAC-SHA256
                </span>
              </div>
              <div>
                The recipient automatically receives <strong>{rolesConfig.find(r => r.id === selectedRole)?.title}</strong> authority. Any manual parameter modification in the URL will trigger a cryptographic signature mismatch and invalidate access.
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)'
        }}>
          <button 
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            Done
          </button>
          <button 
            type="button"
            onClick={handleCopyLink}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px' }}
          >
            <Copy size={14} />
            <span>Copy Link & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
