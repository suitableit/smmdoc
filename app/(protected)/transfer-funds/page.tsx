'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { APP_NAME } from '@/lib/constants';
import { 
  ArrowRightLeft, 
  Wallet, 
  Loader2, 
  User,
  Calculator,
  CheckCircle,
  X,
  Shield,
  CreditCard,
  Zap
} from 'lucide-react';
import { FaExchangeAlt } from 'react-icons/fa';

// Mock currency context hook (replace with your actual import)
const useCurrency = () => ({
  currency: 'BDT' as 'USD' | 'BDT',
  rate: 110
});

// Toast Component
const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info' | 'pending'; onClose: () => void }) => (
  <div className={`toast toast-${type} toast-enter`}>
    {type === 'success' && <CheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <X className="toast-close-icon" />
    </button>
  </div>
);

interface TransferFundProps {
  className?: string;
}

export default function TransferFund({ className = '' }: TransferFundProps) {
  const { currency: globalCurrency, rate: globalRate } = useCurrency();
  const [username, setUsername] = useState('');
  const [amountUSD, setAmountUSD] = useState('');
  const [amountBDT, setAmountBDT] = useState('');
  const [amountBDTConverted, setAmountBDTConverted] = useState('');
  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'BDT'>('BDT');
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'pending' } | null>(null);
  const [isValidatingUser, setIsValidatingUser] = useState(false);
  const [userValidationError, setUserValidationError] = useState('');
  const [isUserValid, setIsUserValid] = useState(false);

  const rate = globalRate;

  // Set document title using useEffect for client-side
  useEffect(() => {
    document.title = `Transfer Funds — ${APP_NAME}`;
  }, []);

  // Debounced username validation
  const validateUsername = useCallback(async (usernameValue: string) => {
    if (!usernameValue.trim()) {
      setUserValidationError('');
      setIsUserValid(false);
      return;
    }

    if (usernameValue.length < 3) {
      setIsUserValid(false);
      showToast('Username must be at least 3 characters', 'error');
      return;
    }

    setIsValidatingUser(true);
    setUserValidationError('');

    try {
      const response = await fetch(`/api/user/validate-username?username=${encodeURIComponent(usernameValue)}`);
      const result = await response.json();
      
      if (result.success) {
        setIsUserValid(true);
        setUserValidationError('');
      } else {
        setIsUserValid(false);
        setUserValidationError(result.error || 'User not found');
        showToast(result.error || 'User not found', 'error');
      }
    } catch (error) {
      setIsUserValid(false);
      setUserValidationError('Error validating username');
      showToast('Error validating username', 'error');
      console.error('Username validation error:', error);
    } finally {
      setIsValidatingUser(false);
    }
  }, []);

  // Debounce username validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateUsername(username);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [username, validateUsername]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    // Reset validation states when user types
    if (value !== username) {
      setIsUserValid(false);
      setUserValidationError('');
    }
  };

  const toggleCurrency = () => {
    const newCurrency = activeCurrency === 'USD' ? 'BDT' : 'USD';
    setActiveCurrency(newCurrency);
    
    setAmountUSD('');
    setAmountBDT('');
    setAmountBDTConverted('');
  };

  const handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const usdValue = parseFloat(e.target.value) || 0;
    const bdtValue = usdValue * rate;

    setAmountUSD(e.target.value);
    setAmountBDT(bdtValue.toFixed(2));
    setAmountBDTConverted(bdtValue.toFixed(2));
  };

  const handleBDTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bdtValue = parseFloat(e.target.value) || 0;
    const usdValue = bdtValue / rate;

    setAmountBDT(e.target.value);
    setAmountUSD(usdValue.toFixed(2));
  };

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'pending' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentAmount = activeCurrency === 'USD' ? amountUSD : amountBDT;
    
    if (!username || !currentAmount) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (!isUserValid) {
      showToast('Please enter a valid username', 'error');
      return;
    }

    const transferAmount = parseFloat(currentAmount);
    if (transferAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const minAmount = activeCurrency === 'USD' ? 0.1 : 10;
    if (transferAmount < minAmount) {
      showToast(`Minimum transfer amount is ${minAmount} ${activeCurrency}`, 'error');
      return;
    }

    startTransition(async () => {
      try {
        showToast('Processing transfer...', 'pending');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Calculate fee (3%)
        const fee = transferAmount * 0.03;
        const totalAmount = transferAmount + fee;
        
        showToast(`Successfully transferred ${transferAmount} ${activeCurrency} to ${username} (Fee: ${fee.toFixed(2)} ${activeCurrency})`, 'success');
        setUsername('');
        setAmountUSD('');
        setAmountBDT('');
        setAmountBDTConverted('');
      } catch (error) {
        showToast('Transfer failed. Please try again.', 'error');
      }
    });
  };

  const currentAmount = activeCurrency === 'USD' ? parseFloat(amountUSD) || 0 : parseFloat(amountBDT) || 0;
  const fee = currentAmount * 0.03;
  const totalAmount = currentAmount + fee;

  return (
    <div className={`page-container ${className}`}>
      {/* Toast Container */}
      <div className="toast-container">
        {toastMessage && (
          <Toast 
            message={toastMessage.message} 
            type={toastMessage.type} 
            onClose={() => setToastMessage(null)} 
          />
        )}
      </div>

      <div className="page-content">
        <div className="max-w-2xl mx-auto">
          {/* Transfer Form Card */}
          <div className="card card-padding">
          <div className="card-header">
            <div className="card-icon">
              <FaExchangeAlt />
            </div>
            <h3 className="card-title">Transfer Funds</h3>
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            You can transfer funds to your friends with %3 fees only.
          </p>

          <form onSubmit={handleTransfer} className="space-y-6">
            {/* Username Field */}
            <div className="form-group">
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className={`form-input pr-10 ${
                    isUserValid 
                      ? 'border-green-300 focus:ring-green-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter friend's username"
                  disabled={isPending}
                />
                
                {/* Loading spinner */}
                {isValidatingUser && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-gray-400 w-4 h-4" />
                  </div>
                )}
                
                {/* Success check */}
                {isUserValid && !isValidatingUser && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="text-green-500 w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Amount Section */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: '20px' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title">Amount Details</h3>
                <div className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full border">
                  Rate: 1 USD = {rate} BDT
                </div>
              </div>
              
              <div className="space-y-4">
                {activeCurrency === 'USD' ? (
                  <div className="form-group">
                    <label className="form-label">Amount (USD)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amountUSD}
                        onChange={handleUSDChange}
                        className="form-input pl-14"
                        placeholder="0.00"
                        disabled={isPending}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-semibold">$</span>
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Amount (BDT)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amountBDT}
                        onChange={handleBDTChange}
                        className="form-input pl-14"
                        placeholder="0.00"
                        disabled={isPending}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-semibold">৳</span>
                    </div>
                  </div>
                )}

                {/* Currency Toggle */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={toggleCurrency}
                    className="btn btn-secondary h-12 px-6 flex items-center gap-2"
                    disabled={isPending}
                    title={`Switch to ${activeCurrency === 'USD' ? 'BDT' : 'USD'}`}
                  >
                    <ArrowRightLeft className="text-blue-600" />
                    <span className="text-sm font-semibold">
                      Switch to {activeCurrency === 'USD' ? 'BDT' : 'USD'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Converted Amount Display */}
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-2 font-medium">Converted Amount</div>
                {activeCurrency === 'USD' ? (
                  <div className="relative">
                    <input
                      type="text"
                      className="form-input pl-14 bg-gray-50 font-bold text-blue-600"
                      disabled
                      placeholder="0.00 BDT"
                      value={amountBDTConverted || '0.00'}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold">৳</span>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      className="form-input pl-14 bg-gray-50 font-bold text-blue-600"
                      disabled
                      placeholder="0.00 USD"
                      value={amountUSD || '0.00'}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold">$</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fee Breakdown */}
            {currentAmount > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Transfer Amount:</span>
                    <span className="text-lg font-semibold text-gray-900">{activeCurrency === 'USD' ? '$' : '৳'}{currentAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Processing Fee (3%):</span>
                    <span className="text-lg font-semibold text-red-600">{activeCurrency === 'USD' ? '$' : '৳'}{fee.toFixed(2)}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Total Deduction:</span>
                    <span className="text-2xl font-bold text-blue-600">{activeCurrency === 'USD' ? '$' : '৳'}{totalAmount.toFixed(2)}</span>
                  </div>
                  {activeCurrency === 'USD' && (
                    <div className="text-sm text-gray-600">
                      ≈ ৳{(totalAmount * rate).toFixed(2)} BDT
                    </div>
                  )}
                  {activeCurrency === 'BDT' && (
                    <div className="text-sm text-gray-600">
                      ≈ ${(totalAmount / rate).toFixed(2)} USD
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || !username || currentAmount <= 0 || !isUserValid || isValidatingUser}
              className="btn btn-primary w-full"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <ArrowRightLeft />
                  Transfer Now
                </div>
              )}
            </button>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
}