import React, { useState } from 'react';
import {
  X,
  Compass,
  Layers,
  CheckCircle2,
  TrendingDown,
  Users,
  Database,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBlank: () => void;
  onKeepTutorialTasks: () => void;
}

const TUTORIAL_STEPS = [
  {
    icon: Compass,
    badge: 'Introduction',
    title: 'Welcome to Chronos',
    subtitle: 'Minimalist work tracking, task estimations, and continuous project burn curves.',
    content: (
      <div className="space-y-3 text-xs text-zinc-600 leading-relaxed">
        <p>
          Chronos is engineered to be <strong>distraction-free, fast, and local-first</strong>. Instead of rigid 2-week sprint cycles or intrusive timers, it tracks progress across your <strong>entire project duration</strong> using individual task hour estimations.
        </p>
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
            <span className="font-semibold text-zinc-900 block mb-1">Kanban & Estimates</span>
            <span>Assign tasks with hour estimates across custom workflow columns.</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
            <span className="font-semibold text-zinc-900 block mb-1">Move to Complete</span>
            <span>Tasks are marked done solely when moved to the Done column.</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
            <span className="font-semibold text-zinc-900 block mb-1">Duration Burn Curves</span>
            <span>Track remaining work and completion velocity across the full project schedule.</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Layers,
    badge: 'Step 1: Kanban & Estimations',
    title: 'Organize Work & Set Estimations',
    subtitle: 'Every task estimation directly powers your project burn charts.',
    content: (
      <div className="space-y-3 text-xs text-zinc-600 leading-relaxed">
        <p>
          Each task on the Kanban board has an <strong>Estimated Hours</strong> field (e.g. 4h, 8h, 16h). When you create or update tasks:
        </p>
        <ul className="space-y-2 list-disc list-inside bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/60 text-zinc-700">
          <li>
            <strong>Total Project Scope:</strong> Chronos automatically sums the estimated hours of all tasks in your team space to form the project ceiling.
          </li>
          <li>
            <strong>Estimate Badges:</strong> Each card displays its estimation (e.g. <span className="font-mono font-medium">8h est</span>), or <span className="font-mono font-medium text-emerald-700">8h completed</span> when moved to Done.
          </li>
          <li>
            <strong>Quick State Moves:</strong> Use the directional arrow buttons on cards or open task details to progress work across workflow stages.
          </li>
        </ul>
      </div>
    ),
  },
  {
    icon: CheckCircle2,
    badge: 'Step 2: Completing Work',
    title: 'Move to Done to Burn Down Work',
    subtitle: 'Clean, effortless completion without stopwatches or manual timesheets.',
    content: (
      <div className="space-y-3 text-xs text-zinc-600 leading-relaxed">
        <p>
          Analytics in Chronos are kept pure and straightforward:
        </p>
        <div className="space-y-2 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/60 text-zinc-700">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-900">Marked Done on Move:</strong> When a task transitions into the <strong>Done</strong> column, its completion timestamp is recorded automatically and its estimated hours are credited as completed scope.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-900">Reversible Anytime:</strong> If a task is moved back to In Progress or Review, its completed status is automatically cleared, restoring remaining hours to the burndown chart.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: TrendingDown,
    badge: 'Step 3: Burn Analytics',
    title: 'Project-Duration Burn Curves',
    subtitle: 'Continuous burn-down and burn-up trajectories based on project timeline.',
    content: (
      <div className="space-y-3 text-xs text-zinc-600 leading-relaxed">
        <p>
          Navigate to the <strong>Burn Analytics</strong> tab to inspect your project timeline:
        </p>
        <div className="space-y-2 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/60 text-zinc-700">
          <div>
            <strong className="text-zinc-900">Burn-down Chart:</strong> Starts at total scope hours on the project start date and descends toward zero as tasks are moved to Done, benchmarked against the ideal planned pace.
          </div>
          <div>
            <strong className="text-zinc-900">Burn-up Chart:</strong> Plots total scope ceiling alongside cumulative completed scope, with a velocity forecast projecting completion date.
          </div>
          <div>
            <strong className="text-zinc-900">Timeline Customization:</strong> Click "Edit Dates" in the header to modify the project start date or delivery milestone anytime.
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Users,
    badge: 'Step 4: Teams, RBAC & Chat',
    title: 'Spaces, Team Chat & Permissions',
    subtitle: 'Add spaces for teams, track member workloads, and collaborate.',
    content: (
      <div className="space-y-3 text-xs text-zinc-600 leading-relaxed">
        <p>
          Collaborate seamlessly across your organization:
        </p>
        <ul className="space-y-2 list-disc list-inside bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/60 text-zinc-700">
          <li>
            <strong>Team Spaces:</strong> Create dedicated spaces for each team (e.g. Core Engineering, Mobile, Design). Each space has its own board, duration, and chat.
          </li>
          <li>
            <strong>Built-in Chat:</strong> Message teammates in real-time within each space and attach task references with one click.
          </li>
          <li>
            <strong>Role-Based Access (RBAC):</strong> Switch roles in the top-right menu to test permissions (Admin, Lead, Member, Viewer).
          </li>
        </ul>
      </div>
    ),
  },
  {
    icon: Database,
    badge: 'Step 5: Offline & Export',
    title: 'Local Storage & Data Portability',
    subtitle: 'Keep your work private offline, with one-click JSON backup & restore.',
    content: (
      <div className="space-y-3 text-xs text-zinc-600 leading-relaxed">
        <p>
          Your data is 100% stored in your browser's local storage with no external dependencies:
        </p>
        <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/60 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-zinc-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ready for Cloud or Team Sharing</span>
          </div>
          <p className="text-[11px] text-zinc-600">
            Click <strong>"Data & Sync"</strong> in the top navigation anytime to export a complete JSON backup file, or upload a JSON backup to restore your workspace on any device.
          </p>
        </div>
      </div>
    ),
  },
];

export const QuickStartModal: React.FC<QuickStartModalProps> = ({
  isOpen,
  onClose,
  onStartBlank,
  onKeepTutorialTasks,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStepIndex];
  const StepIcon = step.icon;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-900 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Quick Start & Tutorial
              </span>
              <span className="text-xs text-zinc-300 ml-1.5">•</span>
              <span className="text-xs font-medium text-zinc-600 ml-1.5">
                Step {currentStepIndex + 1} of {TUTORIAL_STEPS.length}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            aria-label="Close tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 pt-3 flex gap-1.5">
          {TUTORIAL_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-1 flex-1 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'bg-zinc-900'
                  : idx < currentStepIndex
                  ? 'bg-zinc-400'
                  : 'bg-zinc-200'
              }`}
              title={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-semibold border border-zinc-200">
              {step.badge}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <StepIcon className="w-5 h-5 text-zinc-700" />
              <span>{step.title}</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">{step.subtitle}</p>
          </div>

          <div className="pt-1">{step.content}</div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onStartBlank();
                onClose();
              }}
              className="text-xs text-zinc-500 hover:text-zinc-800 font-medium underline-offset-2 hover:underline"
              title="Remove tutorial tasks and start with 0 tasks"
            >
              Start with blank board
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            {!isLast ? (
              <button
                onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium transition-colors shadow-xs"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onKeepTutorialTasks();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
