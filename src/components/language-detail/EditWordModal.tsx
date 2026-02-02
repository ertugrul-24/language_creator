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
  const [displayError, setDisplayError] = useState<string | null>(null);

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
    setDisplayError(null);

    // Validation
    if (!formData.word.trim() || !formData.translation.trim()) {
      const error = 'Word and translation are required';
      setDisplayError(error);
      addToast(error, 'error');
      return;
    }

    // Validate examples: if any example is started, both fields must be filled
    const invalidExamples = examples.some(
      (ex) => (ex.phrase.trim() || ex.translation.trim()) && (!ex.phrase.trim() || !ex.translation.trim())
    );

    if (invalidExamples) {
      const error = 'All example phrases must have both phrase and translation';
      setDisplayError(error);
      addToast(error, 'error');
      return;
    }

    // Filter out empty examples
    const validExamples = examples.filter((ex) => ex.phrase.trim() && ex.translation.trim());

    setIsLoading(true);
    console.log('Form submission started for word:', word.id);

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

    console.log('Update result:', result);

    if (result.error) {
      console.error('Update failed:', result.error);
      setDisplayError(result.error);
      addToast(`Failed to update word: ${result.error}`, 'error');
      setIsLoading(false);
      return;
    }

    console.log('Update successful!');
    addToast(`✅ Word '${formData.word}' updated successfully!`, 'success');

    // Refresh word list
    console.log('Refreshing word list...');
    await getWords(languageId);
    onWordUpdated();
    onClose();
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">Edit Word</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-200 text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Alert */}
          {displayError && (
            <div className="bg-red-500/20 border border-red-500 rounded px-4 py-3 text-red-300 mb-4">
              <p className="text-sm font-medium">{displayError}</p>
            </div>
          )}

          {/* Word and Translation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Word <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.word}
                onChange={(e) => handleInputChange('word', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Word in constructed language"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Translation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.translation}
                onChange={(e) => handleInputChange('translation', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="English translation"
              />
            </div>
          </div>

          {/* Part of Speech */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Part of Speech <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.part_of_speech}
              onChange={(e) => handleInputChange('part_of_speech', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
            <label className="block text-sm font-medium text-slate-300 mb-1">Pronunciation (IPA)</label>
            <input
              type="text"
              value={formData.pronunciation || ''}
              onChange={(e) => handleInputChange('pronunciation', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="e.g., /əˈbaʊt/"
            />
          </div>

          {/* Etymology Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Etymology Notes</label>
            <textarea
              value={formData.etymology || ''}
              onChange={(e) => handleInputChange('etymology', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
              rows={3}
              placeholder="Word origin and related words"
            />
          </div>

          {/* Example Phrases */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Example Phrases</label>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={example.phrase}
                      onChange={(e) => handleExampleChange(index, 'phrase', e.target.value)}
                      disabled={isLoading}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      placeholder="Phrase"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={example.translation}
                      onChange={(e) => handleExampleChange(index, 'translation', e.target.value)}
                      disabled={isLoading}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
              className="mt-2 px-3 py-1 bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-100 rounded text-sm transition-colors disabled:opacity-50"
            >
              + Add Example
            </button>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
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
