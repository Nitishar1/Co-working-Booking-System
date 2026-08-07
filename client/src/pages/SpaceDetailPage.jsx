import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSpaceById } from '../services/spaceService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Building2, Users, CheckCircle2, ArrowLeft, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SpaceDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [currentImageIdx, setCurrentImageIdx] = React.useState(0);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['space', id],
    queryFn: () => getSpaceById(id),
  });

  if (isLoading) return <LoadingSpinner fullScreen />;
  
  if (error || !data?.data?.space) return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Space not found</h2>
      <p className="text-gray-500 mb-8 max-w-md">The space you are looking for does not exist or has been removed.</p>
      <Link to="/spaces" className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition flex items-center">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to all spaces
      </Link>
    </div>
  );

  const space = data.data.space;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex items-center">
        <Link to="/spaces" className="text-gray-500 hover:text-gray-900 transition flex items-center text-sm font-semibold tracking-wide">
          <ArrowLeft className="w-4 h-4 mr-2" /> <span>Back to spaces</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-md relative bg-gray-100 border border-gray-100">
            {space.images?.length > 0 ? (
              <>
                <img 
                  src={space.images[currentImageIdx]} 
                  alt={`${space.name} view ${currentImageIdx + 1}`} 
                  className="w-full h-full object-cover transition-opacity duration-300" 
                />
                {space.images.length > 1 && (
                  <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
                    {space.images.map((_, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setCurrentImageIdx(idx)} 
                        className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentImageIdx ? 'bg-white scale-125 shadow' : 'bg-white/50 hover:bg-white/80'}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80" 
                alt={space.name} 
                className="w-full h-full object-cover" 
              />
            )}
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-5 py-2 rounded-full text-sm font-bold text-gray-900 capitalize shadow-lg">
              {space.type.replace('_', ' ')}
            </div>
            {!space.isActive && (
              <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center backdrop-blur-sm">
                 <span className="text-white font-black text-2xl tracking-tight px-8 py-4 bg-red-500/90 rounded-2xl shadow-2xl">Temporarily Unavailable</span>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
               <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">{space.name}</h1>
               <div className="bg-primary-50 px-5 py-3 rounded-2xl border border-primary-100 shrink-0 text-center">
                 <span className="block text-primary-700 font-extrabold text-2xl leading-none">${space.pricePerHour || 15}</span>
                 <span className="text-primary-600 text-xs font-bold uppercase tracking-wider">Per Hour</span>
               </div>
            </div>
            
            <p className="text-xl text-gray-600 leading-relaxed mb-8">{space.description}</p>
            
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
                <Users className="w-6 h-6 text-gray-400" />
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Capacity</p>
                   <p className="font-bold text-gray-900 leading-none">Up to {space.capacity} people</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
                <Building2 className="w-6 h-6 text-gray-400" />
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Space Type</p>
                   <p className="font-bold text-gray-900 leading-none capitalize">{space.type.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {space.amenities && space.amenities.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Included Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                  {space.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center text-gray-700 font-medium font-medium">
                      <CheckCircle2 className="w-6 h-6 text-primary-500 mr-3 shrink-0" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Book this space</h3>
            <p className="text-gray-500 mb-8 font-medium">Head over to your dashboard to check real-time availability and secure your spot.</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <CalendarIcon className="w-6 h-6 text-gray-400" />
                <span className="font-bold">Real-time availability</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <Clock className="w-6 h-6 text-gray-400" />
                <span className="font-bold">Instant approval</span>
              </div>
            </div>
            
            {!space.isActive ? (
              <button disabled className="w-full py-4 px-6 bg-gray-100 text-gray-400 font-bold tracking-wide rounded-xl cursor-not-allowed">
                Currently Unavailable
              </button>
            ) : user ? (
              <Link
                to={`/dashboard?space=${space._id}`}
                className="block text-center w-full py-4 px-6 bg-gray-900 text-white font-bold tracking-wide rounded-xl shadow-lg shadow-gray-900/20 hover:bg-gray-800 transition active:scale-[0.98]"
              >
                Go to Booking Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                state={{ from: { pathname: `/dashboard?space=${space._id}` } }}
                className="block text-center w-full py-4 px-6 bg-primary-600 text-white font-bold tracking-wide rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition active:scale-[0.98]"
              >
                Log in to Book
              </Link>
            )}
            
            <p className="text-xs text-center text-gray-400 mt-6 font-bold uppercase tracking-wider">
              No credit card required for booking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceDetailPage;
