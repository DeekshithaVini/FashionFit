
import React from 'react';
import { UserProfile } from '../types';

interface LayoutProps {
  user: UserProfile | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <h1 className="text-xl font-serif font-bold text-slate-900">FashionFit</h1>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500 hidden sm:inline">
                {user.email} ({user.gender})
              </span>
              <button 
                onClick={onLogout}
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h2 className="text-white font-bold mb-4">FashionFit AI</h2>
              <p className="text-sm">Revolutionizing personal styling with artificial intelligence and precise body mapping.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Privacy</h3>
              <p className="text-sm">Your photos and try-on results are stored securely in your private vault.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Powered By</h3>
              <p className="text-sm">Google MediaPipe & Gemini 1.5</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs">
            &copy; {new Date().getFullYear()} FashionFit. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
