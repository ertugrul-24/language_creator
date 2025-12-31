import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getUserLanguages } from '@/services/languageService';
import { PageShell } from '@/components';
import type { Language } from '@/types/database';

export const Languages: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    console.log('[Languages] Fetching languages for user...');

    const fetchLanguages = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[Languages] Calling getUserLanguages with userId:', user.id);
        const data = await getUserLanguages(user.id);
        
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

  if (authLoading) {
    return (
      <PageShell title="Languages">
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-text-secondary animate-spin mb-4">hourglass_empty</span>
            <p className="text-text-secondary">Loading...</p>
          </div>
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
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-text-secondary animate-spin mb-4">hourglass_empty</span>
            <p className="text-text-secondary">Loading languages...</p>
          </div>
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

  // Display languages
  return (
    <PageShell title="Languages">
      <div>
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Languages</h1>
            <p className="text-text-secondary">{languages.length} language{languages.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => navigate('/languages/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            New Language
          </button>
        </div>

        {/* Languages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map((lang) => (
            <div
              key={lang.id}
              onClick={() => navigate(`/languages/${lang.id}`)}
              className="bg-surface-dark rounded-lg border border-border-dark p-6 hover:border-blue-500 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{lang.icon || '🌍'}</div>
                <span className="material-symbols-outlined text-text-secondary group-hover:text-blue-400 transition">arrow_outward</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{lang.name}</h3>
              <p className="text-text-secondary text-sm mb-4 line-clamp-2">{lang.description}</p>
              <div className="pt-4 border-t border-border-dark text-xs text-text-secondary">
                Created {new Date(lang.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default Languages;
