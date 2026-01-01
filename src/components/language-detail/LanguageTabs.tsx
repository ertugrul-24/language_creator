import type { Language } from '@/types/database';
import OverviewTab from './tabs/OverviewTab';
import DictionaryTab from './tabs/DictionaryTab';
import RulesTab from './tabs/RulesTab';
import CoursesTab from './tabs/CoursesTab';

interface LanguageTabsProps {
  activeTab: 'overview' | 'dictionary' | 'rules' | 'courses';
  onTabChange: (tab: 'overview' | 'dictionary' | 'rules' | 'courses') => void;
  language: Language;
  canEdit: boolean;
  onEditSpecs?: () => void;
}

const LanguageTabs: React.FC<LanguageTabsProps> = ({
  activeTab,
  onTabChange,
  language,
  canEdit,
  onEditSpecs,
}) => {
  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📋' },
    { id: 'dictionary' as const, label: 'Dictionary', icon: '📖', badge: language.total_words || 0 },
    { id: 'rules' as const, label: 'Rules', icon: '📝', badge: language.total_rules || 0 },
    { id: 'courses' as const, label: 'Courses', icon: '📚', badge: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-1 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        {activeTab === 'overview' && <OverviewTab language={language} canEdit={canEdit} onEditSpecs={onEditSpecs} />}
        {activeTab === 'dictionary' && <DictionaryTab language={language} canEdit={canEdit} />}
        {activeTab === 'rules' && <RulesTab language={language} canEdit={canEdit} />}
        {activeTab === 'courses' && <CoursesTab language={language} canEdit={canEdit} />}
      </div>
    </div>
  );
};

export default LanguageTabs;
