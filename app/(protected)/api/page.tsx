'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { APP_NAME } from '@/lib/constants';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    FaBan,
    FaBook,
    FaCheckCircle,
    FaCode,
    FaCopy,
    FaDollarSign,
    FaExclamationTriangle,
    FaEye,
    FaEyeSlash,
    FaInfoCircle,
    FaKey,
    FaLifeRing,
    FaList,
    FaPlus,
    FaQuestionCircle,
    FaRedo,
    FaSpinner,
    FaSync,
    FaTimes,
} from 'react-icons/fa';

// Toast Component
const Toast = ({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'pending';
  onClose: () => void;
}) => (
  <div
    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
      type === 'success'
        ? 'bg-green-50 border-green-200 text-green-800'
        : type === 'error'
        ? 'bg-red-50 border-red-200 text-red-800'
        : type === 'info'
        ? 'bg-blue-50 border-blue-200 text-blue-800'
        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }`}
  >
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-black/10 rounded">
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

interface ServiceType {
  id: number;
  name: string;
  parameters: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
}

export default function ApiIntegrationPage() {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `API Integration — ${APP_NAME}`;
  }, []);

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServiceType, setSelectedServiceType] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'php' | 'python' | 'nodejs'>(
    'php'
  );
  const user = useCurrentUser();

  // Show toast notification
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    // Simulate API call to fetch API key
    const fetchApiKey = async () => {
      try {
        setIsLoading(true);
        // Simulate API response
        setTimeout(() => {
          setApiKey(
            'smmdoc_51NxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
          );
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching API key:', error);
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  const generateNewApiKey = async () => {
    setIsGeneratingKey(true);

    try {
      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newApiKey =
        'smmdoc_' +
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      setApiKey(newApiKey);
      setShowApiKey(true);

      showToast(
        'New API key generated successfully! Your previous API key is no longer valid.',
        'success'
      );
    } catch (error) {
      console.error('Error generating new API key:', error);
      showToast(
        'Failed to generate new API key. Please try again later.',
        'error'
      );
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        showToast(message, 'success');
      },
      (err) => {
        console.error('Could not copy text: ', err);
        showToast('Failed to copy to clipboard', 'error');
      }
    );
  };

  // Service types with all possible parameters
  const serviceTypes: ServiceType[] = [
    {
      id: 0,
      name: 'Default',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'quantity', description: 'Needed quantity', required: true },
        { name: 'runs (optional)', description: 'Runs to deliver' },
        { name: 'interval (optional)', description: 'Interval in minutes' },
      ],
    },
    {
      id: 10,
      name: 'Package',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
      ],
    },
    {
      id: 1,
      name: 'SEO',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'quantity', description: 'Needed quantity', required: true },
        {
          name: 'keywords',
          description: 'Keywords list separated by \\r\\n or \\n',
          required: true,
        },
      ],
    },
    {
      id: 2,
      name: 'Custom Comments',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        {
          name: 'comments',
          description: 'Comments list separated by \\r\\n or \\n',
          required: true,
        },
      ],
    },
    {
      id: 100,
      name: 'Subscriptions',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'username', description: 'Username', required: true },
        { name: 'min', description: 'Quantity min', required: true },
        { name: 'max', description: 'Quantity max', required: true },
        { name: 'delay', description: 'Delay in minutes', required: true },
      ],
    },
  ];

  const getCurrentServiceType = (): ServiceType => {
    return (
      serviceTypes.find((type) => type.id === selectedServiceType) ||
      serviceTypes[0]
    );
  };

  // Code examples
  const codeExamples = {
    php: `<?php
// API URL
$url = 'https://smmdoc.com/api/v2';

// API Key
$apiKey = '${apiKey || 'YOUR_API_KEY'}';

// Order details
$postData = [
    'key' => $apiKey,
    'action' => 'add',
    'service' => 1, // Service ID
    'link' => 'https://www.instagram.com/username',
    'quantity' => 100
];

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute request
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`,
    python: `import requests

url = 'https://smmdoc.com/api/v2'
api_key = '${apiKey || 'YOUR_API_KEY'}'

payload = {
    'key': api_key,
    'action': 'add',
    'service': 1,
    'link': 'https://www.instagram.com/username',
    'quantity': 100
}

response = requests.post(url, data=payload)
print(response.json())`,
    nodejs: `const axios = require('axios');

const url = 'https://smmdoc.com/api/v2';
const apiKey = '${apiKey || 'YOUR_API_KEY'}';

const payload = {
  key: apiKey,
  action: 'add',
  service: 1,
  link: 'https://www.instagram.com/username',
  quantity: 100
};

axios.post(url, payload)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`,
  };

  return (
    <div className="page-container">
      {/* Toast Container */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="page-content">
        <div className="space-y-6">
          {/* API Key Management Section */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaKey />
              </div>
              <h3 className="card-title">API Key Management</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Use this key to authenticate your API requests. Keep it secret
                and secure.
              </p>

              {isLoading ? (
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey || ''}
                      readOnly
                      className="form-field w-full pr-10 font-monow-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? (
                        <FaEyeSlash className="h-4 w-4" />
                      ) : (
                        <FaEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      apiKey &&
                      copyToClipboard(apiKey, 'API key copied to clipboard')
                    }
                    disabled={!apiKey}
                    className="btn btn-secondary"
                  >
                    <FaCopy className="h-4 w-4 mr-2" />
                    Copy
                  </button>
                  <button
                    onClick={generateNewApiKey}
                    disabled={isGeneratingKey}
                    className="btn btn-primary"
                  >
                    {isGeneratingKey ? (
                      <>
                        <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FaSync className="h-4 w-4 mr-2" />
                        Generate New Key
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <FaExclamationTriangle className="text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-yellow-800 font-medium">Important</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      Generating a new API key will invalidate your previous
                      key. Make sure to update your applications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API Documentation Overview */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaCode />
              </div>
              <h3 className="card-title">API Documentation</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    HTTP Method
                  </h4>
                  <p className="text-gray-600">POST</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">API URL</h4>
                  <p className="text-gray-600 font-mono text-sm">
                    https://smmdoc.com/api/v2
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Response Format
                  </h4>
                  <p className="text-gray-600">JSON</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">API Key</h4>
                  <p className="text-gray-600">Required for all requests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service List */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaList />
              </div>
              <h3 className="card-title">Service List</h3>
            </div>

            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Parameters
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">key</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Your API key
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">action</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        services
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Example Response
                </h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {`[
  {
    "service": 1,
    "name": "Followers",
    "type": "Default",
    "category": "Instagram",
    "rate": "0.90",
    "min": "50",
    "max": "10000"
  }
]`}
                </pre>
              </div>
            </div>
          </div>

          {/* Add Order */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaPlus />
              </div>
              <h3 className="card-title">Add Order</h3>
            </div>

            <div className="space-y-6">
              {/* Service Type Selector */}
              <div className="form-group">
                <label className="form-label">Service Type</label>
                <div className="relative">
                  <select
                    value={selectedServiceType}
                    onChange={(e) => setSelectedServiceType(Number(e.target.value))}
                    className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointe"
                  >
                    {serviceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parameters Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Parameters
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentServiceType().parameters.map((param, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">
                            {param.name}
                          </span>
                          {param.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {param.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Example Response
                </h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {`{
  "order": 23501
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaCheckCircle />
              </div>
              <h3 className="card-title">Order Status</h3>
            </div>

            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Parameters
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">key</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Your API key
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">action</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        status
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">order</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Order ID
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Example Response
                </h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {`{
  "charge": "0.27819",
  "start_count": "3572",
  "status": "Partial",
  "remains": "157",
  "currency": "USD"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Multiple Orders Status */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaList />
              </div>
              <h3 className="card-title">Multiple Orders Status</h3>
            </div>

            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Parameters
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">key</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Your API key
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">action</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        status
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">orders</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Order IDs (separated by a comma, up to 100 IDs)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Example Response
                </h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {`{
  "1": {
    "charge": "0.27819",
    "start_count": "3572",
    "status": "Partial",
    "remains": "157",
    "currency": "USD"
  },
  "10": {
    "error": "Incorrect order ID"
  },
  "100": {
    "charge": "1.44219",
    "start_count": "234",
    "status": "In progress",
    "remains": "10",
    "currency": "USD"
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Create Refill */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaRedo />
              </div>
              <h3 className="card-title">Create Refill</h3>
            </div>

            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Parameters
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">key</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Your API key
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">action</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        refill
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">order</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Order ID
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Example Response
                </h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {`{
  "refill": "1"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Create Multiple Refill */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaRedo />
              </div>
              <h3 className="card-title">Create Multiple Refill</h3>
            </div>

            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Parameters
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">key</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Your API key
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">action</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        refill
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">orders</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Order IDs (separated by a comma, up to 100 IDs)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Example Response
                </h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {`[
  {
    "order": 1,
    "refill": 1
  },
  {
    "order": 2,
    "refill": 2
  },
  {
    "order": 3,
    "refill": {
      "error": "Incorrect order ID"
    }
  }
]`}
                </pre>
              </div>
            </div>
          </div>

          {/* Get Refill Status */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaInfoCircle />
              </div>
              <h3 className="card-title">Get Refill Status</h3>
            </div>

            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Parameters
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">key</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Your API key
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">action</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        refill_status
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">refill</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Refill ID
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Example Response
                </h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {`{
  "status": "Completed"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Get Multiple Refill Status */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaInfoCircle />
              </div>
              <h3 className="card-title">Get Multiple Refill Status</h3>
            </div>

            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Parameters
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">key</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Your API key
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">action</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        refill_status
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">refills</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Refill IDs (separated by a comma, up to 100 IDs)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Example Response
                </h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {`[
  {
    "refill": 1,
    "status": "Completed"
  },
  {
    "refill": 2,
    "status": "Rejected"
  },
  {
    "refill": 3,
    "status": {
      "error": "Refill not found"
    }
  }
]`}
                </pre>
              </div>
            </div>
          </div>

          {/* Create Cancel */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaBan />
              </div>
              <h3 className="card-title">Create Cancel</h3>
            </div>

            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Parameters
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">key</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Your API key
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">action</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        cancel
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">orders</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Order IDs (separated by a comma, up to 100 IDs)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Example Response
                </h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {`[
  {
    "order": 9,
    "cancel": {
      "error": "Incorrect order ID"
    }
  },
  {
    "order": 2,
    "cancel": 1
  }
]`}
                </pre>
              </div>
            </div>
          </div>

          {/* User Balance */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaDollarSign />
              </div>
              <h3 className="card-title">User Balance</h3>
            </div>

            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Parameters
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">key</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Your API key
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">action</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        balance
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Example Response
                </h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {`{
  "balance": "100.84292",
  "currency": "USD"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaCode />
              </div>
              <h3 className="card-title">Code Examples</h3>
            </div>

            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('php')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'php'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  PHP
                </button>
                <button
                  onClick={() => setActiveTab('python')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'python'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setActiveTab('nodejs')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'nodejs'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Node.js
                </button>
              </div>

              {/* Tab Content */}
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    {activeTab === 'php' && 'PHP'}
                    {activeTab === 'python' && 'Python'}
                    {activeTab === 'nodejs' && 'Node.js'}
                  </h4>
                  <button
                    onClick={() => {
                      const currentCode =
                        activeTab === 'php'
                          ? codeExamples.php
                          : activeTab === 'python'
                          ? codeExamples.python
                          : codeExamples.nodejs;
                      copyToClipboard(
                        currentCode,
                        `${
                          activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                        } code copied to clipboard`
                      );
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <FaCopy className="h-4 w-4 mr-2" />
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>
                    {activeTab === 'php' && codeExamples.php}
                    {activeTab === 'python' && codeExamples.python}
                    {activeTab === 'nodejs' && codeExamples.nodejs}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="card card-padding">
            <div className="card-header">
              <div className="card-icon">
                <FaQuestionCircle />
              </div>
              <h3 className="card-title">Need Help?</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                If you need assistance with API integration, please contact our
                support team or check our detailed documentation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact-support"
                  className={`btn btn-secondary inline-flex items-center justify-center`}
                >
                  <FaLifeRing className="mr-2 w-4 h-4" />
                  Contact Support
                </Link>
                <Link
                  href="https://docs.smmdoc.com"
                  target="_blank"
                  className={`btn btn-secondary inline-flex items-center justify-center`}
                >
                  <FaBook className="mr-2 w-4 h-4" />
                  API Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
