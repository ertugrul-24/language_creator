import { useState } from 'react';
import { deleteRule } from '@/services/ruleService';
import { useToast } from '@/context/ToastContext';

interface DeleteRuleConfirmModalProps {
  ruleName: string;
  ruleId: string;
  languageId: string;
  onClose: () => void;
  onRuleDeleted: () => void;
}

const DeleteRuleConfirmModal: React.FC<DeleteRuleConfirmModalProps> = ({
  ruleName,
  ruleId,
  languageId,
  onClose,
  onRuleDeleted,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🗑️ [DeleteRuleConfirmModal] Deleting rule:', ruleId);

      const result = await deleteRule(ruleId, languageId);

      if (!result.success) {
        console.error('❌ [DeleteRuleConfirmModal] Error deleting rule:', result.error);
        setError(result.error || 'Failed to delete rule');
        showToast('Failed to delete rule: ' + result.error, 'error');
        return;
      }

      console.log('✅ [DeleteRuleConfirmModal] Rule deleted successfully');
      showToast(`✅ Grammar rule "${ruleName}" deleted successfully!`, 'success');
      onRuleDeleted();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete rule';
      console.error('❌ [DeleteRuleConfirmModal] Exception:', message);
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">Delete Grammar Rule</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Confirmation Message */}
          <div className="mb-6">
            <p className="text-slate-300 text-base mb-2">
              Are you sure you want to delete the grammar rule:
            </p>
            <p className="text-lg font-bold text-slate-100 p-3 bg-slate-700 rounded border border-slate-600">
              "{ruleName}"
            </p>
            <p className="text-slate-400 text-sm mt-3">
              This action cannot be undone. The rule will be permanently deleted.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-100 rounded-lg hover:bg-slate-600 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Delete Rule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteRuleConfirmModal;
