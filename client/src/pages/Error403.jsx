import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Error403 = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center max-w-md">
        <div className="bg-red-50 p-6 rounded-full mb-6 relative">
           <ShieldAlert className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-7xl font-black text-gray-900 tracking-tight mb-2">403</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          You lack the required security clearance to view this area.
        </p>
        <Link
          to="/dashboard"
          className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-900/20"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Error403;
