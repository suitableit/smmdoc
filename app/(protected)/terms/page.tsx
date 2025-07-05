'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import {
  FaBan,
  FaCreditCard,
  FaExclamationTriangle,
  FaFileContract,
  FaGavel,
  FaInfoCircle,
  FaUserCheck,
  FaUserShield,
} from 'react-icons/fa';

export default function TermsPage() {
  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Terms & Conditions — ${APP_NAME}`;
  }, []);

  const termsData = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: <FaUserCheck />,
      content: [
        'By accessing and using our social media marketing services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.',
        'If you do not agree with any part of these terms, you must not use our services.',
        'We reserve the right to modify these terms at any time without prior notice.',
      ],
    },
    {
      id: 'services',
      title: 'Description of Services',
      icon: <FaInfoCircle />,
      content: [
        'We provide social media marketing services including but not limited to followers, likes, views, comments, and engagement for various social media platforms.',
        'All services are delivered through automated systems and third-party providers.',
        'Service delivery times may vary depending on the platform and service type.',
        'We do not guarantee specific results or outcomes from our services.',
      ],
    },
    {
      id: 'user-responsibilities',
      title: 'User Responsibilities',
      icon: <FaUserShield />,
      content: [
        'You must provide accurate and complete information when placing orders.',
        "You are responsible for ensuring your social media accounts comply with the respective platform's terms of service.",
        'You must not use our services for illegal, harmful, or fraudulent purposes.',
        'You agree not to resell our services without proper authorization.',
        'You must keep your account credentials secure and confidential.',
      ],
    },
    {
      id: 'payment-terms',
      title: 'Payment Terms',
      icon: <FaCreditCard />,
      content: [
        'All payments must be made in advance before service delivery begins.',
        'We accept various payment methods as displayed on our platform.',
        'All transactions are processed securely through trusted payment gateways.',
        'Refunds are subject to our refund policy and specific service conditions.',
        'You are responsible for any transaction fees charged by payment processors.',
      ],
    },
    {
      id: 'prohibited-activities',
      title: 'Prohibited Activities',
      icon: <FaBan />,
      content: [
        'Using our services to promote illegal content, hate speech, or harmful activities.',
        'Attempting to manipulate or exploit our systems or pricing.',
        'Creating multiple accounts to abuse promotions or discounts.',
        'Sharing account access with unauthorized parties.',
        'Using our services in ways that violate social media platform policies.',
        'Engaging in fraudulent activities or chargebacks without valid reasons.',
      ],
    },
    {
      id: 'disclaimers',
      title: 'Disclaimers and Limitations',
      icon: <FaExclamationTriangle />,
      content: [
        'Our services are provided "as is" without warranties of any kind.',
        'We do not guarantee that services will meet your specific requirements.',
        'We are not responsible for any actions taken by social media platforms against your accounts.',
        'Service delivery may be affected by platform updates, policy changes, or technical issues.',
        'We reserve the right to refuse service to any user at our discretion.',
      ],
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: <FaGavel />,
      content: [
        'In no event shall we be liable for any indirect, incidental, or consequential damages.',
        'Our total liability shall not exceed the amount paid for the specific service in question.',
        'We are not responsible for any losses resulting from account suspensions or bans.',
        'Users assume all risks associated with using social media marketing services.',
        'We shall not be liable for any damages arising from service interruptions or delays.',
      ],
    },
    {
      id: 'termination',
      title: 'Termination',
      icon: <FaBan />,
      content: [
        'We reserve the right to terminate or suspend accounts that violate these terms.',
        'Users may terminate their account at any time by contacting our support team.',
        'Upon termination, all pending orders will be processed according to our refund policy.',
        'We reserve the right to retain certain information as required by law or for business purposes.',
        'Termination does not relieve users of their obligation to pay for services already provided.',
      ],
    },
  ];

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Terms of Service</h1>
          <p className="page-description">
            Please read these terms carefully before using our social media
            marketing services
          </p>
        </div>

        {/* Last Updated Notice */}
        <div className="card card-padding mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <div className="card-icon mr-4">
                <FaFileContract />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Last Updated</h3>
                <p className="text-sm text-gray-600">
                  These terms were last updated on January 1, 2025
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Version 1.0
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {termsData.map((section, index) => (
            <div key={section.id} className="card card-padding">
              <div className="card-header mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="card-icon">{section.icon}</div>
                  <h3 className="card-title">{section.title}</h3>
                </div>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium w-full sm:w-auto text-center sm:ml-auto">
                  Section {index + 1}
                </span>
              </div>

              <div className="space-y-3">
                {section.content.map((paragraph, idx) => (
                  <p key={idx} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="card card-padding mt-8">
          <div className="card-header">
            <div className="card-icon">
              <FaInfoCircle />
            </div>
            <h3 className="card-title">Questions About These Terms?</h3>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700">
              If you have any questions about these Terms of Service, please
              don't hesitate to contact us.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Email Support
                </h4>
                <p className="text-sm text-gray-600">support@smmdoc.com</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Response Time
                </h4>
                <p className="text-sm text-gray-600">Within 24 hours</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                  href="/contact-support"
                  className={`btn btn-primary`}
                  >
                  Contact Support
              </Link>
              <Link
                  href="/faqs"
                  className={`btn btn-secondary`}
                  >
                  View FAQ
              </Link>
            </div>
          </div>
        </div>

        {/* Agreement Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-yellow-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">
                Important Notice
              </h4>
              <p className="text-yellow-700 text-sm leading-relaxed">
                By continuing to use our services, you acknowledge that you have
                read, understood, and agree to be bound by these Terms of
                Service. If you do not agree with these terms, please
                discontinue use of our services immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}