import type { Language } from '@/types/database';
import VisibilityBadge from './VisibilityBadge';

interface LanguageHeaderProps {
  language: Language;
  owner: { display_name: string } | null;
  userRole: 'owner' | 'editor' | 'viewer' | 'none';
  onEditClick: () => void;
  onVisibilityClick: () => void;
}

const LanguageHeader: React.FC<LanguageHeaderProps> = ({
  language,
  owner,
  userRole,
  onEditClick,
  onVisibilityClick,
}) => {
  const canEdit = userRole === 'owner' || userRole === 'editor';
  
  // Format date as DD.MM.YYYY – HH:MM
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} – ${hours}:${minutes}`;
  };

  // Use updated_at if available, otherwise fall back to created_at
  const lastModified = language.updated_at || language.created_at;
  const formattedDate = formatDate(lastModified);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-lg p-8 text-white shadow-lg">
      <div className="flex items-start justify-between gap-6">
        {/* Left: Icon and Basic Info */}
        <div className="flex items-center gap-6">
          <div className="text-6xl">{language.icon_url || language.icon || '🌍'}</div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{language.name}</h1>
            {language.description && (
              <p className="text-blue-100 mb-3 text-lg">{language.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-blue-100">
              <span>
                Created by <span className="font-semibold">{owner?.display_name || 'Unknown'}</span>
              </span>
              <span>•</span>
              <span>Last Modified: {formattedDate}</span>
              <span>•</span>
              <VisibilityBadge visibility={language.visibility} />
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-col gap-2">
          {canEdit && (
            <button
              onClick={onEditClick}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              ✎ Edit Language
            </button>
          )}
          <button
            onClick={onVisibilityClick}
            className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
          >
            🔒 {language.visibility ? language.visibility.charAt(0).toUpperCase() + language.visibility.slice(1) : 'Private'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageHeader;
