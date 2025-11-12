'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import UserSwitchIcon from './UserSwitchIcon';

const Toast = ({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'pending';
  onClose: () => void;
}) => (
  <div className={`toast toast-${type} toast-enter`}>
    {type === 'success' && <FaCheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

const UserSwitchWrapper = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const router = useRouter();

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSwitchBack = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/switch-back', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Successfully switched back to admin account', 'success');

        window.location.href = '/admin';
      } else {
        showToast(data.error || 'Failed to switch back', 'error');
      }
    } catch (error) {
      console.error('Switch back error:', error);
      showToast('An error occurred while switching back', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="toast-container">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>

      <UserSwitchIcon 
        onSwitchBack={handleSwitchBack}
        isLoading={isLoading}
      />
    </>
  );
};

export default UserSwitchWrapper;