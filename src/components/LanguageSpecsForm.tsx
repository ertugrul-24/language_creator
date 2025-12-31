import React, { useState } from 'react';
import { DepthLevelWarningModal } from './DepthLevelWarningModal';
import { PhonemeSetInput } from './PhonemeSetInput';

export interface LanguageSpecs {
  alphabetScript: string;
  writingDirection: 'ltr' | 'rtl' | 'boustrophedon';
  phonemeSet: Array<{
    symbol: string;
    ipa: string;
    audioUrl?: string;
  }>;
  depthLevel: 'realistic' | 'simplified';
  wordOrder: string;
  caseSensitive: boolean;
  customSpecs: Record<string, string>;
}

export interface LanguageSpecsFormProps {
  data: Partial<LanguageSpecs>;
  onChange: (specs: Partial<LanguageSpecs>) => void;
  errors?: Record<string, string>;
}

const ALPHABET_SCRIPTS = ['Latin', 'Cyrillic', 'Greek', 'Arabic', 'Hebrew', 'Devanagari', 'Custom'];
const WRITING_DIRECTIONS = [
  { value: 'ltr', label: 'Left to Right (LTR)' },
  { value: 'rtl', label: 'Right to Left (RTL)' },
  { value: 'boustrophedon', label: 'Boustrophedon (Zigzag)' },
];
const WORD_ORDERS = ['SVO', 'SOV', 'VSO', 'VOS', 'OSV', 'OVS'];

/**
 * LanguageSpecsForm - Comprehensive language specification form
 * Handles all language specs including alphabet, writing direction, phonemes, etc.
 */
export const LanguageSpecsForm: React.FC<LanguageSpecsFormProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const [showDepthWarning, setShowDepthWarning] = useState(false);
  const [pendingDepthLevel, setPendingDepthLevel] = useState<'realistic' | 'simplified' | null>(
    null
  );

  const handleDepthLevelChange = (newLevel: 'realistic' | 'simplified') => {
    if (newLevel === 'simplified' && data.depthLevel !== 'simplified') {
      // Show warning when switching to simplified
      setPendingDepthLevel(newLevel);
      setShowDepthWarning(true);
    } else {
      onChange({ ...data, depthLevel: newLevel });
    }
  };

  const handleConfirmDepthLevel = () => {
    if (pendingDepthLevel) {
      onChange({ ...data, depthLevel: pendingDepthLevel });
    }
    setShowDepthWarning(false);
    setPendingDepthLevel(null);
  };

  const handleCustomSpecChange = (key: string, value: string) => {
    const customSpecs = { ...data.customSpecs };
    if (value.trim()) {
      customSpecs[key] = value;
    } else {
      delete customSpecs[key];
    }
    onChange({ ...data, customSpecs });
  };

  const handleAddCustomSpec = () => {
    const newKey = `custom_${Date.now()}`;
    const customSpecs = { ...data.customSpecs, [newKey]: '' };
    onChange({ ...data, customSpecs });
  };

  const handleDeleteCustomSpec = (key: string) => {
    const customSpecs = { ...data.customSpecs };
    delete customSpecs[key];
    onChange({ ...data, customSpecs });
  };

  return (
    <div className="space-y-6">
      {/* Alphabet / Script */}
      <div>
        <label htmlFor="alphabetScript" className="block text-sm font-medium text-text-primary mb-2">
          Alphabet / Script <span className="text-red-400">*</span>
        </label>
        <select
          id="alphabetScript"
          value={data.alphabetScript || ''}
          onChange={(e) => onChange({ ...data, alphabetScript: e.target.value })}
          className={`w-full px-4 py-2 bg-background-dark border rounded-lg text-white focus:outline-none focus:ring-2 transition ${
            errors.alphabetScript ? 'border-red-500 focus:ring-red-500' : 'border-border-dark focus:ring-blue-500'
          }`}
        >
          <option value="">Select a script</option>
          {ALPHABET_SCRIPTS.map((script) => (
            <option key={script} value={script}>
              {script}
            </option>
          ))}
        </select>
        {errors.alphabetScript && <p className="text-sm text-red-400 mt-1">{errors.alphabetScript}</p>}
        <p className="text-xs text-text-secondary mt-1">Choose the writing system for your language</p>
      </div>

      {/* Writing Direction */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Writing Direction <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {WRITING_DIRECTIONS.map((direction) => (
            <button
              key={direction.value}
              type="button"
              onClick={() => onChange({ ...data, writingDirection: direction.value as any })}
              className={`p-4 rounded-lg border-2 transition text-center ${
                data.writingDirection === direction.value
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-border-dark text-text-secondary hover:border-text-secondary'
              }`}
            >
              <div className="font-medium">{direction.label}</div>
              <div className="text-xs mt-1 opacity-75">
                {direction.value === 'ltr' && '← Read this way →'}
                {direction.value === 'rtl' && '← Read this way (reversed)'}
                {direction.value === 'boustrophedon' && 'Lines alternate direction'}
              </div>
            </button>
          ))}
        </div>
        {errors.writingDirection && <p className="text-sm text-red-400 mt-1">{errors.writingDirection}</p>}
      </div>

      {/* Phoneme Set */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Phoneme Set <span className="text-red-400">*</span>
        </label>
        <PhonemeSetInput
          phonemes={data.phonemeSet || []}
          onChange={(phonemes) => onChange({ ...data, phonemeSet: phonemes })}
          error={errors.phonemeSet}
        />
      </div>

      {/* Word Order */}
      <div>
        <label htmlFor="wordOrder" className="block text-sm font-medium text-text-primary mb-2">
          Word Order <span className="text-red-400">*</span>
        </label>
        <select
          id="wordOrder"
          value={data.wordOrder || ''}
          onChange={(e) => onChange({ ...data, wordOrder: e.target.value })}
          className={`w-full px-4 py-2 bg-background-dark border rounded-lg text-white focus:outline-none focus:ring-2 transition ${
            errors.wordOrder ? 'border-red-500 focus:ring-red-500' : 'border-border-dark focus:ring-blue-500'
          }`}
        >
          <option value="">Select a word order</option>
          {WORD_ORDERS.map((order) => (
            <option key={order} value={order}>
              {order}
            </option>
          ))}
        </select>
        {errors.wordOrder && <p className="text-sm text-red-400 mt-1">{errors.wordOrder}</p>}
        <p className="text-xs text-text-secondary mt-1">
          Define basic sentence structure (S=Subject, V=Verb, O=Object)
        </p>
      </div>

      {/* Depth Level */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Language Depth Level <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(['realistic', 'simplified'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleDepthLevelChange(level)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                data.depthLevel === level
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-border-dark hover:border-text-secondary'
              }`}
            >
              <div className="font-medium text-white">
                {level === 'realistic' ? '🔬 Realistic' : '📖 Simplified'}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {level === 'realistic'
                  ? 'Complex grammar rules, naturalistic phonology'
                  : 'Streamlined rules for learning'}
              </div>
            </button>
          ))}
        </div>
        {errors.depthLevel && <p className="text-sm text-red-400 mt-1">{errors.depthLevel}</p>}
      </div>

      {/* Case Sensitivity */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Case Sensitivity
        </label>
        <button
          type="button"
          onClick={() => onChange({ ...data, caseSensitive: !data.caseSensitive })}
          className={`w-full px-4 py-3 rounded-lg border-2 transition text-left flex items-center justify-between ${
            data.caseSensitive
              ? 'border-blue-500 bg-blue-500/20'
              : 'border-border-dark hover:border-text-secondary'
          }`}
        >
          <div>
            <div className="font-medium text-white">
              {data.caseSensitive ? '✓ Case Sensitive' : '○ Case Insensitive'}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              {data.caseSensitive ? 'A and a are different letters' : 'A and a are the same letter'}
            </div>
          </div>
          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
            data.caseSensitive ? 'bg-blue-500 border-blue-500' : 'border-border-dark'
          }`}>
            {data.caseSensitive && <span className="text-white text-sm">✓</span>}
          </div>
        </button>
        <p className="text-xs text-text-secondary mt-2">
          Whether capital and lowercase letters are treated differently
        </p>
      </div>

      {/* Custom Specs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-text-primary">
            Custom Specifications
          </label>
          <button
            type="button"
            onClick={handleAddCustomSpec}
            className="flex items-center gap-1 text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Custom
          </button>
        </div>
        <p className="text-xs text-text-secondary mb-3">
          Add any additional language specifications (e.g., "Tones: 4", "Script Origin: Inspired by Elvish")
        </p>

        <div className="space-y-2">
          {Object.entries(data.customSpecs || {}).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const newKey = e.target.value;
                  const customSpecs = { ...data.customSpecs };
                  if (newKey !== key) {
                    customSpecs[newKey] = customSpecs[key];
                    delete customSpecs[key];
                  }
                  onChange({ ...data, customSpecs });
                }}
                placeholder="Specification name"
                className="flex-1 px-3 py-2 bg-background-dark border border-border-dark rounded text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleCustomSpecChange(key, e.target.value)}
                placeholder="Value"
                className="flex-1 px-3 py-2 bg-background-dark border border-border-dark rounded text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={() => handleDeleteCustomSpec(key)}
                className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-700 rounded text-red-400 transition"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Depth Level Warning Modal */}
      <DepthLevelWarningModal
        isOpen={showDepthWarning}
        onConfirm={handleConfirmDepthLevel}
        onCancel={() => {
          setShowDepthWarning(false);
          setPendingDepthLevel(null);
        }}
      />
    </div>
  );
};
