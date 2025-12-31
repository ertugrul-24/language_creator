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
  added_at?: string;
}

const DictionaryTab: React.FC<DictionaryTabProps> = ({ language, canEdit }) => {
  const [words, setWords] = useState<DictionaryWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPOS, setFilterPOS] = useState('');

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
        setWords(data || []);
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

  const filteredWords = words.filter((word) => {
    const matchesSearch =
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPOS = !filterPOS || word.part_of_speech === filterPOS;
    return matchesSearch && matchesPOS;
  });

  const uniquePOS = [...new Set(words.map((w) => w.part_of_speech))];

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            📖 <span className="font-semibold">{language.total_words || 0}</span> words in this language
          </p>
        </div>
        {canEdit && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            + Add Word
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search words or translations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterPOS}
          onChange={(e) => setFilterPOS(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Parts of Speech</option>
          {uniquePOS.map((pos) => (
            <option key={pos} value={pos}>
              {pos.charAt(0).toUpperCase() + pos.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Words Table */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading dictionary...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load dictionary: {error}</p>
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            {words.length === 0 ? 'No words in this language yet' : 'No words match your search'}
          </p>
          {canEdit && words.length === 0 && (
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              + Add the first word
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                  Word
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                  Translation
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                  Part of Speech
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                  Pronunciation
                </th>
                {canEdit && (
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredWords.map((word) => (
                <tr
                  key={word.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{word.word}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{word.translation}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 text-xs font-semibold rounded-full">
                      {word.part_of_speech}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{word.pronunciation || '—'}</td>
                  {canEdit && (
                    <td className="px-4 py-3 text-center">
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-3 font-medium">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium">
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredWords.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Showing {filteredWords.length} of {words.length} words
        </p>
      )}
    </div>
  );
};

export default DictionaryTab;
