import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7m-7 6h7"
          />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white p-6 h-full overflow-y-auto">
            <button
              className="absolute top-4 right-4 p-2"
              onClick={() => setIsOpen(false)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Mobile Navigation Links */}
            <nav className="space-y-4 mt-12">
              <a
                href="/"
                className="block px-4 py-3 text-lg font-medium text-gray-900 rounded-lg hover:bg-gray-100"
              >
                🏠 Home
              </a>
              <a
                href="/progress"
                className="block px-4 py-3 text-lg font-medium text-gray-900 rounded-lg hover:bg-gray-100"
              >
                📊 Progress
              </a>
              <a
                href="/stats"
                className="block px-4 py-3 text-lg font-medium text-gray-900 rounded-lg hover:bg-gray-100"
              >
                📈 Statistics
              </a>
              <a
                href="/optimization"
                className="block px-4 py-3 text-lg font-medium text-gray-900 rounded-lg hover:bg-gray-100"
              >
                🚀 Optimization
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
