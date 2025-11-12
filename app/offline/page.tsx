'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  FaExclamationTriangle, 
  FaSync,
  FaCog,
  FaWifi,
  FaWhatsapp,
  FaCheck
} from 'react-icons/fa';
import { WifiOff } from 'lucide-react';

const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900"></div>
    </div>
  </div>
);

interface PageState {
  path: string;
  title: string;
  timestamp: number;
}

interface ConnectionInfo {
  browser: string;
  platform: string;
  ipAddress: string;
  lastAttempt: string;
}

export default function OfflinePage() {
  const searchParams = useSearchParams();
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    browser: 'Unknown',
    platform: 'Unknown',
    ipAddress: 'Unavailable',
    lastAttempt: new Date().toLocaleString()
  });

  const [currentPageState, setCurrentPageState] = useState<PageState | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [isDetectingIP, setIsDetectingIP] = useState(true);

  const handleRetryConnection = async () => {
    setIsRetrying(true);

    try {

      const response = await fetch('/api/test-db', { 
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {

        const fromParam = searchParams.get('from');
        window.location.href = fromParam || '/';
      } else {

        setConnectionInfo(prev => ({
          ...prev,
          lastAttempt: new Date().toLocaleString()
        }));
      }
    } catch (error) {

      setConnectionInfo(prev => ({
        ...prev,
        lastAttempt: new Date().toLocaleString()
      }));
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {

    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);

      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || 'unknown');
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    updateOnlineStatus();

    const getCurrentPageState = () => {
      const fromParam = searchParams.get('from');
      const titleParam = searchParams.get('title');
      const errorParam = searchParams.get('error');
      const currentPath = fromParam || document.referrer || '/';

      let pagePath = currentPath;
      if (currentPath.startsWith('http')) {
        try {
          const url = new URL(currentPath);
          pagePath = url.pathname;
        } catch (error) {
          pagePath = '/';
        }
      }

      let pageTitle = titleParam || document.title || 'SMM Doc';
      if (!titleParam && (pageTitle === 'SMM Doc' || pageTitle.includes('Offline'))) {

        if (pagePath === '/') {
          pageTitle = 'Homepage';
        } else if (pagePath === '/services') {
          pageTitle = 'Services';
        } else {
          pageTitle = pagePath.split('/').filter(Boolean).map(segment => 
            segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
          ).join(' - ');
        }
      }

      return {
        path: pagePath,
        title: pageTitle,
        timestamp: Date.now(),
        error: errorParam || 'unknown'
      };
    };

    setCurrentPageState(getCurrentPageState());

    const getBrowserInfo = () => {
      const userAgent = navigator.userAgent;
      let browser = 'Unknown';

      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome';
      } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
      } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
      } else if (userAgent.includes('Edg')) {
        browser = 'Edge';
      } else if (userAgent.includes('Opera')) {
        browser = 'Opera';
      }

      return browser;
    };

    const getPlatformInfo = () => {
      const platform = navigator.platform;
      const userAgent = navigator.userAgent;

      if (platform.includes('Win')) return 'Windows';
      if (platform.includes('Mac')) return 'macOS';
      if (platform.includes('Linux')) return 'Linux';
      if (userAgent.includes('Android')) return 'Android';
      if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';

      return platform || 'Unknown';
    };

    const getIPAddress = async () => {
      try {

        if (navigator.onLine) {
          try {

            const ipServices = [
              'https://api.ipify.org?format=json',
              'https://ipapi.co/json/',
              'https://api.ip.sb/jsonip'
            ];

            for (const service of ipServices) {
              try {
                const response = await fetch(service, {
                  method: 'GET',
                  signal: AbortSignal.timeout(3000)
                });

                if (response.ok) {
                  const data = await response.json();
                  let ip = data.ip || data.query || data.IPv4;

                  if (ip) {

                    localStorage.setItem('user-ip', ip);
                    localStorage.setItem('user-ip-timestamp', Date.now().toString());
                    return ip;
                  }
                }
              } catch (serviceError) {

                continue;
              }
            }
          } catch (error) {

          }
        }

        const storedIP = localStorage.getItem('user-ip');
        const storedTimestamp = localStorage.getItem('user-ip-timestamp');

        if (storedIP && storedTimestamp) {
          const age = Date.now() - parseInt(storedTimestamp);
          const twentyFourHours = 24 * 60 * 60 * 1000;

          if (age < twentyFourHours) {
            return storedIP;
          }
        }

        return new Promise<string>((resolve) => {
          const rtc = new RTCPeerConnection({ iceServers: [] });
          rtc.createDataChannel('');

          rtc.onicecandidate = (event) => {
            if (event.candidate) {
              const candidate = event.candidate.candidate;
              const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
              if (ipMatch) {
                resolve(ipMatch[1]);
                rtc.close();
              }
            }
          };

          rtc.createOffer().then(offer => rtc.setLocalDescription(offer));

          setTimeout(() => {
            resolve('Unable to detect');
            rtc.close();
          }, 3000);
        });
      } catch (error) {
        return 'Unable to detect';
      }
    };

    const initializeConnectionInfo = async () => {
      setIsDetectingIP(true);
      const ipAddress = await getIPAddress();

      setConnectionInfo({
        browser: getBrowserInfo(),
        platform: getPlatformInfo(),
        ipAddress,
        lastAttempt: new Date().toLocaleString()
      });
      setIsDetectingIP(false);
    };

    initializeConnectionInfo();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const formatPagePath = (path: string) => {
    if (path === '/') return 'Homepage';
    return path.split('/').filter(Boolean).map(segment => 
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    ).join(' > ');
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 bg-gradient-to-r ${isOnline ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600'} rounded-full flex items-center justify-center mx-auto mb-6 relative`}>
              {isOnline ? (
                <FaWifi className="w-10 h-10 text-white" />
              ) : (
                <WifiOff className="w-10 h-10 text-white" />
              )}
              <div className={`absolute -top-1 -right-1 w-6 h-6 ${isOnline ? 'bg-green-500' : 'bg-yellow-500'} rounded-full flex items-center justify-center`}>
                {isOnline ? (
                  <FaCheck className="w-3 h-3 text-white" />
                ) : (
                  <FaExclamationTriangle className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {isOnline ? "Connection Available" : "You're Offline"}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              {isOnline 
                ? "Your internet connection is working. You can navigate back to the application."
                : "No internet connection detected. Please check your network settings."
              }
            </p>
            {currentPageState && !isOnline && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You were viewing: <span className="font-semibold text-gray-700 dark:text-gray-300">{currentPageState.title}</span>
                {currentPageState.path !== '/' && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">({currentPageState.path})</span>
                )}
              </p>
            )}
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
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <FaSync className="w-4 h-4 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Retry Connection</span>
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Connection Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Connection Status:</span>
                  <span className={`font-semibold ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Browser:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                    {connectionInfo.browser}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Platform:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                    {connectionInfo.platform}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">IP Address:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                    {isDetectingIP ? (
                      <span className="text-blue-600 dark:text-blue-400 animate-pulse">Detecting...</span>
                    ) : (
                      connectionInfo.ipAddress
                    )}
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
                  <span className="text-red-600 dark:text-red-400 font-mono text-sm">
                    {isOnline ? 'NETWORK_AVAILABLE' : 'NETWORK_OFFLINE'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Last Attempt:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                    {connectionInfo.lastAttempt}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Detection Time:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                    {currentPageState ? formatTimestamp(currentPageState.timestamp) : 'Just now'}
                  </span>
                </div>
              </div>
            </div>

            {!isOnline && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800 mt-6">
                 <p className="text-orange-700 dark:text-orange-300 text-sm">
                   <span className="font-semibold text-orange-800 dark:text-orange-200">Troubleshooting Tips:</span> Check your Wi-Fi or ethernet connection. Restart your router or modem. Try accessing other websites to verify connectivity. Contact your internet service provider if the issue persists.
                 </p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}