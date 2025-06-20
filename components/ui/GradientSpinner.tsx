import React from 'react';

interface GradientSpinnerProps {
  size?: string;
  className?: string;
}

/**
 * GradientSpinner - A consistent gradient loading spinner component
 * Used throughout the SMMDOC application for all loading states
 * 
 * @param size - Tailwind size classes (e.g., 'w-4 h-4', 'w-6 h-6', 'w-16 h-16')
 * @param className - Additional CSS classes
 */
export const GradientSpinner: React.FC<GradientSpinnerProps> = ({ 
  size = 'w-16 h-16', 
  className = '' 
}) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

export default GradientSpinner;
