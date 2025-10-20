'use client';

import React from 'react';
import { ServiceType, getServiceTypeConfig } from '@/lib/serviceTypes';

interface ServiceTypeFieldsProps {
  serviceType: ServiceType;
  values: {
    comments?: string;
    username?: string;
    posts?: number;
    delay?: number;
    minQty?: number;
    maxQty?: number;
    isDripfeed?: boolean;
    dripfeedRuns?: number;
    dripfeedInterval?: number;
    isSubscription?: boolean;
  };
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export const ServiceTypeFields: React.FC<ServiceTypeFieldsProps> = ({
  serviceType,
  values,
  onChange,
  errors = {}
}) => {
  const config = getServiceTypeConfig(serviceType);

  if (!config || config.fields.length === 0) {
    return null;
  }

  const renderField = (field: any) => {
    const fieldValue = values[field.name as keyof typeof values];
    const hasError = errors[field.name];

    switch (field.type) {
      case 'text':
        return (
          <div key={field.name} className="form-group">
            <label className="form-label" htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              id={field.name}
              className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border ${
                hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200`}
              placeholder={field.placeholder || field.label}
              value={fieldValue as string || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              required={field.required}
            />
            {field.description && (
              <small className="text-xs text-gray-500 mt-1">{field.description}</small>
            )}
            {hasError && (
              <div className="text-red-500 text-xs mt-1">{hasError}</div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="form-group">
            <label className="form-label" htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={field.name}
              className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border ${
                hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-vertical`}
              placeholder={field.placeholder || field.label}
              value={fieldValue as string || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              required={field.required}
              rows={3}
            />
            {field.description && (
              <small className="text-xs text-gray-500 mt-1">{field.description}</small>
            )}
            {hasError && (
              <div className="text-red-500 text-xs mt-1">{hasError}</div>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="form-group">
            <label className="form-label" htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              id={field.name}
              className={`form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border ${
                hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              placeholder={field.placeholder || field.label}
              value={fieldValue as number || ''}
              onChange={(e) => onChange(field.name, e.target.value ? parseInt(e.target.value) : undefined)}
              required={field.required}
              min={field.min}
              max={field.max}
            />
            {field.description && (
              <small className="text-xs text-gray-500 mt-1">{field.description}</small>
            )}
            {hasError && (
              <div className="text-red-500 text-xs mt-1">{hasError}</div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="form-group">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.name}
                className="w-4 h-4 text-[var(--primary)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                checked={fieldValue as boolean || false}
                onChange={(e) => onChange(field.name, e.target.checked)}
              />
              <label className="form-label mb-0" htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {field.description && (
              <small className="text-xs text-gray-500 mt-1 ml-7">{field.description}</small>
            )}
            {hasError && (
              <div className="text-red-500 text-xs mt-1 ml-7">{hasError}</div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          {config.name} Settings
        </h4>
        <div className="space-y-4">
          {config.fields.map(renderField)}
        </div>
      </div>
    </div>
  );
};

export default ServiceTypeFields;