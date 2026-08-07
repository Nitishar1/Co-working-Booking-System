import React from 'react';
import { Loader2 } from 'lucide-react';
import { classNames } from '../utils/helpers';

const LoadingSpinner = ({ fullScreen, className }) => {
  const content = (
    <div className={classNames('flex flex-col items-center justify-center space-y-4', className)}>
      <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      <span className="text-gray-500 font-medium tracking-wide">Loading workspace...</span>
    </div>
  );

  return fullScreen ? (
    <div className="fixed inset-0 min-h-screen bg-gray-50 flex items-center justify-center z-50">
      {content}
    </div>
  ) : (
    <div className="py-16 flex items-center justify-center">
      {content}
    </div>
  );
};

export default LoadingSpinner;
