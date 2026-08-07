import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Building2, LogIn, UserPlus, FileText } from 'lucide-react';

const MainLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <header className="bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2 shrink-0 group">
              <div className="bg-primary-600 p-2 rounded-lg transform group-hover:rotate-6 transition-transform">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">CoWork<span className="text-primary-600">.</span></span>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/spaces" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">
                Find exactly what you need
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                  className="flex items-center space-x-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium flex items-center space-x-1 transition-colors">
                    <LogIn className="w-4 h-4" />
                    <span>Sign in</span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center space-x-1 transition-all active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Get Started</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <Outlet />
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
             <Building2 className="h-5 w-5 text-gray-400" />
             <span className="text-gray-500 font-medium">CoWork</span>
          </div>
          <div className="text-sm text-gray-400 mt-4 md:mt-0">
            &copy; {new Date().getFullYear()} CoWork Booking System. Built for productivity and collaboration.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
