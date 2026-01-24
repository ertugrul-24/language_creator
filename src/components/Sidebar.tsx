import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Sidebar - Main navigation sidebar
 */
export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/languages', label: 'Languages', icon: 'language' },
    { path: '/dictionary', label: 'Dictionary', icon: 'menu_book' },
    { path: '/grammar', label: 'Grammar', icon: 'spellcheck' },
    { path: '/courses', label: 'Courses', icon: 'school' },
  ];

  return (
    <aside className="w-64 flex-col bg-background-dark border-r border-border-dark hidden md:flex">
      <div className="flex h-full flex-col justify-between p-4">
        {/* Logo Section */}
        <div className="flex flex-col gap-6">
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
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-surface-dark hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined ${isActive(item.path) ? 'filled' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-2">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-dark hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </Link>

          {/* User Profile */}
          <div className="flex items-center gap-3 px-3 py-4 border-t border-border-dark mt-2">
            <div className="size-8 rounded-full bg-cover bg-center" style={{
              backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}')`
            }}></div>
            <div className="flex flex-col">
              <p className="text-white text-sm font-medium">{user?.displayName || user?.email || 'User'}</p>
              <p className="text-text-secondary text-xs">Free Plan</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
