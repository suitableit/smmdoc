'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock FAQ data
  const faqItems: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'What is SMM Panel?',
      answer: 'SMM (Social Media Marketing) Panel is a platform that allows you to purchase social media marketing services like followers, likes, views, and more for various social media platforms at wholesale prices.',
      category: 'general',
    },
    {
      id: 'faq-2',
      question: 'How do I place an order?',
      answer: 'To place an order, simply navigate to the "New Order" section, select the service you want, enter the required details (like the link to your social media profile or post), enter the quantity, and complete the payment.',
      category: 'orders',
    },
    {
      id: 'faq-3',
      question: 'How long does it take to deliver an order?',
      answer: 'Delivery time varies depending on the service. Some services start delivering within minutes, while others may take a few hours to start. The estimated delivery time is mentioned in the service description.',
      category: 'orders',
    },
    {
      id: 'faq-4',
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including credit/debit cards, PayPal, cryptocurrency, and local payment options like bKash, Nagad, and bank transfers.',
      category: 'payment',
    },
    {
      id: 'faq-5',
      question: 'Is it safe to use SMM services?',
      answer: 'Yes, our services are safe to use. We use high-quality methods that comply with social media platforms\' terms of service. However, we recommend using these services moderately and naturally.',
      category: 'general',
    },
    {
      id: 'faq-6',
      question: 'What happens if my order is not delivered?',
      answer: 'If your order is not delivered within the expected timeframe, you can open a support ticket, and our team will investigate the issue. If the service cannot be delivered, you will receive a refund.',
      category: 'orders',
    },
    {
      id: 'faq-7',
      question: 'Can I get a refund if I\'m not satisfied?',
      answer: 'Refund policies vary by service. Generally, if a service is not delivered as described, you can request a refund through our support system. Please check our terms of service for detailed refund policies.',
      category: 'payment',
    },
    {
      id: 'faq-8',
      question: 'How do I add funds to my account?',
      answer: 'To add funds, go to the "Add Funds" section, select your preferred payment method, enter the amount you wish to add, and follow the payment instructions.',
      category: 'payment',
    },
    {
      id: 'faq-9',
      question: 'Do you offer an API for resellers?',
      answer: 'Yes, we provide an API for resellers. You can access the API documentation in the "API Integration" section of your dashboard. Our API allows you to automate orders and check service status.',
      category: 'api',
    },
    {
      id: 'faq-10',
      question: 'What is a child panel?',
      answer: 'A child panel is a reseller panel that you can purchase from us. It\'s a complete SMM panel with your own domain, where you can set your own prices and sell services to your customers.',
      category: 'reseller',
    },
    {
      id: 'faq-11',
      question: 'How can I contact support?',
      answer: 'You can contact our support team by opening a ticket in the "Support Ticket" section of your dashboard. Our support team is available 24/7 to assist you.',
      category: 'support',
    },
    {
      id: 'faq-12',
      question: 'Can I cancel my order after placing it?',
      answer: 'Once an order is placed, it cannot be canceled as our system starts processing it immediately. However, if the order hasn\'t started yet, you can contact support for assistance.',
      category: 'orders',
    },
  ];
  
  // Filter FAQ items based on search term
  const filteredFAQs = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group FAQ items by category
  const groupedFAQs = filteredFAQs.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FAQItem[]>);
  
  // Category display names
  const categoryNames: Record<string, string> = {
    'general': 'General Questions',
    'orders': 'Orders',
    'payment': 'Payment & Billing',
    'api': 'API & Integration',
    'reseller': 'Reseller Services',
    'support': 'Support',
  };
  
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find answers to common questions about our services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-8">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {Object.keys(groupedFAQs).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No questions found matching your search.
            </div>
          ) : (
            Object.entries(groupedFAQs).map(([category, items]) => (
              <div key={category} className="mb-8">
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-medium">{categoryNames[category] || category}</h3>
                  <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                    {items.length} {items.length === 1 ? 'question' : 'questions'}
                  </Badge>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  {items.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                      <AccordionContent>
                        <div className="prose prose-sm max-w-none">
                          <p>{item.answer}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}