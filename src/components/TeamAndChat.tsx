import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Shield,
  UserPlus,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  Tag,
  Paperclip,
  Check,
  ShieldAlert,
} from 'lucide-react';
import {
  Member,
  ChatMessage,
  Task,
  TeamSpace,
  Role,
  ROLE_PERMISSIONS,
  RolePermissions,
} from '../types';
import { calculateMemberWorkloads } from '../utils/analytics';

interface TeamAndChatProps {
  members: Member[];
  chatMessages: ChatMessage[];
  tasks: Task[];
  currentSpace: TeamSpace;
  currentMemberId: string;
  permissions: RolePermissions;
  onSendMessage: (content: string, taskId?: string) => void;
  onUpdateMemberRole: (memberId: string, role: Role) => void;
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onOpenTaskModal: (taskId: string) => void;
}

export const TeamAndChat: React.FC<TeamAndChatProps> = ({
  members,
  chatMessages,
  tasks,
  currentSpace,
  currentMemberId,
  permissions,
  onSendMessage,
  onUpdateMemberRole,
  onAddMember,
  onOpenTaskModal,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'workload' | 'rbac'>('chat');
  const [messageInput, setMessageInput] = useState('');
  const [selectedTaskLink, setSelectedTaskLink] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // New member inputs
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberTitle, setNewMemberTitle] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<Role>('member');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for current space
  const spaceMessages = chatMessages.filter((m) => m.spaceId === currentSpace.id);
  const spaceTasks = tasks.filter((t) => t.spaceId === currentSpace.id);

  // Workload analytics based purely on task estimations
  const memberWorkloads = calculateMemberWorkloads(members, spaceTasks);

  // Auto scroll chat to bottom when message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [spaceMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    onSendMessage(messageInput.trim(), selectedTaskLink || undefined);
    setMessageInput('');
    setSelectedTaskLink('');
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    onAddMember({
      name: newMemberName.trim(),
      email: newMemberEmail.trim() || `${newMemberName.toLowerCase().replace(/\s+/g, '.')}@chronos.local`,
      title: newMemberTitle.trim() || 'Team Member',
      role: newMemberRole,
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 50000)}?auto=format&fit=crop&w=120&h=120&q=80`,
    });

    setIsAddMemberOpen(false);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberTitle('');
  };

  const formatMessageTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Section Header */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Team Collaboration</span>
            <span className="text-xs text-zinc-300">•</span>
            <span className="text-xs font-medium text-zinc-500">{currentSpace.name} Space</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Team Hub & Space Chat</h2>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'chat' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Space Chat ({spaceMessages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('workload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'workload' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Member Workloads ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'rbac' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Role Permissions (RBAC)</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs flex flex-col h-[560px]">
          {/* Chat Header */}
          <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentSpace.color }}
              />
              <span className="text-xs font-semibold text-zinc-900">#{currentSpace.name.toLowerCase().replace(/\s+/g, '-')}</span>
              <span className="text-[11px] text-zinc-400">Collaborative stream for this space</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {spaceMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <MessageSquare className="w-8 h-8 text-zinc-300 mb-2" />
                <p className="text-xs">No chat messages in this space yet.</p>
                <p className="text-[11px] text-zinc-400 mt-1">Start the conversation with your team!</p>
              </div>
            ) : (
              spaceMessages.map((msg) => {
                const author = members.find((m) => m.id === msg.memberId);
                const isMe = msg.memberId === currentMemberId;
                const linkedTask = msg.taskId ? spaceTasks.find((t) => t.id === msg.taskId) : null;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <img
                      src={author?.avatar}
                      alt={author?.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />

                    <div className={`max-w-md ${isMe ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-zinc-900">
                          {isMe ? 'You' : author?.name || 'Member'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {formatMessageTime(msg.timestamp)}
                        </span>
                      </div>

                      <div
                        className={`text-xs p-3 rounded-2xl ${
                          isMe
                            ? 'bg-zinc-900 text-white rounded-tr-xs'
                            : 'bg-zinc-100 text-zinc-800 rounded-tl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                        {/* Linked Task Chip in Chat */}
                        {linkedTask && (
                          <div
                            onClick={() => onOpenTaskModal(linkedTask.id)}
                            className={`mt-2 p-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer text-[11px] font-medium transition-colors ${
                              isMe
                                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                                : 'bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200'
                            }`}
                          >
                            <Tag className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span className="truncate">Task: {linkedTask.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Composer */}
          <div className="p-3 border-t border-zinc-100 bg-white">
            {permissions.canChat ? (
              <form onSubmit={handleSend} className="space-y-2">
                {/* Optional Task Mention selector */}
                {selectedTaskLink && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-zinc-100 rounded-lg text-xs text-zinc-700 w-fit">
                    <Tag className="w-3 h-3 text-indigo-600" />
                    <span>Referencing task: {spaceTasks.find((t) => t.id === selectedTaskLink)?.title}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTaskLink('')}
                      className="text-zinc-400 hover:text-zinc-600 ml-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {/* Task picker toggle */}
                  <select
                    value={selectedTaskLink}
                    onChange={(e) => setSelectedTaskLink(e.target.value)}
                    className="text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-2 text-zinc-600 focus:border-zinc-900 max-w-[140px] truncate"
                    title="Attach task reference"
                  >
                    <option value="">Attach Task</option>
                    {spaceTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message #${currentSpace.name.toLowerCase()}...`}
                    className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white"
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <span>Send</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-2 text-xs text-zinc-400 text-center italic">
                Your role (Viewer) is in read-only mode for space chat.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Member Workload Tab */}
      {activeTab === 'workload' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Collective progress and workload allocation across all members in {currentSpace.name}.
            </p>
            {permissions.canManageMembers && (
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            )}
          </div>

          {/* Add member dialog */}
          {isAddMemberOpen && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 animate-in fade-in">
              <div className="text-xs font-semibold text-zinc-900 mb-2">Add New Team Member</div>
              <form onSubmit={handleCreateMember} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="text-xs bg-white border border-zinc-200 rounded-lg p-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Role Title (e.g. Backend Lead)"
                  value={newMemberTitle}
                  onChange={(e) => setNewMemberTitle(e.target.value)}
                  className="text-xs bg-white border border-zinc-200 rounded-lg p-2"
                />
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as Role)}
                  className="text-xs bg-white border border-zinc-200 rounded-lg p-2"
                >
                  <option value="admin">Admin</option>
                  <option value="lead">Lead</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddMemberOpen(false)}
                    className="px-3 py-2 text-zinc-500 hover:text-zinc-700 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Workload Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberWorkloads.map((workload) => {
              const member = members.find((m) => m.id === workload.memberId);
              if (!member) return null;

              const completionPct =
                workload.assignedTasksCount > 0
                  ? Math.round((workload.completedTasksCount / workload.assignedTasksCount) * 100)
                  : 0;

              return (
                <div
                  key={workload.memberId}
                  className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={workload.avatar}
                        alt={workload.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-900">{workload.name}</h4>
                        <span className="text-[10px] text-zinc-500">{member.title}</span>
                      </div>
                    </div>

                    {permissions.canManageMembers ? (
                      <select
                        value={member.role}
                        onChange={(e) => onUpdateMemberRole(member.id, e.target.value as Role)}
                        className="text-[10px] font-mono uppercase bg-zinc-100 border border-zinc-200 rounded px-1.5 py-0.5"
                      >
                        <option value="admin">ADMIN</option>
                        <option value="lead">LEAD</option>
                        <option value="member">MEMBER</option>
                        <option value="viewer">VIEWER</option>
                      </select>
                    ) : (
                      <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                        {member.role}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Assigned Tasks</span>
                      <span className="font-mono font-semibold text-zinc-800">
                        {workload.completedTasksCount}/{workload.assignedTasksCount} done
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 block">Estimated Scope</span>
                      <span className="font-mono font-semibold text-zinc-800">
                        {workload.completedEstimatedHours}h / {workload.totalEstimatedHours}h
                      </span>
                    </div>
                  </div>

                  {/* Member Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                      <span>Task Completion</span>
                      <span>{completionPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 rounded-full"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RBAC Matrix Tab */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Role-Based Access Control Matrix</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Strict permissions mapped to member security tiers. Switch users in the header to observe the enforcement in real time.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-700">
                  <th className="py-2.5 px-4">Action / Capability</th>
                  <th className="py-2.5 px-4 text-center">Admin</th>
                  <th className="py-2.5 px-4 text-center">Lead</th>
                  <th className="py-2.5 px-4 text-center">Member</th>
                  <th className="py-2.5 px-4 text-center">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono">
                <tr>
                  <td className="py-2.5 px-4 font-sans text-zinc-800">Create & Edit Tasks</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ Allowed</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ Allowed</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ Allowed</td>
                  <td className="py-2.5 px-4 text-center text-zinc-400">✕ Denied</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans text-zinc-800">Delete Tasks</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ Allowed</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ Allowed</td>
                  <td className="py-2.5 px-4 text-center text-zinc-400">✕ Denied</td>
                  <td className="py-2.5 px-4 text-center text-zinc-400">✕ Denied</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans text-zinc-800">Move & Complete Tasks</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ Allowed</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ Allowed</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ Allowed</td>
                  <td className="py-2.5 px-4 text-center text-zinc-400">✕ Denied</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans text-zinc-800">Manage Spaces & Project Dates</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ Allowed</td>
                  <td className="py-2.5 px-4 text-center text-zinc-400">✕ Denied</td>
                  <td className="py-2.5 px-4 text-center text-zinc-400">✕ Denied</td>
                  <td className="py-2.5 px-4 text-center text-zinc-400">✕ Denied</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans text-zinc-800">Import & Export Backups</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ Allowed</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ (Export only)</td>
                  <td className="py-2.5 px-4 text-center text-zinc-400">✕ Denied</td>
                  <td className="py-2.5 px-4 text-center text-zinc-400">✕ Denied</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans text-zinc-800">Space Chat Messaging</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ Allowed</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ Allowed</td>
                  <td className="py-2.5 px-4 text-center text-emerald-600">✓ Allowed</td>
                  <td className="py-2.5 px-4 text-center text-zinc-400">✕ Denied</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
