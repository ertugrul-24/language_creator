import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabaseClient';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalWords: 0,
    totalRules: 0,
    dayStreak: 0,
  });
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        console.log('[HomePage] Fetching user stats for user_id:', user.id);

        // Fetch active projects (languages where user is a collaborator)
        const { data: collaborations, error: collabError } = await supabase
          .from('language_collaborators')
          .select('language_id')
          .eq('user_id', user.id);

        if (collabError) {
          console.error('[HomePage] Error fetching collaborations:', collabError);
        } else {
          const activeProjectCount = collaborations?.length || 0;
          console.log('[HomePage] Active projects count:', activeProjectCount);
          
          // Fetch the actual language details
          if (activeProjectCount > 0) {
            const languageIds = collaborations?.map(c => c.language_id) || [];
            const { data: langs, error: langsError } = await supabase
              .from('languages')
              .select('*')
              .in('id', languageIds);

            if (langsError) {
              console.error('[HomePage] Error fetching languages:', langsError);
            } else {
              setLanguages(langs || []);
            }
          }

          // Calculate totals from languages
          const { data: allLanguages, error: totalsError } = await supabase
            .from('languages')
            .select('total_words, total_rules')
            .in('id', collaborations?.map(c => c.language_id) || []);

          if (totalsError) {
            console.error('[HomePage] Error fetching totals:', totalsError);
          } else {
            const totalWords = allLanguages?.reduce((sum, lang) => sum + (lang.total_words || 0), 0) || 0;
            const totalRules = allLanguages?.reduce((sum, lang) => sum + (lang.total_rules || 0), 0) || 0;
            
            setStats({
              activeProjects: activeProjectCount,
              totalWords,
              totalRules,
              dayStreak: 0, // TODO: Implement in future phase
            });
          }
        }
      } catch (err) {
        console.error('[HomePage] Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user?.id]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display selection:bg-primary/30 selection:text-primary">
      {/* Sidebar */}
      <aside className="w-64 flex-col bg-background-dark border-r border-border-dark flex">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-6">
            {/* Brand */}
            <div className="flex gap-3 items-center px-2">
              <div className="bg-primary/20 flex items-center justify-center rounded-lg size-10 text-primary">
                <span className="material-symbols-outlined text-2xl">translate</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-white text-base font-bold leading-normal">LinguaFabric</h1>
                <p className="text-text-secondary text-xs font-normal">Creator Studio</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              <a
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary group transition-colors"
              >
                <span className="material-symbols-outlined filled">home</span>
                <span className="text-sm font-medium">Home</span>
              </a>
              <a
                href="/languages"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-dark hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">language</span>
                <span className="text-sm font-medium">Languages</span>
              </a>
              <a
                href="/dictionary"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-dark hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">menu_book</span>
                <span className="text-sm font-medium">Dictionary</span>
              </a>
              <a
                href="/grammar"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-dark hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">spellcheck</span>
                <span className="text-sm font-medium">Grammar</span>
              </a>
              <a
                href="/courses"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-dark hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">school</span>
                <span className="text-sm font-medium">Courses</span>
              </a>
              <a
                href="/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-dark hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">settings</span>
                <span className="text-sm font-medium">Settings</span>
              </a>
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-3 py-4 border-t border-border-dark mt-2">
              <div
                className="size-8 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}')`,
                }}
              />
              <div className="flex flex-col">
                <p className="text-white text-sm font-medium">{user?.displayName || user?.email || 'User'}</p>
                <p className="text-text-secondary text-xs">Free Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between border-b border-border-dark px-6 bg-background-dark/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-text-secondary hover:text-white">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-text-secondary text-sm">
              <span>Studio</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-white font-medium">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center bg-surface-dark rounded-lg px-3 py-2 w-64 border border-transparent focus-within:border-primary/50 transition-colors">
              <span className="material-symbols-outlined text-text-secondary text-[20px]">search</span>
              <input
                className="bg-transparent border-none text-sm text-white placeholder-text-secondary focus:ring-0 w-full ml-2 p-0"
                placeholder="Search lexicons..."
                type="text"
              />
            </div>
            {/* Actions */}
            <button className="size-10 flex items-center justify-center rounded-lg hover:bg-surface-dark text-text-secondary transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full border-2 border-background-dark"></span>
            </button>
            <button className="size-10 flex items-center justify-center rounded-lg hover:bg-surface-dark text-text-secondary transition-colors">
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Center Column */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:pr-8">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
              {/* Page Heading */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Welcome back, {user?.displayName || user?.email || 'User'}</h2>
                  <p className="text-text-secondary text-lg">Ready to define a new world today?</p>
                </div>
                <button 
                  onClick={() => navigate('/languages/new')}
                  className="bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined">add</span>
                  <span>New Language</span>
                </button>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-dark p-4 rounded-xl border border-border-dark flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">list_alt</span>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">{stats.totalWords}</span>
                    <span className="text-text-secondary text-xs">Total Words</span>
                  </div>
                </div>
                <div className="bg-surface-dark p-4 rounded-xl border border-border-dark flex flex-col gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-2xl">rule</span>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">{stats.totalRules}</span>
                    <span className="text-text-secondary text-xs">Grammar Rules</span>
                  </div>
                </div>
                <div className="bg-surface-dark p-4 rounded-xl border border-border-dark flex flex-col gap-2">
                  <span className="material-symbols-outlined text-purple-400 text-2xl">forum</span>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">{stats.activeProjects}</span>
                    <span className="text-text-secondary text-xs">Active Projects</span>
                  </div>
                </div>
                <div className="bg-surface-dark p-4 rounded-xl border border-border-dark flex flex-col gap-2">
                  <span className="material-symbols-outlined text-orange-400 text-2xl">local_fire_department</span>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">{stats.dayStreak}</span>
                    <span className="text-text-secondary text-xs">Day Streak</span>
                  </div>
                </div>
              </div>

              {/* Main Sections Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Active Projects */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Active Projects</h3>
                    <a className="text-sm text-primary hover:text-blue-400 font-medium" href="#">View All</a>
                  </div>

                  {/* Languages List or Empty State */}
                  {loading ? (
                    <div className="bg-surface-dark rounded-xl border border-border-dark p-8 text-center">
                      <p className="text-text-secondary">Loading projects...</p>
                    </div>
                  ) : languages.length > 0 ? (
                    <div className="space-y-3">
                      {languages.map((language) => (
                        <div
                          key={language.id}
                          onClick={() => navigate(`/languages/${language.id}`)}
                          className="bg-surface-dark hover:bg-surface-dark/80 rounded-xl border border-border-dark p-4 cursor-pointer transition-all hover:border-primary/50"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="text-3xl mt-1">{language.icon_url || '🌍'}</div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-white">{language.name}</h4>
                                <p className="text-sm text-text-secondary line-clamp-1">{language.description || 'No description'}</p>
                                <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                                  <span>{language.total_words || 0} words</span>
                                  <span>{language.total_rules || 0} rules</span>
                                  <span className="capitalize">{language.visibility || 'private'}</span>
                                </div>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-text-secondary">arrow_forward</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-surface-dark rounded-xl border border-border-dark p-8 text-center">
                      <span className="material-symbols-outlined text-4xl text-text-secondary mb-3 block">language</span>
                      <p className="text-text-secondary">No projects yet. Create your first language to get started!</p>
                      <button 
                        onClick={() => navigate('/languages/new')}
                        className="mt-4 bg-primary hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Create Language
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Quick Tools & Heatmap */}
                <div className="flex flex-col gap-8">
                  {/* Quick Tools */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="bg-surface-dark hover:bg-primary/20 hover:border-primary/50 border border-border-dark p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group aspect-square">
                        <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">add_circle</span>
                        <span className="text-sm font-medium text-white">Add Word</span>
                      </button>
                      <button className="bg-surface-dark hover:bg-primary/20 hover:border-primary/50 border border-border-dark p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group aspect-square">
                        <span className="material-symbols-outlined text-emerald-400 text-3xl group-hover:scale-110 transition-transform">gavel</span>
                        <span className="text-sm font-medium text-white">New Rule</span>
                      </button>
                      <button className="bg-surface-dark hover:bg-primary/20 hover:border-primary/50 border border-border-dark p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group aspect-square">
                        <span className="material-symbols-outlined text-purple-400 text-3xl group-hover:scale-110 transition-transform">graphic_eq</span>
                        <span className="text-sm font-medium text-white">Phonology</span>
                      </button>
                      <button className="bg-surface-dark hover:bg-primary/20 hover:border-primary/50 border border-border-dark p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group aspect-square">
                        <span className="material-symbols-outlined text-orange-400 text-3xl group-hover:scale-110 transition-transform">file_upload</span>
                        <span className="text-sm font-medium text-white">Export PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Activity Heatmap */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white">Activity</h3>
                      <span className="text-xs text-text-secondary">Last 30 days</span>
                    </div>
                    <div className="bg-surface-dark border border-border-dark rounded-xl p-4 text-center py-8">
                      <p className="text-text-secondary text-sm">No activity yet. Start creating languages to see your activity here!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pb-6 pt-4 border-t border-border-dark flex flex-col md:flex-row justify-between items-center text-text-secondary text-sm gap-4">
                <p>© 2023 LinguaFabric Inc.</p>
                <div className="flex gap-4">
                  <a className="hover:text-white" href="#">Privacy</a>
                  <a className="hover:text-white" href="#">Terms</a>
                  <a className="hover:text-white" href="#">Community</a>
                </div>
              </div>
            </div>
          </main>

          {/* Right Sidebar (Social & Meta) */}
          <aside className="w-80 bg-background-dark border-l border-border-dark hidden xl:flex flex-col overflow-y-auto">
            <div className="p-6 flex flex-col gap-8">
              {/* Friend Activity */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">Friend Activity</h3>
                  <button className="size-6 bg-surface-dark hover:bg-border-dark rounded flex items-center justify-center text-text-secondary transition-colors">
                    <span className="material-symbols-outlined text-sm">more_horiz</span>
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="text-center py-8">
                    <p className="text-text-secondary text-sm">No friend activity yet</p>
                  </div>
                </div>
                <button className="text-xs text-primary hover:underline self-start">View all friends</button>
              </div>

              <div className="h-px bg-border-dark w-full"></div>

              {/* Course Summary Widget */}
              <div className="flex flex-col gap-4">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Learning Progress</h3>
                <div className="text-center py-6">
                  <p className="text-text-secondary text-sm">Enroll in courses to track your progress</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
