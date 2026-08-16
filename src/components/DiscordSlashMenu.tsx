import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Task } from '../types';
import { 
  Clock, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  UserCheck, 
  UserMinus, 
  ExternalLink, 
  Lock, 
  RotateCcw, 
  Database, 
  Layers,
  ArrowRight,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface DiscordSlashMenuProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand?: (cmd: string) => void;
}

interface SlashCommandItem {
  command: string;
  args?: string;
  description: string;
  badge?: string;
  icon?: React.ReactNode;
  allowedRoles: ('leader' | 'developer' | 'qa' | 'researcher' | 'adviser' | 'coordinator')[];
  action: (task?: Task | null) => void;
}

export const DiscordSlashMenu: React.FC<DiscordSlashMenuProps> = ({
  task,
  isOpen,
  onClose,
  onSelectCommand
}) => {
  const { 
    currentMember, 
    claimTask, 
    releaseTask, 
    resolveTask, 
    reviewTask, 
    closeTask, 
    loadTemplateTickets, 
    rebuildDatabase 
  } = useProject();

  const [search, setSearch] = useState('');
  const [prUrlInput, setPrUrlInput] = useState('');
  const [isPromptingPR, setIsPromptingPR] = useState(false);

  if (!isOpen) return null;

  const isPM = currentMember.role === 'leader';
  const isDev = currentMember.role === 'developer' || isPM;
  const isQA = currentMember.role === 'qa' || currentMember.role === 'adviser' || isPM;

  const commands: SlashCommandItem[] = [
    {
      command: '/resolved',
      args: 'pr_url',
      description: 'Mark a ticket as PENDING-REVIEW with PR link (Developer & PM only)',
      badge: 'CapStone Bot',
      allowedRoles: ['leader', 'developer'],
      action: (t) => {
        if (!t) {
          toast.error('Please open a ticket to run /resolved');
          return;
        }
        setIsPromptingPR(true);
      }
    },
    {
      command: '/closed',
      description: 'Mark a ticket as CLOSED (PM or involved Dev/QA only)',
      badge: 'CapStone Bot',
      allowedRoles: ['leader', 'developer', 'qa'],
      action: (t) => {
        if (!t) {
          toast.error('Please open a ticket to run /closed');
          return;
        }
        closeTask(t.id, 'Closed via /closed slash command');
        onClose();
      }
    },
    {
      command: '/reviewed',
      description: 'Approve & verify ticket deliverables (QA & Adviser only)',
      badge: 'CapStone Bot',
      allowedRoles: ['leader', 'qa', 'adviser'],
      action: (t) => {
        if (!t) {
          toast.error('Please open a ticket to run /reviewed');
          return;
        }
        reviewTask(t.id, 'Approved via /reviewed QA command');
        onClose();
      }
    },
    {
      command: '/unclaim',
      description: 'Unclaim a ticket back to open pool (Developer only)',
      badge: 'CapStone Bot',
      allowedRoles: ['leader', 'developer'],
      action: (t) => {
        if (!t) {
          toast.error('Please open a ticket to run /unclaim');
          return;
        }
        releaseTask(t.id);
        onClose();
      }
    },
    {
      command: '/claim',
      description: 'Claim ticket ownership and assign to yourself',
      badge: 'CapStone Bot',
      allowedRoles: ['leader', 'developer'],
      action: (t) => {
        if (!t) {
          toast.error('Please open a ticket to run /claim');
          return;
        }
        claimTask(t.id);
        onClose();
      }
    },
    {
      command: '/load-tickets',
      description: 'Load default capstone tickets into matrix (PM only)',
      badge: 'CapStone Bot',
      allowedRoles: ['leader'],
      action: () => {
        loadTemplateTickets();
        onClose();
      }
    },
    {
      command: '/rebuild-db',
      description: 'Rebuild database from seed schema (PM only)',
      badge: 'CapStone Bot',
      allowedRoles: ['leader'],
      action: () => {
        rebuildDatabase();
        onClose();
      }
    },
    {
      command: '/tableflip',
      description: 'Appends (╯°□°)╯︵ ┻━┻ to chat or progress log',
      badge: 'Built-In',
      allowedRoles: ['leader', 'developer', 'qa', 'researcher', 'adviser', 'coordinator'],
      action: () => {
        navigator.clipboard.writeText('(╯°□°)╯︵ ┻━┻');
        toast.success('Copied to clipboard: (╯°□°)╯︵ ┻━┻');
        onClose();
      }
    },
    {
      command: '/spoiler',
      description: 'Marks defense secret or surprise update as spoiler',
      badge: 'Built-In',
      allowedRoles: ['leader', 'developer', 'qa', 'researcher', 'adviser', 'coordinator'],
      action: () => {
        toast.info('Spoiler tag enabled ||spoiler||');
        onClose();
      }
    }
  ];

  const filtered = commands.filter(cmd => {
    const matchesSearch = cmd.command.toLowerCase().includes(search.toLowerCase()) || 
      cmd.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleExecutePR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    resolveTask(task.id, prUrlInput.trim() || undefined, 'Submitted with PR link');
    setIsPromptingPR(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1300 }}>
      <div 
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '540px',
          padding: 0,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          overflow: 'hidden'
        }}
      >
        {/* Discord Slash Search Input Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)'
        }}>
          <span style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 800 }}>/</span>
          <input 
            type="text" 
            placeholder="Type a slash command or search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.86rem',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ width: '24px', height: '24px', padding: 0 }}>
            <X size={14} />
          </button>
        </div>

        {/* PR URL Sub-Prompt If User clicked /resolved */}
        {isPromptingPR ? (
          <form onSubmit={handleExecutePR} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Submit for Review: <code>/resolved</code>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Provide a GitHub Pull Request URL or deliverable document link to submit for Peer / QA review:
            </div>
            <input 
              type="url" 
              placeholder="https://github.com/org/repo/pull/12 or deliverable link..."
              value={prUrlInput}
              onChange={e => setPrUrlInput(e.target.value)}
              className="input-field"
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button type="button" onClick={() => setIsPromptingPR(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Mark PENDING-REVIEW 🚀
              </button>
            </div>
          </form>
        ) : (
          <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '6px' }}>
            <div style={{ 
              fontSize: '0.7rem', 
              fontWeight: 800, 
              color: 'var(--text-muted)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.04em',
              padding: '6px 10px' 
            }}>
              Frequently Used & Bot Commands
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {filtered.map(item => {
                const isAllowed = isPM || item.allowedRoles.includes(currentMember.role);

                return (
                  <div
                    key={item.command}
                    onClick={() => {
                      if (!isAllowed) {
                        toast.error(`Permission Denied: Your role (${currentMember.role.toUpperCase()}) cannot run ${item.command}`);
                        return;
                      }
                      item.action(task);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: isAllowed ? 'pointer' : 'not-allowed',
                      opacity: isAllowed ? 1 : 0.45,
                      background: 'transparent',
                      transition: 'background 120ms var(--ease-out)'
                    }}
                    className="dropdown-option-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontWeight: 800, 
                        fontSize: '0.82rem', 
                        color: 'var(--text-primary)' 
                      }}>
                        {item.command}
                      </span>
                      {item.args && (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          background: 'var(--bg-elevated)',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          color: 'var(--primary)'
                        }}>
                          {item.args}
                        </span>
                      )}
                      <span style={{ 
                        fontSize: '0.76rem', 
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.description}
                      </span>
                    </div>

                    <span style={{ 
                      fontSize: '0.66rem', 
                      color: 'var(--text-muted)', 
                      fontFamily: 'var(--font-mono)',
                      flexShrink: 0,
                      marginLeft: '8px'
                    }}>
                      {item.badge}
                    </span>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  No matching slash command found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div style={{
          padding: '8px 14px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>Your Role: <strong style={{ color: 'var(--primary)' }}>{currentMember.role.toUpperCase()}</strong></span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>Tab or Click to execute</span>
        </div>
      </div>
    </div>
  );
};
