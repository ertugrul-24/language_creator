import { useState, useEffect } from 'react';
import type { Language, LanguageSpecs } from '@/types/database';
import { updateLanguage } from '@/services/languageService';
import { DepthLevelWarningModal } from '@/components/DepthLevelWarningModal';

interface EditLanguageSpecsModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedLanguage: Language) => void;
  canEdit: boolean;
}

const EditLanguageSpecsModal: React.FC<EditLanguageSpecsModalProps> = ({
  language,
  isOpen,
  onClose,
  onUpdate,
  canEdit,
}) => {
  const [formData, setFormData] = useState<LanguageSpecs>(language.specs || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDepthChange, setConfirmDepthChange] = useState(false);
  const [pendingDepthLevel, setPendingDepthLevel] = useState<'realistic' | 'simplified' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(language.specs || {});
      setError(null);
      setConfirmDepthChange(false);
    }
  }, [language, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'depthLevel') {
      if (language.specs?.depthLevel !== value && value === 'simplified') {
        // Show confirmation for simplified depth level
        setPendingDepthLevel(value as 'simplified');
        setConfirmDepthChange(true);
        return;
      }
      setFormData((prev) => ({
        ...prev,
        depthLevel: value as 'realistic' | 'simplified',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDepthLevelConfirm = () => {
    if (pendingDepthLevel) {
      setFormData((prev) => ({
        ...prev,
        depthLevel: pendingDepthLevel,
      }));
    }
    setConfirmDepthChange(false);
    setPendingDepthLevel(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      setSaving(true);
      setError(null);

      console.log('[EditLanguageSpecsModal] Updating specs for language:', language.id);
      console.log('[EditLanguageSpecsModal] Old specs:', language.specs);
      console.log('[EditLanguageSpecsModal] New specs:', formData);

      // Call updateLanguage with only specs
      const updatedLanguage = await updateLanguage(language.id, {
        specs: formData,
      });

      console.log('[EditLanguageSpecsModal] Update successful:', updatedLanguage);
      onUpdate(updatedLanguage);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update language specs';
      console.error('[EditLanguageSpecsModal] Update error:', message);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-surface-dark rounded-lg border border-border-dark p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Edit Language Specifications</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alphabet Script */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Alphabet Script</label>
              <select
                name="alphabetScript"
                value={formData.alphabetScript || ''}
                onChange={handleChange}
                disabled={!canEdit || saving}
                className="w-full bg-surface-light dark:bg-surface-dark text-white border border-border-dark rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select alphabet...</option>
                <option value="Latin">Latin</option>
                <option value="Cyrillic">Cyrillic</option>
                <option value="Greek">Greek</option>
                <option value="Arabic">Arabic</option>
                <option value="Devanagari">Devanagari</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {/* Writing Direction */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Writing Direction</label>
              <select
                name="writingDirection"
                value={formData.writingDirection || ''}
                onChange={handleChange}
                disabled={!canEdit || saving}
                className="w-full bg-surface-light dark:bg-surface-dark text-white border border-border-dark rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select direction...</option>
                <option value="ltr">Left to Right (LTR)</option>
                <option value="rtl">Right to Left (RTL)</option>
                <option value="boustrophedon">Boustrophedon</option>
              </select>
            </div>

            {/* Word Order */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Word Order</label>
              <select
                name="wordOrder"
                value={formData.wordOrder || ''}
                onChange={handleChange}
                disabled={!canEdit || saving}
                className="w-full bg-surface-light dark:bg-surface-dark text-white border border-border-dark rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select word order...</option>
                <option value="SVO">SVO (Subject-Verb-Object)</option>
                <option value="SOV">SOV (Subject-Object-Verb)</option>
                <option value="VSO">VSO (Verb-Subject-Object)</option>
                <option value="VOS">VOS (Verb-Object-Subject)</option>
                <option value="OVS">OVS (Object-Verb-Subject)</option>
                <option value="OSV">OSV (Object-Subject-Verb)</option>
              </select>
            </div>

            {/* Depth Level */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Depth Level</label>
              <select
                name="depthLevel"
                value={formData.depthLevel || ''}
                onChange={handleChange}
                disabled={!canEdit || saving}
                className="w-full bg-surface-light dark:bg-surface-dark text-white border border-border-dark rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select depth level...</option>
                <option value="realistic">Realistic</option>
                <option value="simplified">Simplified</option>
              </select>
              {formData.depthLevel === 'simplified' && (
                <p className="text-xs text-amber-400 mt-2">⚠️ Simplified languages are suitable for learning purposes but less linguistically realistic.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border-dark">
              <button
                type="submit"
                disabled={!canEdit || saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Depth Level Confirmation Modal */}
      <DepthLevelWarningModal
        isOpen={confirmDepthChange}
        onConfirm={handleDepthLevelConfirm}
        onCancel={() => {
          setConfirmDepthChange(false);
          setPendingDepthLevel(null);
        }}
      />
    </>
  );
};

export default EditLanguageSpecsModal;
