import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Shield } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto w-full animate-in fade-in duration-300">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Your Profile</h1>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800" />
        <div className="px-8 pb-8">
           <div className="relative flex justify-between items-end -mt-16 mb-8">
              <div className="w-32 h-32 bg-white rounded-full p-2 relative z-10 shadow-sm border border-gray-50">
                 <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center text-white text-5xl font-extrabold shadow-inner">
                    {user.name.charAt(0).toUpperCase()}
                 </div>
              </div>
           </div>
           
           <div className="space-y-8">
              <div>
                 <h2 className="text-3xl font-extrabold text-gray-900">{user.name}</h2>
                 <p className="text-gray-500 font-semibold capitalize mt-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary-500" /> {user.role}
                 </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-100">
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Email Address</p>
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-900 font-bold text-lg">
                       <Mail className="w-6 h-6 text-gray-400" />
                       {user.email}
                    </div>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Member Since</p>
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-900 font-bold text-lg">
                       <User className="w-6 h-6 text-gray-400" />
                       {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
