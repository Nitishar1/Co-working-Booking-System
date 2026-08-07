import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

const Error404 = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
      <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center max-w-md">
        <div className="bg-gray-50 p-6 rounded-full mb-6 relative">
           <FileQuestion className="w-16 h-16 text-primary-500" />
           <div className="absolute top-0 right-0 w-4 h-4 bg-red-400 rounded-full animate-ping" />
        </div>
        <h1 className="text-7xl font-black text-gray-900 tracking-tight mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Page not found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Maybe check your coordinates?
        </p>
        <Link
          to="/"
          className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          Return to home
        </Link>
      </div>
    </div>
  );
};

export default Error404;
