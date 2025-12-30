import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components';

export const Languages: React.FC = () => {
  const navigate = useNavigate();

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
};

export default Languages;
