import { useEffect, useState } from 'react';
import type { Language } from '@/types/database';
import { getRules } from '@/services/ruleService';
import AddRuleModal from '@/components/language-detail/AddRuleModal';

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
  created_at?: string;
  added_by?: string;
  updated_at?: string;
}

const RulesTab: React.FC<RulesTabProps> = ({ language, canEdit }) => {
  console.log('✅ RulesTab MOUNTED - Language:', language.name, 'ID:', language.id);

  const [allRules, setAllRules] = useState<GrammarRule[]>([]);
  const [displayedRules, setDisplayedRules] = useState<GrammarRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [itemsToShow, setItemsToShow] = useState(50);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch all rules
  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoading(true);
        console.log('🔍 [RulesTab.useEffect] Loading rules for language:', language.id);

        if (!language.id) {
          console.error('❌ [RulesTab.useEffect] Language ID is missing!');
          setError('Language ID is missing');
          return;
        }

        console.log('📡 [RulesTab.useEffect] Calling ruleService.getRules...');
        const result = await getRules(language.id);

        if (result.error) {
          console.error('❌ [RulesTab.useEffect] ruleService error:', result.error);
          throw new Error(result.error);
        }

        console.log(`✅ [RulesTab.useEffect] Loaded ${result.rules.length} rules from database`);
        setAllRules(result.rules || []);

        // Extract unique categories
        const categories = [...new Set(result.rules.map((r) => r.category))].sort();
        setAvailableCategories(categories);
        console.log('📋 [RulesTab.useEffect] Available categories:', categories);

        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load rules';
        console.error('❌ [RulesTab.useEffect] Exception:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, [language.id]);

  // Filter, sort, and paginate rules
  useEffect(() => {
    let filtered = allRules.filter((rule) => {
      const matchesSearch =
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rule.description && rule.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !filterCategory || rule.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort by name
    let sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

    // Paginate
    setDisplayedRules(sorted.slice(0, itemsToShow));
  }, [allRules, searchTerm, filterCategory, itemsToShow]);

  const categoryIcons: Record<string, string> = {
    phonology: '🔤',
    morphology: '🏗️',
    syntax: '📐',
    pragmatics: '💬',
  };

  const handleLoadMore = () => {
    setItemsToShow((prev) => prev + 50);
  };

  const handleRuleAdded = () => {
    console.log('🔄 [RulesTab] Rule added, refreshing rule list...');
    setItemsToShow(50);
    const fetchRules = async () => {
      try {
        setLoading(true);
        const result = await getRules(language.id);
        if (result.error) {
          throw new Error(result.error);
        }
        console.log(`✅ [RulesTab.handleRuleAdded] Refreshed: ${result.rules.length} rules`);
        setAllRules(result.rules || []);
        const categories = [...new Set(result.rules.map((r) => r.category))].sort();
        setAvailableCategories(categories);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to refresh';
        console.error('❌ [RulesTab.handleRuleAdded]', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  };

  const filteredCount = allRules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rule.description && rule.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || rule.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).length;

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-100 mb-2">Grammar Rules</h2>
          <p className="text-slate-400">
            {filteredCount} of {allRules.length} rules
            {filterCategory && ` • Filtered by ${filterCategory}`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Search and Add Button Row */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search rules by name or description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setItemsToShow(50);
                }}
                className="w-full px-4 py-2 bg-slate-800 text-slate-100 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
            </div>
            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <span className="text-lg">+</span> Add Rule
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setFilterCategory(null);
                setItemsToShow(50);
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                !filterCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All Categories ({allRules.length})
            </button>
            {availableCategories.map((category) => {
              const count = allRules.filter((r) => r.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => {
                    setFilterCategory(category);
                    setItemsToShow(50);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    filterCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span>{categoryIcons[category] || '📝'}</span>
                  <span className="capitalize">{category}</span>
                  <span className="text-sm opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rules List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-slate-800 rounded-lg animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : displayedRules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">
              {allRules.length === 0
                ? 'No grammar rules yet. Create one to get started!'
                : 'No rules match your search.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {displayedRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-5 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{categoryIcons[rule.category] || '📝'}</span>
                        <h3 className="text-xl font-bold text-slate-100">{rule.name}</h3>
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded capitalize">
                          {rule.category}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="text-slate-400 text-sm ml-11">{rule.description}</p>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            // Edit functionality - to be implemented
                            console.log('Edit rule:', rule.id);
                          }}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-slate-100"
                          title="Edit rule"
                        >
                          <span className="text-lg">✏️</span>
                        </button>
                        <button
                          onClick={() => {
                            // Delete functionality - to be implemented
                            console.log('Delete rule:', rule.id);
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-300 hover:text-red-300"
                          title="Delete rule"
                        >
                          <span className="text-lg">🗑️</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 ml-11">
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Type</p>
                      <p className="text-slate-200 capitalize">{rule.rule_type}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Pattern</p>
                      <p className="text-slate-200 font-mono text-sm truncate">{rule.pattern || '—'}</p>
                    </div>
                    {rule.examples && rule.examples.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Examples</p>
                        <div className="space-y-1">
                          {rule.examples.slice(0, 2).map((ex: any, i: number) => (
                            <p key={i} className="text-slate-300 text-sm">
                              <span className="text-slate-400">{ex.input}</span>
                              <span className="text-slate-500 mx-1">→</span>
                              <span className="text-slate-200">{ex.output}</span>
                            </p>
                          ))}
                          {rule.examples.length > 2 && (
                            <p className="text-slate-400 text-xs">
                              +{rule.examples.length - 2} more example{rule.examples.length - 2 !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {displayedRules.length < filteredCount && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors"
                >
                  Load More ({displayedRules.length} of {filteredCount})
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <AddRuleModal
          language={language}
          onClose={() => setShowAddModal(false)}
          onRuleAdded={handleRuleAdded}
        />
      )}
    </div>
  );
};

export default RulesTab;
