import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface PageShellProps {
  title: string;
  children: React.ReactNode;
}

/**
 * PageShell - Main layout wrapper with sidebar and header
 */
export const PageShell: React.FC<PageShellProps> = ({ title, children }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden dark">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full overflow-hidden relative">
        {/* Header */}
        <Header title={title} />

        {/* Page Content */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PageShell;
