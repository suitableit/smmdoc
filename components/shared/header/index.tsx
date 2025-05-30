"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
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
                About Us
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
                Contact Us
              </Link>

              <Link 
                href="/login" 
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 rounded-md hover:bg-gray-50"
              >
                Sign in
              </Link>
              
              {/* Sign Up Button */}
              <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <span>Sign Up</span>
            </Link>
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
                href="/login" 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 font-medium transition-colors rounded-md"
                onClick={closeMenu}
              >
                Sign in
              </Link>
              
              <Link 
                href="/about" 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 font-medium transition-colors rounded-md"
                onClick={closeMenu}
              >
                About Us
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
    </header>
  );
};

export default Header;