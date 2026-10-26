import React, { useState, useRef } from 'react';
import {
  Sparkles,
  User,
  Briefcase,
  Check,
  ArrowRight,
  X,
  Camera,
  Upload,
  AlertCircle,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { Member } from '../types';
import {
  DEFAULT_AVATARS,
  AVATAR_OPTIONS,
  MAX_AVATAR_SIZE_BYTES,
  validateAvatarFile,
} from '../utils/avatar';

export { DEFAULT_AVATARS, AVATAR_OPTIONS, MAX_AVATAR_SIZE_BYTES };

const SUGGESTED_ROLES = [
  'Workspace Owner & Admin',
  'Software Engineer',
  'Product Manager',
  'Engineering Lead',
  'UI/UX Designer',
];

interface OnboardingNameModalProps {
  isOpen: boolean;
  isEditMode?: boolean;
  currentMember: Member;
  onSaveProfile: (profile: { name: string; title: string; avatar: string; email?: string }) => void;
  onClose?: () => void;
}

export const OnboardingNameModal: React.FC<OnboardingNameModalProps> = ({
  isOpen,
  isEditMode = false,
  currentMember,
  onSaveProfile,
  onClose,
}) => {
  const initialName =
    currentMember.name === 'Workspace Owner' || currentMember.name === 'Praful (You)'
      ? ''
      : currentMember.name;

  const isCurrentCustom =
    currentMember.avatar &&
    currentMember.avatar !== DEFAULT_AVATARS[0].url &&
    currentMember.avatar !== DEFAULT_AVATARS[1].url;

  const [name, setName] = useState(initialName);
  const [title, setTitle] = useState(currentMember.title || 'Workspace Owner & Admin');
  const [selectedAvatar, setSelectedAvatar] = useState(
    currentMember.avatar || DEFAULT_AVATARS[0].url
  );
  const [customAvatar, setCustomAvatar] = useState<string | null>(
    isCurrentCustom ? currentMember.avatar : null
  );
  const [customAvatarSize, setCustomAvatarSize] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        setCustomAvatar(dataUrl);
        setCustomAvatarSize(file.size);
        setSelectedAvatar(dataUrl);
        setUploadError('');
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);

    // Reset input so re-selecting same file triggers change
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveCustomAvatar = () => {
    setCustomAvatar(null);
    setCustomAvatarSize(null);
    setUploadError('');
    // Switch to first default (Male default)
    setSelectedAvatar(DEFAULT_AVATARS[0].url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter your name to continue.');
      return;
    }

    const cleanTitle = title.trim() || 'Workspace Owner & Admin';
    const cleanEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@workspace.local`;

    onSaveProfile({
      name: cleanName,
      title: cleanTitle,
      avatar: selectedAvatar,
      email: cleanEmail,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">
                {isEditMode ? 'Edit Profile & Name' : 'Welcome to Chronos'}
              </h2>
              <p className="text-[11px] text-zinc-500">
                {isEditMode
                  ? 'Update your name, title, and profile picture'
                  : 'Let’s get your profile set up before you begin'}
              </p>
            </div>
          </div>

          {isEditMode && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Form Body (Scrollable if needed) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Live Preview Card */}
          <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-center gap-3.5">
            <div className="relative">
              <img
                src={selectedAvatar}
                alt="Selected avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <span className="absolute -bottom-1 -right-1 bg-zinc-900 text-white p-0.5 rounded-full">
                <Camera className="w-2.5 h-2.5" />
              </span>
            </div>
            <div className="truncate flex-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block">
                Profile Preview
              </span>
              <span className="font-semibold text-zinc-900 text-sm block truncate">
                {name.trim() || 'Your Name'}
              </span>
              <span className="text-xs text-zinc-500 block truncate">
                {title.trim() || 'Workspace Owner & Admin'}
              </span>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              What is your name? <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                placeholder="Enter your name (e.g. Alex, Sarah, Jordan)"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
            {error && (
              <p className="text-xs text-rose-600 mt-1.5 font-medium">{error}</p>
            )}
          </div>

          {/* Role / Title Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Your role or title
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Workspace Lead, Product Manager, Engineer"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
            {/* Quick role suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUGGESTED_ROLES.map((suggested) => (
                <button
                  type="button"
                  key={suggested}
                  onClick={() => setTitle(suggested)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                    title === suggested
                      ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200/80 hover:bg-zinc-200 hover:text-zinc-900'
                  }`}
                >
                  {suggested}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Picture: 1 Male, 1 Female Default + Custom Upload (<100KB) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-zinc-800">
                Profile Picture
              </label>
              <span className="text-[11px] text-zinc-500">
                1 Male / 1 Female default or upload (&lt;100 KB)
              </span>
            </div>

            {/* Avatar Selection Cards */}
            <div className="grid grid-cols-3 gap-3">
              {/* 1. Male Default */}
              {(() => {
                const maleOpt = DEFAULT_AVATARS[0];
                const isSelected = selectedAvatar === maleOpt.url;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(maleOpt.url);
                      setUploadError('');
                    }}
                    className={`relative flex flex-col items-center p-2.5 rounded-xl border text-center transition-all group ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-50/80 shadow-xs ring-1 ring-zinc-900'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={maleOpt.url}
                        alt="Male default avatar"
                        className="w-14 h-14 rounded-full object-cover border border-zinc-200 group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 bg-zinc-900 text-white rounded-full p-0.5 shadow-xs">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <span className="mt-2 text-xs font-medium text-zinc-800">Male</span>
                    <span className="text-[10px] text-zinc-400">Default 1</span>
                  </button>
                );
              })()}

              {/* 2. Female Default */}
              {(() => {
                const femaleOpt = DEFAULT_AVATARS[1];
                const isSelected = selectedAvatar === femaleOpt.url;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(femaleOpt.url);
                      setUploadError('');
                    }}
                    className={`relative flex flex-col items-center p-2.5 rounded-xl border text-center transition-all group ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-50/80 shadow-xs ring-1 ring-zinc-900'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={femaleOpt.url}
                        alt="Female default avatar"
                        className="w-14 h-14 rounded-full object-cover border border-zinc-200 group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 bg-zinc-900 text-white rounded-full p-0.5 shadow-xs">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <span className="mt-2 text-xs font-medium text-zinc-800">Female</span>
                    <span className="text-[10px] text-zinc-400">Default 2</span>
                  </button>
                );
              })()}

              {/* 3. Custom Upload Picture */}
              {customAvatar ? (
                <div
                  className={`relative flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all ${
                    selectedAvatar === customAvatar
                      ? 'border-zinc-900 bg-zinc-50/80 shadow-xs ring-1 ring-zinc-900'
                      : 'border-zinc-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(customAvatar);
                      setUploadError('');
                    }}
                    className="flex flex-col items-center w-full"
                  >
                    <div className="relative">
                      <img
                        src={customAvatar}
                        alt="Custom uploaded avatar"
                        className="w-14 h-14 rounded-full object-cover border border-zinc-200"
                      />
                      {selectedAvatar === customAvatar && (
                        <span className="absolute -top-1 -right-1 bg-zinc-900 text-white rounded-full p-0.5 shadow-xs">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <span className="mt-2 text-xs font-medium text-zinc-800 truncate max-w-full">
                      Custom Photo
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      {customAvatarSize ? `${(customAvatarSize / 1024).toFixed(1)} KB` : '< 100 KB'}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-zinc-100 w-full justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-medium text-zinc-600 hover:text-zinc-900 hover:underline"
                    >
                      Change
                    </button>
                    <span className="text-zinc-300">·</span>
                    <button
                      type="button"
                      onClick={handleRemoveCustomAvatar}
                      className="text-[10px] font-medium text-rose-500 hover:text-rose-700 flex items-center gap-0.5"
                      title="Remove custom photo"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-100/50 transition-all text-center group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-500 group-hover:text-zinc-800 group-hover:bg-zinc-200 flex items-center justify-center transition-colors mb-1.5">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-zinc-800 group-hover:text-zinc-900">
                    Upload Your Photo
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">
                    &lt; 100 KB
                  </span>
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              aria-label="Upload profile photo"
            />

            {/* Upload error display */}
            {uploadError && (
              <div className="mt-2.5 flex items-start gap-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="flex-1 leading-snug">{uploadError}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100 shrink-0">
            {isEditMode && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium transition-all shadow-xs"
            >
              <span>{isEditMode ? 'Save Profile' : 'Continue to Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
