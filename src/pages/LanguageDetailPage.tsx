import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabaseClient';
import PageShell from '@/components/PageShell';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import LanguageHeader from '@/components/language-detail/LanguageHeader';
import LanguageTabs from '@/components/language-detail/LanguageTabs';
import EditLanguageModal from '@/components/language-detail/EditLanguageModal';
import VisibilitySettingsModal from '@/components/language-detail/VisibilitySettingsModal';
import type { Language } from '@/types/database';

type LanguageDetailPageProps = Record<string, never>;

const LanguageDetailPage: React.FC<LanguageDetailPageProps> = () => {
  const { languageId } = useParams<{ languageId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [language, setLanguage] = useState<Language | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dictionary' | 'rules' | 'courses'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
  const [owner, setOwner] = useState<{ display_name: string } | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer' | 'none'>('none');

  // Fetch language data
  useEffect(() => {
    if (!languageId || !user) return;

    const fetchLanguage = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[LanguageDetailPage] Fetching language:', languageId);

        // Step 1: Fetch language - simplified query without joins
        // Start with a basic query to ensure we can get the language data
        const { data: languageData, error: langError } = await supabase
          .from('languages')
          .select('*')
          .eq('id', languageId)
          .single();

        if (langError) {
          console.error('[LanguageDetailPage] Error fetching language:', langError);
          console.error('[LanguageDetailPage] Error code:', langError.code);
          console.error('[LanguageDetailPage] Error message:', langError.message);
          throw new Error(`Failed to fetch language: ${langError.message}`);
        }

        if (!languageData) {
          console.error('[LanguageDetailPage] No language data returned');
          setError('Language not found');
          return;
        }

        console.log('[LanguageDetailPage] Language data fetched:', languageData);

        // Log spec columns specifically
        console.log('[LanguageDetailPage] Spec columns from database:');
        console.log('  alphabet_script:', languageData.alphabet_script);
        console.log('  writing_direction:', languageData.writing_direction);
        console.log('  word_order:', languageData.word_order);
        console.log('  depth_level:', languageData.depth_level);
        console.log('  case_sensitive:', languageData.case_sensitive);
        console.log('  phoneme_count:', languageData.phoneme_count);

        // Map database columns to Language type with nested specs
        const mappedLanguage: Language = {
          id: languageData.id,
          owner_id: languageData.owner_id,
          name: languageData.name,
          description: languageData.description,
          icon: languageData.icon || '🌍',
          icon_url: languageData.icon_url,
          cover_image_url: languageData.cover_image_url,
          visibility: languageData.visibility,
          specs: {
            alphabetScript: languageData.alphabet_script,
            writingDirection: languageData.writing_direction,
            wordOrder: languageData.word_order,
            depthLevel: languageData.depth_level,
            phonemeSet: languageData.phoneme_set || [],
          },
          total_words: languageData.total_words || 0,
          total_rules: languageData.total_rules || 0,
          total_contributors: languageData.total_contributors || 1,
          phoneme_count: languageData.phoneme_count,
          case_sensitive: languageData.case_sensitive || false,
          created_at: languageData.created_at,
          updated_at: languageData.updated_at,
        };

        setLanguage(mappedLanguage);
        console.log('[LanguageDetailPage] Language mapped:', mappedLanguage);

        // Step 2: Fetch owner info - with error handling
        console.log('[LanguageDetailPage] Fetching owner with auth_id:', languageData.owner_id);
        const { data: ownerData, error: ownerError } = await supabase
          .from('users')
          .select('display_name, email')
          .eq('auth_id', languageData.owner_id)
          .single();

        if (ownerError) {
          console.warn('[LanguageDetailPage] Warning fetching owner:', ownerError.message);
          // Don't fail if owner lookup fails - just use fallback
          setOwner({ display_name: 'Unknown' });
        } else if (ownerData) {
          console.log('[LanguageDetailPage] Owner data fetched:', ownerData);
          setOwner({ display_name: ownerData.display_name || ownerData.email || 'Unknown' });
        } else {
          console.warn('[LanguageDetailPage] No owner data returned');
          setOwner({ display_name: 'Unknown' });
        }

        // Step 3: Check user role - with error handling
        console.log('[LanguageDetailPage] Checking user role. User ID:', user.id, 'Owner ID:', languageData.owner_id);
        
        if (languageData.owner_id === user.id) {
          console.log('[LanguageDetailPage] User is owner');
          setUserRole('owner');
        } else {
          // Check collaborator role
          const { data: collabData, error: collabError } = await supabase
            .from('language_collaborators')
            .select('role')
            .eq('language_id', languageId)
            .eq('user_id', user.id)
            .single();

          if (collabError) {
            if (collabError.code === 'PGRST116') {
              // Not a collaborator
              console.log('[LanguageDetailPage] User is not a collaborator');
              setUserRole('none');
            } else {
              console.warn('[LanguageDetailPage] Error checking collaborator role:', collabError.message);
              setUserRole('none');
            }
          } else if (collabData) {
            console.log('[LanguageDetailPage] User role:', collabData.role);
            setUserRole((collabData.role as 'editor' | 'viewer') || 'none');
          } else {
            console.log('[LanguageDetailPage] User is not a collaborator (no data)');
            setUserRole('none');
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch language';
        console.error('[LanguageDetailPage] ❌ Error fetching language:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguage();
  }, [languageId, user]);

  // Handle language update
  const handleLanguageUpdate = (updatedLanguage: Language) => {
    setLanguage(updatedLanguage);
    setIsEditModalOpen(false);
  };

  // Handle visibility update
  const handleVisibilityUpdate = (newVisibility: string) => {
    if (language) {
      setLanguage({ ...language, visibility: newVisibility as 'public' | 'private' | 'friends' });
      setIsVisibilityModalOpen(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !language) {
    return (
      <PageShell title="Error">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Language not found'}</p>
            <button
              onClick={() => navigate('/languages')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Languages
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  const canEdit = userRole === 'owner' || userRole === 'editor';

  return (
    <ErrorBoundary>
      <PageShell title={language.name}>
        <div className="space-y-6 pb-12">
          {/* Language Header */}
          <LanguageHeader
            language={language}
            owner={owner}
            userRole={userRole}
            onEditClick={() => setIsEditModalOpen(true)}
            onVisibilityClick={() => setIsVisibilityModalOpen(true)}
          />

          {/* Tabs */}
          <LanguageTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            language={language}
            canEdit={canEdit}
          />

          {/* Edit Modal */}
          {isEditModalOpen && (
            <EditLanguageModal
              language={language}
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onUpdate={handleLanguageUpdate}
              canEdit={canEdit}
            />
          )}

          {/* Visibility Settings Modal */}
          {isVisibilityModalOpen && (
            <VisibilitySettingsModal
              language={language}
              isOpen={isVisibilityModalOpen}
              onClose={() => setIsVisibilityModalOpen(false)}
              onUpdate={handleVisibilityUpdate}
              canEdit={canEdit}
            />
          )}
        </div>
      </PageShell>
    </ErrorBoundary>
  );
};

export default LanguageDetailPage;
