import React, { useState } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  CircleDot,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Task, Member, TaskStatus, RolePermissions } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  members: Member[];
  permissions: RolePermissions;
  currentSpaceId: string;
  showQuickStartBanner: boolean;
  onOpenTaskModal: (taskId: string) => void;
  onCreateTask: (status?: TaskStatus) => void;
  onMoveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenTutorial: () => void;
  onDismissQuickStartBanner: () => void;
  onClearTutorialTasks: () => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  colorDot: string;
  borderColor: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: 'backlog', title: 'Backlog', colorDot: 'bg-zinc-400', borderColor: 'border-zinc-200' },
  { id: 'todo', title: 'To Do', colorDot: 'bg-blue-500', borderColor: 'border-blue-200' },
  { id: 'in_progress', title: 'In Progress', colorDot: 'bg-amber-500', borderColor: 'border-amber-200' },
  { id: 'review', title: 'In Review', colorDot: 'bg-indigo-500', borderColor: 'border-indigo-200' },
  { id: 'done', title: 'Done', colorDot: 'bg-emerald-500', borderColor: 'border-emerald-200' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  members,
  permissions,
  currentSpaceId,
  showQuickStartBanner,
  onOpenTaskModal,
  onCreateTask,
  onMoveTaskStatus,
  onOpenTutorial,
  onDismissQuickStartBanner,
  onClearTutorialTasks,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const spaceTasks = tasks.filter((t) => t.spaceId === currentSpaceId);
  const hasTutorialTasks = spaceTasks.some((t) => t.id.startsWith('tutorial-task'));

  const hasMultipleTasks = spaceTasks.length >= 2;
  const hasEstimatedTasks = spaceTasks.some((t) => Number(t.estimatedHours) > 0);
  const hasDoneTask = spaceTasks.some((t) => t.status === 'done');

  const filteredTasks = spaceTasks.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = t.title.toLowerCase().includes(q);
      const matchesTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchesTitle && !matchesTags) return false;
    }
    if (selectedAssignee !== 'all') {
      if (t.assigneeId !== selectedAssignee) return false;
    }
    if (selectedPriority !== 'all') {
      if (t.priority !== selectedPriority) return false;
    }
    return true;
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && permissions.canMoveTask) {
      onMoveTaskStatus(taskId, status);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] overflow-hidden">
      {/* Quick Start Guided Checklist Banner */}
      {showQuickStartBanner && (
        <div className="bg-zinc-900 text-white px-4 sm:px-6 py-2.5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-wide flex items-center gap-1.5 text-zinc-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Start:</span>
            </span>

            <div className="flex items-center gap-3 text-zinc-300 text-[11px] flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>1. Setup Space</span>
              </span>
              <span className="flex items-center gap-1">
                {hasMultipleTasks ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <CircleDot className="w-3 h-3 text-zinc-500" />
                )}
                <span>2. Create Tasks</span>
              </span>
              <span className="flex items-center gap-1">
                {hasEstimatedTasks ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <CircleDot className="w-3 h-3 text-zinc-500" />
                )}
                <span>3. Set Estimations</span>
              </span>
              <span className="flex items-center gap-1">
                {hasDoneTask ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <CircleDot className="w-3 h-3 text-zinc-500" />
                )}
                <span>4. Move to Done (Burn Down)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasTutorialTasks && (
              <button
                onClick={onClearTutorialTasks}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors"
                title="Remove sample tutorial tasks to start with an empty board"
              >
                Clear Sample Tasks
              </button>
            )}
            <button
              onClick={onOpenTutorial}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[11px] font-medium transition-colors"
            >
              Open Tutorial
            </button>
            <button
              onClick={onDismissQuickStartBanner}
              className="p-1 text-zinc-400 hover:text-white rounded"
              title="Dismiss checklist"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Filter and Actions Toolbar */}
      <div className="px-4 sm:px-6 py-3 bg-white border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px] max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks by name or tag..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 font-medium text-zinc-700 focus:border-zinc-900"
          >
            <option value="all">All Assignees</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 font-medium text-zinc-700 focus:border-zinc-900"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {(searchQuery || selectedAssignee !== 'all' || selectedPriority !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedAssignee('all');
                setSelectedPriority('all');
              }}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {permissions.canCreateTask && (
            <button
              onClick={() => onCreateTask('todo')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="flex-1 overflow-x-auto p-4 sm:p-6 bg-zinc-50/70">
        <div className="flex gap-4 min-w-[1100px] h-full items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const colEstimatedHours = colTasks.reduce(
              (sum, t) => sum + (Number(t.estimatedHours) || 0),
              0
            );

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="flex-1 flex flex-col max-w-xs h-full bg-zinc-100/70 rounded-2xl border border-zinc-200/70 p-3 shadow-2xs"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-200/60">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.colorDot}`} />
                    <span className="text-xs font-semibold text-zinc-800">{col.title}</span>
                    <span className="text-[11px] font-mono font-medium text-zinc-400 bg-zinc-200/60 px-1.5 py-0.2 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 font-medium">
                    {colEstimatedHours}h est
                  </span>
                </div>

                {/* Task Cards Scrollable Area */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                  {colTasks.length === 0 ? (
                    <div className="h-28 flex flex-col items-center justify-center border border-dashed border-zinc-300 rounded-xl text-center p-3">
                      <p className="text-[11px] text-zinc-400">No tasks in {col.title.toLowerCase()}</p>
                      {permissions.canCreateTask && (
                        <button
                          onClick={() => onCreateTask(col.id)}
                          className="mt-1.5 text-[11px] font-medium text-zinc-600 hover:text-zinc-900"
                        >
                          + Add one
                        </button>
                      )}
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable={permissions.canMoveTask}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', task.id);
                        }}
                      >
                        <TaskCard
                          task={task}
                          members={members}
                          permissions={permissions}
                          onOpenTaskModal={onOpenTaskModal}
                          onMoveTaskStatus={onMoveTaskStatus}
                        />
                      </div>
                    ))
                  )}
                </div>

                {permissions.canCreateTask && (
                  <button
                    onClick={() => onCreateTask(col.id)}
                    className="mt-2 w-full py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60 rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Task</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
