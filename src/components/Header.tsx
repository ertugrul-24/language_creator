import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Header - Top navigation and page title bar
 */
export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="h-16 flex items-center justify-between border-b border-border-dark px-6 bg-background-dark/80 backdrop-blur-md z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-text-secondary hover:text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-text-secondary text-sm">
          <span>Studio</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-white font-medium">{title}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-surface-dark rounded-lg px-3 py-2 w-64 border border-transparent focus-within:border-primary/50 transition-colors">
          <span className="material-symbols-outlined text-text-secondary text-[20px]">search</span>
          <input
            className="bg-transparent border-none text-sm text-white placeholder-text-secondary focus:ring-0 w-full ml-2 p-0"
            placeholder="Search..."
            type="text"
          />
        </div>

        {/* Action Buttons */}
        <button className="size-10 flex items-center justify-center rounded-lg hover:bg-surface-dark text-text-secondary transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full border-2 border-background-dark"></span>
        </button>
        <button className="size-10 flex items-center justify-center rounded-lg hover:bg-surface-dark text-text-secondary transition-colors">
          <span className="material-symbols-outlined">help</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
