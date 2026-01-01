import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getAllUserLanguages } from '@/services/languageService';
import { PageShell, LoadingSpinner } from '@/components';
import type { Language } from '@/types/database';

type FilterType = 'all' | 'created' | 'collaborating';
type SortType = 'recent' | 'alphabetical';

interface LanguageWithMetadata extends Language {
  userRole?: 'owner' | 'editor' | 'viewer';
  type?: 'created' | 'collaborated';
}

// Helper function to format date as DD.MM.YYYY – HH:MM
const formatDatetime = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} – ${hours}:${minutes}`;
};

export const Languages: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [languages, setLanguages] = useState<LanguageWithMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('recent');

  // Fetch languages when auth is ready
  useEffect(() => {
    if (authLoading) {
      console.log('[Languages] Waiting for auth to load...');
      return;
    }

    if (!user) {
      console.log('[Languages] Not authenticated, clearing languages');
      setLanguages([]);
      return;
    }

    console.log('[Languages] Auth ready, user.id:', user.id);
    console.log('[Languages] Fetching all languages for user...');

    const fetchLanguages = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[Languages] Calling getAllUserLanguages with userId:', user.id);
        const data = await getAllUserLanguages(user.id);
        
        console.log('[Languages] Fetch successful, received:', data.length, 'languages');
        setLanguages(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch languages';
        console.error('[Languages] Fetch error:', message);
        console.error('[Languages] Full error:', err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, [user, authLoading]);

  // Filter languages based on selected filter
  const filteredLanguages = languages.filter((lang) => {
    if (filter === 'created') return lang.type === 'created';
    if (filter === 'collaborating') return lang.type === 'collaborated';
    return true;
  });

  // Sort languages based on selected sort
  const sortedLanguages = [...filteredLanguages].sort((a, b) => {
    if (sort === 'recent') {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    } else if (sort === 'alphabetical') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const createdCount = languages.filter((l) => l.type === 'created').length;
  const collaboratingCount = languages.filter((l) => l.type === 'collaborated').length;

  if (authLoading) {
    return (
      <PageShell title="Languages">
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell title="Languages">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">lock</span>
          <h2 className="text-2xl font-bold text-white mb-2">Not Authenticated</h2>
          <p className="text-text-secondary mb-6">Please log in to view your languages.</p>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Languages">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Languages</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell title="Languages">
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  // No languages
  if (languages.length === 0) {
    return (
      <PageShell title="Languages">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">language</span>
          <h2 className="text-2xl font-bold text-white mb-2">No languages yet</h2>
          <p className="text-text-secondary mb-6 max-w-md">Create your first constructed language to get started. Define its alphabet, phonemes, grammar rules, and more.</p>
          <button
            onClick={() => navigate('/languages/new')}
            className="bg-primary hover:bg-blue-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Create your first language
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Languages">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Languages</h1>
            <p className="text-text-secondary text-sm">
              {languages.length} language{languages.length !== 1 ? 's' : ''} • {createdCount} created, {collaboratingCount} collaborating
            </p>
          </div>
          <button
            onClick={() => navigate('/languages/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Language
          </button>
        </div>

        {/* Controls */}
        <div className="bg-surface-dark rounded-lg border border-border-dark p-4 flex flex-col sm:flex-row gap-4">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-sm font-medium">Filter:</span>
            <div className="flex gap-2">
              {(['all', 'created', 'collaborating'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-surface-light text-text-secondary hover:bg-border-dark'
                  }`}
                >
                  {f === 'all' && `All (${languages.length})`}
                  {f === 'created' && `Created by me (${createdCount})`}
                  {f === 'collaborating' && `Collaborating (${collaboratingCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-text-secondary text-sm font-medium">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="bg-surface-light dark:bg-surface-dark text-text-primary dark:text-white border border-border-dark rounded-lg px-4 py-2 text-sm font-medium hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors dark:hover:bg-surface-light/10 cursor-pointer"
            >
              <option value="recent" className="bg-surface-dark text-white">Recently modified</option>
              <option value="alphabetical" className="bg-surface-dark text-white">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Empty State for Filter */}
        {sortedLanguages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-text-secondary mb-3">search_off</span>
            <h3 className="text-lg font-semibold text-white mb-2">No languages found</h3>
            <p className="text-text-secondary text-sm mb-6">
              {filter === 'created' && 'You haven\'t created any languages yet.'}
              {filter === 'collaborating' && 'You aren\'t collaborating on any languages yet.'}
              {filter === 'all' && 'Try adjusting your filters.'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
              >
                View all languages
              </button>
            )}
          </div>
        ) : (
          // Languages Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
            {sortedLanguages.map((lang) => (
              <div
                key={lang.id}
                onClick={() => navigate(`/languages/${lang.id}`)}
                className="bg-surface-dark rounded-lg border border-border-dark p-5 hover:border-blue-500 transition-colors cursor-pointer group h-full flex flex-col"
              >
                {/* Header with Icon and Arrow */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{lang.icon_url || lang.icon || '🌍'}</div>
                  <span className="material-symbols-outlined text-text-secondary group-hover:text-blue-400 transition">arrow_outward</span>
                </div>

                {/* Title and Role Badge */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white truncate flex-1">{lang.name}</h3>
                    {lang.type === 'collaborated' && (
                      <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${
                        lang.userRole === 'editor'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {lang.userRole === 'editor' ? 'Editor' : 'Viewer'}
                      </span>
                    )}
                    {lang.type === 'created' && (
                      <span className="text-xs font-medium px-2 py-1 rounded bg-green-500/20 text-green-300 whitespace-nowrap">Owner</span>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm line-clamp-2">{lang.description || 'No description'}</p>
                </div>

                {/* Stats */}
                <div className="flex gap-4 mb-4 text-xs text-text-secondary py-3 border-y border-border-dark">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">text_snippet</span>
                    <span>{lang.total_words || 0} words</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">rule</span>
                    <span>{lang.total_rules || 0} rules</span>
                  </div>
                </div>

                {/* Footer with Last Modified */}
                <div className="text-xs text-text-secondary mt-auto">
                  Last Modified: {formatDatetime(lang.updated_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default Languages;
