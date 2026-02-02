import React, { useState, useEffect } from 'react';
import { updateWord, getWords } from '@/services/wordService';
import { useToast } from '@/context/ToastContext';

interface Word {
  id: string;
  word: string;
  translation: string;
  part_of_speech: string;
  pronunciation?: string;
  etymology?: string;
  examples?: Array<{ phrase: string; translation: string }>;
}

interface EditWordModalProps {
  word: Word;
  languageId: string;
  isOpen: boolean;
  onClose: () => void;
  onWordUpdated: () => void;
}

const EditWordModal: React.FC<EditWordModalProps> = ({
  word,
  languageId,
  isOpen,
  onClose,
  onWordUpdated,
}) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState(word);
  const [isLoading, setIsLoading] = useState(false);
  const [examples, setExamples] = useState(word.examples || [{ phrase: '', translation: '' }]);

  useEffect(() => {
    setFormData(word);
    setExamples(word.examples || [{ phrase: '', translation: '' }]);
  }, [word]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExampleChange = (index: number, field: string, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setExamples(newExamples);
  };

  const addExample = () => {
    setExamples([...examples, { phrase: '', translation: '' }]);
  };

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.word.trim() || !formData.translation.trim()) {
      addToast('Word and translation are required', 'error');
      return;
    }

    // Validate examples: if any example is started, both fields must be filled
    const invalidExamples = examples.some(
      (ex) => (ex.phrase.trim() || ex.translation.trim()) && (!ex.phrase.trim() || !ex.translation.trim())
    );

    if (invalidExamples) {
      addToast('All example phrases must have both phrase and translation', 'error');
      return;
    }

    // Filter out empty examples
    const validExamples = examples.filter((ex) => ex.phrase.trim() && ex.translation.trim());

    setIsLoading(true);

    const result = await updateWord(word.id, {
      word: formData.word,
      translation: formData.translation,
      partOfSpeech: formData.part_of_speech,
      pronunciation: formData.pronunciation,
      etymologyNote: formData.etymology,
      examples: validExamples,
      languageId,
      userId: '',
      userEmail: '',
    });

    if (result.error) {
      console.error('Edit word error:', result.error);
      addToast(`Failed to update word: ${result.error}`, 'error');
      setIsLoading(false);
      return;
    }

    addToast(`✅ Word '${formData.word}' updated successfully!`, 'success');

    // Refresh word list
    await getWords(languageId);
    onWordUpdated();
    onClose();
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-dark rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border-dark">
        {/* Header */}
        <div className="sticky top-0 bg-surface-dark border-b border-border-dark px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Edit Word</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-text-secondary hover:text-white transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Word and Translation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Word <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.word}
                onChange={(e) => handleInputChange('word', e.target.value)}
                disabled={isLoading}
                className="w-full bg-surface-light border border-border-dark rounded px-3 py-2 text-white disabled:opacity-50"
                placeholder="Word in constructed language"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Translation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.translation}
                onChange={(e) => handleInputChange('translation', e.target.value)}
                disabled={isLoading}
                className="w-full bg-surface-light border border-border-dark rounded px-3 py-2 text-white disabled:opacity-50"
                placeholder="English translation"
              />
            </div>
          </div>

          {/* Part of Speech */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Part of Speech <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.part_of_speech}
              onChange={(e) => handleInputChange('part_of_speech', e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-light border border-border-dark rounded px-3 py-2 text-white disabled:opacity-50"
            >
              <option>noun</option>
              <option>verb</option>
              <option>adjective</option>
              <option>adverb</option>
              <option>pronoun</option>
              <option>preposition</option>
              <option>conjunction</option>
              <option>interjection</option>
              <option>article</option>
              <option>determiner</option>
              <option>numeral</option>
            </select>
          </div>

          {/* Pronunciation */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Pronunciation (IPA)</label>
            <input
              type="text"
              value={formData.pronunciation || ''}
              onChange={(e) => handleInputChange('pronunciation', e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-light border border-border-dark rounded px-3 py-2 text-white disabled:opacity-50"
              placeholder="e.g., /əˈbaʊt/"
            />
          </div>

          {/* Etymology Notes */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Etymology Notes</label>
            <textarea
              value={formData.etymology || ''}
              onChange={(e) => handleInputChange('etymology', e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-light border border-border-dark rounded px-3 py-2 text-white disabled:opacity-50 resize-none"
              rows={3}
              placeholder="Word origin and related words"
            />
          </div>

          {/* Example Phrases */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">Example Phrases</label>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={example.phrase}
                      onChange={(e) => handleExampleChange(index, 'phrase', e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-surface-light border border-border-dark rounded px-3 py-2 text-white text-sm disabled:opacity-50"
                      placeholder="Phrase"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={example.translation}
                      onChange={(e) => handleExampleChange(index, 'translation', e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-surface-light border border-border-dark rounded px-3 py-2 text-white text-sm disabled:opacity-50"
                      placeholder="Translation"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExample(index)}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-400 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addExample}
              disabled={isLoading}
              className="mt-2 px-3 py-1 bg-surface-light border border-border-dark hover:border-primary/50 text-white rounded text-sm transition-colors disabled:opacity-50"
            >
              + Add Example
            </button>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-dark">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-surface-light border border-border-dark hover:border-primary/50 text-white rounded transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <span className="material-symbols-outlined animate-spin">hourglass_empty</span>}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWordModal;
