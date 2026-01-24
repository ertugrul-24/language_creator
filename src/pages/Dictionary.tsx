import React from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '@/components';

/**
 * Dictionary - Dashboard view showing all words across languages
 * Users can browse, search, and add words to their languages
 * 
 * Note: Individual language dictionaries are in LanguageDetailPage tabs
 */
export const Dictionary: React.FC = () => {
  return (
    <PageShell title="Dictionary">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface-dark rounded-lg border border-border-dark p-8">
          <div className="flex items-start gap-4 mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">menu_book</span>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dictionary</h1>
              <p className="text-text-secondary">
                Browse and manage all words across your languages
              </p>
            </div>
          </div>

          <div className="bg-background-dark rounded-lg p-6 mb-6 border border-border-dark/50">
            <p className="text-text-secondary mb-4">
              Dictionary management is organized by language. To add or edit words:
            </p>
            <ol className="space-y-3 text-text-secondary">
              <li className="flex gap-3">
                <span className="text-primary font-bold">1.</span>
                <span>Go to <Link to="/languages" className="text-primary hover:underline">Languages</Link></span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">2.</span>
                <span>Select any language you created or collaborate on</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">3.</span>
                <span>Click the <span className="text-white font-medium">Dictionary</span> tab</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">4.</span>
                <span>Add words, search, filter by part of speech, and sort</span>
              </li>
            </ol>
          </div>

          <div className="flex gap-4">
            <Link
              to="/languages"
              className="px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">language</span>
              Go to Languages
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Dictionary;
