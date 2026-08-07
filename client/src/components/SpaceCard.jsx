import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2 } from 'lucide-react';

const SpaceCard = ({ space }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img 
          src={space.images?.[0] || 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80'} 
          alt={space.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 capitalize flex items-center shadow-sm">
          {space.type.replace('_', ' ')}
        </div>
        {!space.isActive && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center backdrop-blur-sm">
             <span className="text-white font-bold px-4 py-2 bg-red-500 rounded-lg">Temporarily Unavailable</span>
          </div>
        )}
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{space.name}</h3>
          <span className="text-primary-600 font-bold whitespace-nowrap">${space.pricePerHour || 15}/hr</span>
        </div>
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">
          {space.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 font-medium">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
            <Users className="w-4 h-4 text-gray-400" />
            <span>Up to {space.capacity}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="capitalize">{space.type.replace('_', ' ')}</span>
          </div>
        </div>
        
        <Link 
          to={`/spaces/${space._id}`}
          className="w-full py-3 px-4 bg-gray-50 text-gray-900 hover:bg-gray-900 hover:text-white font-bold tracking-wide rounded-xl transition-colors duration-200 text-center"
        >
          View Space Details
        </Link>
      </div>
    </div>
  );
};

export default SpaceCard;
