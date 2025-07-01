'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaDesktop, FaMoon, FaSun } from 'react-icons/fa';

// Enhanced Dropdown Components (you'll need to install these or use your existing dropdown)
const DropdownMenu = ({ children }: { children: React.ReactNode }) => (
  <div className="relative inline-block">{children}</div>
);

const DropdownMenuTrigger = ({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) => <>{children}</>;

const DropdownMenuContent = ({
  align,
  className,
  style,
  children,
}: {
  align?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => (
  <div
    className={`absolute mt-2 z-50 ${
      align === 'end' ? 'right-0' : 'left-0'
    } ${className}`}
    style={style}
  >
    {children}
  </div>
);

// Enhanced Theme Toggle Component (cloned from dashboard)
const ThemeToggle = () => {
  const [theme, setTheme] = useState('system'); // 'light', 'dark', 'system'
  const [mounted, setMounted] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
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

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setIsThemeMenuOpen(false);

    if (newTheme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', newTheme);
    }

    applyTheme(newTheme);
  };

  if (!mounted) {
    return (
      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center animate-pulse">
        <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-gray-200 dark:bg-gray-600"></div>
      </div>
    );
  }

  const themeOptions = [
    { key: 'light', label: 'Light', icon: FaSun },
    { key: 'dark', label: 'Dark', icon: FaMoon },
    { key: 'system', label: 'System', icon: FaDesktop },
  ];

  const currentTheme =
    themeOptions.find((option) => option.key === theme) || themeOptions[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
        className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm ml-4"
        aria-label="Toggle theme"
      >
        <CurrentIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-300 transition-colors duration-200" />
      </button>

      {/* Theme Dropdown */}
      {isThemeMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsThemeMenuOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 transition-colors duration-200">
            <div className="p-1">
              {themeOptions.map((option) => {
                const IconComponent = option.icon;
                const isActive = theme === option.key;

                return (
                  <button
                    key={option.key}
                    onClick={() => handleThemeChange(option.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-[var(--primary)] text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent
                      className={`h-4 w-4 transition-colors duration-200 ml-1 ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    />
                    <span className="font-medium text-sm">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
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
                alt="SMMDOC"
                width={400}
                height={50}
                className="h-16 w-auto max-w-[400px]"
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
                <span className="pl-2">Sign Up</span>
              </Link>

              {/* Enhanced Theme Toggle */}
              <ThemeToggle />
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

              {/* Mobile Enhanced Theme Toggle */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Theme
                </div>
                <div className="flex gap-2 px-4">
                  <ThemeToggle />
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
    </header>
  );
};

export default Header;