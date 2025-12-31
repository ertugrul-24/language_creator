import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { createLanguage } from '@/services/languageService';
import { PageShell, LanguageSpecsForm } from '@/components';
import { validateLanguageSpecs } from '@/utils/specsValidation';
import type { LanguageSpecs } from '@/components/LanguageSpecsForm';

interface FormData {
  name: string;
  description: string;
  icon: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  icon?: string;
}

interface SpecsErrors extends Record<string, string | undefined> {
  alphabetScript?: string;
  writingDirection?: string;
  phonemeSet?: string;
  depthLevel?: string;
  wordOrder?: string;
  customSpecs?: string;
}

/**
 * NewLanguagePage - Create a new constructed language
 * Handles form submission and validation
 */
export const NewLanguagePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    icon: '🌍',
  });

  const [specs, setSpecs] = useState<Partial<LanguageSpecs>>({
    alphabetScript: '',
    writingDirection: 'ltr',
    phonemeSet: [],
    depthLevel: 'realistic',
    wordOrder: 'SVO',
    caseSensitive: false,
    customSpecs: {},
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [specsErrors, setSpecsErrors] = useState<SpecsErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'basic' | 'specs'>('basic');

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Language name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Language name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Language name must be less than 50 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!formData.icon.trim()) {
      newErrors.icon = 'Icon is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate specs
  const validateSpecs = (): boolean => {
    const newErrors = validateLanguageSpecs(specs);
    setSpecsErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  // Handle emoji picker (simple version)
  const emojis = ['🌍', '🗣️', '📚', '✨', '🎭', '🌟', '💬', '🔤', '🧩', '🎨'];
  const handleEmojiSelect = (emoji: string) => {
    setFormData((prev) => ({
      ...prev,
      icon: emoji,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate both sections
    const basicValid = validateForm();
    const specsValid = validateSpecs();

    if (!basicValid || !specsValid) {
      // Show specs tab if specs has errors
      if (!specsValid) {
        setActiveSection('specs');
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('[handleSubmit] User authenticated:', user.id);

      console.log('[handleSubmit] Calling createLanguage...');
      // Create language with specs
      const newLanguage = await createLanguage(user.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
      }, specs);

      console.log('[handleSubmit] Language created successfully:', newLanguage.id);
      // Navigate to the language detail page
      navigate(`/languages/${newLanguage.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create language';
      console.error('[handleSubmit] Error:', message);
      console.error('[handleSubmit] Full error:', err);
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell title="Create Language">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/languages')}
            className="flex items-center gap-2 text-text-secondary hover:text-white mb-4 transition"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Languages
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Create New Language</h1>
          <p className="text-text-secondary">Design your constructed language with specifications</p>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border-dark">
          <button
            onClick={() => setActiveSection('basic')}
            className={`px-4 py-3 font-medium transition border-b-2 ${
              activeSection === 'basic'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-text-secondary hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>
              Basic Info
            </span>
          </button>
          <button
            onClick={() => setActiveSection('specs')}
            className={`px-4 py-3 font-medium transition border-b-2 ${
              activeSection === 'specs'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-text-secondary hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">settings</span>
              Language Specs
            </span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-surface-dark rounded-lg border border-border-dark p-8 space-y-6 mb-8">
          {/* Error Alert */}
          {submitError && (
            <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm mt-1">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Info Section */}
          {activeSection === 'basic' && (
            <div className="space-y-6">
              {/* Language Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                  Language Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Elvish, Klingon, Esperanto"
                  maxLength={50}
                  className={`w-full px-4 py-2 bg-background-dark border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 transition ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-border-dark focus:ring-blue-500'
                  }`}
                />
                {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name}</p>}
                <p className="text-xs text-text-secondary mt-1">{formData.name.length}/50 characters</p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your language (10-500 characters)"
                  maxLength={500}
                  rows={4}
                  className={`w-full px-4 py-2 bg-background-dark border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 transition resize-none ${
                    errors.description ? 'border-red-500 focus:ring-red-500' : 'border-border-dark focus:ring-blue-500'
                  }`}
                />
                {errors.description && <p className="text-sm text-red-400 mt-1">{errors.description}</p>}
                <p className="text-xs text-text-secondary mt-1">{formData.description.length}/500 characters</p>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Language Icon <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{formData.icon}</div>
                  <div className="text-sm text-text-secondary">
                    Current selection: {formData.icon}
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className={`text-3xl p-3 rounded-lg border-2 transition ${
                        formData.icon === emoji
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-border-dark hover:border-text-secondary'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Specs Section */}
          {activeSection === 'specs' && (
            <LanguageSpecsForm data={specs} onChange={setSpecs} errors={Object.fromEntries(
              Object.entries(specsErrors).filter(([, v]) => v !== undefined)
            ) as Record<string, string>} />
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-border-dark">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              {isSubmitting && <span className="material-symbols-outlined animate-spin">hourglass_empty</span>}
              {isSubmitting ? 'Creating...' : 'Create Language'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/languages')}
              className="flex-1 px-6 py-3 bg-surface-dark hover:bg-background-dark text-text-primary font-medium rounded-lg border border-border-dark transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};
