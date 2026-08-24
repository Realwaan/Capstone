import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { Role } from '../types';
import { verifyInviteToken, TokenVerificationResult } from '../lib/tokenSecurity';
import { 
  UserPlus, 
  Link2, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  X, 
  Sparkles, 
  Terminal, 
  Code, 
  Edit3, 
  GraduationCap, 
  Eye,
  CheckCircle2,
  FolderKanban,
  Lock,
  ShieldAlert,
  Key
} from 'lucide-react';
import { toast } from 'sonner';

interface JoinProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  onSuccessNavigate?: () => void;
}

export const JoinProjectModal: React.FC<JoinProjectModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  onSuccessNavigate
}) => {
  const { projects, joinProjectByInvite, currentMember } = useProject();

  const [inviteInput, setInviteInput] = useState(initialCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenVerification, setTokenVerification] = useState<TokenVerificationResult | null>(null);

  useEffect(() => {
    if (initialCode) {
      setInviteInput(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      if (!initialCode) setInviteInput('');
      setTokenVerification(null);
    }
  }, [isOpen, initialCode]);

  // Check cryptographic signature whenever input changes
  useEffect(() => {
    const raw = inviteInput.trim();
    if (raw.includes('token=') || raw.includes('cft_') || raw.split('.').length === 3) {
      verifyInviteToken(raw).then(result => {
        setTokenVerification(result);
      });
    } else {
      setTokenVerification(null);
    }
  }, [inviteInput]);

  if (!isOpen) return null;

  // Helper to parse code and encoded role from input
  const parseInvite = (input: string) => {
    const raw = input.trim();
    if (!raw) return { code: '', role: 'developer' as Role, permission: 'member' as const, isCryptographic: false };

    // If verified cryptographic token is available, use its tamper-proof payload
    if (tokenVerification && tokenVerification.valid && tokenVerification.payload) {
      const p = tokenVerification.payload;
      const roleToAssign: Role = p.role === 'adviser' ? 'adviser' : p.role === 'editor' ? 'leader' : p.role === 'viewer' ? 'researcher' : 'developer';
      return {
        code: p.pid.toUpperCase(),
        role: roleToAssign,
        permission: p.role as 'member' | 'editor' | 'adviser' | 'viewer',
        isCryptographic: true,
        issuer: p.iss
      };
    }

    // Fallback standard URL/code parsing
    let extractedRole: Role = 'developer';
    let extractedPermission: 'member' | 'editor' | 'adviser' | 'viewer' = 'member';

    const lower = raw.toLowerCase();
    if (lower.includes('role=adviser') || lower.includes('role=faculty') || lower.endsWith('-adviser') || lower.endsWith('-faculty')) {
      extractedRole = 'adviser';
      extractedPermission = 'adviser';
    } else if (lower.includes('role=editor') || lower.includes('role=lead') || lower.endsWith('-editor') || lower.endsWith('-lead')) {
      extractedRole = 'leader';
      extractedPermission = 'editor';
    } else if (lower.includes('role=viewer') || lower.includes('role=observer') || lower.endsWith('-viewer') || lower.endsWith('-observer')) {
      extractedRole = 'researcher';
      extractedPermission = 'viewer';
    } else {
      extractedRole = 'developer';
      extractedPermission = 'member';
    }

    // Extract core invite code (e.g. CF-AGRI88 or [CF-G8YSW4])
    const match = raw.match(/CF-[A-Z0-9]{4,12}/i);
    let code = match 
      ? match[0].toUpperCase()
      : raw
          .replace(/^https?:\/\/[^/]+\/#projects\?join=/i, '')
          .replace(/^https?:\/\/[^/]+\/\?join=/i, '')
          .replace(/^#projects\?join=/i, '')
          .replace(/^.*join=/i, '')
          .split('&')[0]
          .split('-ADVISER')[0]
          .split('-FACULTY')[0]
          .split('-EDITOR')[0]
          .split('-LEAD')[0]
          .split('-DEVELOPER')[0]
          .split('-VIEWER')[0]
          .split('-OBSERVER')[0]
          .replace(/[\[\]]/g, '')
          .trim()
          .toUpperCase();

    return {
      code,
      role: extractedRole,
      permission: extractedPermission,
      isCryptographic: false
    };
  };

  const parsed = parseInvite(inviteInput);
  const matchedProject = projects.find(p => 
    (p.inviteCode && p.inviteCode.toUpperCase() === parsed.code) ||
    p.id.toUpperCase() === parsed.code
  );

  const roleDetails = {
    member: { title: 'Developer / Contributor', icon: Code, badge: 'Full Contributor Access', color: 'var(--primary)' },
    editor: { title: 'Editor / Co-Lead', icon: Edit3, badge: 'Sprint Management Access', color: '#38bdf8' },
    adviser: { title: 'Faculty Adviser / Reviewer', icon: GraduationCap, badge: 'Academic Sign-Off Authority', color: '#a78bfa' },
    viewer: { title: 'Observer / Evaluator', icon: Eye, badge: 'Read-Only Access', color: 'var(--text-muted)' }
  }[parsed.permission];

  const RoleIcon = roleDetails.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // An unverifiable signature is a warning, not a blocker: fall back to the
    // plain project code inside the link. The join itself fails honestly if
    // the code matches nothing.
    if (tokenVerification && !tokenVerification.valid) {
      toast('Invite link signature not verified', {
        description: 'Joining with the project code extracted from the link instead.'
      });
    }

    if (!parsed.code) {
      toast.error('Invite Code Required', { description: 'Please enter a valid project invite code or URL.' });
      return;
    }

    setIsSubmitting(true);

    const inputToPass = inviteInput.trim() || parsed.code;
    const tokenPayload = tokenVerification?.valid ? tokenVerification.payload : undefined;
    const success = await joinProjectByInvite(inputToPass, parsed.role, parsed.permission, tokenPayload);
    setIsSubmitting(false);
    if (success) {
      onClose();
      if (onSuccessNavigate) {
        onSuccessNavigate();
      }
    }
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
          maxWidth: '520px',
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
              <UserPlus size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                Join Project Workspace
              </h2>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Enter an invite link or code from your project lead
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Input: Project Invite Code or Published URL */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Project Invite Code or URL *
            </label>

            <div style={{ position: 'relative' }}>
              <Link2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={inviteInput}
                onChange={e => setInviteInput(e.target.value)}
                placeholder="e.g. CF-AGRI88 or https://capstoneflow.app/#projects?join=CF-AGRI88&role=developer"
                className="input-field"
                style={{
                  width: '100%',
                  paddingLeft: '36px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  height: '42px',
                  borderRadius: 'var(--radius-md)'
                }}
                autoFocus
                required
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
              Paste the invite link or 6-character code provided by your project owner.
            </span>
          </div>

          {/* Dynamic Access Preview (Set by Project Owner) */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Lock size={12} /> Access Configured by Project Lead
              </span>
              {tokenVerification ? (
                tokenVerification.valid ? (
                  <span className="badge badge-primary" style={{ fontSize: '0.62rem', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={11} /> Cryptographically Verified (HMAC-SHA256)
                  </span>
                ) : (
                  <span className="badge badge-neutral" style={{ fontSize: '0.62rem', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={11} /> Signature not verified
                  </span>
                )
              ) : (
                <span className="badge badge-primary" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
                  {roleDetails.badge}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: tokenVerification && !tokenVerification.valid ? 'var(--bg-elevated)' : 'rgba(48, 209, 88, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokenVerification && !tokenVerification.valid ? 'var(--text-muted)' : roleDetails.color
              }}>
                {tokenVerification && !tokenVerification.valid ? <ShieldAlert size={16} /> : <RoleIcon size={16} />}
              </div>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: tokenVerification && !tokenVerification.valid ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                  {tokenVerification && !tokenVerification.valid ? 'Unverified invite link' : roleDetails.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {tokenVerification && !tokenVerification.valid
                    ? 'Could not verify this link signature. The project code inside it will be used instead.'
                    : matchedProject 
                      ? `Target Project: ${matchedProject.title}` 
                      : parsed.code 
                        ? `Invite Code: ${parsed.code}` 
                        : 'Awaiting invite link...'}
                </div>
              </div>
            </div>
          </div>

          {/* User Joining Profile Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentMember.avatar ? (
                <img 
                  src={currentMember.avatar} 
                  alt={currentMember.name} 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#061109', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem' }}>
                  {currentMember.name.charAt(0)}
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Joining as: {currentMember.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {currentMember.email || 'authenticated student'}
                </div>
              </div>
            </div>
            <span className="badge badge-neutral" style={{ fontSize: '0.62rem' }}>
              CURRENT SESSION
            </span>
          </div>

          {/* Modal Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '4px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px'
          }}>
            <button 
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!parsed.code || isSubmitting}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px', height: '36px', padding: '0 16px' }}
            >
              {isSubmitting ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Join Project Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
