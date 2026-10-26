import React, { useState } from 'react';
import {
  X,
  Clock,
  Trash2,
  Calendar,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import {
  Task,
  Member,
  TaskStatus,
  Priority,
  RolePermissions,
} from '../types';

interface TaskModalProps {
  task: Task;
  members: Member[];
  permissions: RolePermissions;
  onClose: () => void;
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  members,
  permissions,
  onClose,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [estimatedHours, setEstimatedHours] = useState(task.estimatedHours.toString());
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || '');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [tagInput, setTagInput] = useState(task.tags.join(', '));

  const isDone = status === 'done';

  const handleSave = () => {
    if (!title.trim()) return;
    const tagsArray = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const completedAt = isDone
      ? task.completedAt || new Date().toISOString()
      : undefined;

    onUpdateTask({
      ...task,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      estimatedHours: Math.max(0, Number(estimatedHours) || 0),
      assigneeId: assigneeId || undefined,
      dueDate: dueDate || undefined,
      tags: tagsArray,
      completedAt,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Task Details</span>
            <span className="text-xs text-zinc-300">•</span>
            <span className="text-xs font-medium text-zinc-500">ID: {task.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5">
          {/* Title and Description */}
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              disabled={!permissions.canEditTask}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title..."
              className="w-full text-lg font-semibold text-zinc-900 border-0 border-b border-zinc-200 focus:border-zinc-900 focus:ring-0 pb-1.5 placeholder-zinc-300 disabled:bg-transparent"
            />
            <textarea
              value={description}
              disabled={!permissions.canEditTask}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description, requirements, or deliverables..."
              rows={3}
              className="w-full text-xs text-zinc-700 rounded-xl border border-zinc-200 p-3 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 placeholder-zinc-400 disabled:bg-zinc-50"
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
            <div>
              <label className="text-[11px] font-medium text-zinc-500 block mb-1">Status</label>
              <select
                value={status}
                disabled={!permissions.canEditTask}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full text-xs font-medium bg-white rounded-lg border border-zinc-200 p-1.5 focus:border-zinc-900"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-500 block mb-1">Priority</label>
              <select
                value={priority}
                disabled={!permissions.canEditTask}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-xs font-medium bg-white rounded-lg border border-zinc-200 p-1.5 focus:border-zinc-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-500 block mb-1">Estimate (Hours)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                disabled={!permissions.canEditTask}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full text-xs font-mono font-medium bg-white rounded-lg border border-zinc-200 p-1.5 focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-500 block mb-1">Assignee</label>
              <select
                value={assigneeId}
                disabled={!permissions.canEditTask}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-xs font-medium bg-white rounded-lg border border-zinc-200 p-1.5 focus:border-zinc-900"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-500 flex items-center gap-1 mb-1">
                <Tag className="w-3 h-3" />
                <span>Tags (comma separated)</span>
              </label>
              <input
                type="text"
                value={tagInput}
                disabled={!permissions.canEditTask}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Backend, API, Security..."
                className="w-full text-xs bg-white rounded-lg border border-zinc-200 p-2 focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-500 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" />
                <span>Target Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                disabled={!permissions.canEditTask}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs bg-white rounded-lg border border-zinc-200 p-2 focus:border-zinc-900"
              />
            </div>
          </div>

          {/* Completion Status Callout */}
          <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            isDone
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-zinc-50 border-zinc-200 text-zinc-700'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-emerald-600' : 'text-zinc-400'}`} />
              <div>
                <span className="font-semibold block">
                  {isDone ? 'Marked Done' : 'Work in Progress'}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {isDone
                    ? `This task's ${estimatedHours}h estimation is counted as completed in project burn analytics.`
                    : `Moving this task to Done will mark it completed and burn down ${estimatedHours}h from remaining project scope.`}
                </span>
              </div>
            </div>

            <span className="font-mono font-bold text-sm">
              {estimatedHours}h
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
          <div>
            {permissions.canDeleteTask ? (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    onDeleteTask(task.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            ) : (
              <div />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>
            {permissions.canEditTask && (
              <button
                onClick={handleSave}
                className="px-5 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-xs transition-colors"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
