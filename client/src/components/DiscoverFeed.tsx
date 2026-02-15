import React, { useState, useEffect } from 'react';
import { MatchProfile, UserProfile, Gender, PoliticalView, WantsChildren } from '../types';
import { X, Heart, Star, MapPin, SlidersHorizontal, RotateCcw, Baby, Vote, Users } from 'lucide-react';

import { getMatchRecommendations } from '../services/api';

// Helper to map API response to MatchProfile
// Defaults used for fields not yet in DB
const mapRecommendationToProfile = (rec: any): MatchProfile => {
  const target = rec.targetUser;
  return {
    id: target.id,
    name: target.name || 'Unknown',
    age: target.age || 25,
    gender: (target.gender as Gender) || 'Male',
    bio: target.bio || '',
    matchPercentage: rec.score || 0,
    imageUrl: target.photoUrl || 'https://via.placeholder.com/400x600',
    interests: target.interests || [],
    politicalView: 'Apolitical', // Default
    wantsChildren: 'Maybe', // Default
    hasChildren: false // Default
  };
};

interface FilterModalProps {
  show: boolean;
  onClose: () => void;
  // State Setters
  minAge: number; setMinAge: (n: number) => void;
  maxAge: number; setMaxAge: (n: number) => void;
  minMatch: number; setMinMatch: (n: number) => void;
  interestFilter: string; setInterestFilter: (s: string) => void;
  genderFilter: Gender[]; setGenderFilter: (g: Gender[]) => void;
  politicsFilter: PoliticalView | 'Any'; setPoliticsFilter: (p: PoliticalView | 'Any') => void;
  hasChildrenFilter: boolean | 'Any'; setHasChildrenFilter: (v: boolean | 'Any') => void;
  wantsChildrenFilter: WantsChildren | 'Any'; setWantsChildrenFilter: (v: WantsChildren | 'Any') => void;

  onApply: () => void;
  onReset: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  onClose,
  minAge, setMinAge,
  maxAge, setMaxAge,
  minMatch, setMinMatch,
  interestFilter, setInterestFilter,
  genderFilter, setGenderFilter,
  politicsFilter, setPoliticsFilter,
  hasChildrenFilter, setHasChildrenFilter,
  wantsChildrenFilter, setWantsChildrenFilter,
  onApply, onReset
}) => {

  const toggleGender = (g: Gender) => {
    if (genderFilter.includes(g)) {
      if (genderFilter.length > 1) setGenderFilter(genderFilter.filter(x => x !== g));
    } else {
      setGenderFilter([...genderFilter, g]);
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md rounded-3xl p-6 flex flex-col animate-fade-in border border-slate-200 shadow-2xl">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" /> Filters
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Age Range */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Age Range</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={minAge}
              onChange={(e) => setMinAge(Number(e.target.value))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <span className="text-slate-300 font-bold">-</span>
            <input
              type="number"
              value={maxAge}
              onChange={(e) => setMaxAge(Number(e.target.value))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
            <Users className="w-3 h-3" /> Gender
          </label>
          <div className="flex gap-2">
            {(['Male', 'Female'] as Gender[]).map(g => (
              <button
                key={g}
                onClick={() => toggleGender(g)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${genderFilter.includes(g)
                    ? 'bg-rose-100 text-rose-700 border-2 border-rose-200'
                    : 'bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100'
                  }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Politics */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
            <Vote className="w-3 h-3" /> Politics
          </label>
          <select
            value={politicsFilter}
            onChange={(e) => setPoliticsFilter(e.target.value as PoliticalView | 'Any')}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200 appearance-none"
          >
            <option value="Any">Any</option>
            <option value="Liberal">Liberal</option>
            <option value="Moderate">Moderate</option>
            <option value="Conservative">Conservative</option>
            <option value="Apolitical">Apolitical</option>
          </select>
        </div>

        {/* Children Preference */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
              <Baby className="w-3 h-3" /> Has Kids?
            </label>
            <div className="flex flex-col gap-1">
              {[
                { label: 'Any', value: 'Any' },
                { label: 'No', value: false },
                { label: 'Yes', value: true }
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setHasChildrenFilter(opt.value as boolean | 'Any')}
                  className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all text-left ${hasChildrenFilter === opt.value
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
              Wants Kids?
            </label>
            <div className="flex flex-col gap-1">
              {['Any', 'Yes', 'No', 'Maybe'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setWantsChildrenFilter(opt as WantsChildren | 'Any')}
                  className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all text-left ${wantsChildrenFilter === opt
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Min Match % */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Min Match Score</label>
            <span className="text-rose-500 font-bold text-sm">{minMatch}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={minMatch}
            onChange={(e) => setMinMatch(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>

        {/* Interest Filter */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Specific Interest</label>
          <input
            type="text"
            value={interestFilter}
            onChange={(e) => setInterestFilter(e.target.value)}
            placeholder="e.g. Hiking"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200 placeholder:text-slate-400 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={onReset}
          className="px-6 py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors text-sm"
        >
          Reset
        </button>
        <button
          onClick={onApply}
          className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg text-sm"
        >
          Show Matches
        </button>
      </div>
    </div>
  );
}

interface DiscoverFeedProps {
  userProfile: UserProfile;
}

const DiscoverFeed: React.FC<DiscoverFeedProps> = ({ userProfile }) => {
  // Initialize filter state with user preferences
  const [showFilters, setShowFilters] = useState(false);
  const [minAge, setMinAge] = useState(userProfile.ageRangePreference.min);
  const [maxAge, setMaxAge] = useState(userProfile.ageRangePreference.max);
  const [minMatch, setMinMatch] = useState(0);
  const [interestFilter, setInterestFilter] = useState('');

  // New Filters State
  const [genderFilter, setGenderFilter] = useState<Gender[]>(userProfile.interestedIn);
  const [politicsFilter, setPoliticsFilter] = useState<PoliticalView | 'Any'>('Any');
  const [hasChildrenFilter, setHasChildrenFilter] = useState<boolean | 'Any'>('Any');
  const [wantsChildrenFilter, setWantsChildrenFilter] = useState<WantsChildren | 'Any'>('Any');

  const [lastDirection, setLastDirection] = useState<string | null>(null);

  // State
  const [allProfiles, setAllProfiles] = useState<MatchProfile[]>([]);
  const [profiles, setProfiles] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch matches on mount
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const recommendations = await getMatchRecommendations('one_way');
        const mapped = recommendations.map(mapRecommendationToProfile);
        setAllProfiles(mapped);
        // Initial filter will happen in effect below or we can set it here
        // But since we rely on userProfile for initial filters, let's wait/trigger it.
      } catch (err) {
        console.error("Failed to fetch matches", err);
        setError("Failed to load matches.");
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  // Filter Logic
  const filterProfiles = () => {
    return allProfiles.filter(p => {
      const matchGender = genderFilter.includes(p.gender);
      const matchAge = p.age >= minAge && p.age <= maxAge;
      const matchScore = p.matchPercentage >= minMatch;
      const matchInterest = interestFilter === '' || p.interests.some(i => i.toLowerCase().includes(interestFilter.toLowerCase()));
      const matchPolitics = politicsFilter === 'Any' || p.politicalView === politicsFilter;
      const matchHasChildren = hasChildrenFilter === 'Any' || p.hasChildren === hasChildrenFilter;
      const matchWantsChildren = wantsChildrenFilter === 'Any' || p.wantsChildren === wantsChildrenFilter;

      return matchGender && matchAge && matchScore && matchInterest && matchPolitics && matchHasChildren && matchWantsChildren;
    });
  };

  // Re-run filter when filters change or profiles change
  useEffect(() => {
    setProfiles(filterProfiles());
  }, [allProfiles, minAge, maxAge, minMatch, interestFilter, genderFilter, politicsFilter, hasChildrenFilter, wantsChildrenFilter]);

  // Re-run filter when Apply is clicked (or initially)
  const applyFilters = () => {
    setProfiles(filterProfiles());
    setShowFilters(false);
  };

  const resetFilters = () => {
    setMinAge(userProfile.ageRangePreference.min);
    setMaxAge(userProfile.ageRangePreference.max);
    setMinMatch(0);
    setInterestFilter('');
    setGenderFilter(userProfile.interestedIn);
    setPoliticsFilter('Any');
    setHasChildrenFilter('Any');
    setWantsChildrenFilter('Any');

    // We can't immediately call setProfiles because state updates are async, 
    // so we manually pass the reset values to filterProfiles or just reset profiles directly based on logic.
    // Easier to just filter based on "reset" values manually here:
    const resetFiltered = allProfiles.filter(p =>
      userProfile.interestedIn.includes(p.gender) &&
      p.age >= userProfile.ageRangePreference.min &&
      p.age <= userProfile.ageRangePreference.max
    );
    setProfiles(resetFiltered);
    setShowFilters(false);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    setLastDirection(direction);
    setTimeout(() => {
      setProfiles(prev => prev.slice(1));
      setLastDirection(null);
    }, 300);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-slate-500">
        {error}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 relative">
        <button
          onClick={() => setShowFilters(true)}
          className="absolute top-0 right-0 p-2 text-slate-400 hover:text-rose-500 transition-colors"
        >
          <SlidersHorizontal className="w-6 h-6" />
        </button>

        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No more profiles</h2>
        <p className="text-slate-500 mb-6">Refine your filters to see more people.</p>

        <div className="flex gap-4">
          <button
            onClick={resetFilters}
            className="px-6 py-2 bg-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-300 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Reset Filters
          </button>
        </div>

        {showFilters && (
          <FilterModal
            show={showFilters}
            onClose={() => setShowFilters(false)}
            minAge={minAge} setMinAge={setMinAge}
            maxAge={maxAge} setMaxAge={setMaxAge}
            minMatch={minMatch} setMinMatch={setMinMatch}
            interestFilter={interestFilter} setInterestFilter={setInterestFilter}
            genderFilter={genderFilter} setGenderFilter={setGenderFilter}
            politicsFilter={politicsFilter} setPoliticsFilter={setPoliticsFilter}
            hasChildrenFilter={hasChildrenFilter} setHasChildrenFilter={setHasChildrenFilter}
            wantsChildrenFilter={wantsChildrenFilter} setWantsChildrenFilter={setWantsChildrenFilter}
            onApply={applyFilters}
            onReset={resetFilters}
          />
        )}
      </div>
    );
  }

  const currentProfile = profiles[0];

  return (
    <div className="max-w-md mx-auto relative h-[70vh]">
      {/* Filter Trigger Button */}
      <div className="absolute top-0 right-0 z-30 -mt-12 md:mt-0 md:top-4 md:right-4">
        <button
          onClick={() => setShowFilters(true)}
          className="bg-white p-2 rounded-full shadow-md text-slate-600 hover:text-rose-500 hover:shadow-lg transition-all border border-slate-100"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <FilterModal
          show={showFilters}
          onClose={() => setShowFilters(false)}
          minAge={minAge} setMinAge={setMinAge}
          maxAge={maxAge} setMaxAge={setMaxAge}
          minMatch={minMatch} setMinMatch={setMinMatch}
          interestFilter={interestFilter} setInterestFilter={setInterestFilter}
          genderFilter={genderFilter} setGenderFilter={setGenderFilter}
          politicsFilter={politicsFilter} setPoliticsFilter={setPoliticsFilter}
          hasChildrenFilter={hasChildrenFilter} setHasChildrenFilter={setHasChildrenFilter}
          wantsChildrenFilter={wantsChildrenFilter} setWantsChildrenFilter={setWantsChildrenFilter}
          onApply={applyFilters}
          onReset={resetFilters}
        />
      )}

      {/* Card Stack Effect */}
      <div className="absolute top-4 left-4 right-4 bottom-4 bg-white rounded-3xl shadow-md border border-slate-100 transform rotate-2 z-0"></div>
      <div className="absolute top-2 left-2 right-2 bottom-6 bg-white rounded-3xl shadow-lg border border-slate-100 transform -rotate-1 z-10"></div>

      {/* Active Card */}
      <div className={`
        absolute inset-0 bg-white rounded-3xl shadow-xl overflow-hidden z-20 border border-slate-200 flex flex-col
        transition-transform duration-300 ease-out
        ${lastDirection === 'left' ? '-translate-x-full rotate-[-20deg] opacity-0' : ''}
        ${lastDirection === 'right' ? 'translate-x-full rotate-[20deg] opacity-0' : ''}
      `}>
        {/* Image Area */}
        <div className="relative flex-1 bg-slate-200">
          <img
            src={currentProfile.imageUrl}
            alt={currentProfile.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-emerald-600 flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-emerald-600" />
            {currentProfile.matchPercentage}% Match
          </div>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-24 text-white">
            <h2 className="text-3xl font-bold flex items-end gap-2">
              {currentProfile.name}
              <span className="text-xl font-normal opacity-80">{currentProfile.age}</span>
              <span className="text-sm font-normal opacity-70 ml-1 bg-white/20 px-2 py-0.5 rounded-full">{currentProfile.gender}</span>
            </h2>
            <div className="flex flex-wrap gap-3 mt-3 opacity-90 text-sm font-medium">
              {/* Quick Info Tags on Image Overlay */}
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 5 mi</span>
              {currentProfile.hasChildren && <span className="flex items-center gap-1"><Baby className="w-3 h-3" /> Has Kids</span>}
              {currentProfile.politicalView !== 'Apolitical' && <span className="flex items-center gap-1"><Vote className="w-3 h-3" /> {currentProfile.politicalView}</span>}
            </div>
          </div>
        </div>

        {/* Details Area */}
        <div className="p-6 h-1/3 flex flex-col">
          <div className="flex flex-wrap gap-2 mb-4">
            {currentProfile.interests.map(i => (
              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">{i}</span>
            ))}
          </div>
          <p className="text-slate-600 text-sm line-clamp-3 flex-1">
            {currentProfile.bio}
          </p>

          {/* Actions */}
          <div className="flex justify-center gap-6 mt-4">
            <button
              onClick={() => handleSwipe('left')}
              className="w-14 h-14 rounded-full bg-white border-2 border-slate-200 text-slate-400 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center shadow-sm"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="w-14 h-14 rounded-full bg-rose-500 text-white hover:bg-rose-600 hover:scale-110 transition-all flex items-center justify-center shadow-lg shadow-rose-200"
            >
              <Heart className="w-6 h-6 fill-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverFeed;