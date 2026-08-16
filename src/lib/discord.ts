import { Task, StandupEntry, MilestonePhase } from '../types';

const DISCORD_WEBHOOK_KEY = 'capstoneflow_discord_webhook';

export const getDiscordWebhookUrl = (): string => {
  const envUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
  if (typeof envUrl === 'string' && envUrl.trim() !== '' && !envUrl.includes('placeholder')) {
    return envUrl.trim();
  }
  const stored = localStorage.getItem(DISCORD_WEBHOOK_KEY);
  return stored ? stored.trim() : '';
};

export const setDiscordWebhookUrl = (url: string) => {
  if (url && url.trim()) {
    localStorage.setItem(DISCORD_WEBHOOK_KEY, url.trim());
  } else {
    localStorage.removeItem(DISCORD_WEBHOOK_KEY);
  }
};

export const isDiscordConfigured = (): boolean => {
  const url = getDiscordWebhookUrl();
  return typeof url === 'string' && url.includes('discord.com/api/webhooks');
};

const sendDiscordPayload = async (payload: any, customUrl?: string): Promise<boolean> => {
  const webhookUrl = customUrl || getDiscordWebhookUrl();
  if (!webhookUrl || !webhookUrl.includes('discord.com/api/webhooks')) {
    return false;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return res.ok || res.status === 204;
  } catch (err) {
    console.warn('Failed to send Discord webhook:', err);
    return false;
  }
};

// 1. Ticket Claimed (/claim)
export const notifyDiscordTaskClaimed = async (
  task: Task,
  claimerName: string,
  claimerHandle: string
): Promise<boolean> => {
  const payload = {
    username: 'CapStoneFlow Bot',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    embeds: [
      {
        title: `🎯 Ticket Claimed: [${task.id.toUpperCase()}] ${task.title}`,
        description: task.description || task.problemStatement || 'No description provided.',
        color: 0x10b981, // Emerald green
        fields: [
          {
            name: '👤 Claimed By',
            value: `**${claimerName}** (\`${claimerHandle}\`)`,
            inline: true
          },
          {
            name: '⚡ Priority',
            value: task.priority.toUpperCase(),
            inline: true
          },
          {
            name: '🎲 Story Points',
            value: `${task.storyPoints || 1} pts (~${task.estimatedHours || 2}h)`,
            inline: true
          },
          {
            name: '📁 Category / Phase',
            value: `${task.category.toUpperCase()} • Phase ${task.phaseId}`,
            inline: true
          },
          {
            name: '📅 Due Date',
            value: task.dueDate || 'Unset',
            inline: true
          },
          {
            name: '📋 Status',
            value: '`[IN PROGRESS / CLAIMED]`',
            inline: true
          }
        ],
        footer: {
          text: 'CapStoneFlow Discord Bot • Real-time Workspace Feed',
          icon_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  return sendDiscordPayload(payload);
};

// 2. Ticket Resolved (/resolve)
export const notifyDiscordTaskResolved = async (
  task: Task,
  resolverName: string,
  resolverHandle: string,
  prUrl?: string
): Promise<boolean> => {
  const payload = {
    username: 'CapStoneFlow Bot',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    embeds: [
      {
        title: `🚀 Ticket Ready for Review: [${task.id.toUpperCase()}] ${task.title}`,
        description: `Work has been submitted and is ready for peer & adviser review.`,
        color: 0x3b82f6, // Blue
        fields: [
          {
            name: '👤 Submitted By',
            value: `**${resolverName}** (\`${resolverHandle}\`)`,
            inline: true
          },
          {
            name: '🔗 Linked PR / Branch',
            value: prUrl ? `[View GitHub Pull Request](${prUrl})` : '`Commit pushed to main`',
            inline: true
          },
          {
            name: '📋 Current Status',
            value: '`[PENDING REVIEW]`',
            inline: true
          }
        ],
        footer: {
          text: 'CapStoneFlow Discord Bot • Quality Assurance Gate'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  return sendDiscordPayload(payload);
};

// 3. Ticket Approved (/review)
export const notifyDiscordTaskReviewed = async (
  task: Task,
  reviewerName: string,
  reviewerHandle: string
): Promise<boolean> => {
  const payload = {
    username: 'CapStoneFlow Bot',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    embeds: [
      {
        title: `✅ Ticket Verified & Completed: [${task.id.toUpperCase()}] ${task.title}`,
        description: `Verified and signed off by QA / Faculty Adviser.`,
        color: 0x22c55e, // Success Green
        fields: [
          {
            name: '🛡️ Verified By',
            value: `**${reviewerName}** (\`${reviewerHandle}\`)`,
            inline: true
          },
          {
            name: '🎲 Points Delivered',
            value: `${task.storyPoints || 1} Story Points`,
            inline: true
          },
          {
            name: '📋 Final Status',
            value: '`[DONE / CLOSED]`',
            inline: true
          }
        ],
        footer: {
          text: 'CapStoneFlow Discord Bot • Milestone Progress'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  return sendDiscordPayload(payload);
};

// 4. Daily Standup Entry
export const notifyDiscordStandup = async (
  standup: StandupEntry,
  memberName: string,
  roleTitle: string,
  avatarUrl?: string
): Promise<boolean> => {
  const payload = {
    username: 'CapStoneFlow Daily Standup',
    avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    embeds: [
      {
        title: `⚡ Sprint Standup: ${memberName}`,
        description: `**Role:** ${roleTitle} • **Date:** ${standup.date}`,
        color: 0x8b5cf6, // Purple
        fields: [
          {
            name: '⏮️ Yesterday (Completed)',
            value: standup.yesterdayAccomplished || 'None',
            inline: false
          },
          {
            name: '⏭️ Today (Objectives)',
            value: standup.todayPlan || 'None',
            inline: false
          },
          {
            name: '⚠️ Blockers / Impediments',
            value: standup.blockers && standup.blockers.trim() !== '' ? `🔴 **${standup.blockers}**` : '🟢 *No active blockers*',
            inline: false
          }
        ],
        footer: {
          text: 'CapStoneFlow • Agile Sprint Standups'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  return sendDiscordPayload(payload);
};

// 5. Milestone Phase Sign-Off
export const notifyDiscordMilestone = async (
  phase: MilestonePhase,
  adviserName: string
): Promise<boolean> => {
  const completedDeliverables = phase.keyDeliverables.filter(d => d.completed).length;
  const totalDeliverables = phase.keyDeliverables.length;

  const payload = {
    username: 'CapStoneFlow Defense Gate',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    embeds: [
      {
        title: `🛡️ Milestone Gate Signed Off: Phase ${phase.id} — ${phase.title}`,
        description: phase.description,
        color: 0xf59e0b, // Amber / Gold
        fields: [
          {
            name: '🎓 Endorsed By',
            value: `**${adviserName}** (Faculty Adviser)`,
            inline: true
          },
          {
            name: '📦 Deliverables Verified',
            value: `${completedDeliverables} of ${totalDeliverables} Completed`,
            inline: true
          },
          {
            name: '📅 Target Date',
            value: phase.targetDate,
            inline: true
          },
          {
            name: '🏆 Milestone Status',
            value: '`[OFFICIALLY SIGNED OFF]`',
            inline: false
          }
        ],
        footer: {
          text: 'CapStoneFlow • Institutional Defense Gate Compliance'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  return sendDiscordPayload(payload);
};

// 6. Test Webhook Ping
export const testDiscordWebhook = async (customUrl?: string): Promise<{ success: boolean; message: string }> => {
  const url = customUrl || getDiscordWebhookUrl();
  if (!url || !url.includes('discord.com/api/webhooks')) {
    return {
      success: false,
      message: 'Invalid Discord Webhook URL. It must start with https://discord.com/api/webhooks/...'
    };
  }

  const payload = {
    username: 'CapStoneFlow Test Bot',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    embeds: [
      {
        title: '🔔 CapStoneFlow Discord Integration Connected!',
        description: 'Your project updates, ticket claims, PR reviews, and daily standups will now broadcast live to this channel.',
        color: 0x30d158, // Emerald
        fields: [
          {
            name: 'Status',
            value: '🟢 Live Webhook Operational',
            inline: true
          },
          {
            name: 'Timestamp',
            value: new Date().toLocaleString(),
            inline: true
          }
        ],
        footer: {
          text: 'CapStoneFlow • Pair Programming & Research Collaboration System'
        }
      }
    ]
  };

  const ok = await sendDiscordPayload(payload, url);
  if (ok) {
    return {
      success: true,
      message: 'Test message sent to Discord successfully! Check your channel.'
    };
  } else {
    return {
      success: false,
      message: 'Failed to send Discord webhook. Check the URL and channel permissions.'
    };
  }
};

// 7. AI UX Workflow Injected / Synchronized
export const notifyDiscordWorkflowLaunched = async (
  workflowTitle: string,
  projectName: string,
  stepsCount: number,
  duration: string,
  triggerUser: string,
  deliverables: string[]
): Promise<boolean> => {
  const payload = {
    username: 'CapStoneFlow AI Workflows',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    embeds: [
      {
        title: `🧩 AI UX Playbook Synchronized: ${workflowTitle}`,
        description: `**${triggerUser}** synchronized a multi-step **${workflowTitle}** for **${projectName}** directly into the CapStoneFlow Task Matrix!`,
        color: 0x8b5cf6, // Purple
        fields: [
          {
            name: '⏱️ Duration & Scope',
            value: `**${duration}** • **${stepsCount}** Actionable Tickets`,
            inline: true
          },
          {
            name: '🎯 Target Phase',
            value: '`Active Sprint`',
            inline: true
          },
          {
            name: '✨ Key Deliverables',
            value: deliverables.map(d => `▫️ ${d}`).join('\n') || 'Full sprint deliverables generated',
            inline: false
          }
        ],
        footer: {
          text: 'CapStoneFlow x AI UX Playground • Bidirectional Task Matrix Sync'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  return sendDiscordPayload(payload);
};
