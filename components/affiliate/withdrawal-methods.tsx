'use client';

import { useState } from 'react';
import {
  FaMobile,
  FaPlus,
  FaTimes,
  FaTrash,
  FaUniversity,
  FaWallet
} from 'react-icons/fa';

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

interface NewPaymentMethodForm {
  method: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | '';
  mobileNumber: string;
  bankAccountNumber: string;
  bankName: string;
  accountHolderName: string;
  routingNumber: string;
  swiftCode: string;
}

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[];
  onAddPaymentMethod: (paymentMethod: PaymentMethod) => void;
  onRemovePaymentMethod: (id: string) => void;
  errors?: {
    paymentMethods?: string;
  };
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info' | 'pending') => void;
}

export default function PaymentMethodsSection({
  paymentMethods,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  errors = {},
  onShowToast,
}: PaymentMethodsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState<NewPaymentMethodForm>({
    method: '',
    mobileNumber: '',
    bankAccountNumber: '',
    bankName: '',
    accountHolderName: '',
    routingNumber: '',
    swiftCode: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const methodExists = (method: string) => paymentMethods.some(pm => pm.method === method);

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

  const validateNewPaymentMethod = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!newPaymentMethod.method) {
      newErrors.method = 'Please select a withdrawal method';
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

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNewPaymentMethodChange = (field: keyof NewPaymentMethodForm, value: string) => {
    setNewPaymentMethod(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addPaymentMethod = () => {
    if (!validateNewPaymentMethod()) {
      onShowToast?.('Please fix the errors below', 'error');
      return;
    }

    if (methodExists(newPaymentMethod.method)) {
      onShowToast?.(`You can add only one ${getPaymentMethodDisplayName(newPaymentMethod.method)} withdrawal method`, 'error');
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

    onAddPaymentMethod(paymentMethod);

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
    setFormErrors({});
    onShowToast?.('Withdrawal method added successfully!', 'success');
  };

  const handleCloseForm = () => {
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
    setFormErrors({});
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Withdrawal Methods *
          </label>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center btn-primary px-3 py-1.5 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity duration-200"
          >
            <FaPlus className="w-3 h-3 mr-1" />
            Add Withdrawal Method
          </button>
        </div>
        {paymentMethods.length > 0 ? (
          <div className="space-y-3 mb-4">
            {paymentMethods.map((paymentMethod) => (
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
                    onClick={() => onRemovePaymentMethod(paymentMethod.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                    title="Remove withdrawal method"
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
              No withdrawal methods added yet. Click "Add Withdrawal Method" to get started.
            </p>
          </div>
        )}

        {errors.paymentMethods && (
          <p className="text-red-500 text-sm mt-1">{String(errors.paymentMethods)}</p>
        )}
      </div>
      {showAddForm && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add New Withdrawal Method
            </h3>
            <button
              type="button"
              onClick={handleCloseForm}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="newPaymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Withdrawal Method *
              </label>
              <select
                id="newPaymentMethod"
                value={newPaymentMethod.method}
                onChange={(e) => handleNewPaymentMethodChange('method', e.target.value)}
                className={`form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer ${
                  formErrors.method
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select a withdrawal method</option>
                <option value="bkash" disabled={methodExists('bkash')}>bKash</option>
                <option value="nagad" disabled={methodExists('nagad')}>Nagad</option>
                <option value="rocket" disabled={methodExists('rocket')}>Rocket</option>
                <option value="upay" disabled={methodExists('upay')}>Upay</option>
                <option value="bank" disabled={methodExists('bank')}>Bank Transfer</option>
              </select>
              {formErrors.method && (
                <p className="text-red-500 text-sm mt-1">{formErrors.method}</p>
              )}
            </div>
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
                    formErrors.mobileNumber
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="e.g., 01712345678"
                />
                {formErrors.mobileNumber && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.mobileNumber}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter your {newPaymentMethod.method} registered mobile number
                </p>
              </div>
            )}
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
                      formErrors.bankName
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Dutch Bangla Bank, BRAC Bank"
                  />
                  {formErrors.bankName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.bankName}</p>
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
                      formErrors.accountHolderName
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter account holder name"
                  />
                  {formErrors.accountHolderName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.accountHolderName}</p>
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
                      formErrors.bankAccountNumber
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your account number"
                  />
                  {formErrors.bankAccountNumber && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.bankAccountNumber}</p>
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
                      formErrors.routingNumber
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter routing number or branch name"
                  />
                  {formErrors.routingNumber && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.routingNumber}</p>
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
                    className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                      formErrors.swiftCode
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter swift code"
                  />
                  {formErrors.swiftCode && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.swiftCode}</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={addPaymentMethod}
                className="w-full md:flex-1 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
              >
                Add Withdrawal Method
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                className="w-full md:w-auto px-4 py-2 btn-secondary rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

