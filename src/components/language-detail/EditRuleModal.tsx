import { useState, useEffect } from 'react';
import type { Language } from '@/types/database';
import { updateRule } from '@/services/ruleService';
import { useToast } from '@/context/ToastContext';

interface GrammarRule {
  id: string;
  name: string;
  description: string;
  category: string;
  rule_type: string;
  pattern?: string;
  examples?: Array<{ input: string; output: string; explanation?: string }>;
}

interface EditRuleModalProps {
  rule: GrammarRule;
  language: Language;
  onClose: () => void;
  onRuleUpdated: () => void;
}

interface FormData {
  name: string;
  description: string;
  category: 'morphology' | 'phonology' | 'syntax' | 'pragmatics';
  rule_type: 'phoneme_rule' | 'inflection' | 'word_order' | 'agreement';
  pattern: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
}

const EditRuleModal: React.FC<EditRuleModalProps> = ({ rule, language, onClose, onRuleUpdated }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: rule.name,
    description: rule.description,
    category: (rule.category as FormData['category']) || 'morphology',
    rule_type: (rule.rule_type as FormData['rule_type']) || 'inflection',
    pattern: rule.pattern || '',
    examples: rule.examples || [{ input: '', output: '', explanation: '' }],
  });

  const handleExampleChange = (
    index: number,
    field: 'input' | 'output' | 'explanation',
    value: string
  ) => {
    const newExamples = [...formData.examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setFormData({ ...formData, examples: newExamples });
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: '', output: '', explanation: '' }],
    });
  };

  const removeExample = (index: number) => {
    const newExamples = formData.examples.filter((_, i) => i !== index);
    setFormData({ ...formData, examples: newExamples });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Rule name is required');
      return;
    }

    if (!formData.category) {
      setError('Category is required');
      return;
    }

    if (formData.examples.some((ex) => !ex.input.trim() || !ex.output.trim())) {
      setError('All examples must have input and output');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📝 [EditRuleModal] Updating rule:', {
        ruleId: rule.id,
        name: formData.name,
        category: formData.category,
      });

      const result = await updateRule(rule.id, {
        languageId: language.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        ruleType: formData.rule_type,
        pattern: formData.pattern.trim(),
        examples: formData.examples.filter((ex) => ex.input.trim() && ex.output.trim()),
        userId: '', // Will be fetched by service
        userEmail: '', // Will be fetched by service
      });

      if (!result.success) {
        console.error('❌ [EditRuleModal] Error updating rule:', result.error);
        setError(result.error || 'Failed to update rule');
        showToast('Failed to update rule: ' + result.error, 'error');
        return;
      }

      console.log('✅ [EditRuleModal] Rule updated successfully');
      showToast(`✅ Grammar rule "${formData.name}" updated successfully!`, 'success');
      onRuleUpdated();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update rule';
      console.error('❌ [EditRuleModal] Exception:', message);
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-100">Edit Grammar Rule</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Rule Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Rule Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Plural Formation, Subject-Verb Agreement"
              className="w-full px-4 py-2 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain how this rule works..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>

          {/* Category & Rule Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as FormData['category'],
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="morphology">🏗️ Morphology</option>
                <option value="phonology">🔤 Phonology</option>
                <option value="syntax">📐 Syntax</option>
                <option value="pragmatics">💬 Pragmatics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Rule Type
              </label>
              <select
                value={formData.rule_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rule_type: e.target.value as FormData['rule_type'],
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="phoneme_rule">Phoneme Rule</option>
                <option value="inflection">Inflection</option>
                <option value="word_order">Word Order</option>
                <option value="agreement">Agreement</option>
              </select>
            </div>
          </div>

          {/* Pattern */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Pattern (e.g., regex or description)
            </label>
            <input
              type="text"
              value={formData.pattern}
              onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
              placeholder="e.g., /^[a-z]+s$/, SVOPattern"
              className="w-full px-4 py-2 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>

          {/* Examples */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-slate-200">
                Examples <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={addExample}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                + Add Example
              </button>
            </div>

            <div className="space-y-3">
              {formData.examples.map((example, index) => (
                <div key={index} className="p-4 bg-slate-700 border border-slate-600 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm text-slate-300 font-medium">Example {index + 1}</p>
                    {formData.examples.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExample(index)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={example.input}
                      onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                      placeholder="Input form"
                      className="w-full px-3 py-2 bg-slate-600 text-slate-100 border border-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">→</span>
                      <input
                        type="text"
                        value={example.output}
                        onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                        placeholder="Output form"
                        className="flex-1 px-3 py-2 bg-slate-600 text-slate-100 border border-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      value={example.explanation || ''}
                      onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                      placeholder="Explanation (optional)"
                      className="w-full px-3 py-2 bg-slate-600 text-slate-100 border border-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-100 rounded-lg hover:bg-slate-600 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRuleModal;
