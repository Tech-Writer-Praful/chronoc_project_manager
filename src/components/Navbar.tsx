import React, { useState } from 'react';
import {
  Layers,
  BarChart3,
  Users,
  ChevronDown,
  Database,
  Plus,
  ShieldCheck,
  Check,
  Compass,
  User,
} from 'lucide-react';
import { AppData, Role } from '../types';

interface NavbarProps {
  data: AppData;
  activeView: 'board' | 'analytics' | 'team';
  setActiveView: (view: 'board' | 'analytics' | 'team') => void;
  onSelectSpace: (spaceId: string) => void;
  onOpenSpacesModal: () => void;
  onOpenBackupModal: () => void;
  onSelectMember: (memberId: string) => void;
  onOpenTutorial: () => void;
  onOpenProfileModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  data,
  activeView,
  setActiveView,
  onSelectSpace,
  onOpenSpacesModal,
  onOpenBackupModal,
  onSelectMember,
  onOpenTutorial,
  onOpenProfileModal,
}) => {
  const [spacesDropdownOpen, setSpacesDropdownOpen] = useState(false);
  const [membersDropdownOpen, setMembersDropdownOpen] = useState(false);

  const currentSpace = data.spaces.find((s) => s.id === data.currentSpaceId) || data.spaces[0];
  const currentMember = data.members.find((m) => m.id === data.currentMemberId) || data.members[0];

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'bg-zinc-900 text-white';
      case 'lead':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'member':
        return 'bg-zinc-100 text-zinc-700 border border-zinc-200';
      case 'viewer':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 md:h-16 gap-2">
          {/* Brand & Space Selector */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs sm:text-sm tracking-wider shadow-sm">
                C
              </div>
              <span className="font-semibold tracking-tight text-zinc-900 text-sm sm:text-base hidden sm:inline">
                Chronos
              </span>
            </div>

            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

            {/* Space Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSpacesDropdownOpen(!spacesDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-xs font-medium text-zinc-800"
                aria-label="Select Team Space"
              >
                <span
                  className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: currentSpace?.color || '#4f46e5' }}
                />
                <span className="max-w-[100px] sm:max-w-[140px] truncate">{currentSpace?.name || 'Default Space'}</span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
              </button>

              {spacesDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setSpacesDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white border border-zinc-200 shadow-xl py-1.5 z-30">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Team Spaces
                    </div>
                    {data.spaces.map((space) => (
                      <button
                        key={space.id}
                        onClick={() => {
                          onSelectSpace(space.id);
                          setSpacesDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                          space.id === data.currentSpaceId
                            ? 'bg-zinc-100 text-zinc-900 font-medium'
                            : 'text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: space.color }}
                          />
                          <span className="truncate">{space.name}</span>
                        </div>
                        {space.id === data.currentSpaceId && <Check className="w-3.5 h-3.5 text-zinc-700" />}
                      </button>
                    ))}
                    <div className="border-t border-zinc-100 my-1" />
                    <button
                      onClick={() => {
                        setSpacesDropdownOpen(false);
                        onOpenSpacesModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Manage / Add Spaces</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveView('board')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'board'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>

            <button
              onClick={() => setActiveView('analytics')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'analytics'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Burn Analytics</span>
            </button>

            <button
              onClick={() => setActiveView('team')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'team'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team & Chat</span>
            </button>
          </nav>

          {/* Right Actions: Quick Start + Backup + Member Profile & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Start / Tutorial Button */}
            <button
              onClick={onOpenTutorial}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors"
              title="Open Tutorial & Quick Start Guide"
            >
              <Compass className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Quick Start</span>
            </button>

            {/* Backup / Export / Import Button */}
            <button
              onClick={onOpenBackupModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors"
              title="Import or Export JSON Backup"
            >
              <Database className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Data & Sync</span>
            </button>

            {/* Member & Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMembersDropdownOpen(!membersDropdownOpen)}
                className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                aria-label="Switch User or Test RBAC"
              >
                <img
                  src={currentMember?.avatar}
                  alt={currentMember?.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                />
                <span className="text-xs font-medium text-zinc-800 hidden lg:inline max-w-[80px] truncate">
                  {currentMember?.name.split(' ')[0]}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-mono uppercase px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded ${getRoleBadge(currentMember.role)}`}>
                  {currentMember?.role}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {membersDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMembersDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-zinc-200 shadow-xl py-2 z-30">
                    <div className="px-3.5 py-1">
                      <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Switch Active Member (RBAC)</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                        Test permissions live as an Admin, Lead, Member, or Viewer.
                      </p>
                    </div>
                    <div className="border-t border-zinc-100 my-1.5" />
                    {data.members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          onSelectMember(member.id);
                          setMembersDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                          member.id === data.currentMemberId
                            ? 'bg-zinc-100 text-zinc-900 font-medium'
                            : 'text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="truncate">
                            <div className="text-xs font-medium text-zinc-900 truncate">{member.name}</div>
                            <div className="text-[10px] text-zinc-500 truncate">{member.title}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${getRoleBadge(member.role)}`}>
                            {member.role}
                          </span>
                          {member.id === data.currentMemberId && <Check className="w-3.5 h-3.5 text-zinc-700" />}
                        </div>
                      </button>
                    ))}
                    <div className="border-t border-zinc-100 my-1" />
                    <button
                      onClick={() => {
                        setMembersDropdownOpen(false);
                        onOpenProfileModal();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-zinc-800 hover:bg-zinc-50 font-medium transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Edit Your Profile & Name</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs Bar */}
        <nav className="flex md:hidden items-center gap-1 overflow-x-auto pb-2 pt-0.5 scrollbar-none">
          <button
            onClick={() => setActiveView('board')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
              activeView === 'board'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Board</span>
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
              activeView === 'analytics'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Burn Analytics</span>
          </button>

          <button
            onClick={() => setActiveView('team')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
              activeView === 'team'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Team & Chat</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
