'use client';
import { useEffect } from 'react';
import {
    FaCog,
    FaExclamationTriangle,
    FaHeadset,
    FaHome,
    FaRedo,
} from 'react-icons/fa';

export default function GlobalError() {
  useEffect(() => {
    console.error('404 Error page loaded');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="page-header text-center">
          <div className="flex justify-center mb-4">
            <div
              className="card-icon"
              style={{
                backgroundColor: 'var(--error-color, #ef4444)',
                color: 'white',
              }}
            >
              <FaExclamationTriangle />
            </div>
          </div>
          <h4 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-2 transition-colors duration-200">
            Something went wrong!
          </h4>
          <h1 className="page-title">
            Application{' '}
            <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
              Error
            </span>
          </h1>
          <p className="page-description max-w-2xl mx-auto">
            We're sorry, but an unexpected error has occurred in the
            application. This might be a temporary issue. You can try refreshing
            the page or return to the homepage to continue using our services.
          </p>

        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="card card-padding">
              <div className="card-header">
                <h3 className="card-title">What would you like to do?</h3>
              </div>

              <div className="space-y-4">
                <button
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                  onClick={() => window.location.reload()}
                >
                  <FaRedo className="w-4 h-4" />
                  <span>Refresh Page</span>
                </button>

                <button
                  className="btn btn-secondary w-full flex items-center justify-center gap-2"
                  onClick={() => (window.location.href = '/')}
                >
                  <FaHome className="w-4 h-4" />
                  <span>Go to Homepage</span>
                </button>
              </div>
            </div>
            <div className="card card-padding mt-6">
              <div className="card-header">
                <h3 className="card-title">Quick Links</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  className="form-field text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                  onClick={() => (window.location.href = '/dashboard')}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <FaHome className="w-4 h-4 text-[var(--primary)] dark:text-[var(--secondary)]" />
                    Dashboard
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Go to your main dashboard
                  </div>
                </button>

                <button
                  className="form-field text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                  onClick={() => (window.location.href = '/contact-support')}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <FaHeadset className="w-4 h-4 text-[var(--primary)] dark:text-[var(--secondary)]" />
                    Contact Support
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Get help from our support team
                  </div>
                </button>

                <button
                  className="form-field text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                  onClick={() => window.location.reload()}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <FaRedo className="w-4 h-4 text-[var(--primary)] dark:text-[var(--secondary)]" />
                    Try Again
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Refresh and try again
                  </div>
                </button>

                <button
                  className="form-field text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                  onClick={() => (window.location.href = '/account-settings')}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <FaCog className="w-4 h-4 text-[var(--primary)] dark:text-[var(--secondary)]" />
                    Account Settings
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Manage your account settings
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
