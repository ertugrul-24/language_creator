import { useState } from 'react';
import type { Language } from '@/types/database';

interface OverviewTabProps {
  language: Language;
  canEdit: boolean;
}

interface ExpandableSpec {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ language }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const specs: ExpandableSpec[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: '📋',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Language Name</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{language.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Icon</p>
            <p className="text-4xl">{language.icon_url || language.icon || '🌍'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</p>
            <p className="text-gray-900 dark:text-white">{language.description || 'No description provided'}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'phonology',
      title: 'Phonology & Script',
      icon: '🔤',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Alphabet/Script</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {language.specs?.alphabetScript || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Writing Direction</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {language.specs?.writingDirection || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phoneme Count</p>
            <p className="font-semibold text-gray-900 dark:text-white">{language.phoneme_count || 0}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phoneme Set</p>
            <div className="flex flex-wrap gap-2">
              {language.specs?.phonemeSet && language.specs.phonemeSet.length > 0 ? (
                language.specs.phonemeSet.map((phoneme: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-full text-sm font-medium"
                  >
                    {phoneme.symbol} [{phoneme.ipa}]
                  </span>
                ))
              ) : (
                <span className="text-gray-500 dark:text-gray-400">No phonemes defined</span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'grammar',
      title: 'Grammar & Syntax',
      icon: '🗣️',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Word Order</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {language.specs?.wordOrder || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Case Sensitive</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {language.case_sensitive ? '✓ Yes' : '✗ No'}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Depth Level</p>
            <p className="font-semibold text-gray-900 dark:text-white capitalize">
              {language.specs?.depthLevel || 'Not specified'}
            </p>
            {language.specs?.depthLevel === 'simplified' && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                ⚠️ This is a simplified language spec. Some features may be abstracted.
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'stats',
      title: 'Statistics',
      icon: '📊',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">📖 Total Words</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{language.total_words || 0}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">📝 Grammar Rules</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{language.total_rules || 0}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">👥 Contributors</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {language.total_contributors || 1}
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {specs.map((spec) => (
        <div
          key={spec.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => toggleSection(spec.id)}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="flex items-center gap-3 font-semibold text-gray-900 dark:text-white">
              <span className="text-2xl">{spec.icon}</span>
              {spec.title}
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-2xl transform transition-transform">
              {expandedSections.has(spec.id) ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.has(spec.id) && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {spec.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OverviewTab;
