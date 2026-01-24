import React from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '@/components';

/**
 * Grammar - Dashboard view showing all grammar rules across languages
 * Users can browse, search, and add rules to their languages
 * 
 * Note: Individual language grammar rules are in LanguageDetailPage tabs
 */
export const Grammar: React.FC = () => {
  return (
    <PageShell title="Grammar">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface-dark rounded-lg border border-border-dark p-8">
          <div className="flex items-start gap-4 mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">spellcheck</span>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Grammar Rules</h1>
              <p className="text-text-secondary">
                Define and manage grammar rules across your languages
              </p>
            </div>
          </div>

          <div className="bg-background-dark rounded-lg p-6 mb-6 border border-border-dark/50">
            <p className="text-text-secondary mb-4">
              Grammar rules are organized by language. To add or edit rules:
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
                <span>Click the <span className="text-white font-medium">Rules</span> tab</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">4.</span>
                <span>Add rules, view examples, filter by category, and edit</span>
              </li>
            </ol>
          </div>

          <div className="bg-background-dark rounded-lg p-6 border border-border-dark/50 mb-6">
            <h3 className="text-white font-semibold mb-3">Rule Categories:</h3>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                <span><span className="text-white">Phonology</span> - Sound and pronunciation rules</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                <span><span className="text-white">Morphology</span> - Word formation and inflection</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                <span><span className="text-white">Syntax</span> - Sentence structure and word order</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                <span><span className="text-white">Pragmatics</span> - Usage and context rules</span>
              </li>
            </ul>
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

export default Grammar;
