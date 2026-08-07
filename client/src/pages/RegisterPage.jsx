import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Building2, User, Mail, Lock, Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm();
  const { sendOtp } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const onRegisterSubmit = async (data) => {
    setIsLoading(true);
    setGeneralError('');
    try {
      await sendOtp(data.name, data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      setGeneralError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md relative overflow-hidden">
        
        <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-primary-100 blur-3xl opacity-50 pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-900 mb-5 shadow-lg transform rotate-3">
            <Building2 className="w-7 h-7 text-white transform -rotate-3" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an account</h2>
          <p className="text-gray-500 mt-2">Join us and book your first workspace</p>
        </div>

        {generalError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 relative z-10">
            <p className="text-sm font-medium text-red-700">{generalError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="name">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                {...formRegister('name', { required: 'Name is required' })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 transition-colors"
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-500 font-medium">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="email">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                {...formRegister('email', { required: 'Email is required' })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="password">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                {...formRegister('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' }
                })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 transition-colors"
                placeholder="•••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500 font-medium">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-4 flex items-center justify-center bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-900/20 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register & Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-gray-600 relative z-10">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
