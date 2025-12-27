import React from 'react';
import { PageShell } from '@/components';

/**
 * Home - Dashboard home page
 */
export const Home: React.FC = () => {
  return (
    <PageShell title="Dashboard">
      <div className="flex flex-col gap-8">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-text-secondary text-lg">
              Ready to define a new world today?
            </p>
          </div>
          <button className="bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95">
            <span className="material-symbols-outlined">add</span>
            <span>New Language</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-dark p-4 rounded-xl border border-border-dark flex flex-col gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">list_alt</span>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">0</span>
              <span className="text-text-secondary text-xs">Total Words</span>
            </div>
          </div>

          <div className="bg-surface-dark p-4 rounded-xl border border-border-dark flex flex-col gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-2xl">rule</span>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">0</span>
              <span className="text-text-secondary text-xs">Grammar Rules</span>
            </div>
          </div>

          <div className="bg-surface-dark p-4 rounded-xl border border-border-dark flex flex-col gap-2">
            <span className="material-symbols-outlined text-purple-400 text-2xl">forum</span>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">0</span>
              <span className="text-text-secondary text-xs">Active Projects</span>
            </div>
          </div>

          <div className="bg-surface-dark p-4 rounded-xl border border-border-dark flex flex-col gap-2">
            <span className="material-symbols-outlined text-orange-400 text-2xl">local_fire_department</span>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">0</span>
              <span className="text-text-secondary text-xs">Day Streak</span>
            </div>
          </div>
        </div>

        {/* Placeholder Message */}
        <div className="bg-surface-dark border border-border-dark rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-text-secondary mb-4 block">
            construction
          </span>
          <h3 className="text-xl font-bold text-white mb-2">Dashboard Coming Soon</h3>
          <p className="text-text-secondary">
            This is a placeholder. Dashboard features will be implemented in Phase 1.
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default Home;
