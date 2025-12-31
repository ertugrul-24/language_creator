import { useState, useEffect } from 'react';
import type { Language } from '@/types/database';
import { updateLanguage } from '@/services/languageService';

interface VisibilitySettingsModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newVisibility: string) => void;
  canEdit: boolean;
}

interface VisibilityOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const VisibilitySettingsModal: React.FC<VisibilitySettingsModalProps> = ({
  language,
  isOpen,
  onClose,
  onUpdate,
  canEdit,
}) => {
  const [visibility, setVisibility] = useState(language.visibility);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVisibility(language.visibility);
  }, [language.visibility, isOpen]);

  const visibilityOptions: VisibilityOption[] = [
    {
      id: 'private',
      label: 'Private',
      description: 'Only you can see this language',
      icon: '🔒',
    },
    {
      id: 'friends',
      label: 'Friends Only',
      description: 'Only your friends can see this language',
      icon: '👥',
    },
    {
      id: 'public',
      label: 'Public',
      description: 'Anyone can view and learn from this language',
      icon: '🌐',
    },
  ];

  const handleSave = async () => {
    if (!canEdit || visibility === language.visibility) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      setError(null);

      console.log('[VisibilitySettingsModal] Updating visibility to:', visibility);

      await updateLanguage(language.id, {
        visibility: visibility || 'private',
      });

      console.log('[VisibilitySettingsModal] ✅ Visibility updated to:', visibility);
      onUpdate(visibility || 'private');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update visibility';
      console.error('[VisibilitySettingsModal] ❌ Error updating visibility:', message);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visibility Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {visibilityOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                visibility === option.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } ${canEdit ? '' : 'opacity-50 cursor-not-allowed'}`}
            >
              <input
                type="radio"
                name="visibility"
                value={option.id}
                checked={visibility === option.id}
                onChange={(e) => setVisibility(e.target.value as 'public' | 'private' | 'friends')}
                disabled={!canEdit || saving}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{option.icon}</span>
                  <span
                    className={`font-semibold ${
                      visibility === option.id
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
              </div>
            </label>
          ))}

          {/* Warning for Public */}
          {visibility === 'public' && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-semibold">⚠️ Public languages</span> can be viewed and accessed by
                anyone. Collaborators can still only edit if invited.
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={saving || !canEdit}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !canEdit || visibility === language.visibility}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisibilitySettingsModal;
