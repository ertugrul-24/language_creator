import React from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '@/components';

/**
 * Courses - Dashboard view showing all courses across languages
 * Users can browse, create, and enroll in courses
 * 
 * Note: Individual language courses are in LanguageDetailPage tabs
 */
export const Courses: React.FC = () => {
  return (
    <PageShell title="Courses">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface-dark rounded-lg border border-border-dark p-8">
          <div className="flex items-start gap-4 mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">school</span>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Courses</h1>
              <p className="text-text-secondary">
                Create flashcard courses and structured lessons for your languages
              </p>
            </div>
          </div>

          <div className="bg-background-dark rounded-lg p-6 mb-6 border border-border-dark/50">
            <p className="text-text-secondary mb-4">
              Courses are organized by language. To create or view courses:
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
                <span>Click the <span className="text-white font-medium">Courses</span> tab</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">4.</span>
                <span>Create new courses with lessons, flashcards, and quizzes</span>
              </li>
            </ol>
          </div>

          <div className="bg-background-dark rounded-lg p-6 border border-border-dark/50 mb-6">
            <h3 className="text-white font-semibold mb-3">Course Features:</h3>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                <span>Structured lessons with markdown content</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                <span>Interactive flashcards with images</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                <span>Quiz questions and progress tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                <span>Public or private course visibility</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                <span>Enrollment and progress analytics</span>
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

export default Courses;
