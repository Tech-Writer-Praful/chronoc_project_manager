import { AppData, Member, TeamSpace, Task, ChatMessage } from '../types';
import { formatDate, addDays } from './analytics';

const STORAGE_KEY = 'chronos_work_tracker_data_v3';

export const INITIAL_USER: Member = {
  id: 'mem-1',
  name: 'Workspace Owner',
  email: 'owner@workspace.local',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  role: 'admin',
  title: 'Workspace Owner & Admin',
};

export const INITIAL_SPACE: TeamSpace = {
  id: 'space-primary',
  name: 'Primary Workspace',
  description: 'Track project deliverables, individual task estimations, and duration burn curves.',
  color: '#18181b', // sleek zinc
  projectStartDate: formatDate(new Date()),
  projectTargetDate: addDays(formatDate(new Date()), 45),
};

export const TUTORIAL_TASKS: Task[] = [
  {
    id: 'tutorial-task-1',
    spaceId: 'space-primary',
    title: '1. Explore task details: click to edit estimate & tags',
    description: 'Welcome to Chronos! Tasks use hour estimations. The total project duration and individual estimations directly power your burn-down and burn-up curves.',
    status: 'todo',
    priority: 'high',
    estimatedHours: 4,
    assigneeId: 'mem-1',
    tags: ['QuickStart', 'Estimate'],
    dueDate: addDays(formatDate(new Date()), 7),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tutorial-task-2',
    spaceId: 'space-primary',
    title: '2. Move work: advance tasks to In Progress or Review',
    description: 'Track progress visually on the Kanban board. When you are ready, moving a task to "Done" automatically records it as completed.',
    status: 'in_progress',
    priority: 'urgent',
    estimatedHours: 6,
    assigneeId: 'mem-1',
    tags: ['Workflow'],
    dueDate: addDays(formatDate(new Date()), 10),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tutorial-task-3',
    spaceId: 'space-primary',
    title: '3. Move to "Done" to burn down project scope',
    description: 'Tasks are marked done only when moved to the Done column. Check the "Burn Analytics" tab to see how completed tasks burn down the remaining work curve!',
    status: 'done',
    priority: 'medium',
    estimatedHours: 4,
    assigneeId: 'mem-1',
    tags: ['Analytics'],
    dueDate: addDays(formatDate(new Date()), 5),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const TUTORIAL_CHAT: ChatMessage[] = [
  {
    id: 'chat-welcome',
    spaceId: 'space-primary',
    memberId: 'mem-1',
    content: 'Welcome to your project space! Use this built-in chat to collaborate with your team, share status updates, and reference specific deliverables.',
    timestamp: new Date().toISOString(),
  },
];

export function getDefaultAppData(): AppData {
  return {
    version: 3,
    currentSpaceId: INITIAL_SPACE.id,
    currentMemberId: INITIAL_USER.id,
    spaces: [INITIAL_SPACE],
    members: [INITIAL_USER],
    tasks: TUTORIAL_TASKS,
    chatMessages: TUTORIAL_CHAT,
    hasDismissedTutorial: false,
    hasOnboardedName: false,
  };
}

export function getFreshBlankAppData(): AppData {
  return {
    version: 3,
    currentSpaceId: INITIAL_SPACE.id,
    currentMemberId: INITIAL_USER.id,
    spaces: [INITIAL_SPACE],
    members: [INITIAL_USER],
    tasks: [],
    chatMessages: [],
    hasDismissedTutorial: true,
    hasOnboardedName: false,
  };
}

export function loadAppData(): AppData {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return getDefaultAppData();
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultData = getDefaultAppData();
      saveAppData(defaultData);
      return defaultData;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!parsed.spaces || !parsed.tasks || !parsed.members) {
      const fallback = getDefaultAppData();
      saveAppData(fallback);
      return fallback;
    }

    // Clean any prior default hardcoded Praful name from old storage versions
    const cleanedMembers = Array.isArray(parsed.members) && parsed.members.length > 0
      ? parsed.members.map((m) =>
          m.id === 'mem-1' && m.name === 'Praful (You)'
            ? { ...m, name: 'Workspace Owner', email: 'owner@workspace.local' }
            : m
        )
      : [INITIAL_USER];

    const hasCompletedNameOnboarding =
      parsed.hasOnboardedName === true &&
      cleanedMembers[0]?.name !== 'Praful (You)' &&
      cleanedMembers[0]?.name !== 'Workspace Owner';

    return {
      version: parsed.version || 3,
      currentSpaceId: parsed.currentSpaceId || INITIAL_SPACE.id,
      currentMemberId: parsed.currentMemberId || INITIAL_USER.id,
      spaces: Array.isArray(parsed.spaces) && parsed.spaces.length > 0 ? parsed.spaces : [INITIAL_SPACE],
      members: cleanedMembers,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      chatMessages: Array.isArray(parsed.chatMessages) ? parsed.chatMessages : [],
      hasDismissedTutorial: parsed.hasDismissedTutorial ?? false,
      hasOnboardedName: hasCompletedNameOnboarding,
    };
  } catch (err) {
    console.error('Failed to load local storage data, resetting to defaults:', err);
    return getDefaultAppData();
  }
}

export function saveAppData(data: AppData): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (err) {
    console.error('Failed to save to local storage:', err);
  }
}

export function exportAppDataJson(data: AppData): void {
  const exportPayload = {
    ...data,
    exportedAt: new Date().toISOString(),
    appName: 'Chronos Work Tracker',
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportPayload, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateStr = new Date().toISOString().substring(0, 10);
  downloadAnchor.setAttribute('download', `chronos-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importAppDataFromJson(jsonString: string): { success: boolean; data?: AppData; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON file: Root must be an object' };
    }

    if (!Array.isArray(parsed.spaces) || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.members)) {
      return {
        success: false,
        error: 'Incompatible backup file format: Missing spaces, tasks, or members arrays',
      };
    }

    const importedData: AppData = {
      version: parsed.version || 3,
      currentSpaceId: parsed.currentSpaceId || parsed.spaces[0]?.id || INITIAL_SPACE.id,
      currentMemberId: parsed.currentMemberId || parsed.members[0]?.id || INITIAL_USER.id,
      spaces: parsed.spaces,
      members: parsed.members,
      tasks: parsed.tasks,
      chatMessages: Array.isArray(parsed.chatMessages) ? parsed.chatMessages : [],
      hasDismissedTutorial: true,
    };

    saveAppData(importedData);
    return { success: true, data: importedData };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown parsing error',
    };
  }
}
