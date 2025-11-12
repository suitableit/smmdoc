'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaExclamationTriangle, 
  FaSync,
  FaCog,
  FaDatabase,
  FaWhatsapp
} from 'react-icons/fa';

const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900"></div>
    </div>
  </div>
);

export default function DatabaseErrorPage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);

  const handleRetryConnection = async () => {
    setIsRetrying(true);

    try {

      const response = await fetch('/api/test-db', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {

        window.location.href = '/';
      } else {

        setTimeout(() => {
          setIsRetrying(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Retry connection failed:', error);
      setTimeout(() => {
        setIsRetrying(false);
      }, 2000);
    }
  };

  useEffect(() => {

    document.title = 'Database Connection Error - SMM Panel';

    const fetchDatabaseInfo = async () => {
      try {
        const response = await fetch('/api/database-info', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setDatabaseInfo(data.databaseInfo);
          }
        }
      } catch (error) {
        console.log('Failed to fetch database info:', error);
      }
    };

    const checkDatabaseStatus = async () => {
      try {
        const response = await fetch('/api/test-db', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (response.ok) {

          window.location.href = '/';
        }
      } catch (error) {

        console.log('Database still unavailable, staying on error page');
      }
    };

    fetchDatabaseInfo();
    checkDatabaseStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <FaDatabase className="w-10 h-10 text-white" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="w-3 h-3 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Database Connection Error
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We're experiencing technical difficulties. Please try again in a moment.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetryConnection}
              disabled={isRetrying}
              className="btn btn-primary inline-flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto min-w-[180px] relative overflow-hidden group"
            >
              {isRetrying ? (
                <>
                  <GradientSpinner size="sm" className="mr-3" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <FaSync className="w-4 h-4 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Refresh Connection</span>
                </>
              )}
            </button>

            <a
              href="https://wa.me/+8801723139610"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary inline-flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-lg transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto min-w-[180px] relative overflow-hidden text-white"
            >
              <FaWhatsapp className="w-4 h-4 mr-3" />
              <span>Contact Support</span>
            </a>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-[#5F1DE8] to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <FaCog className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Technical Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Service Status:</span>
                  <span className="text-red-600 dark:text-red-400 font-semibold">Disconnected</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Database Server:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                    {databaseInfo ? `${databaseInfo.host}:${databaseInfo.port}` : 'Loading...'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Database Name:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                    {databaseInfo ? databaseInfo.database : 'Loading...'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Username:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                    {databaseInfo ? databaseInfo.username : 'Loading...'}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Auto Retry:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">Enabled</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Error Code:</span>
                  <span className="text-red-600 dark:text-red-400 font-mono text-sm">DB_CONNECTION_FAILED</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Timestamp:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                    {databaseInfo ? databaseInfo.currentTime : new Date().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Last Connection:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                    {databaseInfo ? new Date(databaseInfo.lastAttempt).toLocaleString() : 'Checking...'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                <strong>Support Information:</strong> If this problem continues, please contact our support team with the error code above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}