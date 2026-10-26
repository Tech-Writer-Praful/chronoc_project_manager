export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export type Role = 'admin' | 'lead' | 'member' | 'viewer';

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  title: string;
}

export interface Task {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  estimatedHours: number; // estimation in hours
  assigneeId?: string;
  tags: string[];
  dueDate?: string; // YYYY-MM-DD
  createdAt: string; // ISO
  completedAt?: string; // ISO when moved to 'done'
}

export interface TeamSpace {
  id: string;
  name: string;
  description: string;
  color: string;
  projectStartDate: string; // YYYY-MM-DD (e.g. 2026-10-01)
  projectTargetDate: string; // YYYY-MM-DD (e.g. 2026-11-30)
  totalScopeEstimateHours?: number;
}

export interface ChatMessage {
  id: string;
  spaceId: string;
  memberId: string;
  content: string;
  timestamp: string; // ISO
  taskId?: string; // Optional task link
}

export interface AppData {
  version: number;
  currentSpaceId: string;
  currentMemberId: string;
  spaces: TeamSpace[];
  members: Member[];
  tasks: Task[];
  chatMessages: ChatMessage[];
  hasDismissedTutorial?: boolean;
}

export interface RolePermissions {
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canMoveTask: boolean;
  canManageMembers: boolean;
  canManageSpaces: boolean;
  canExportData: boolean;
  canImportData: boolean;
  canChat: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  admin: {
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: true,
    canMoveTask: true,
    canManageMembers: true,
    canManageSpaces: true,
    canExportData: true,
    canImportData: true,
    canChat: true,
  },
  lead: {
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: true,
    canMoveTask: true,
    canManageMembers: false,
    canManageSpaces: false,
    canExportData: true,
    canImportData: false,
    canChat: true,
  },
  member: {
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: false,
    canMoveTask: true,
    canManageMembers: false,
    canManageSpaces: false,
    canExportData: false,
    canImportData: false,
    canChat: true,
  },
  viewer: {
    canCreateTask: false,
    canEditTask: false,
    canDeleteTask: false,
    canMoveTask: false,
    canManageMembers: false,
    canManageSpaces: false,
    canExportData: false,
    canImportData: false,
    canChat: false,
  },
};
