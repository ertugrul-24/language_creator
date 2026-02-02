import { useState, useRef } from 'react';
import { addWord } from '@/services/wordService';
import { useAuth } from '@/context/AuthContext';
import type { Language } from '@/types/database';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onWordAdded: () => void;
}

interface ExamplePhrase {
  id: string;
  phrase: string;
  translation: string;
}

interface FormData {
  word: string;
  translation: string;
  partOfSpeech: string;
  pronunciation: string;
  etymologyNote: string;
  examplePhrases: ExamplePhrase[];
}

interface FormErrors {
  word?: string;
  translation?: string;
  partOfSpeech?: string;
  pronunciation?: string;
  examplePhrases?: string;
}

// Common parts of speech
const PARTS_OF_SPEECH = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'interjection',
  'determiner',
  'particle',
  'other',
];

// Simple IPA validation - checks for common IPA characters
const isValidIPA = (text: string): boolean => {
  if (!text) return true; // Optional field
  // Allow common IPA characters, spaces, and brackets
  const ipaRegex = /^[\p{L}\s\[\]\/ˈˌːʰ\-,.:()]*$/u;
  return ipaRegex.test(text);
};

const AddWordModal: React.FC<AddWordModalProps> = ({
  isOpen,
  onClose,
  language,
  onWordAdded,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    word: '',
    translation: '',
    partOfSpeech: '',
    pronunciation: '',
    etymologyNote: '',
    examplePhrases: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [nextExampleId, setNextExampleId] = useState(1);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.word.trim()) {
      newErrors.word = 'Word is required';
    }

    if (!formData.translation.trim()) {
      newErrors.translation = 'Translation is required';
    }

    if (!formData.partOfSpeech) {
      newErrors.partOfSpeech = 'Part of speech is required';
    }

    if (formData.pronunciation && !isValidIPA(formData.pronunciation)) {
      newErrors.pronunciation =
        'Invalid IPA format. Use standard IPA characters and brackets.';
    }

    // Validate example phrases
    if (formData.examplePhrases.length > 0) {
      const invalidExamples = formData.examplePhrases.filter(
        (ex) => !ex.phrase.trim() || !ex.translation.trim()
      );
      if (invalidExamples.length > 0) {
        newErrors.examplePhrases =
          'All example phrases must have both phrase and translation';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      console.log('Form validation failed or user not found');
      return;
    }

    setLoading(true);
    setSuccessMessage(null);

    try {
      const result = await addWord({
        languageId: language.id,
        word: formData.word.trim(),
        translation: formData.translation.trim(),
        partOfSpeech: formData.partOfSpeech,
        pronunciation: formData.pronunciation.trim() || undefined,
        etymologyNote: formData.etymologyNote.trim() || undefined,
        examples: formData.examplePhrases.map((ex) => ({
          phrase: ex.phrase.trim(),
          translation: ex.translation.trim(),
        })),
        userId: user.id,
        userEmail: user.email || 'unknown',
      });

      if (result.success) {
        setSuccessMessage(`✅ Word "${formData.word}" added successfully!`);
        console.log('✅ [AddWordModal] Word added:', result.wordId);

        // Reset form
        setFormData({
          word: '',
          translation: '',
          partOfSpeech: '',
          pronunciation: '',
          etymologyNote: '',
          examplePhrases: [],
        });
        setAudioFile(null);
        setAudioPreview(null);
        setNextExampleId(1);

        // Call parent callback to refresh word list
        setTimeout(() => {
          onWordAdded();
          onClose();
        }, 1500);
      } else {
        setErrors({ word: result.error || 'Failed to add word' });
        console.error('❌ [AddWordModal] Error adding word:', result.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setErrors({ word: message });
      console.error('❌ [AddWordModal] Exception:', message);
    } finally {
      setLoading(false);
    }
  };

  // Handle audio file selection
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        const preview = URL.createObjectURL(file);
        setAudioPreview(preview);
        console.log('📁 Audio file selected:', file.name);
      } else {
        setErrors((prev) => ({ ...prev, word: 'Please select a valid audio file' }));
      }
    }
  };

  // Add example phrase
  const addExamplePhrase = () => {
    setFormData((prev) => ({
      ...prev,
      examplePhrases: [
        ...prev.examplePhrases,
        { id: `example-${nextExampleId}`, phrase: '', translation: '' },
      ],
    }));
    setNextExampleId((prev) => prev + 1);
  };

  // Remove example phrase
  const removeExamplePhrase = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      examplePhrases: prev.examplePhrases.filter((ex) => ex.id !== id),
    }));
  };

  // Update example phrase
  const updateExamplePhrase = (
    id: string,
    field: 'phrase' | 'translation',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      examplePhrases: prev.examplePhrases.map((ex) =>
        ex.id === id ? { ...ex, [field]: value } : ex
      ),
    }));
  };

  // Close modal and reset
  const handleClose = () => {
    if (successMessage) {
      return;
    }
    setFormData({
      word: '',
      translation: '',
      partOfSpeech: '',
      pronunciation: '',
      etymologyNote: '',
      examplePhrases: [],
    });
    setErrors({});
    setAudioFile(null);
    setAudioPreview(null);
    setNextExampleId(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">
            Add Word to {language.name}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-200 text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mx-6 mt-4 p-4 bg-green-900 border border-green-700 rounded-lg text-green-100">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Word (in constructed language) */}
          <div>
            <label htmlFor="word" className="block text-sm font-medium text-slate-300 mb-1">
              Word <span className="text-red-500">*</span>
            </label>
            <input
              id="word"
              type="text"
              placeholder="Enter word in constructed language"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              disabled={loading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            {errors.word && <p className="text-red-400 text-sm mt-1">{errors.word}</p>}
          </div>

          {/* Translation (English) */}
          <div>
            <label htmlFor="translation" className="block text-sm font-medium text-slate-300 mb-1">
              Translation (English) <span className="text-red-500">*</span>
            </label>
            <input
              id="translation"
              type="text"
              placeholder="Enter English translation"
              value={formData.translation}
              onChange={(e) =>
                setFormData({ ...formData, translation: e.target.value })
              }
              disabled={loading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            {errors.translation && (
              <p className="text-red-400 text-sm mt-1">{errors.translation}</p>
            )}
          </div>

          {/* Part of Speech */}
          <div>
            <label htmlFor="pos" className="block text-sm font-medium text-slate-300 mb-1">
              Part of Speech <span className="text-red-500">*</span>
            </label>
            <select
              id="pos"
              value={formData.partOfSpeech}
              onChange={(e) =>
                setFormData({ ...formData, partOfSpeech: e.target.value })
              }
              disabled={loading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select a part of speech</option>
              {PARTS_OF_SPEECH.map((pos) => (
                <option key={pos} value={pos}>
                  {pos.charAt(0).toUpperCase() + pos.slice(1)}
                </option>
              ))}
            </select>
            {errors.partOfSpeech && (
              <p className="text-red-400 text-sm mt-1">{errors.partOfSpeech}</p>
            )}
          </div>

          {/* Pronunciation (IPA) */}
          <div>
            <label htmlFor="pronunciation" className="block text-sm font-medium text-slate-300 mb-1">
              Pronunciation (IPA) <span className="text-slate-500 text-xs">(optional)</span>
            </label>
            <input
              id="pronunciation"
              type="text"
              placeholder="e.g., /ˈwɔrdɪ/ or [wɝd]"
              value={formData.pronunciation}
              onChange={(e) =>
                setFormData({ ...formData, pronunciation: e.target.value })
              }
              disabled={loading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            {errors.pronunciation && (
              <p className="text-red-400 text-sm mt-1">{errors.pronunciation}</p>
            )}
            <p className="text-slate-500 text-xs mt-1">
              Use IPA notation: forward slashes for phonemic //, square brackets for phonetic []
            </p>
          </div>

          {/* Audio Upload */}
          <div>
            <label htmlFor="audio" className="block text-sm font-medium text-slate-300 mb-1">
              Audio File <span className="text-slate-500 text-xs">(optional)</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-100 text-sm font-medium disabled:opacity-50 transition"
              >
                Choose Audio File
              </button>
              {audioFile && <span className="text-slate-400 py-2 text-sm">{audioFile.name}</span>}
            </div>
            <input
              ref={fileInputRef}
              id="audio"
              type="file"
              accept="audio/*"
              onChange={handleAudioFileChange}
              disabled={loading}
              className="hidden"
            />
            {audioPreview && (
              <div className="mt-2">
                <audio controls className="w-full h-8">
                  <source src={audioPreview} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>

          {/* Etymology Notes */}
          <div>
            <label htmlFor="etymology" className="block text-sm font-medium text-slate-300 mb-1">
              Etymology Notes <span className="text-slate-500 text-xs">(optional)</span>
            </label>
            <textarea
              id="etymology"
              placeholder="Enter notes about the word origin, derivation, or interesting facts"
              value={formData.etymologyNote}
              onChange={(e) =>
                setFormData({ ...formData, etymologyNote: e.target.value })
              }
              disabled={loading}
              rows={2}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Example Phrases */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Example Phrases <span className="text-slate-500 text-xs">(optional)</span>
              </label>
              <button
                type="button"
                onClick={addExamplePhrase}
                disabled={loading}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium disabled:opacity-50"
              >
                + Add Example
              </button>
            </div>

            {formData.examplePhrases.length > 0 && (
              <div className="space-y-3 mb-3">
                {formData.examplePhrases.map((example) => (
                  <div
                    key={example.id}
                    className="p-3 bg-slate-700 border border-slate-600 rounded-lg space-y-2"
                  >
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Phrase in constructed language"
                          value={example.phrase}
                          onChange={(e) =>
                            updateExamplePhrase(example.id, 'phrase', e.target.value)
                          }
                          disabled={loading}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExamplePhrase(example.id)}
                        disabled={loading}
                        className="text-red-400 hover:text-red-300 px-3 py-2 text-sm font-medium disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="English translation"
                      value={example.translation}
                      onChange={(e) =>
                        updateExamplePhrase(example.id, 'translation', e.target.value)
                      }
                      disabled={loading}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                ))}
              </div>
            )}

            {errors.examplePhrases && (
              <p className="text-red-400 text-sm mt-1">{errors.examplePhrases}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              type="submit"
              disabled={loading || !!successMessage}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Word'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg disabled:opacity-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWordModal;
