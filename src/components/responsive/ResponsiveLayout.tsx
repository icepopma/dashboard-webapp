import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MobileMenu } from '@/components/responsive/MobileMenu';

interface ResponsiveLayoutContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const ResponsiveLayoutContext = createContext<ResponsiveLayoutContextType | undefined>(undefined);

export function useResponsiveLayout() {
  const context = useContext(ResponsiveLayoutContext);
  if (!context) {
    throw new Error('useResponsiveLayout must be used within ResponsiveLayoutProvider');
  }
  return context;
}

export function ResponsiveLayoutProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Close sidebar on route change on mobile
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile, setSidebarOpen]);

  return (
    <ResponsiveLayoutContext.Provider
      value={{
        isMobile,
        isTablet,
        isDesktop,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </ResponsiveLayoutContext.Provider>
  );
}

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useResponsiveLayout();
  const pathname = usePathname();

  // Hide navigation on certain pages
  const hideNavigation = pathname === '/idea/[id]';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation */}
      {!isMobile && !hideNavigation && (
        <header className="sticky top-0 z-50 bg-white border-b border-border">
          <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <a href="/" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <span className="text-2xl">🫧</span>
                <span className="font-semibold text-gray-900">Dashboard</span>
              </a>
              <div className="flex items-center gap-1">
                <a href="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  Home
                </a>
                <a href="/progress" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/progress' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  Progress
                </a>
                <a href="/stats" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/stats' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  Statistics
                </a>
                <a href="/optimization" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/optimization' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  Optimization
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/icepopma/dashboard-webapp" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12 6.477 2 12 10c0 5.523 4 10 10 10s4.477 2 10 10-2c0-5.523-4-10-10-10-2C2 6.477 2 6.477 2 12 2 17.523 4 2 22 2 22zm0 18c-5.523 0 10-4.477 2-10 10s-4.477 2 10 10 2c5.523 0 10-4.477 2-10 10-2c5.523-0 10-4.477-2-10 10-2zm-3-8c0-3.314-2.686-6-6s-2.686-6-6-6c0-3.314 2.686-6 6 6-6-686 6-6c-3.314 2.686 6 12 6 12zm-4 0c-4.418 0 8-3.582 8-8s-3.582 8-8 8 3.582 8 8z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </nav>
        </header>
      )}

      {/* Mobile Navigation */}
      {isMobile && !hideNavigation && <MobileMenu />}

      {/* Main Content */}
      <main className={isMobile ? 'pt-16' : 'pt-20'}>
        {children}
      </main>
    </div>
  );
}
