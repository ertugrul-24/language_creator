import { useEffect, useState } from 'react';
import type { Language } from '@/types/database';
import { supabase } from '@/services/supabaseClient';

interface DictionaryTabProps {
  language: Language;
  canEdit: boolean;
}

interface DictionaryWord {
  id: string;
  word: string;
  translation: string;
  part_of_speech: string;
  pronunciation?: string;
  added_by?: string;
  created_at?: string;
}

type SortOption = 'name-asc' | 'name-desc' | 'date-added' | 'popularity';

const DictionaryTab: React.FC<DictionaryTabProps> = ({ language, canEdit }) => {
  const [allWords, setAllWords] = useState<DictionaryWord[]>([]);
  const [displayedWords, setDisplayedWords] = useState<DictionaryWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPOS, setFilterPOS] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-added');
  const [itemsToShow, setItemsToShow] = useState(50);

  // Fetch all words
  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('dictionaries')
          .select('*')
          .eq('language_id', language.id)
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: false });

        if (err) throw err;
        setAllWords(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch dictionary';
        console.error('❌ Error fetching dictionary:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [language.id]);

  // Filter, sort, and paginate words
  useEffect(() => {
    let filtered = allWords.filter((word) => {
      const matchesSearch =
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.translation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPOS = !filterPOS || word.part_of_speech === filterPOS;
      return matchesSearch && matchesPOS;
    });

    // Sort
    let sorted = [...filtered];
    if (sortBy === 'name-asc') {
      sorted.sort((a, b) => a.word.localeCompare(b.word));
    } else if (sortBy === 'name-desc') {
      sorted.sort((a, b) => b.word.localeCompare(a.word));
    } else if (sortBy === 'date-added') {
      sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    } else if (sortBy === 'popularity') {
      // For now, popularity = most recent (can be enhanced with view_count later)
      sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    // Paginate
    setDisplayedWords(sorted.slice(0, itemsToShow));
  }, [allWords, searchTerm, filterPOS, sortBy, itemsToShow]);

  const uniquePOS = [...new Set(allWords.map((w) => w.part_of_speech))].sort();

  const filteredCount = allWords.filter((word) => {
    const matchesSearch =
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPOS = !filterPOS || word.part_of_speech === filterPOS;
    return matchesSearch && matchesPOS;
  }).length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const handleLoadMore = () => {
    setItemsToShow((prev) => prev + 50);
  };

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">
            📖 <span className="font-semibold text-white">{language.total_words || 0}</span> words in this language
          </p>
        </div>
        {canEdit && (
          <button className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Word
          </button>
        )}
      </div>

      {/* Search, Filters, and Sort */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search words or translations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-dark rounded-lg bg-surface-dark text-white placeholder-text-secondary focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <select
            value={filterPOS}
            onChange={(e) => setFilterPOS(e.target.value)}
            className="px-4 py-2 border border-border-dark rounded-lg bg-surface-dark text-white focus:outline-none focus:border-primary/50 transition-colors min-w-[180px]"
          >
            <option value="">All Parts of Speech</option>
            {uniquePOS.map((pos) => (
              <option key={pos} value={pos}>
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-border-dark rounded-lg bg-surface-dark text-white focus:outline-none focus:border-primary/50 transition-colors min-w-[150px]"
          >
            <option value="date-added">Date Added</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Words Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="text-text-secondary mt-4">Loading dictionary...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load dictionary: {error}</p>
        </div>
      ) : displayedWords.length === 0 ? (
        <div className="text-center py-12 bg-surface-dark rounded-xl border border-border-dark">
          <span className="material-symbols-outlined text-4xl text-text-secondary mb-3 block">
            menu_book
          </span>
          <p className="text-text-secondary text-lg mb-2">
            {allWords.length === 0 ? 'No words in this language yet' : 'No words match your search'}
          </p>
          {canEdit && allWords.length === 0 && (
            <button className="mt-4 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors font-medium">
              + Add the first word
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-border-dark rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-dark/50 border-b border-border-dark">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Word</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Translation</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Part of Speech</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Date Added</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Added by</th>
                  {canEdit && <th className="px-4 py-3 text-center text-sm font-semibold text-white">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {displayedWords.map((word) => (
                  <tr
                    key={word.id}
                    className="border-b border-border-dark hover:bg-surface-dark/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-white">{word.word}</td>
                    <td className="px-4 py-3 text-text-secondary">{word.translation}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded">
                        {word.part_of_speech}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-sm">{formatDate(word.created_at)}</td>
                    <td className="px-4 py-3 text-text-secondary text-sm">{word.added_by || '—'}</td>
                    {canEdit && (
                      <td className="px-4 py-3 text-center">
                        <button className="text-primary hover:text-blue-400 mr-3 font-medium text-sm transition-colors">
                          Edit
                        </button>
                        <button className="text-red-500 hover:text-red-400 font-medium text-sm transition-colors">
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Info and Load More */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-xs text-text-secondary">
              Showing <span className="font-semibold text-white">{displayedWords.length}</span> of{' '}
              <span className="font-semibold text-white">{filteredCount}</span> words
            </p>
            {displayedWords.length < filteredCount && (
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 bg-surface-dark border border-border-dark hover:border-primary/50 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
                Load More ({Math.min(50, filteredCount - displayedWords.length)} remaining)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DictionaryTab;
