import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    setLogoutError('');
    setIsLoggingOut(true);

    try {
      await signOut();
      // Navigate to login after successful logout
      navigate('/auth/login', { replace: true });
    } catch (err: any) {
      setLogoutError(err.message || 'Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

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
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-dark hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">home</span>
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
                <span className="material-symbols-outlined">rule</span>
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors"
              >
                <span className="material-symbols-outlined filled">settings</span>
                <span className="text-sm font-medium">Settings</span>
              </a>
            </nav>
          </div>

          {/* User Profile Card */}
          <div className="flex flex-col gap-3 p-3 rounded-lg bg-surface-dark border border-border-dark">
            <div className="flex items-center gap-2">
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">account_circle</span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-text-secondary text-xs truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-background-dark border-b border-border-dark sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <p className="text-text-secondary text-sm">Manage your account and preferences</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Account Section */}
            <section className="bg-surface-dark border border-border-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">account_circle</span>
                Account Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white cursor-not-allowed opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-2">Display Name</label>
                  <input
                    type="text"
                    value={user?.displayName || ''}
                    disabled
                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white cursor-not-allowed opacity-60"
                  />
                </div>
              </div>
            </section>

            {/* Preferences Section */}
            <section className="bg-surface-dark border border-border-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">tune</span>
                Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-white font-medium">Dark Mode</p>
                    <p className="text-text-secondary text-sm">Always enabled in LinguaFabric</p>
                  </div>
                  <div className="size-6 bg-primary/20 rounded flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                </div>

                <div className="h-px bg-border-dark"></div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-text-secondary text-sm">Coming soon</p>
                  </div>
                  <div className="text-text-secondary opacity-40">
                    <span className="material-symbols-outlined">radio_button_unchecked</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Session Section */}
            <section className="bg-surface-dark border border-border-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">logout</span>
                Session
              </h3>

              <div className="flex flex-col gap-4">
                <p className="text-text-secondary text-sm">
                  You are currently logged in as <span className="text-white font-medium">{user?.email}</span>
                </p>

                {logoutError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {logoutError}
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
                </button>

                <p className="text-text-secondary text-xs text-center">
                  Clicking "Log Out" will clear your session and redirect you to the login page.
                </p>
              </div>
            </section>

            {/* About Section */}
            <section className="bg-surface-dark border border-border-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">info</span>
                About
              </h3>

              <div className="space-y-3 text-sm text-text-secondary">
                <p>
                  <span className="text-white font-medium">LinguaFabric v0.1</span>
                </p>
                <p>
                  A collaborative platform for designing custom languages and building linguistic resources.
                </p>
                <div className="flex gap-4 pt-2">
                  <a href="#" className="text-primary hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-primary hover:text-blue-400 transition-colors">
                    Terms of Service
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
