import React, { useState } from 'react';
import { X, Plus, FolderKanban, Calendar, Palette, Trash2, Check } from 'lucide-react';
import { TeamSpace, RolePermissions } from '../types';
import { formatDate, addDays } from '../utils/analytics';

interface SpacesModalProps {
  spaces: TeamSpace[];
  currentSpaceId: string;
  permissions: RolePermissions;
  onClose: () => void;
  onSelectSpace: (spaceId: string) => void;
  onCreateSpace: (newSpace: Omit<TeamSpace, 'id'>) => void;
  onDeleteSpace: (spaceId: string) => void;
}

const COLOR_PRESETS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Red
  '#7c3aed', // Purple
  '#0284c7', // Sky
  '#0d9488', // Teal
  '#18181b', // Zinc
];

export const SpacesModal: React.FC<SpacesModalProps> = ({
  spaces,
  currentSpaceId,
  permissions,
  onClose,
  onSelectSpace,
  onCreateSpace,
  onDeleteSpace,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const [projectStartDate, setProjectStartDate] = useState(formatDate(new Date()));
  const [projectTargetDate, setProjectTargetDate] = useState(addDays(formatDate(new Date()), 45));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateSpace({
      name: name.trim(),
      description: description.trim() || 'Team workspace for tracking project deliverables',
      color,
      projectStartDate,
      projectTargetDate,
    });

    setName('');
    setDescription('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-zinc-700" />
            <h3 className="text-sm font-semibold text-zinc-900">Manage Team Spaces</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Spaces List */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Existing Spaces ({spaces.length})
            </div>

            {spaces.map((space) => {
              const isCurrent = space.id === currentSpaceId;
              return (
                <div
                  key={space.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-zinc-50 border-zinc-900 shadow-xs'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div
                    onClick={() => {
                      onSelectSpace(space.id);
                      onClose();
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: space.color }}
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-zinc-900 flex items-center gap-2">
                        <span>{space.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-200/60 px-1.5 py-0.2 rounded">
                            Active Space
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {space.description}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                        Duration: {space.projectStartDate} → {space.projectTargetDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-3">
                    {spaces.length > 1 && permissions.canManageSpaces && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete space "${space.name}" and its tasks?`)) {
                            onDeleteSpace(space.id);
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-red-600 rounded"
                        title="Delete space"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create Space Form */}
          {permissions.canManageSpaces && (
            <div className="pt-2">
              {!isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full py-2.5 border border-dashed border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 rounded-xl text-xs font-medium text-zinc-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Space</span>
                </button>
              ) : (
                <form onSubmit={handleCreate} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                  <div className="text-xs font-semibold text-zinc-900">New Team Space</div>

                  <div>
                    <label className="text-[11px] text-zinc-500 block mb-1">Space Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Design Systems, Marketing Growth"
                      className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-500 block mb-1">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Purpose and scope of this team space..."
                      className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-zinc-500 block mb-1">Project Start Date</label>
                      <input
                        type="date"
                        value={projectStartDate}
                        onChange={(e) => setProjectStartDate(e.target.value)}
                        className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-1.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-500 block mb-1">Target End Date</label>
                      <input
                        type="date"
                        value={projectTargetDate}
                        onChange={(e) => setProjectTargetDate(e.target.value)}
                        className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-1.5"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-500 block mb-1.5">Color Tag</label>
                    <div className="flex items-center gap-2">
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            color === c ? 'scale-125 ring-2 ring-zinc-900 ring-offset-1' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800"
                    >
                      Create Space
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-50 border-t border-zinc-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
