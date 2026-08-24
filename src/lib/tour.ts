import { driver, DriveStep } from 'driver.js';
import { toast } from 'sonner';
import 'driver.js/dist/driver.css';

/**
 * CapStoneFlow Guided Onboarding Tour powered by Driver.js
 *
 * Motion principles (animations.dev / Emil Kowalski):
 * - Interruptible by construction: allowClose, Esc, and overlay clicks all
 *   exit cleanly, and every exit path answers with a recovery hint toast
 *   instead of stranding the user.
 * - Honors prefers-reduced-motion: stage transitions drop to instant swaps.
 * - Iconography matches the app shell (lucide stroke vectors, currentColor).
 */

const icon = (paths: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:7px" aria-hidden="true">${paths}</svg>`;

const ICONS = {
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  folder:
    '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  target:
    '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  bookOpen:
    '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  fileText:
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>'
};

export const startWorkspaceTour = () => {
  const steps: DriveStep[] = [
    {
      element: '#navbar-countdown-ticker',
      popover: {
        title: `${icon(ICONS.clock)}Target Defense Countdown`,
        description: 'Live countdown ticker to your thesis defense deadline. Keeps the entire research team synchronized on milestone delivery.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#sidebar-nav',
      popover: {
        title: `${icon(ICONS.folder)}Workspace Command Center`,
        description: 'Your unified navigation hub. Switch between Kanban backlog, Manuscript Chapters 1–5, Git Telemetry, and Defense Reports.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#sidebar-kanban',
      popover: {
        title: `${icon(ICONS.target)}Sprint Task Matrix`,
        description: 'Manage sprint backlog deliverables, claim tickets with 1-click, and verify ISO 25010 defense-required items.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#sidebar-manuscript',
      popover: {
        title: `${icon(ICONS.bookOpen)}Thesis Manuscript & Chapters`,
        description: 'Collaborative thesis writing portal. Draft Chapters 1–5 with APA 7th compliance, research matrices, and adviser sign-offs.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#sidebar-revisions',
      popover: {
        title: `${icon(ICONS.fileText)}Faculty Adviser Revisions`,
        description: 'Log and track defense panel comments, revision compliance tables, and adviser endorsement criteria.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#navbar-presence',
      popover: {
        title: `${icon(ICONS.users)}Live Multiplayer Presence`,
        description: 'Real-time indicators showing online teammates, active role allocations, and live claimed task loads.',
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#navbar-cloud-sync',
      popover: {
        title: `${icon(ICONS.cloud)}Cloud Database Sync`,
        description: 'Real-time WebSocket connection to Supabase PostgreSQL. All sprint state is automatically synced in the cloud.',
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#navbar-search',
      popover: {
        title: `${icon(ICONS.zap)}Power Search & Command Palette`,
        description: 'Press ⌘K or Ctrl+K anywhere to search tasks, generate Gemini AI summaries, or switch views with lightning speed.',
        side: 'bottom',
        align: 'start'
      }
    }
  ];

  // Filter only existing elements on current screen
  const availableSteps = steps.filter(step => {
    if (typeof step.element === 'string') {
      return !!document.querySelector(step.element);
    }
    return true;
  });

  const resolvedSteps = availableSteps.length > 0 ? availableSteps : steps;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let dismissed = false;
  let driverObjRef: ReturnType<typeof driver> | null = null;

  const driverObj = driver({
    showProgress: true,
    animate: !prefersReducedMotion,
    allowClose: true,
    overlayColor: 'rgba(3, 5, 10, 0.85)',
    stagePadding: 8,
    stageRadius: 14,
    popoverClass: 'capstone-tour-popover',
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: 'Launch Workspace 🚀',
    steps: resolvedSteps,
    onCloseClick: () => {
      dismissed = true;
      driverObjRef?.destroy();
    },
    onDestroyed: () => {
      localStorage.setItem('capstoneflow_tour_completed', 'true');

      const activeIndex =
        typeof driverObjRef?.getActiveIndex === 'function'
          ? driverObjRef.getActiveIndex()
          : -1;
      const reachedLastStep = (activeIndex ?? -1) >= resolvedSteps.length - 1;

      if (dismissed || !reachedLastStep) {
        toast('Tour paused', {
          description: 'Restart anytime via the tour button in the navbar or the ⌘K command palette.',
          duration: 5000
        });
      } else {
        toast.success('You are all set', {
          description: 'The workspace tour is complete. Your sprint pipeline is live.',
          duration: 4500
        });
      }
    }
  });

  driverObjRef = driverObj;
  driverObj.drive();
  return driverObj;
};
