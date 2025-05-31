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
import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ApiEndpoint {
  method: string;
  endpoint: string;
  description: string;
  parameters: string[];
  example: string;
}

export default function ApiIntegrationPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  
  // API endpoints documentation
  const apiEndpoints: ApiEndpoint[] = [
    {
      method: 'GET',
      endpoint: '/api/v1/services',
      description: 'Get all services',
      parameters: [],
      example: 'curl -X GET "https://api.smmcompany.com/api/v1/services" -H "api-key: YOUR_API_KEY"',
    },
    {
      method: 'POST',
      endpoint: '/api/v1/order',
      description: 'Create a new order',
      parameters: ['service', 'link', 'quantity'],
      example: 'curl -X POST "https://api.smmcompany.com/api/v1/order" -H "api-key: YOUR_API_KEY" -d "service=1&link=https://example.com&quantity=100"',
    },
    {
      method: 'GET',
      endpoint: '/api/v1/order/{order_id}',
      description: 'Get order status',
      parameters: ['order_id'],
      example: 'curl -X GET "https://api.smmcompany.com/api/v1/order/123456" -H "api-key: YOUR_API_KEY"',
    },
    {
      method: 'GET',
      endpoint: '/api/v1/orders',
      description: 'Get all orders',
      parameters: ['status (optional)', 'page (optional)'],
      example: 'curl -X GET "https://api.smmcompany.com/api/v1/orders?status=completed&page=1" -H "api-key: YOUR_API_KEY"',
    },
    {
      method: 'GET',
      endpoint: '/api/v1/balance',
      description: 'Get user balance',
      parameters: [],
      example: 'curl -X GET "https://api.smmcompany.com/api/v1/balance" -H "api-key: YOUR_API_KEY"',
    },
  ];
  
  // Code examples for different programming languages
  const codeExamples = {
    php: `<?php
// API URL
$url = 'https://api.smmcompany.com/api/v1/order';

// API Key
$apiKey = '${apiKey || 'YOUR_API_KEY'}';

// Order details
$postData = [
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
    'api-key: ' . $apiKey,
    'Content-Type: application/x-www-form-urlencoded'
]);

// Execute cURL request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Process response
if ($httpCode === 200) {
    $result = json_decode($response, true);
    echo "Order created successfully! Order ID: " . $result['order_id'];
} else {
    echo "Error: " . $response;
}
?>`,
    python: `import requests

# API URL
url = 'https://api.smmcompany.com/api/v1/order'

# API Key
api_key = '${apiKey || 'YOUR_API_KEY'}'

# Order details
payload = {
    'service': 1,  # Service ID
    'link': 'https://www.instagram.com/username',  # Link to your profile/post
    'quantity': 100  # Number of followers/likes/etc.
}

# Headers
headers = {
    'api-key': api_key,
    'Content-Type': 'application/x-www-form-urlencoded'
}

# Make the request
response = requests.post(url, data=payload, headers=headers)

# Process response
if response.status_code == 200:
    result = response.json()
    print(f"Order created successfully! Order ID: {result['order_id']}")
else:
    print(f"Error: {response.text}")`,
    nodejs: `const axios = require('axios');
const querystring = require('querystring');

// API URL
const url = 'https://api.smmcompany.com/api/v1/order';

// API Key
const apiKey = '${apiKey || 'YOUR_API_KEY'}';

// Order details
const payload = {
  service: 1, // Service ID
  link: 'https://www.instagram.com/username', // Link to your profile/post
  quantity: 100 // Number of followers/likes/etc.
};

// Headers
const headers = {
  'api-key': apiKey,
  'Content-Type': 'application/x-www-form-urlencoded'
};

// Make the request
axios.post(url, querystring.stringify(payload), { headers })
  .then(response => {
    console.log(\`Order created successfully! Order ID: \${response.data.order_id}\`);
  })
  .catch(error => {
    console.error(\`Error: \${error.response ? error.response.data : error.message}\`);
  });`,
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
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
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">API Endpoints</h3>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Method</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Parameters</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiEndpoints.map((endpoint, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge variant={endpoint.method === 'GET' ? 'outline' : 'default'}>
                              {endpoint.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs sm:text-sm">{endpoint.endpoint}</TableCell>
                          <TableCell>{endpoint.description}</TableCell>
                          <TableCell>
                            {endpoint.parameters.length > 0 ? (
                              <ul className="list-disc list-inside text-xs sm:text-sm">
                                {endpoint.parameters.map((param, i) => (
                                  <li key={i}>{param}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground">None</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Code Examples</h3>
                
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
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  If you need assistance with API integration, please contact our support team or check our detailed documentation.
                </p>
                <div className="flex gap-4 mt-4">
                  <Button variant="outline" asChild>
                    <a href="/dashboard/user/contact">Contact Support</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://docs.smmcompany.com" target="_blank" rel="noopener noreferrer">API Documentation</a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}