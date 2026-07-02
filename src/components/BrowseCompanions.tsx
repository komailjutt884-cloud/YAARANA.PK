import React, { useState } from 'react';
import { Companion } from '../types';
import { Search, Heart, MapPin, Star, Sparkles, Filter, SlidersHorizontal, X } from 'lucide-react';

interface BrowseCompanionsProps {
  companions: Companion[];
  onSelectCompanion: (companion: Companion) => void;
  onSeedDemoCompanions?: () => void;
  isAdmin: boolean;
}

export default function BrowseCompanions({ companions, onSelectCompanion, onSeedDemoCompanions, isAdmin }: BrowseCompanionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<string>('All');
  const [selectedCompanionForModal, setSelectedCompanionForModal] = useState<Companion | null>(null);

  // List of all Pakistani companion services
  const ALL_SERVICES = [
    "Dining Out",
    "Movies & Cinema",
    "Call Companionship",
    "Scenic Travel",
    "Spending a Day Together",
    "Spending a Night Together"
  ];

  const filteredCompanions = companions.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          comp.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = selectedGender === 'All' || comp.gender === selectedGender;
    const matchesService = selectedService === 'All' || comp.services.includes(selectedService);
    return matchesSearch && matchesGender && matchesService;
  });

  const handleOpenDetail = (companion: Companion) => {
    setSelectedCompanionForModal(companion);
  };

  return (
    <div className="space-y-8">
      {/* Banner / Hero Section */}
      <div className="bg-gradient-to-br from-brand via-brand/90 to-pink-500 rounded-[32px] p-8 text-white shadow-xl shadow-brand/10 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-15 w-1/3 flex items-center justify-center">
          <Sparkles className="w-40 h-40" />
        </div>
        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="bg-white/20 text-white backdrop-blur-md text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
            Yaarana.pk Premium
          </span>
          <h1 className="text-3xl md:text-4xl font-black font-display tracking-tight leading-tight">
            Find your perfect companion
          </h1>
          <p className="text-rose-100 text-xs md:text-sm font-medium leading-relaxed max-w-xl">
            Browse certified local companions for high-end dining, cinema dates, scenic travels, or warm phone calls. Verified profiles only. Admin approved & ready to meet.
          </p>
        </div>
      </div>

      {/* Control Area (Search & Filters) */}
      <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search companions by name or city (e.g. Lahore, Karachi)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/80 focus:bg-white rounded-[16px] border border-gray-100 outline-none focus:border-brand/40 text-xs font-semibold text-gray-750 transition-all placeholder-gray-400"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-4 py-3 bg-gray-50 hover:bg-gray-100/80 rounded-[16px] border border-gray-100 text-xs font-extrabold text-gray-650 outline-none cursor-pointer focus:border-brand/40 transition-all"
            >
              <option value="All">All Genders</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-4 py-3 bg-gray-50 hover:bg-gray-100/80 rounded-[16px] border border-gray-100 text-xs font-extrabold text-gray-650 outline-none cursor-pointer focus:border-brand/40 transition-all max-w-[200px]"
            >
              <option value="All">All Services</option>
              {ALL_SERVICES.map((srv, idx) => (
                <option key={idx} value={srv}>{srv}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Companions Grid */}
      {filteredCompanions.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-gray-200 shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto border border-rose-100/30 text-brand">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-gray-800 font-display">No Companions Found</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              No profiles found matching those filters. Try resetting the search, or use the database seeding control below to pre-populate with beautiful test companions.
            </p>
            {onSeedDemoCompanions && (
              <button
                onClick={onSeedDemoCompanions}
                className="mt-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white font-extrabold rounded-2xl shadow-md transition-all text-xs"
              >
                Seed 5 Pre-made Companion Profiles
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCompanions.map((comp) => (
            <div
              key={comp.id}
              className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Image & Badges */}
              <div className="w-full aspect-[4/5] bg-gray-100 rounded-[24px] mb-4 overflow-hidden relative">
                <img
                  src={comp.photoUrl}
                  alt={comp.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Rating Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-gray-100/50">
                  <span className="text-accent text-xs">★</span>
                  <span className="text-xs font-black text-gray-800">{comp.rating}</span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-wider text-white shadow-sm ${
                    comp.availability === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}>
                    {comp.availability}
                  </span>
                </div>

                {/* Location overlay badge */}
                <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white font-bold text-[10px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand" />
                  <span>{comp.location.split(',')[0]}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-xl text-gray-900 font-display">
                    {comp.name}, <span className="text-gray-500 font-normal">{comp.age}</span>
                  </h3>
                  
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed italic">
                    "{comp.about}"
                  </p>
                </div>

                {/* Services Tags */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {comp.services.slice(0, 3).map((srv, idx) => (
                      <span key={idx} className="bg-active-bg text-brand text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-brand/10">
                        {srv}
                      </span>
                    ))}
                    {comp.services.length > 3 && (
                      <span className="bg-gray-50 text-gray-400 text-[9px] font-bold px-2 py-1 rounded-lg border border-gray-100">
                        +{comp.services.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="border-t border-gray-100/60 pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Rate/Fee</span>
                      <span className="text-lg font-black text-brand">
                        Rs. {comp.rate.toLocaleString()}
                        <span className="text-xs text-gray-400 font-normal">/hr</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenDetail(comp)}
                      className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-brand hover:scale-105 active:scale-95 transition-all shadow-md shadow-gray-950/10"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Companion Details Modal */}
      {selectedCompanionForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCompanionForModal(null)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-600 p-2 rounded-full shadow-md transition-all active:scale-90 border border-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="relative h-64 bg-gray-100 shrink-0">
              <img
                src={selectedCompanionForModal.photoUrl}
                alt={selectedCompanionForModal.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider text-white shadow-sm ${
                    selectedCompanionForModal.availability === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}>
                    {selectedCompanionForModal.availability}
                  </span>
                  <span className="bg-white/20 text-white backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-widest border border-white/10">
                    Verified Partner
                  </span>
                </div>
                <h2 className="text-2xl font-black font-display mt-1">
                  {selectedCompanionForModal.name}, <span className="font-light text-rose-200">{selectedCompanionForModal.age}</span>
                </h2>
                <div className="flex items-center gap-4 text-xs text-rose-100 mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand" />{selectedCompanionForModal.location}</span>
                  <span className="flex items-center gap-1 font-bold text-accent"><span className="text-accent text-sm">★</span>{selectedCompanionForModal.rating} ({selectedCompanionForModal.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">About {selectedCompanionForModal.name}</h4>
                <p className="text-xs text-gray-600 leading-relaxed italic bg-active-bg/50 p-4 rounded-[18px] border border-brand/5">
                  "{selectedCompanionForModal.about}"
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Companionship Pricing</h4>
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-[18px] border border-gray-100">
                  <span className="text-xs font-bold text-gray-500">Hourly Direct Booking Fee</span>
                  <span className="text-lg font-black text-brand">Rs. {selectedCompanionForModal.rate.toLocaleString()} / Hour</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Available Activities & Services</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCompanionForModal.services.map((srv, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-active-bg/30 px-3 py-2.5 rounded-xl border border-brand/5">
                      <span className="w-1.5 h-1.5 bg-brand rounded-full shrink-0" />
                      <span className="text-xs font-extrabold text-gray-700">{srv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0 flex gap-3">
              <button
                onClick={() => setSelectedCompanionForModal(null)}
                className="w-1/3 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl text-xs hover:bg-gray-100/50 transition-all duration-200"
              >
                Close Profile
              </button>
              <button
                onClick={() => {
                  onSelectCompanion(selectedCompanionForModal);
                  setSelectedCompanionForModal(null);
                }}
                className="w-2/3 py-3 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl text-xs hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Hire {selectedCompanionForModal.name} Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
