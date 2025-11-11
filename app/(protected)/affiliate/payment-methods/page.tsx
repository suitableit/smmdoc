'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import { useEffect, useState } from 'react';
import {
    FaCheckCircle,
    FaDollarSign,
    FaExclamationTriangle,
    FaInfoCircle,
    FaMobile,
    FaPlus,
    FaRocket,
    FaTimes,
    FaTrash,
    FaUniversity,
    FaUser,
    FaWallet
} from 'react-icons/fa';
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);
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
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
        : type === 'error'
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        : type === 'info'
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
    }`}
  >
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      {type === 'error' && <FaExclamationTriangle className="w-4 h-4" />}
      {type === 'info' && <FaInfoCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
      >
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

interface PaymentMethod {
  id: string;
  method: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank';
  mobileNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  accountHolderName?: string;
  routingNumber?: string;
  swiftCode?: string;
}

interface ActivationFormData {
  paymentMethods: PaymentMethod[];
  agreeToTerms: boolean;
}

interface NewPaymentMethodForm {
  method: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | '';
  mobileNumber: string;
  bankAccountNumber: string;
  bankName: string;
  accountHolderName: string;
  routingNumber: string;
  swiftCode: string;
}

export default function ActivateAffiliatePage() {
  const { appName } = useAppNameWithFallback();

  const user = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [formData, setFormData] = useState<ActivationFormData>({
    paymentMethods: [],
    agreeToTerms: false,
  });
  const [newPaymentMethod, setNewPaymentMethod] = useState<NewPaymentMethodForm>({
    method: '',
    mobileNumber: '',
    bankAccountNumber: '',
    bankName: '',
    accountHolderName: '',
    routingNumber: '',
    swiftCode: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<Partial<ActivationFormData>>({});
  useEffect(() => {
    setPageTitle('Activate Affiliate Account', appName);
  }, [appName]);
  useEffect(() => {
    const checkAffiliateStatus = async () => {
      try {
        const response = await fetch('/api/user/affiliate/status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.isActivated) {
            setIsActivated(true);
          }
        }
      } catch (error) {
        console.error('Error checking affiliate status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (user?.id) {
      checkAffiliateStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [user]);
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };
  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (formData.paymentMethods.length === 0) {
      newErrors.paymentMethods = 'Please add at least one payment method';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateNewPaymentMethod = (): boolean => {
    const newErrors: any = {};

    if (!newPaymentMethod.method) {
      newErrors.method = 'Please select a payment method';
    }

    if (newPaymentMethod.method === 'bank') {
      if (!newPaymentMethod.bankName.trim()) {
        newErrors.bankName = 'Bank name is required';
      }
      if (!newPaymentMethod.accountHolderName.trim()) {
        newErrors.accountHolderName = 'Account holder name is required';
      }
      if (!newPaymentMethod.bankAccountNumber.trim()) {
        newErrors.bankAccountNumber = 'Account number is required';
      }
      if (!newPaymentMethod.routingNumber.trim()) {
        newErrors.routingNumber = 'Routing number/Branch name is required';
      }
      if (!newPaymentMethod.swiftCode.trim()) {
        newErrors.swiftCode = 'Swift code is required';
      }
    } else if (newPaymentMethod.method && !['bank'].includes(newPaymentMethod.method)) {
      if (!newPaymentMethod.mobileNumber.trim()) {
        newErrors.mobileNumber = 'Mobile number is required';
      } else if (!/^(\+88)?01[3-9]\d{8}$/.test(newPaymentMethod.mobileNumber.replace(/\s/g, ''))) {
        newErrors.mobileNumber = 'Please enter a valid Bangladeshi mobile number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const addPaymentMethod = () => {
    if (!validateNewPaymentMethod()) {
      showToast('Please fix the errors below', 'error');
      return;
    }

    const paymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      method: newPaymentMethod.method as any,
      ...(newPaymentMethod.method === 'bank' 
        ? {
            bankName: newPaymentMethod.bankName,
            accountHolderName: newPaymentMethod.accountHolderName,
            bankAccountNumber: newPaymentMethod.bankAccountNumber,
            routingNumber: newPaymentMethod.routingNumber,
            swiftCode: newPaymentMethod.swiftCode,
          }
        : {
            mobileNumber: newPaymentMethod.mobileNumber,
          }
      ),
    };

    setFormData(prev => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, paymentMethod],
    }));
    setNewPaymentMethod({
      method: '',
      mobileNumber: '',
      bankAccountNumber: '',
      bankName: '',
      accountHolderName: '',
      routingNumber: '',
      swiftCode: '',
    });
    setShowAddForm(false);
    setErrors({});
    showToast('Payment method added successfully!', 'success');
  };
  const removePaymentMethod = (id: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(pm => pm.id !== id),
    }));
    showToast('Payment method removed', 'info');
  };
  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors below', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/affiliate/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethods: formData.paymentMethods,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsActivated(true);
        showToast('Affiliate account activated successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to activate affiliate account', 'error');
      }
    } catch (error) {
      console.error('Error activating affiliate account:', error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (field: keyof ActivationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if ((errors as any)[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  const handleNewPaymentMethodChange = (field: keyof NewPaymentMethodForm, value: string) => {
    setNewPaymentMethod(prev => ({ ...prev, [field]: value }));
    if ((errors as any)[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  const getPaymentMethodDisplayName = (method: string): string => {
    const names: Record<string, string> = {
      bkash: 'bKash',
      nagad: 'Nagad',
      rocket: 'Rocket',
      upay: 'Upay',
      bank: 'Bank Transfer',
    };
    return names[method] || method;
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] dark:bg-[var(--page-bg)] transition-colors duration-200">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <GradientSpinner className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Checking affiliate status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isActivated) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] dark:bg-[var(--page-bg)] transition-colors duration-200">
        <div className="space-y-6">
          {}
          <div className="card card-padding">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Affiliate Account Active!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your affiliate account is already activated and ready to use.
              </p>
              <a
                href="/affiliate"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity duration-200"
              >
                <FaRocket className="w-4 h-4 mr-2" />
                Go to Affiliate Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg)] dark:bg-[var(--page-bg)] transition-colors duration-200">
      <div className="space-y-6">
        {}
        {toastMessage && (
          <Toast
            message={toastMessage.message}
            type={toastMessage.type}
            onClose={() => setToastMessage(null)}
          />
        )}

        {}
        <div className="card card-padding">
          <div className="card-header mb-6">
            <div className="card-icon">
              <FaDollarSign />
            </div>
            <h2 className="card-title">Configure Payment Methods</h2>
          </div>

          <form onSubmit={handleActivateAccount} className="space-y-6">
            {}
            <div className="bg-gray-50 dark:bg-[#1e1f2e] rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3 mb-2">
                <FaUser className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Account Information</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Username:</strong> {user?.username || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Email:</strong> {user?.email || 'Not available'}
              </p>
            </div>

            {}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment Methods *
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center btn-primary px-3 py-1.5 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity duration-200"
                >
                  <FaPlus className="w-3 h-3 mr-1" />
                  Add Payment Method
                </button>
              </div>

              {}
              {formData.paymentMethods.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {formData.paymentMethods.map((paymentMethod) => (
                    <div
                      key={paymentMethod.id}
                      className="bg-gray-50 dark:bg-[#1e1f2e] border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                              {paymentMethod.method === 'bank' ? (
                                <FaUniversity className="w-4 h-4 text-white" />
                              ) : (
                                <FaMobile className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {getPaymentMethodDisplayName(paymentMethod.method)}
                            </h4>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {paymentMethod.method === 'bank' ? (
                              <div className="space-y-1">
                                <p><strong>Bank:</strong> {paymentMethod.bankName}</p>
                                <p><strong>A/C Holder:</strong> {paymentMethod.accountHolderName}</p>
                                <p><strong>A/C Number:</strong> {paymentMethod.bankAccountNumber}</p>
                                <p><strong>Routing/Branch:</strong> {paymentMethod.routingNumber}</p>
                                <p><strong>Swift Code:</strong> {paymentMethod.swiftCode}</p>
                              </div>
                            ) : (
                              <p><strong>Mobile Number:</strong> {paymentMethod.mobileNumber}</p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePaymentMethod(paymentMethod.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                          title="Remove payment method"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-[#1e1f2e] border border-gray-200 dark:border-gray-600 rounded-lg">
                  <FaWallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No payment methods added yet. Click "Add Payment Method" to get started.
                  </p>
                </div>
              )}

              {errors.paymentMethods && (
                <p className="text-red-500 text-sm mt-1">{String(errors.paymentMethods)}</p>
              )}
            </div>

            {}
            {showAddForm && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Add New Payment Method
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewPaymentMethod({
                        method: '',
                        mobileNumber: '',
                        bankAccountNumber: '',
                        bankName: '',
                        accountHolderName: '',
                        routingNumber: '',
                        swiftCode: '',
                      });
                      setErrors({});
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {}
                  <div>
                    <label htmlFor="newPaymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Method *
                    </label>
                    <select
                      id="newPaymentMethod"
                      value={newPaymentMethod.method}
                      onChange={(e) => handleNewPaymentMethodChange('method', e.target.value)}
                      className={`form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer ${
                        (errors as any).method
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select a payment method</option>
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                      <option value="upay">Upay</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                    {(errors as any).method && (
                      <p className="text-red-500 text-sm mt-1">{(errors as any).method}</p>
                    )}
                  </div>

                  {}
                  {newPaymentMethod.method && newPaymentMethod.method !== 'bank' && (
                    <div>
                      <label htmlFor="newMobileNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {newPaymentMethod.method.charAt(0).toUpperCase() + newPaymentMethod.method.slice(1)} Mobile Number *
                      </label>
                      <input
                        type="tel"
                        id="newMobileNumber"
                        value={newPaymentMethod.mobileNumber}
                        onChange={(e) => handleNewPaymentMethodChange('mobileNumber', e.target.value)}
                        className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                          (errors as any).mobileNumber
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="e.g., 01712345678"
                      />
                      {(errors as any).mobileNumber && (
                        <p className="text-red-500 text-sm mt-1">{(errors as any).mobileNumber}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Enter your {newPaymentMethod.method} registered mobile number
                      </p>
                    </div>
                  )}

                  {}
                  {newPaymentMethod.method === 'bank' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="newBankName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          id="newBankName"
                          value={newPaymentMethod.bankName}
                          onChange={(e) => handleNewPaymentMethodChange('bankName', e.target.value)}
                          className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                            (errors as any).bankName
                              ? 'border-red-500 dark:border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="e.g., Dutch Bangla Bank, BRAC Bank"
                        />
                        {(errors as any).bankName && (
                          <p className="text-red-500 text-sm mt-1">{(errors as any).bankName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="newAccountHolderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          A/C Holder Name *
                        </label>
                        <input
                          type="text"
                          id="newAccountHolderName"
                          value={newPaymentMethod.accountHolderName}
                          onChange={(e) => handleNewPaymentMethodChange('accountHolderName', e.target.value)}
                          className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                            (errors as any).accountHolderName
                              ? 'border-red-500 dark:border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter account holder name"
                        />
                        {(errors as any).accountHolderName && (
                          <p className="text-red-500 text-sm mt-1">{(errors as any).accountHolderName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="newBankAccountNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          A/C Number *
                        </label>
                        <input
                          type="text"
                          id="newBankAccountNumber"
                          value={newPaymentMethod.bankAccountNumber}
                          onChange={(e) => handleNewPaymentMethodChange('bankAccountNumber', e.target.value)}
                          className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                            (errors as any).bankAccountNumber
                              ? 'border-red-500 dark:border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter your account number"
                        />
                        {(errors as any).bankAccountNumber && (
                          <p className="text-red-500 text-sm mt-1">{(errors as any).bankAccountNumber}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="newRoutingNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Routing No/Branch Name *
                        </label>
                        <input
                          type="text"
                          id="newRoutingNumber"
                          value={newPaymentMethod.routingNumber}
                          onChange={(e) => handleNewPaymentMethodChange('routingNumber', e.target.value)}
                          className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                            (errors as any).routingNumber
                              ? 'border-red-500 dark:border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter routing number or branch name"
                        />
                        {(errors as any).routingNumber && (
                          <p className="text-red-500 text-sm mt-1">{(errors as any).routingNumber}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="newSwiftCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Swift Code *
                        </label>
                        <input
                          type="text"
                          id="newSwiftCode"
                          value={newPaymentMethod.swiftCode}
                          onChange={(e) => handleNewPaymentMethodChange('swiftCode', e.target.value)}
                          className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                            (errors as any).swiftCode
                              ? 'border-red-500 dark:border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter swift code"
                        />
                        {(errors as any).swiftCode && (
                          <p className="text-red-500 text-sm mt-1">{(errors as any).swiftCode}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {}
                  <div className="flex flex-col md:flex-row gap-3">
                    <button
                      type="button"
                      onClick={addPaymentMethod}
                      className="w-full md:flex-1 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
                    >
                      Add Payment Method
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewPaymentMethod({
                          method: '',
                          mobileNumber: '',
                          bankAccountNumber: '',
                          bankName: '',
                          accountHolderName: '',
                          routingNumber: '',
                          swiftCode: '',
                        });
                        setErrors({});
                      }}
                      className="w-full md:w-auto px-4 py-2 btn-secondary rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 text-[var(--primary)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--primary)] dark:focus:ring-[var(--primary)] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  disabled={loading}
                />
                <div>
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-700 dark:text-gray-300">
                    I agree to the <a href="/terms" className="text-[var(--primary)] hover:underline">Terms & Conditions</a> *
                  </label>
                  {(errors as any).agreeToTerms && (
                    <p className="text-red-500 text-xs mt-1">{(errors as any).agreeToTerms}</p>
                  )}
                </div>
              </div>
            </div>

            {}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || formData.paymentMethods.length === 0}
                className="flex-1 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <GradientSpinner size="w-5 h-5" />
                    <span>Activating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Save Changes</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}