import type { LanguageSpecs } from '@/components/LanguageSpecsForm';

export interface SpecsValidationErrors extends Record<string, string | undefined> {
  alphabetScript?: string;
  writingDirection?: string;
  phonemeSet?: string;
  depthLevel?: string;
  wordOrder?: string;
  customSpecs?: string;
}

/**
 * Validate language specifications
 */
export const validateLanguageSpecs = (specs: Partial<LanguageSpecs>): SpecsValidationErrors => {
  const errors: SpecsValidationErrors = {};

  // Validate alphabetScript
  if (!specs.alphabetScript || specs.alphabetScript.trim().length === 0) {
    errors.alphabetScript = 'Alphabet/Script is required';
  }

  // Validate writingDirection
  if (!specs.writingDirection) {
    errors.writingDirection = 'Writing direction is required';
  } else if (!['ltr', 'rtl', 'boustrophedon'].includes(specs.writingDirection)) {
    errors.writingDirection = 'Invalid writing direction';
  }

  // Validate phonemeSet
  if (!specs.phonemeSet || specs.phonemeSet.length === 0) {
    errors.phonemeSet = 'At least one phoneme is required';
  } else if (specs.phonemeSet.length < 5) {
    errors.phonemeSet = `At least 5 phonemes are recommended (you have ${specs.phonemeSet.length})`;
  } else {
    // Check for empty symbols or IPA
    const invalidPhonemes = specs.phonemeSet.some(
      (p) => !p.symbol?.trim() || !p.ipa?.trim()
    );
    if (invalidPhonemes) {
      errors.phonemeSet = 'All phonemes must have a symbol and IPA notation';
    }
  }

  // Validate wordOrder
  if (!specs.wordOrder || specs.wordOrder.trim().length === 0) {
    errors.wordOrder = 'Word order is required';
  } else if (!['SVO', 'SOV', 'VSO', 'VOS', 'OSV', 'OVS'].includes(specs.wordOrder)) {
    errors.wordOrder = 'Invalid word order';
  }

  // Validate depthLevel
  if (!specs.depthLevel) {
    errors.depthLevel = 'Depth level is required';
  } else if (!['realistic', 'simplified'].includes(specs.depthLevel)) {
    errors.depthLevel = 'Invalid depth level';
  }

  return errors;
};

/**
 * Check if specs are valid (no errors)
 */
export const areSpecsValid = (specs: Partial<LanguageSpecs>): boolean => {
  const errors = validateLanguageSpecs(specs);
  return Object.keys(errors).length === 0;
};
