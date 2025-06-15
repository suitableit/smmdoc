import { CreateServiceForm } from '@/components/admin/services/createServiceForm';
import React from 'react';
import { 
  FaEye,
  FaPlus,
  FaArrowLeft,
  FaSync
} from 'react-icons/fa';

// Toast Component
const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info' | 'pending'; onClose: () => void }) => (
  <div className={`toast toast-${type} toast-enter`}>
    {type === 'success' && <FaCheckCircle className="toast-icon" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="toast-close">
      <FaTimes className="toast-close-icon" />
    </button>
  </div>
);

export default function CreateServicesPage() {
  return (
    <div className="page-container">
      <div className="page-content">
        {/* Page Header */}
        <div className="page-header mb-6">
          <div className="flex gap-2">
            <button 
              className="btn btn-secondary flex items-center gap-2"
            >
              <FaArrowLeft />
              Back
            </button>
            <button 
              className="btn btn-primary flex items-center gap-2"
            >
              <FaEye />
              View All Services
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="card">
          <div className="card-header" style={{ padding: '24px 24px 0 24px' }}>
            <div className="flex items-center gap-2 flex-1">
              <div className="card-icon">
                <FaPlus />
              </div>
              <h3 className="card-title">Create New Service</h3>
              <span className="ml-auto bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm font-medium">
                Create Service
              </span>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            <div className="flex flex-col items-center justify-center py-10">
              <CreateServiceForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}