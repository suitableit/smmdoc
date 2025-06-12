'use client';

import React, { useState, useEffect } from 'react';
import { APP_NAME } from '@/lib/constants';
import {
  FaShoppingCart,
  FaCheckCircle,
  FaTimes,
  FaChevronDown,
  FaServer,
  FaGlobe,
  FaUser,
  FaLock,
  FaDollarSign,
  FaInfoCircle,
  FaClock,
  FaQuestionCircle
} from 'react-icons/fa';

interface FormData {
  domain: string;
  currency: string;
  username: string;
  password: string;
  passwordConfirm: string;
}

interface FAQ {
  question: string;
  answer: string;
}

// Custom Gradient Spinner Component (Large version for loading state)
const GradientSpinner = ({ size = "w-5 h-5", className = "" }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

// Toast/Twist Message Component
const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info' | 'pending'; onClose: () => void }) => (
  <div className={`toast toast-${type} toast-enter`}>
    {type === 'success' && <FaCheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

const ChildPanel: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    domain: '',
    currency: 'USD',
    username: '',
    password: '',
    passwordConfirm: ''
  });

  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'pending' } | null>(null);

  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Child Panel — ${APP_NAME}`;
  }, []);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const currencies = [
    { value: 'USD', label: 'United States Dollars (USD)' },
    { value: 'BDT', label: 'Bangladeshi Taka (BDT)' }
  ];

  const faqs: FAQ[] = [
    {
      question: "What is child panel?",
      answer: "A child panel is a panel with a limited selection of features that is linked to one of your regular panels such as SMMDOC.com"
    },
    {
      question: "How much cost for a child panel?",
      answer: "It will cost you $10.00 per month. Please note, you paying for panel, not for services, you have to pay for the services you will purchase from SMMDOC"
    },
    {
      question: "How long it will take to activate the child panel?",
      answer: "It will take 3-6 hrs to active your child panel if you changed your name server perfectly."
    },
    {
      question: "Do you need hosting for child panel?",
      answer: "No, for child panel you just need a domain and that's all."
    },
    {
      question: "I have domain, what i can do next?",
      answer: "If you have domain, you can simply change your domain name server and point it to ns1.smmdoc.com ns2.smmdoc.com After you successfully changed the name server, you can submit a order for child panel"
    },
    {
      question: "How can i change name server for my domain?",
      answer: "Its actually depend on your domain provider, if you go to your domain settings and choose custom DNS and enter the name server given by SMMDOC."
    },
    {
      question: "How to i connect child panel with SMMDOC?",
      answer: "You can simply go to https://yourdomain.com/admin/settings/providers and you will find out option to connect your panel with SMMDOC. You can a key to connect your panel with SMMDOC. This key you will find out on settings of your SMMDOC account."
    },
    {
      question: "How can i get refund for child panel if i am not interested to continue?",
      answer: "Unfortunately refund not possible after we activate your child panel. But you can terminate your child panel any time by creating a ticket to us."
    },
    {
      question: "I want to change my child panel domain address, what i need to do?",
      answer: "You can simply, change your new domain name server and send to us your new domain address. We will replace your new domain with old domain. But, this change only possible for 1 time."
    },
    {
      question: "How can i activate affiliate on my child panel?",
      answer: "Unfortunately, there is no affiliate feature on child panel"
    },
    {
      question: "How can i add payment gateway on our child panel?",
      answer: "You can visit https://yourdomain.com/admin/settings/payments - Add method - Choose Payment Method"
    },
    {
      question: "How can i collect money from our customer?",
      answer: "You customer will pay to your own payment gateway account, they are not paying to us. So, you don't have to worry about payment. Setup your own payment gateway, and collect payment from your customers"
    },
    {
      question: "If i connect our child panel with SMMDOC, is there any way customer will find out about SMMDOC?",
      answer: "No, your customer will never know about SMMDOC.com. They will place order on your website and your order will automatically place to SMMDOC.com under your user account."
    }
  ];

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'pending' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      showToast('Child panel order submitted successfully!', 'success');
      console.log('Form submitted:', formData);
    }, 1000);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  if (isPageLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          {/* Page Title Section - Static */}
          <div className="mb-6">
            <div className="card card-padding bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Create A Child Panel
                  </h1>
                  <p className="text-gray-600 mb-4">
                    Create a child panel with your own domain and start your own business. 
                    You can connect your child panel with SMMDOC and start selling services to your customers.
                  </p>
                  <button className="btn btn-primary inline-flex items-center">
                    Get Started
                  </button>
                </div>
                <div className="lg:col-span-1">
                  <div className="flex justify-center">
                    <div className="w-48 h-32 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaServer className="w-16 h-16 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Loading State */}
            <div className="space-y-6">
              <div id="childPanelOrder">
                <div className="card card-padding">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center flex flex-col items-center">
                      <GradientSpinner size="w-14 h-14" className="mb-4" />
                      <div className="text-lg font-medium">Loading child panel form...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Static FAQ */}
            <div className="space-y-6">
              <div className="card card-padding">
                <div className="card-header">
                  <div className="card-icon">
                    <FaQuestionCircle />
                  </div>
                  <h3 className="card-title">Frequently Asked Questions</h3>
                </div>

                <div className="space-y-3 mt-4">
                  {faqs.slice(0, 3).map((faq, index) => (
                    <div key={index} className="card">
                      <div className="w-full p-4 text-left flex justify-between items-center">
                        <span className="flex items-center gap-2 font-medium text-gray-900 pr-4">
                          <FaInfoCircle className="w-4 h-4" />
                          {faq.question}
                        </span>
                        <FaChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Toast Container */}
      <div className="toast-container">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>

      <div className="page-content">
        {/* Page Title Section */}
        <div className="mb-6">
          <div className="card card-padding bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Create A Child Panel
                </h1>
                <p className="text-gray-600 mb-4">
                  Create a child panel with your own domain and start your own business. 
                  You can connect your child panel with SMMDOC and start selling services to your customers.
                </p>
                <a 
                  href="#childPanelOrder" 
                  className="btn btn-primary inline-flex items-center"
                >
                  Get Started
                </a>
              </div>
              <div className="lg:col-span-1">
                <div className="flex justify-center">
                  <div className="w-48 h-32 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaServer className="w-16 h-16 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Form Section */}
            <div id="childPanelOrder">
              <div className="card card-padding">
                {/* Tab Header */}
                <div className="card-header mb-6">
                  <div className="card-icon">
                    <FaShoppingCart />
                  </div>
                  <h3 className="card-title">Create Child Panel</h3>
                </div>

                {/* Form */}
                <div className="space-y-6">
                  <div className="form-group">
                    <label htmlFor="domain" className="form-label">
                      Domain
                    </label>
                    <input
                      type="text"
                      id="domain"
                      name="domain"
                      value={formData.domain}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your domain"
                      required
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <div className="font-semibold mb-2 flex items-center">
                        <FaInfoCircle className="mr-2" />
                        Please change nameservers to:
                      </div>
                      <ul className="ml-4 space-y-1">
                        <li>• ns1.smmdoc.com</li>
                        <li>• ns2.smmdoc.com</li>
                      </ul>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="currency" className="form-label">
                      Currency
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      {currencies.map((currency) => (
                        <option key={currency.value} value={currency.value}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="username" className="form-label">
                      Admin username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter admin username"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      Admin password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter admin password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="passwordConfirm" className="form-label">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      id="passwordConfirm"
                      name="passwordConfirm"
                      value={formData.passwordConfirm}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Confirm admin password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="price" className="form-label">
                      Price per month
                    </label>
                    <input
                      type="text"
                      id="price"
                      value="$10.00"
                      className="form-input bg-gray-50 text-gray-600"
                      readOnly
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="btn btn-primary w-full"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <GradientSpinner size="w-5 h-5" />
                          Processing...
                        </div>
                      ) : (
                        'Submit Order'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - FAQ */}
          <div className="space-y-6">
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaQuestionCircle />
                </div>
                <h3 className="card-title">Frequently Asked Questions</h3>
              </div>

              <div className="space-y-3 mt-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="card">
                    <button
                      className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      onClick={() => toggleFAQ(index)}
                    >
                      <span className="flex items-center gap-2 font-medium text-gray-900 pr-4">
                        <FaInfoCircle className="w-4 h-4" />
                        {faq.question}
                      </span>
                      <div
                        className={`transform transition-transform duration-200 ${
                          openFAQ === index ? 'rotate-180' : 'rotate-0'
                        }`}
                      >
                        <FaChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      </div>
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openFAQ === index
                          ? 'max-h-96 opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50">
                        <p className="text-gray-600 leading-relaxed mt-3">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildPanel;