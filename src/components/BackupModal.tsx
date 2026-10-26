import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  Database,
  CheckCircle2,
  AlertCircle,
  FileCode,
  HardDrive,
} from 'lucide-react';
import { AppData, RolePermissions } from '../types';
import { exportAppDataJson, importAppDataFromJson, getDefaultAppData } from '../utils/storage';

interface BackupModalProps {
  data: AppData;
  permissions: RolePermissions;
  onClose: () => void;
  onRestoreData: (restored: AppData) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  data,
  permissions,
  onClose,
  onRestoreData,
}) => {
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportAppDataJson(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = importAppDataFromJson(content);
      if (result.success && result.data) {
        onRestoreData(result.data);
        setImportStatus({
          type: 'success',
          message: 'Data successfully restored from backup file!',
        });
        setTimeout(() => onClose(), 1500);
      } else {
        setImportStatus({
          type: 'error',
          message: result.error || 'Failed to parse backup JSON file.',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefaults = () => {
    if (
      confirm(
        'Are you sure you want to reset all data to default demo state? Any custom tasks or time logs will be replaced.'
      )
    ) {
      const fresh = getDefaultAppData();
      onRestoreData(fresh);
      setImportStatus({
        type: 'success',
        message: 'Reset to default sample data complete!',
      });
      setTimeout(() => onClose(), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-700" />
            <h3 className="text-sm font-semibold text-zinc-900">Local Data Storage & Backup</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Alert */}
          {importStatus.type === 'success' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importStatus.message}</span>
            </div>
          )}

          {importStatus.type === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Diagnostics summary */}
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Current Local Storage Footprint</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center pt-1 font-mono text-xs">
              <div className="bg-white p-2 rounded-lg border border-zinc-200/60">
                <span className="text-[10px] text-zinc-400 block font-sans">Spaces</span>
                <span className="font-bold text-zinc-900">{data.spaces.length}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-zinc-200/60">
                <span className="text-[10px] text-zinc-400 block font-sans">Tasks</span>
                <span className="font-bold text-zinc-900">{data.tasks.length}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-zinc-200/60">
                <span className="text-[10px] text-zinc-400 block font-sans">Members</span>
                <span className="font-bold text-zinc-900">{data.members.length}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-zinc-200/60">
                <span className="text-[10px] text-zinc-400 block font-sans">Messages</span>
                <span className="font-bold text-zinc-900">{data.chatMessages.length}</span>
              </div>
            </div>
          </div>

          {/* Action 1: Export JSON */}
          <div className="p-4 rounded-xl border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-zinc-900">Export Backup File (JSON)</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Download a complete portable snapshot of all spaces, tasks, estimations, members, and chat logs.
                </p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Action 2: Import JSON */}
          {permissions.canImportData ? (
            <div className="p-4 rounded-xl border border-zinc-200 space-y-2">
              <div>
                <h4 className="text-xs font-semibold text-zinc-900">Import Data from Backup</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Restore or sync work from another team member's JSON export file.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex items-center justify-center gap-2 w-full py-2 border border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 text-zinc-800 rounded-xl text-xs font-medium transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload & Restore JSON File</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-zinc-50 rounded-xl text-xs text-zinc-400 border border-zinc-200">
              Only workspace Admins are permitted to import backup files.
            </div>
          )}

          {/* Action 3: Reset Demo Data */}
          {permissions.canImportData && (
            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-zinc-500">Need to start fresh?</span>
              <button
                onClick={handleResetToDefaults}
                className="text-zinc-600 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Sample Data</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-50 border-t border-zinc-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
