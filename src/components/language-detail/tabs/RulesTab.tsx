import { useEffect, useState } from 'react';
import type { Language } from '@/types/database';
import { supabase } from '@/services/supabaseClient';

interface RulesTabProps {
  language: Language;
  canEdit: boolean;
}

interface GrammarRule {
  id: string;
  name: string;
  description: string;
  category: string;
  rule_type: string;
  pattern?: string;
  examples?: any[];
  added_at?: string;
}

const RulesTab: React.FC<RulesTabProps> = ({ language, canEdit }) => {
  const [rules, setRules] = useState<GrammarRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('grammar_rules')
          .select('*')
          .eq('language_id', language.id)
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: false });

        if (err) throw err;
        setRules(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch grammar rules';
        console.error('❌ Error fetching rules:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, [language.id]);

  const filteredRules = filterCategory
    ? rules.filter((rule) => rule.category === filterCategory)
    : rules;

  const uniqueCategories = [...new Set(rules.map((r) => r.category))];

  const categoryIcons: Record<string, string> = {
    phonology: '🔤',
    morphology: '🏗️',
    syntax: '📐',
    pragmatics: '💬',
  };

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">
            📝 <span className="font-semibold">{language.total_rules || 0}</span> grammar rules
          </p>
        </div>
        {canEdit && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            + Add Rule
          </button>
        )}
      </div>

      {/* Filter by Category */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Filter by Category
        </label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full md:w-48 px-4 py-2 border border-border-dark rounded-lg bg-surface-dark text-white focus:outline-none focus:border-primary/50 transition-colors"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>
              {categoryIcons[cat] || '📋'} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">Loading grammar rules...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load rules: {error}</p>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary text-lg mb-2">
            {rules.length === 0 ? 'No grammar rules yet' : 'No rules in this category'}
          </p>
          {canEdit && rules.length === 0 && (
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              + Create the first rule
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="border border-border-dark rounded-lg p-4 hover:bg-surface-dark/80 transition-colors bg-surface-dark"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {categoryIcons[rule.category] || '📋'}
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {rule.name}
                    </h3>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 text-xs font-semibold rounded-full">
                      {rule.rule_type}
                    </span>
                  </div>
                  <p className="text-text-secondary mb-3">{rule.description}</p>

                  {rule.pattern && (
                    <div className="mb-3 p-3 bg-background-dark rounded font-mono text-sm text-text-secondary border border-border-dark">
                      Pattern: {rule.pattern}
                    </div>
                  )}

                  {rule.examples && rule.examples.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-text-secondary mb-2">
                        Examples:
                      </p>
                      <ul className="space-y-2">
                        {rule.examples.map((example: any, idx: number) => (
                          <li
                            key={idx}
                            className="text-sm text-text-secondary bg-surface-dark p-2 rounded"
                          >
                            <span className="font-mono font-semibold">{example.input}</span> →{' '}
                            <span className="font-mono font-semibold">{example.output}</span>
                            {example.explanation && (
                              <div className="text-xs text-text-secondary mt-1">
                                {example.explanation}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {canEdit && (
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm">
                      Edit
                    </button>
                    <button className="px-3 py-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredRules.length > 0 && (
        <p className="text-xs text-text-secondary text-center">
          Showing {filteredRules.length} of {rules.length} rules
        </p>
      )}
    </div>
  );
};

export default RulesTab;
