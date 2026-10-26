import React, { useState, useEffect } from 'react';
import {
  loadAppData,
  saveAppData,
} from './utils/storage';
import {
  AppData,
  Task,
  TaskStatus,
  Role,
  TeamSpace,
  Member,
  ROLE_PERMISSIONS,
} from './types';
import { formatDate } from './utils/analytics';
import { Navbar } from './components/Navbar';
import { KanbanBoard } from './components/KanbanBoard';
import { BurnCharts } from './components/BurnCharts';
import { TeamAndChat } from './components/TeamAndChat';
import { TaskModal } from './components/TaskModal';
import { SpacesModal } from './components/SpacesModal';
import { BackupModal } from './components/BackupModal';
import { QuickStartModal } from './components/QuickStartModal';
import { OnboardingNameModal } from './components/OnboardingNameModal';

export default function App() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [activeView, setActiveView] = useState<'board' | 'analytics' | 'team'>('board');
  const [selectedTaskIdForModal, setSelectedTaskIdForModal] = useState<string | null>(null);
  const [isSpacesModalOpen, setIsSpacesModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(() => !data.hasOnboardedName);
  const [isProfileEditMode, setIsProfileEditMode] = useState<boolean>(false);
  const [isQuickStartModalOpen, setIsQuickStartModalOpen] = useState<boolean>(
    () => Boolean(data.hasOnboardedName && !data.hasDismissedTutorial)
  );
  const [showQuickStartBanner, setShowQuickStartBanner] = useState<boolean>(() => !data.hasDismissedTutorial);

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const currentSpace =
    data.spaces.find((s) => s.id === data.currentSpaceId) || data.spaces[0];
  const currentMember =
    data.members.find((m) => m.id === data.currentMemberId) || data.members[0];
  const permissions =
    ROLE_PERMISSIONS[currentMember?.role || 'member'];

  // Task selection for modal
  const activeModalTask = selectedTaskIdForModal
    ? data.tasks.find((t) => t.id === selectedTaskIdForModal) || null
    : null;

  // --- Task CRUD ---
  const handleCreateTask = (status: TaskStatus = 'todo') => {
    if (!permissions.canCreateTask) return;
    const newTask: Task = {
      id: `task-${Date.now().toString().slice(-4)}`,
      spaceId: data.currentSpaceId,
      title: 'New Project Deliverable',
      description: '',
      status,
      priority: 'medium',
      estimatedHours: 8,
      assigneeId: data.currentMemberId,
      tags: ['Feature'],
      dueDate: formatDate(new Date(Date.now() + 14 * 86400000)),
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    setSelectedTaskIdForModal(newTask.id);
  };

  const handleUpdateTask = (updated: Task) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    if (!permissions.canDeleteTask) return;
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const handleMoveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    if (!permissions.canMoveTask) return;
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const isDone = newStatus === 'done';
        return {
          ...t,
          status: newStatus,
          completedAt: isDone ? t.completedAt || new Date().toISOString() : undefined,
        };
      }),
    }));
  };

  // --- Spaces & Project Duration Management ---
  const handleSelectSpace = (spaceId: string) => {
    setData((prev) => ({
      ...prev,
      currentSpaceId: spaceId,
    }));
  };

  const handleCreateSpace = (newSpace: Omit<TeamSpace, 'id'>) => {
    const spaceId = `space-${Date.now().toString().slice(-4)}`;
    const created: TeamSpace = {
      ...newSpace,
      id: spaceId,
    };
    setData((prev) => ({
      ...prev,
      spaces: [...prev.spaces, created],
      currentSpaceId: spaceId,
    }));
  };

  const handleDeleteSpace = (spaceId: string) => {
    if (data.spaces.length <= 1) return;
    setData((prev) => {
      const remainingSpaces = prev.spaces.filter((s) => s.id !== spaceId);
      return {
        ...prev,
        spaces: remainingSpaces,
        currentSpaceId: remainingSpaces[0]?.id || 'space-platform',
        tasks: prev.tasks.filter((t) => t.spaceId !== spaceId),
        chatMessages: prev.chatMessages.filter((m) => m.spaceId !== spaceId),
      };
    });
  };

  const handleUpdateSpaceDates = (projectStartDate: string, projectTargetDate: string) => {
    setData((prev) => ({
      ...prev,
      spaces: prev.spaces.map((s) =>
        s.id === prev.currentSpaceId
          ? { ...s, projectStartDate, projectTargetDate }
          : s
      ),
    }));
  };

  // --- Member Management & RBAC ---
  const handleSelectMember = (memberId: string) => {
    setData((prev) => ({
      ...prev,
      currentMemberId: memberId,
    }));
  };

  const handleUpdateMemberRole = (memberId: string, role: Role) => {
    if (!permissions.canManageMembers) return;
    setData((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === memberId ? { ...m, role } : m)),
    }));
  };

  const handleAddMember = (member: Omit<Member, 'id'>) => {
    if (!permissions.canManageMembers) return;
    const newMember: Member = {
      ...member,
      id: `mem-${Date.now().toString().slice(-4)}`,
    };
    setData((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
  };

  // --- Team Space Chat ---
  const handleSendMessage = (content: string, taskId?: string) => {
    if (!permissions.canChat) return;
    const newMsg = {
      id: `chat-${Date.now()}`,
      spaceId: data.currentSpaceId,
      memberId: data.currentMemberId,
      content,
      timestamp: new Date().toISOString(),
      taskId,
    };
    setData((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, newMsg],
    }));
  };

  // --- Data Restore ---
  const handleRestoreData = (restored: AppData) => {
    setData(restored);
  };

  // --- Tutorial / Quick Start Actions ---
  const handleStartBlank = () => {
    setData((prev) => ({
      ...prev,
      tasks: [],
      hasDismissedTutorial: true,
    }));
    setShowQuickStartBanner(false);
  };

  const handleKeepTutorialTasks = () => {
    setData((prev) => ({
      ...prev,
      hasDismissedTutorial: true,
    }));
  };

  const handleClearTutorialTasks = () => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => !t.id.startsWith('tutorial-task')),
    }));
  };

  // --- Profile / Name Onboarding ---
  const handleSaveProfile = (profile: { name: string; title: string; avatar: string; email?: string }) => {
    setData((prev) => {
      const updatedMembers = prev.members.map((m) =>
        m.id === prev.currentMemberId || m.id === 'mem-1'
          ? {
              ...m,
              name: profile.name,
              title: profile.title,
              avatar: profile.avatar,
              email: profile.email || m.email,
            }
          : m
      );

      const updatedChat = prev.chatMessages.map((msg) =>
        msg.id === 'chat-welcome'
          ? {
              ...msg,
              content: `Welcome ${profile.name} to your project space! Use this built-in chat to collaborate with your team, share status updates, and reference specific deliverables.`,
            }
          : msg
      );

      return {
        ...prev,
        members: updatedMembers,
        chatMessages: updatedChat,
        hasOnboardedName: true,
      };
    });

    setIsOnboardingModalOpen(false);
    setIsProfileEditMode(false);

    // Open Quick Start tutorial if not yet seen
    if (!data.hasDismissedTutorial) {
      setIsQuickStartModalOpen(true);
    }
  };

  const handleOpenProfileModal = () => {
    setIsProfileEditMode(true);
    setIsOnboardingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Global Minimalist Header Navigation */}
      <Navbar
        data={data}
        activeView={activeView}
        setActiveView={setActiveView}
        onSelectSpace={handleSelectSpace}
        onOpenSpacesModal={() => setIsSpacesModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onSelectMember={handleSelectMember}
        onOpenTutorial={() => setIsQuickStartModalOpen(true)}
        onOpenProfileModal={handleOpenProfileModal}
      />

      {/* Main View Port */}
      <main className="flex-1 overflow-x-hidden">
        {activeView === 'board' && (
          <KanbanBoard
            tasks={data.tasks}
            members={data.members}
            permissions={permissions}
            currentSpaceId={data.currentSpaceId}
            showQuickStartBanner={showQuickStartBanner}
            onOpenTaskModal={(taskId) => setSelectedTaskIdForModal(taskId)}
            onCreateTask={handleCreateTask}
            onMoveTaskStatus={handleMoveTaskStatus}
            onOpenTutorial={() => setIsQuickStartModalOpen(true)}
            onDismissQuickStartBanner={() => setShowQuickStartBanner(false)}
            onClearTutorialTasks={handleClearTutorialTasks}
          />
        )}

        {activeView === 'analytics' && (
          <BurnCharts
            tasks={data.tasks}
            currentSpace={currentSpace}
            permissions={permissions}
            onUpdateSpaceDates={handleUpdateSpaceDates}
          />
        )}

        {activeView === 'team' && (
          <TeamAndChat
            members={data.members}
            chatMessages={data.chatMessages}
            tasks={data.tasks}
            currentSpace={currentSpace}
            currentMemberId={data.currentMemberId}
            permissions={permissions}
            onSendMessage={handleSendMessage}
            onUpdateMemberRole={handleUpdateMemberRole}
            onAddMember={handleAddMember}
            onOpenTaskModal={(taskId) => setSelectedTaskIdForModal(taskId)}
          />
        )}
      </main>

      {/* Task Details & Estimation Modal */}
      {activeModalTask && (
        <TaskModal
          task={activeModalTask}
          members={data.members}
          permissions={permissions}
          onClose={() => setSelectedTaskIdForModal(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* Spaces Management Modal */}
      {isSpacesModalOpen && (
        <SpacesModal
          spaces={data.spaces}
          currentSpaceId={data.currentSpaceId}
          permissions={permissions}
          onClose={() => setIsSpacesModalOpen(false)}
          onSelectSpace={handleSelectSpace}
          onCreateSpace={handleCreateSpace}
          onDeleteSpace={handleDeleteSpace}
        />
      )}

      {/* Local Storage & Backup JSON Modal */}
      {isBackupModalOpen && (
        <BackupModal
          data={data}
          permissions={permissions}
          onClose={() => setIsBackupModalOpen(false)}
          onRestoreData={handleRestoreData}
        />
      )}

      {/* Quick Start & Tutorial Guide Modal */}
      <QuickStartModal
        isOpen={isQuickStartModalOpen}
        onClose={() => setIsQuickStartModalOpen(false)}
        onStartBlank={handleStartBlank}
        onKeepTutorialTasks={handleKeepTutorialTasks}
      />

      {/* First-boot Name Onboarding & Profile Customization Modal */}
      <OnboardingNameModal
        isOpen={isOnboardingModalOpen}
        isEditMode={isProfileEditMode}
        currentMember={currentMember}
        onSaveProfile={handleSaveProfile}
        onClose={isProfileEditMode ? () => setIsOnboardingModalOpen(false) : undefined}
      />
    </div>
  );
}
