"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('system'); // 'light', 'dark', 'system'

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

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    setIsThemeMenuOpen(false);
    // Here you would typically implement the actual theme switching logic
    // For example: document.documentElement.setAttribute('data-theme', theme);
  };

  const getCurrentThemeIcon = () => {
    switch (currentTheme) {
      case 'light':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'dark':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case 'system':
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="bg-white">
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
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 rounded-md hover:bg-gray-50"
              >
                About
              </Link>
              
              <Link 
                href="/services" 
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 rounded-md hover:bg-gray-50"
              >
                Services
              </Link>
              
              <Link 
                href="/blog" 
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 rounded-md hover:bg-gray-50"
              >
                Blog
              </Link>
              
              <Link 
                href="/contact" 
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 rounded-md hover:bg-gray-50"
              >
                Contact
              </Link>

              <Link 
                href="/sign-in" 
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 rounded-md hover:bg-gray-50"
              >
                Sign In
              </Link>
              
              {/* Sign Up Button */}
              <Link 
                href="/signup" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <span>Sign Up</span>
              </Link>

              {/* Theme Toggle */}
              <div className="relative">
                <button
                  onClick={toggleThemeMenu}
                  className="p-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  aria-label="Toggle theme"
                >
                  {getCurrentThemeIcon()}
                </button>
                
                {/* Theme Dropdown */}
                {isThemeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        currentTheme === 'light' ? 'text-purple-600 bg-purple-50' : 'text-gray-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Light
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        currentTheme === 'dark' ? 'text-purple-600 bg-purple-50' : 'text-gray-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Dark
                    </button>
                    <button
                      onClick={() => handleThemeChange('system')}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        currentTheme === 'system' ? 'text-purple-600 bg-purple-50' : 'text-gray-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      System
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-50 transition-colors"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <div className="py-4 space-y-2 border-t border-gray-100">
              <Link 
                href="/sign-in" 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 font-medium transition-colors rounded-md"
                onClick={closeMenu}
              >
                Sign In
              </Link>
              
              <Link 
                href="/about" 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 font-medium transition-colors rounded-md"
                onClick={closeMenu}
              >
                About
              </Link>
              
              <Link 
                href="/services" 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 font-medium transition-colors rounded-md"
                onClick={closeMenu}
              >
                Services
              </Link>
              
              <Link 
                href="/blog" 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 font-medium transition-colors rounded-md"
                onClick={closeMenu}
              >
                Blog
              </Link>
              
              <Link 
                href="/contact" 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 font-medium transition-colors rounded-md"
                onClick={closeMenu}
              >
                Contact Us
              </Link>
              
              {/* Mobile Sign Up Button */}
              <div className="pt-2">
                <Link 
                  href="/signup" 
                  className="block w-full px-4 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors text-center"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>

              {/* Mobile Theme Toggle */}
              <div className="pt-2 border-t border-gray-100">
                <div className="px-4 py-2 text-sm text-gray-500 font-medium">Theme</div>
                <div className="flex gap-2 px-4">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      currentTheme === 'light' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Light
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      currentTheme === 'dark' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Dark
                  </button>
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      currentTheme === 'system' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
          className="fixed inset-0 bg-black/20 lg:hidden z-40"
          onClick={closeMenu}
        />
      )}

      {/* Theme Menu Overlay */}
      {isThemeMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={closeThemeMenu}
        />
      )}
    </header>
  );
};

export default Header;