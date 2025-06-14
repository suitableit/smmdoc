'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('system'); // 'light', 'dark', 'system'
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') || 'system';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme: string) => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      root.classList.remove('dark');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      }
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleThemeMenu = () => {
    setIsThemeMenuOpen(!isThemeMenuOpen);
  };

  const closeThemeMenu = () => {
    setIsThemeMenuOpen(false);
  };

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    setIsThemeMenuOpen(false);

    if (theme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', theme);
    }

    applyTheme(theme);
  };

  const getCurrentThemeIcon = () => {
    switch (currentTheme) {
      case 'light':
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      case 'dark':
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        );
      case 'system':
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[var(--header-bg)] shadow-sm dark:shadow-lg dark:shadow-black/20 transition-colors duration-200">
      <nav className="bg-white dark:bg-[var(--header-bg)]">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="SMMGEN"
                width={400}
                height={50}
                className="h-20 w-auto max-w-[400px]"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                href="/about"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] font-medium transition-colors duration-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                About
              </Link>

              <Link
                href="/our-services"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] font-medium transition-colors duration-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                Services
              </Link>

              <Link
                href="/blog"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] font-medium transition-colors duration-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                Blog
              </Link>

              <Link
                href="/contact"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] font-medium transition-colors duration-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                Contact
              </Link>

              <Link
                href="/sign-in"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] font-medium transition-colors duration-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                Sign In
              </Link>

              {/* Sign Up Button */}
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-[#4F0FD8] hover:to-[#A121E8]"
              >
                <span>Sign Up</span>
              </Link>

              {/* Theme Toggle */}
              <div className="relative">
                <button
                  onClick={toggleThemeMenu}
                  className="p-3 text-gray-700 dark:text-gray-300 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md transition-colors duration-200"
                  aria-label="Toggle theme"
                >
                  {getCurrentThemeIcon()}
                </button>

                {/* Theme Dropdown */}
                {isThemeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#2A2D3A] rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2 transition-colors ${
                        currentTheme === 'light'
                          ? 'text-[var(--primary)] bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      Light
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2 transition-colors ${
                        currentTheme === 'dark'
                          ? 'text-[var(--primary)] bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                      </svg>
                      Dark
                    </button>
                    <button
                      onClick={() => handleThemeChange('system')}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2 transition-colors ${
                        currentTheme === 'system'
                          ? 'text-[var(--primary)] bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 00-2-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      System
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              type="button"
              onClick={toggleMenu}
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          <div
            className={`lg:hidden transition-all duration-300 ease-in-out ${
              isMenuOpen
                ? 'max-h-96 opacity-100'
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="py-4 space-y-2 border-t border-gray-100 dark:border-gray-700">
              <Link
                href="/sign-in"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium transition-colors rounded-md"
                onClick={closeMenu}
              >
                Sign In
              </Link>

              <Link
                href="/about"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium transition-colors rounded-md"
                onClick={closeMenu}
              >
                About
              </Link>

              <Link
                href="/dashboard/services"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium transition-colors rounded-md"
                onClick={closeMenu}
              >
                Services
              </Link>

              <Link
                href="/blog"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium transition-colors rounded-md"
                onClick={closeMenu}
              >
                Blog
              </Link>

              <Link
                href="/contact"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium transition-colors rounded-md"
                onClick={closeMenu}
              >
                Contact Us
              </Link>

              {/* Mobile Sign Up Button */}
              <div className="pt-2">
                <Link
                  href="/sign-up"
                  className="block w-full px-4 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold rounded-md hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-200 text-center"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>

              {/* Mobile Theme Toggle */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Theme
                </div>
                <div className="flex gap-2 px-4">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      currentTheme === 'light'
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    Light
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      currentTheme === 'dark'
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                    Dark
                  </button>
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      currentTheme === 'system'
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 00-2-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    System
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 lg:hidden z-40"
          onClick={closeMenu}
        />
      )}

      {/* Theme Menu Overlay */}
      {isThemeMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={closeThemeMenu} />
      )}
    </header>
  );
};

export default Header;
