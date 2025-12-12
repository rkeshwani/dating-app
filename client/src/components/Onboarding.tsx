import React, { useState } from 'react';
import { UserProfile, Gender } from '../types';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile: UserProfile;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialProfile }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const toggleInterest = (gender: Gender) => {
    const current = profile.interestedIn || [];
    if (current.includes(gender)) {
      setProfile({ ...profile, interestedIn: current.filter(g => g !== gender) });
    } else {
      setProfile({ ...profile, interestedIn: [...current, gender] });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Welcome to Aura Match</h2>
        <p className="text-slate-500">Let's start with the basics.</p>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
        <input 
          type="text" 
          value={profile.name}
          onChange={e => setProfile({...profile, name: e.target.value})}
          className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
          placeholder="What do you go by?"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
          <input 
            type="number" 
            value={profile.age || ''}
            onChange={e => setProfile({...profile, age: Number(e.target.value)})}
            className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
          />
        </div>
         <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Your Gender</label>
          <select 
            value={profile.gender || ""}
            onChange={e => setProfile({...profile, gender: e.target.value as Gender})}
            className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all appearance-none"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      <button 
        onClick={handleNext}
        disabled={!profile.name || !profile.age}
        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next Step <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Who are you looking for?</h2>
        <p className="text-slate-500">We'll filter your feed based on this.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">I'm interested in...</label>
        <div className="grid grid-cols-2 gap-3">
          {(['Male', 'Female'] as Gender[]).map(g => (
            <button
              key={g}
              onClick={() => toggleInterest(g)}
              className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                (profile.interestedIn || []).includes(g)
                ? 'border-rose-500 bg-rose-50 text-rose-700'
                : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
         <label className="block text-sm font-semibold text-slate-700 mb-3">Age Range: {profile.ageRangePreference.min} - {profile.ageRangePreference.max}</label>
         <div className="flex items-center gap-4">
            <input 
              type="range" min="18" max="60" 
              value={profile.ageRangePreference.min}
              onChange={e => setProfile({...profile, ageRangePreference: {...profile.ageRangePreference, min: Math.min(Number(e.target.value), profile.ageRangePreference.max)}})}
              className="w-full accent-rose-500"
            />
            <input 
              type="range" min="18" max="60" 
              value={profile.ageRangePreference.max}
              onChange={e => setProfile({...profile, ageRangePreference: {...profile.ageRangePreference, max: Math.max(Number(e.target.value), profile.ageRangePreference.min)}})}
              className="w-full accent-rose-500"
            />
         </div>
      </div>

      <div className="flex gap-3">
         <button onClick={handleBack} className="px-6 py-4 font-semibold text-slate-500 hover:text-slate-800">Back</button>
         <button 
          onClick={handleNext}
          disabled={(profile.interestedIn || []).length === 0}
          className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          Next Step <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Describe your Ideal Match</h2>
        <p className="text-slate-500">This powers our AI dating coach.</p>
      </div>

      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl shadow-xl text-white">
        <div className="flex items-center gap-2 mb-3 text-rose-300 font-bold">
           <Sparkles className="w-5 h-5" />
           The Magic Prompt
        </div>
        <textarea
          value={profile.lookingForDescription || ""}
          onChange={e => setProfile({...profile, lookingForDescription: e.target.value})}
          className="w-full h-40 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white/20 transition-all resize-none leading-relaxed"
          placeholder="E.g., Someone kind, adventurous, loves dogs, and wants to travel..."
        />
      </div>

      <div className="flex gap-3">
         <button onClick={handleBack} className="px-6 py-4 font-semibold text-slate-500 hover:text-slate-800">Back</button>
         <button 
          onClick={() => onComplete({...profile, onboardingCompleted: true})}
          disabled={(profile.lookingForDescription || "").length < 10}
          className="flex-1 bg-rose-500 text-white py-4 rounded-xl font-bold hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-200 disabled:opacity-50"
        >
          Finish & Explore <Check className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-6">
       <div className="w-full max-w-md">
          {/* Progress Steps */}
          <div className="flex justify-center gap-2 mb-12">
             {[1, 2, 3].map(i => (
               <div key={i} className={`h-2 rounded-full transition-all duration-300 ${step >= i ? 'w-8 bg-rose-500' : 'w-2 bg-slate-200'}`} />
             ))}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
             {step === 1 && renderStep1()}
             {step === 2 && renderStep2()}
             {step === 3 && renderStep3()}
          </div>
       </div>
    </div>
  );
};

export default Onboarding;