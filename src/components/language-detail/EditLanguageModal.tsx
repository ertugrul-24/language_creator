import { useState, useEffect } from 'react';
import type { Language } from '@/types/database';
import { updateLanguage } from '@/services/languageService';
import { DepthLevelWarningModal } from '@/components/DepthLevelWarningModal';

interface EditLanguageModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedLanguage: Language) => void;
  canEdit: boolean;
}

interface FormData {
  // Basic info
  name: string;
  description: string;
  icon_url: string;
  // Specs
  alphabetScript: string;
  writingDirection: string;
  wordOrder: string;
  depthLevel: string;
  // Phonology
  phoneme_count: number;
}

const EditLanguageModal: React.FC<EditLanguageModalProps> = ({
  language,
  isOpen,
  onClose,
  onUpdate,
  canEdit,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: language.name,
    description: language.description || '',
    icon_url: language.icon_url || '🌍',
    alphabetScript: language.specs?.alphabetScript || '',
    writingDirection: language.specs?.writingDirection || '',
    wordOrder: language.specs?.wordOrder || '',
    depthLevel: language.specs?.depthLevel || '',
    phoneme_count: language.phoneme_count || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDepthChange, setConfirmDepthChange] = useState(false);
  const [pendingDepthLevel, setPendingDepthLevel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'specs'>('basic');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: language.name,
        description: language.description || '',
        icon_url: language.icon_url || '🌍',
        alphabetScript: language.specs?.alphabetScript || '',
        writingDirection: language.specs?.writingDirection || '',
        wordOrder: language.specs?.wordOrder || '',
        depthLevel: language.specs?.depthLevel || '',
        phoneme_count: language.phoneme_count || 0,
      });
      setError(null);
      setConfirmDepthChange(false);
      setActiveTab('basic');
    }
  }, [language, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'depthLevel') {
      if (language.specs?.depthLevel !== value && value === 'simplified') {
        // Show confirmation for simplified depth level
        setPendingDepthLevel(value);
        setConfirmDepthChange(true);
        return;
      }
      setFormData((prev) => ({
        ...prev,
        depthLevel: value,
      }));
    } else if (name === 'phoneme_count') {
      // Handle number input for phoneme count
      setFormData((prev) => ({
        ...prev,
        phoneme_count: parseInt(value) || 0,
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

      console.log('[EditLanguageModal] Submitting updates:', formData);

      // Only include non-empty spec fields in the update
      const updatedSpecs: any = {};
      if (formData.alphabetScript) updatedSpecs.alphabetScript = formData.alphabetScript;
      if (formData.writingDirection) updatedSpecs.writingDirection = formData.writingDirection;
      if (formData.wordOrder) updatedSpecs.wordOrder = formData.wordOrder;
      if (formData.depthLevel) updatedSpecs.depthLevel = formData.depthLevel;

      const updatePayload: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon_url,
        specs: updatedSpecs,
        phoneme_count: formData.phoneme_count,
      };

      console.log('[EditLanguageModal] Update payload:', {
        name: updatePayload.name,
        description: updatePayload.description,
        icon: updatePayload.icon,
        specs: updatePayload.specs,
        phoneme_count: updatePayload.phoneme_count,
      });

      const updatedLanguage = await updateLanguage(language.id, updatePayload);

      console.log('[EditLanguageModal] ✅ Language updated successfully');
      console.log('[EditLanguageModal] Updated language specs:', updatedLanguage.specs);
      console.log('[EditLanguageModal] Updated phoneme_count:', updatedLanguage.phoneme_count);
      onUpdate(updatedLanguage);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update language';
      console.error('[EditLanguageModal] ❌ Error updating language:', message);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Language</h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 pt-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`pb-3 px-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'basic'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              Basic Information
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 px-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'specs'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              Language Specifications
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Language Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={saving || !canEdit}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={saving || !canEdit}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Icon Emoji
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      name="icon_url"
                      value={formData.icon_url}
                      onChange={handleChange}
                      maxLength={2}
                      disabled={saving || !canEdit}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div className="text-5xl">{formData.icon_url}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                {/* Alphabet Script */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Alphabet/Script
                  </label>
                  <select
                    name="alphabetScript"
                    value={formData.alphabetScript}
                    onChange={handleChange}
                    disabled={!canEdit || saving}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Writing Direction
                  </label>
                  <select
                    name="writingDirection"
                    value={formData.writingDirection}
                    onChange={handleChange}
                    disabled={!canEdit || saving}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">Select direction...</option>
                    <option value="ltr">Left to Right (LTR)</option>
                    <option value="rtl">Right to Left (RTL)</option>
                    <option value="boustrophedon">Boustrophedon</option>
                  </select>
                </div>

                {/* Word Order */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Word Order
                  </label>
                  <select
                    name="wordOrder"
                    value={formData.wordOrder}
                    onChange={handleChange}
                    disabled={!canEdit || saving}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Depth Level
                  </label>
                  <select
                    name="depthLevel"
                    value={formData.depthLevel}
                    onChange={handleChange}
                    disabled={!canEdit || saving}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">Select depth level...</option>
                    <option value="realistic">Realistic</option>
                    <option value="simplified">Simplified</option>
                  </select>
                  {formData.depthLevel === 'simplified' && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      ⚠️ Simplified languages are suitable for learning purposes but less linguistically realistic.
                    </p>
                  )}
                </div>

                {/* Phoneme Count */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phoneme Count
                  </label>
                  <input
                    type="number"
                    name="phoneme_count"
                    value={formData.phoneme_count}
                    onChange={handleChange}
                    min="0"
                    max="1000"
                    disabled={!canEdit || saving}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total number of distinct phonemes in this language
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !canEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
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

export default EditLanguageModal;
