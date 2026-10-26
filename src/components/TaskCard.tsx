import React from 'react';
import { Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Task, Member, TaskStatus, RolePermissions } from '../types';

interface TaskCardProps {
  task: Task;
  members: Member[];
  permissions: RolePermissions;
  onOpenTaskModal: (taskId: string) => void;
  onMoveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

const STATUS_COLUMNS: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  members,
  permissions,
  onOpenTaskModal,
  onMoveTaskStatus,
}) => {
  const assignee = members.find((m) => m.id === task.assigneeId);
  const estimatedHours = Number(task.estimatedHours) || 0;
  const isDone = task.status === 'done';

  const currentStatusIndex = STATUS_COLUMNS.indexOf(task.status);
  const canMovePrev = currentStatusIndex > 0;
  const canMoveNext = currentStatusIndex < STATUS_COLUMNS.length - 1;

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  return (
    <div
      onClick={() => onOpenTaskModal(task.id)}
      className="group relative bg-white border border-zinc-200/90 hover:border-zinc-300 rounded-xl p-3.5 shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer select-none"
    >
      {/* Header: Priority + Tags + Move arrows */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
            {task.priority}
          </span>
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Column Quick Navigation */}
        {permissions.canMoveTask && (
          <div
            className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {canMovePrev && (
              <button
                onClick={() => onMoveTaskStatus(task.id, STATUS_COLUMNS[currentStatusIndex - 1])}
                className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-700"
                title={`Move to ${STATUS_COLUMNS[currentStatusIndex - 1]}`}
                aria-label={`Move left`}
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            )}
            {canMoveNext && (
              <button
                onClick={() => onMoveTaskStatus(task.id, STATUS_COLUMNS[currentStatusIndex + 1])}
                className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-700"
                title={`Move to ${STATUS_COLUMNS[currentStatusIndex + 1]}`}
                aria-label={`Move right`}
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Task Title */}
      <h3 className={`text-sm font-semibold leading-snug line-clamp-2 mb-3 transition-colors ${
        isDone ? 'text-zinc-500 line-through' : 'text-zinc-900 group-hover:text-indigo-900'
      }`}>
        {task.title}
      </h3>

      {/* Footer: Estimated Time Badge + Assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
        <div className="flex items-center gap-1.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span className={`font-semibold ${isDone ? 'text-emerald-600' : 'text-zinc-800'}`}>
            {estimatedHours}h
          </span>
          <span className="text-[10px] text-zinc-400 font-sans">
            {isDone ? 'completed' : 'estimate'}
          </span>
        </div>

        {/* Assignee Avatar */}
        <div className="flex items-center gap-1.5">
          {assignee ? (
            <img
              src={assignee.avatar}
              alt={assignee.name}
              title={`Assigned to ${assignee.name} (${assignee.role})`}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-zinc-200"
            />
          ) : (
            <span className="text-[10px] text-zinc-400 italic">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
};
