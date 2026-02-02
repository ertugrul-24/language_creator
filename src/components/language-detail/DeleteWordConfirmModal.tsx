import React, { useState } from 'react';
import { deleteWord } from '@/services/wordService';
import { useToast } from '@/context/ToastContext';

interface DeleteWordConfirmModalProps {
  word: {
    id: string;
    word: string;
  };
  languageId: string;
  isOpen: boolean;
  onClose: () => void;
  onWordDeleted: () => void;
}

const DeleteWordConfirmModal: React.FC<DeleteWordConfirmModalProps> = ({
  word,
  languageId,
  isOpen,
  onClose,
  onWordDeleted,
}) => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    console.log('🗑️ [DeleteWordConfirmModal] Deleting word:', word.id, 'from language:', languageId);

    const result = await deleteWord(word.id, languageId);

    if (result.error) {
      console.error('Delete word error:', result.error);
      setError(result.error);
      addToast(`Failed to delete word: ${result.error}`, 'error');
      setIsLoading(false);
      return;
    }

    addToast(`✅ Word '${word.word}' deleted successfully!`, 'success');
    onWordDeleted();
    onClose();
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-dark rounded-lg w-full max-w-sm border border-border-dark">
        {/* Header */}
        <div className="border-b border-border-dark px-6 py-4">
          <h2 className="text-lg font-bold text-white">Delete Word</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded px-4 py-3 text-red-300 mb-4">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          <p className="text-text-secondary mb-2">Are you sure you want to delete this word?</p>
          <p className="text-white font-semibold text-lg">{word.word}</p>
          <p className="text-text-secondary text-sm mt-2">This action cannot be undone.</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border-dark">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-surface-light border border-border-dark hover:border-primary/50 text-white rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <span className="material-symbols-outlined animate-spin">hourglass_empty</span>}
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteWordConfirmModal;
