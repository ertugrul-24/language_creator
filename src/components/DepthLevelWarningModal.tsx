import React from 'react';

export interface DepthLevelWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * DepthLevelWarningModal - Warns users when switching to simplified language depth
 * Explains the implications of using simplified grammar rules
 */
export const DepthLevelWarningModal: React.FC<DepthLevelWarningModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-dark border border-amber-500/50 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-6 py-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-400 text-5xl mt-1">warning</span>
          <div>
            <h3 className="text-lg font-bold text-amber-300">Simplified Language Warning</h3>
            <p className="text-sm text-amber-200/80 mt-1">
              This will enable simplified grammar and phonology
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-text-secondary">
            Switching to <span className="font-semibold text-white">Simplified</span> mode means:
          </p>

          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-amber-400 text-sm mt-0.5 flex-shrink-0">
                info
              </span>
              <span>Grammar rules will be streamlined for learners</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-amber-400 text-sm mt-0.5 flex-shrink-0">
                info
              </span>
              <span>Phonology may not follow natural language patterns</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-amber-400 text-sm mt-0.5 flex-shrink-0">
                info
              </span>
              <span>Designed for educational purposes, not linguistic accuracy</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-amber-400 text-sm mt-0.5 flex-shrink-0">
                info
              </span>
              <span>You can still switch back to Realistic mode later</span>
            </li>
          </ul>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 mt-4">
            <p className="text-xs text-amber-200">
              <span className="font-semibold">Perfect for:</span> Teaching languages to beginners, creating
              auxiliary languages, or learning language design principles.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-border-dark px-6 py-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-surface-dark border border-border-dark text-text-primary hover:text-white rounded-lg transition font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition font-medium text-sm"
          >
            Continue to Simplified
          </button>
        </div>
      </div>
    </div>
  );
};
