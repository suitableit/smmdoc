'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Copy, Eye, EyeOff, RefreshCw, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ServiceType {
  id: string;
  name: string;
  parameters: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
}

export default function ApiIntegrationPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServiceType, setSelectedServiceType] = useState<string>('0');
  const user = useCurrentUser();
  
  useEffect(() => {
    // Simulate API call to fetch API key
    const fetchApiKey = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        // const response = await fetch('/api/user/api-key');
        // const data = await response.json();
        
        // For demo, simulate API response
        setTimeout(() => {
          setApiKey('sk_live_51NxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
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
      // In a real app, this would be an API call
      // const response = await fetch('/api/user/api-key/generate', { method: 'POST' });
      // const data = await response.json();
      
      // For demo, simulate API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newApiKey = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setApiKey(newApiKey);
      setShowApiKey(true);
      
      toast.success('New API key generated successfully', {
        description: 'Your previous API key is no longer valid.',
      });
    } catch (error) {
      console.error('Error generating new API key:', error);
      toast.error('Failed to generate new API key', {
        description: 'Please try again later.',
      });
    } finally {
      setIsGeneratingKey(false);
    }
  };
  
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(message);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast.error('Failed to copy to clipboard');
      }
    );
  };

  // Service types with all possible parameters (from original HTML)
  const serviceTypes: ServiceType[] = [
    {
      id: '0',
      name: 'Default',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'quantity', description: 'Needed quantity', required: true },
        { name: 'runs (optional)', description: 'Runs to deliver' },
        { name: 'interval (optional)', description: 'Interval in minutes' },
      ]
    },
    {
      id: '10',
      name: 'Package',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
      ]
    },
    {
      id: '1',
      name: 'SEO',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'quantity', description: 'Needed quantity', required: true },
        { name: 'keywords', description: 'Keywords list separated by \\r\\n or \\n', required: true },
      ]
    },
    {
      id: '2',
      name: 'Custom Comments',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'comments', description: 'Comments list separated by \\r\\n or \\n', required: true },
      ]
    },
    {
      id: '9',
      name: 'Mentions',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'quantity', description: 'Needed quantity', required: true },
        { name: 'usernames', description: 'Usernames list separated by \\r\\n or \\n', required: true },
      ]
    },
    {
      id: '3',
      name: 'Mentions with Hashtags',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'quantity', description: 'Needed quantity', required: true },
        { name: 'usernames', description: 'Usernames list separated by \\r\\n or \\n', required: true },
        { name: 'hashtags', description: 'Hashtags list separated by \\r\\n or \\n', required: true },
      ]
    },
    {
      id: '4',
      name: 'Mentions Custom List',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'usernames', description: 'Usernames list separated by \\r\\n or \\n', required: true },
      ]
    },
    {
      id: '6',
      name: 'Mentions Hashtag',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'quantity', description: 'Needed quantity', required: true },
        { name: 'hashtag', description: 'Hashtag to scrape usernames from', required: true },
      ]
    },
    {
      id: '7',
      name: 'Mentions User Followers',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'quantity', description: 'Needed quantity', required: true },
        { name: 'username', description: 'URL to scrape followers from', required: true },
      ]
    },
    {
      id: '8',
      name: 'Mentions Media Likers',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'quantity', description: 'Needed quantity', required: true },
        { name: 'media', description: 'Media URL to scrape likers from', required: true },
      ]
    },
    {
      id: '14',
      name: 'Custom Comments Package',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'comments', description: 'Comments list separated by \\r\\n or \\n', required: true },
      ]
    },
    {
      id: '15',
      name: 'Comment Likes',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'quantity', description: 'Needed quantity', required: true },
        { name: 'username', description: 'Username of the comment owner', required: true },
      ]
    },
    {
      id: '17',
      name: 'Poll',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'quantity', description: 'Needed quantity', required: true },
        { name: 'answer_number', description: 'Answer number of the poll', required: true },
      ]
    },
    {
      id: '20',
      name: 'Invites from Groups',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'quantity', description: 'Needed quantity', required: true },
        { name: 'groups', description: 'Groups list separated by \\r\\n or \\n', required: true },
      ]
    },
    {
      id: '100',
      name: 'Subscriptions',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'username', description: 'Username', required: true },
        { name: 'min', description: 'Quantity min', required: true },
        { name: 'max', description: 'Quantity max', required: true },
        { name: 'posts (optional)', description: 'Use this parameter if you want to limit the number of new (future) posts that will be parsed and for which orders will be created. If posts parameter is not set, the subscription will be created for an unlimited number of posts.' },
        { name: 'old_posts (optional)', description: 'Number of existing posts that will be parsed and for which orders will be created, can be used if this option is available for the service.' },
        { name: 'delay', description: 'Delay in minutes. Possible values: 0, 5, 10, 15, 20, 30, 40, 50, 60, 90, 120, 150, 180, 210, 240, 270, 300, 360, 420, 480, 540, 600', required: true },
        { name: 'expiry (optional)', description: 'Expiry date. Format d/m/Y' },
      ]
    },
    {
      id: '102',
      name: 'Web Traffic',
      parameters: [
        { name: 'key', description: 'Your API key', required: true },
        { name: 'action', description: 'add', required: true },
        { name: 'service', description: 'Service ID', required: true },
        { name: 'link', description: 'Link to page', required: true },
        { name: 'quantity', description: 'Needed quantity', required: true },
        { name: 'runs (optional)', description: 'Runs to deliver' },
        { name: 'interval (optional)', description: 'Interval in minutes' },
        { name: 'country', description: 'Country code or full country name. Format: "US" or "United States"', required: true },
        { name: 'device', description: 'Device name. 1 - Desktop, 2 - Mobile (Android), 3 - Mobile (IOS), 4 - Mixed (Mobile), 5 - Mixed (Mobile & Desktop)', required: true },
        { name: 'type_of_traffic', description: '1 - Google Keyword, 2 - Custom Referrer, 3 - Blank Referrer', required: true },
        { name: 'google_keyword', description: 'required if type_of_traffic = 1' },
        { name: 'referring_url', description: 'required if type_of_traffic = 2' },
      ]
    },
  ];

  const getCurrentServiceType = (): ServiceType => {
    return serviceTypes.find(type => type.id === selectedServiceType) || serviceTypes[0];
  };
  
  // Updated code examples to use the real API endpoint
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
    'link' => 'https://www.instagram.com/username', // Link to your profile/post
    'quantity' => 100 // Number of followers/likes/etc.
];

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded'
]);

// Execute cURL request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Process response
if ($httpCode === 200) {
    $result = json_decode($response, true);
    echo "Order created successfully! Order ID: " . $result['order'];
} else {
    echo "Error: " . $response;
}
?>`,
    python: `import requests

# API URL
url = 'https://smmdoc.com/api/v2'

# API Key
api_key = '${apiKey || 'YOUR_API_KEY'}'

# Order details
payload = {
    'key': api_key,
    'action': 'add',
    'service': 1,  # Service ID
    'link': 'https://www.instagram.com/username',  # Link to your profile/post
    'quantity': 100  # Number of followers/likes/etc.
}

# Headers
headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
}

# Make the request
response = requests.post(url, data=payload, headers=headers)

# Process response
if response.status_code == 200:
    result = response.json()
    print(f"Order created successfully! Order ID: {result['order']}")
else:
    print(f"Error: {response.text}")`,
    nodejs: `const axios = require('axios');
const querystring = require('querystring');

// API URL
const url = 'https://smmdoc.com/api/v2';

// API Key
const apiKey = '${apiKey || 'YOUR_API_KEY'}';

// Order details
const payload = {
  key: apiKey,
  action: 'add',
  service: 1, // Service ID
  link: 'https://www.instagram.com/username', // Link to your profile/post
  quantity: 100 // Number of followers/likes/etc.
};

// Headers
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

// Make the request
axios.post(url, querystring.stringify(payload), { headers })
  .then(response => {
    console.log(\`Order created successfully! Order ID: \${response.data.order}\`);
  })
  .catch(error => {
    console.error(\`Error: \${error.response ? error.response.data : error.message}\`);
  });`,
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* API Key Management Section */}
        <Card>
          <CardHeader>
            <CardTitle>API Integration</CardTitle>
            <CardDescription>
              Integrate our services directly into your application using our API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Your API Key</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use this key to authenticate your API requests. Keep it secret and secure.
                </p>
                
                {isLoading ? (
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey || ''}
                        readOnly
                        className="pr-10 font-mono"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => apiKey && copyToClipboard(apiKey, 'API key copied to clipboard')}
                      disabled={!apiKey}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={generateNewApiKey}
                      disabled={isGeneratingKey}
                    >
                      {isGeneratingKey ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Generate New Key
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                <Alert className="mt-4">
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Generating a new API key will invalidate your previous key. Make sure to update your applications.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Documentation Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              API Documentation
            </CardTitle>
            <CardDescription>
              Complete API reference and integration guide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold bg-muted w-2/5">HTTP Method</TableCell>
                  <TableCell>POST</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold bg-muted">API URL</TableCell>
                  <TableCell>https://smmdoc.com/api/v2</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold bg-muted">API Key</TableCell>
                  <TableCell>
                    Get an API key on the{' '}
                    <a href="/account" className="text-purple-600 hover:text-purple-800 underline">
                      Account
                    </a>{' '}
                    page
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold bg-muted">Response format</TableCell>
                  <TableCell>JSON</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-6">
              <Button variant="outline" asChild>
                <a href="/example.txt" target="_blank" rel="noopener noreferrer">
                  Example of PHP code
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Service List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              Service List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Parameters</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>key</TableCell>
                  <TableCell>Your API key</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>action</TableCell>
                  <TableCell>services</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-6">
              <p className="font-semibold text-gray-900 mb-3">Example response</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`[
    {
        "service": 1,
        "name": "Followers",
        "type": "Default",
        "category": "First Category",
        "rate": "0.90",
        "min": "50",
        "max": "10000",
        "refill": true,
        "cancel": true
    },
    {
        "service": 2,
        "name": "Comments",
        "type": "Custom Comments",
        "category": "Second Category",
        "rate": "8",
        "min": "10",
        "max": "1500",
        "refill": false,
        "cancel": true
    }
]`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Add Order */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              Add Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Service Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Service Type</label>
              <div className="relative">
                <select
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value)}
                  className="w-full px-4 py-2 pr-8 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background appearance-none"
                >
                  {serviceTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Parameters Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Parameters</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentServiceType().parameters.map((param, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">{param.name}</TableCell>
                    <TableCell>{param.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6">
              <p className="font-semibold mb-3">Example response</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
    "order": 23501
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Parameters</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>key</TableCell>
                  <TableCell>Your API key</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>action</TableCell>
                  <TableCell>status</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>order</TableCell>
                  <TableCell>Order ID</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-6">
              <p className="font-semibold mb-3">Example response</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
    "charge": "0.27819",
    "start_count": "3572",
    "status": "Partial",
    "remains": "157",
    "currency": "USD"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Multiple Orders Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              Multiple Orders Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Parameters</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>key</TableCell>
                  <TableCell>Your API key</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>action</TableCell>
                  <TableCell>status</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>orders</TableCell>
                  <TableCell>Order IDs (separated by a comma, up to 100 IDs)</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-6">
              <p className="font-semibold mb-3">Example response</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
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
          </CardContent>
        </Card>

        {/* Create Refill */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
              Create Refill
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Parameters</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>key</TableCell>
                  <TableCell>Your API key</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>action</TableCell>
                  <TableCell>refill</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>order</TableCell>
                  <TableCell>Order ID</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-6">
              <p className="font-semibold mb-3">Example response</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
    "refill": "1"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Create Multiple Refill */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
              Create Multiple Refill
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Parameters</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>key</TableCell>
                  <TableCell>Your API key</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>action</TableCell>
                  <TableCell>refill</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>orders</TableCell>
                  <TableCell>Order IDs (separated by a comma, up to 100 IDs)</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-6">
              <p className="font-semibold mb-3">Example response</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
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
          </CardContent>
        </Card>

        {/* Get Refill Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              Get Refill Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Parameters</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>key</TableCell>
                  <TableCell>Your API key</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>action</TableCell>
                  <TableCell>refill_status</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>refill</TableCell>
                  <TableCell>Refill ID</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-6">
              <p className="font-semibold mb-3">Example response</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
    "status": "Completed"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Get Multiple Refill Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              Get Multiple Refill Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Parameters</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>key</TableCell>
                  <TableCell>Your API key</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>action</TableCell>
                  <TableCell>refill_status</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>refills</TableCell>
                  <TableCell>Refill IDs (separated by a comma, up to 100 IDs)</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-6">
              <p className="font-semibold mb-3">Example response</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
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
          </CardContent>
        </Card>

        {/* Create Cancel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              Create Cancel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Parameters</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>key</TableCell>
                  <TableCell>Your API key</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>action</TableCell>
                  <TableCell>cancel</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>orders</TableCell>
                  <TableCell>Order IDs (separated by a comma, up to 100 IDs)</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-6">
              <p className="font-semibold mb-3">Example response</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
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
          </CardContent>
        </Card>

        {/* User Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              User Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Parameters</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>key</TableCell>
                  <TableCell>Your API key</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>action</TableCell>
                  <TableCell>balance</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-6">
              <p className="font-semibold mb-3">Example response</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
    "balance": "100.84292",
    "currency": "USD"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
            <CardDescription>
              Ready-to-use code examples in different programming languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="php" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="php">PHP</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="nodejs">Node.js</TabsTrigger>
              </TabsList>
              
              <TabsContent value="php" className="relative">
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs sm:text-sm">
                  <code>{codeExamples.php}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(codeExamples.php, 'PHP code copied to clipboard')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TabsContent>
              
              <TabsContent value="python" className="relative">
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs sm:text-sm">
                  <code>{codeExamples.python}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(codeExamples.python, 'Python code copied to clipboard')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TabsContent>
              
              <TabsContent value="nodejs" className="relative">
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs sm:text-sm">
                  <code>{codeExamples.nodejs}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(codeExamples.nodejs, 'Node.js code copied to clipboard')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Get assistance with API integration and access additional resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you need assistance with API integration, please contact our support team or check our detailed documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" asChild>
                <a href="/dashboard/user/contact">Contact Support</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://docs.smmcompany.com" target="_blank" rel="noopener noreferrer">
                  API Documentation
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}