import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Wifi, Coffee, Users, ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="flex flex-col gap-24 py-10 w-full animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
            alt="Coworking Space" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Your next great idea needs the perfect space.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
            Discover and book premium desks, private offices, and meeting rooms across our state-of-the-art coworking facilities. Built for modern professionals and dynamic teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/spaces" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-900 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
            >
              Browse Spaces
            </Link>
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-primary-600 rounded-xl shadow-lg hover:bg-primary-500 transition-colors"
            >
              Start for Free
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Everything you need to succeed</h2>
          <p className="text-lg text-gray-500">We provide more than just a desk. We offer a comprehensive ecosystem designed for productivity, collaboration, and growth.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
              <Wifi className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Enterprise Grade Wi-Fi</h3>
            <p className="text-gray-500 leading-relaxed">Experience uncompromising speed and absolute reliability with our dedicated fiber optic networks and enterprise access points.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Vibrant Community</h3>
            <p className="text-gray-500 leading-relaxed">Connect, collaborate, and grow alongside a curated community of innovators, creators, and established professionals.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Amenities</h3>
            <p className="text-gray-500 leading-relaxed">From ergonomic Herman Miller chairs to soundproof phone booths and unlimited artisanal coffee, we've thought of everything.</p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-10 md:p-16 text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">Ready to elevate your workday?</h2>
          <p className="text-primary-100 text-lg mb-8 leading-relaxed">Join thousands of members who have already upgraded their work environment. Book a tour or secure your spot today in minutes.</p>
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-primary-900 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
          >
            Create your account <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
