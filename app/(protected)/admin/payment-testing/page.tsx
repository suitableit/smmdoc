'use client';

import BreadCrumb from '@/components/shared/BreadCrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Clock,
  Mail,
  Smartphone,
  TestTube,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PaymentTestingPage() {
  const [testData, setTestData] = useState({
    invoice_id: '',
    transaction_id: '',
    phone: '',
    response_type: 'completed',
    amount: '100',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const breadcrumbItems = [
    { title: 'Admin', link: '/admin' },
    { title: 'Payment Testing', link: '/admin/payment-testing' },
  ];

  const generateTestData = () => {
    const timestamp = Date.now();
    setTestData({
      ...testData,
      invoice_id: `INV-${timestamp}`,
      transaction_id: `TXN-${timestamp}`,
      phone: '+8801712345678',
    });
  };

  const runPaymentTest = async () => {
    if (!testData.invoice_id || !testData.transaction_id || !testData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // First create a test payment record
      const createResponse = await fetch(
        '/api/admin/testing/create-test-payment',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoice_id: testData.invoice_id,
            amount: parseFloat(testData.amount),
            phone: testData.phone,
          }),
        }
      );

      if (!createResponse.ok) {
        throw new Error('Failed to create test payment');
      }

      // Then test the verification
      const verifyResponse = await fetch('/api/payment/uddoktapay-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: testData.invoice_id,
          transaction_id: testData.transaction_id,
          phone: testData.phone,
          response_type: testData.response_type,
        }),
      });

      const result = await verifyResponse.json();

      const testResult = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        input: { ...testData },
        response: result,
        status: verifyResponse.ok ? 'success' : 'error',
      };

      setTestResults((prev) => [testResult, ...prev]);

      if (verifyResponse.ok) {
        toast.success(`Test completed: ${result.status}`);
      } else {
        toast.error(`Test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailNotification = async () => {
    try {
      const response = await fetch('/api/admin/testing/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment_success',
          amount: testData.amount,
          transaction_id: testData.transaction_id,
        }),
      });

      if (response.ok) {
        toast.success('Test email sent successfully');
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error) {
      toast.error('Email test failed');
    }
  };

  const testSMSNotification = async () => {
    try {
      const response = await fetch('/api/admin/testing/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testData.phone,
          type: 'payment_success',
          amount: testData.amount,
          transaction_id: testData.transaction_id,
        }),
      });

      if (response.ok) {
        toast.success('Test SMS sent successfully');
      } else {
        toast.error('Failed to send test SMS');
      }
    } catch (error) {
      toast.error('SMS test failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
      </div>
      <Separator />

      <div className="py-4">
        <h1 className="text-2xl font-bold">Payment System Testing</h1>
        <p className="text-muted-foreground">
          Test UddoktaPay payment workflows and notifications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TestTube className="w-5 h-5 mr-2" />
              Payment Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_id">Invoice ID</Label>
                <Input
                  id="invoice_id"
                  value={testData.invoice_id}
                  onChange={(e) =>
                    setTestData({ ...testData, invoice_id: e.target.value })
                  }
                  placeholder="INV-123456"
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (BDT)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={testData.amount}
                  onChange={(e) =>
                    setTestData({ ...testData, amount: e.target.value })
                  }
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="transaction_id">Transaction ID</Label>
              <Input
                id="transaction_id"
                value={testData.transaction_id}
                onChange={(e) =>
                  setTestData({ ...testData, transaction_id: e.target.value })
                }
                placeholder="TXN-123456"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={testData.phone}
                onChange={(e) =>
                  setTestData({ ...testData, phone: e.target.value })
                }
                placeholder="+8801712345678"
              />
            </div>

            <div>
              <Label htmlFor="response_type">Response Type</Label>
              <Select
                value={testData.response_type}
                onValueChange={(value) =>
                  setTestData({ ...testData, response_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">
                    Completed (Auto-approve)
                  </SelectItem>
                  <SelectItem value="pending">
                    Pending (Manual review)
                  </SelectItem>
                  <SelectItem value="cancelled">Cancelled (Failed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={generateTestData}
                variant="outline"
                className="flex-1"
              >
                Generate Test Data
              </Button>
              <Button
                onClick={runPaymentTest}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Testing...' : 'Run Payment Test'}
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Notification Tests</h4>
              <div className="flex gap-2">
                <Button
                  onClick={testEmailNotification}
                  variant="outline"
                  size="sm"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Test Email
                </Button>
                <Button
                  onClick={testSMSNotification}
                  variant="outline"
                  size="sm"
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Test SMS
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No test results yet. Run a payment test to see results.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {testResults.map((result) => (
                  <div
                    key={result.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-sm text-gray-500">
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                      {result.response.status &&
                        getStatusBadge(result.response.status)}
                    </div>

                    <div className="text-sm">
                      <strong>Input:</strong> {result.input.response_type} - ৳
                      {result.input.amount}
                    </div>

                    <div className="text-sm">
                      <strong>Response:</strong>{' '}
                      {result.response.message || result.response.error}
                    </div>

                    {result.response.payment && (
                      <div className="text-xs text-gray-600">
                        Invoice: {result.response.payment.invoice_id} | Status:{' '}
                        {result.response.payment.status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Test Scenarios */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Test Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-green-700 mb-2">
                ✅ Success Flow
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Test automatic approval and balance addition
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  generateTestData();
                  setTestData((prev) => ({
                    ...prev,
                    response_type: 'completed',
                  }));
                }}
              >
                Setup Success Test
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-yellow-700 mb-2">
                ⏳ Pending Flow
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Test manual admin review process
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  generateTestData();
                  setTestData((prev) => ({
                    ...prev,
                    response_type: 'pending',
                  }));
                }}
              >
                Setup Pending Test
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-red-700 mb-2">❌ Failed Flow</h4>
              <p className="text-sm text-gray-600 mb-3">
                Test payment cancellation process
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  generateTestData();
                  setTestData((prev) => ({
                    ...prev,
                    response_type: 'cancelled',
                  }));
                }}
              >
                Setup Failed Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
