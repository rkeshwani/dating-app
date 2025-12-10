import React, { useState, useRef } from 'react';
import { UserProfile, AiAnalysisResult } from '../types';
import { analyzeProfile, analyzeImageMetadata } from '../services/api';
import AnalysisPanel from './AnalysisPanel';
import { Camera, MapPin, Briefcase, Heart, Wand2, Loader2, Save, ScanFace } from 'lucide-react';

interface ProfileEditorProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, setProfile }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [currentInterest, setCurrentInterest] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleInterestAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInterest.trim() && !profile.interests.includes(currentInterest.trim())) {
      setProfile({
        ...profile,
        interests: [...profile.interests, currentInterest.trim()]
      });
      setCurrentInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter(i => i !== interest)
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      // Update the profile immediately with the new image
      setProfile(prev => ({ ...prev, photoUrl: base64String }));
      
      // Analyze image
      setIsAnalyzingImage(true);
      try {
        const metadata = await analyzeImageMetadata(base64String);
        setProfile(prev => ({
          ...prev,
          hairColor: metadata.hairColor,
          eyeColor: metadata.eyeColor,
          bodyType: metadata.bodyType
        }));
      } catch (error) {
        console.error("Failed to analyze image", error);
        alert("Could not analyze image. Please try a different photo.");
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    setShowAnalysis(true); // Open the panel immediately in loading state
    try {
      const result = await analyzeProfile(profile);
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      alert("Something went wrong with the AI coach. Make sure you have an API key configured.");
      setShowAnalysis(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto pb-24">
      {/* AI Analysis Panel Overlay */}
      {(showAnalysis || isAnalyzing) && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setShowAnalysis(false)}
          />
          <AnalysisPanel 
            analysis={analysisResult} 
            isLoading={isAnalyzing} 
            onClose={() => setShowAnalysis(false)} 
          />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Photo & Basic Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative group">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handlePhotoUpload}
            />
            <div className="aspect-[3/4] bg-slate-100 relative">
               <img 
                  src={profile.photoUrl} 
                  alt="Profile" 
                  className={`w-full h-full object-cover transition-opacity duration-300 ${isAnalyzingImage ? 'opacity-50 blur-sm' : ''}`}
                />
               {isAnalyzingImage && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-500 font-semibold z-10">
                   <Loader2 className="w-8 h-8 animate-spin mb-2" />
                   <span>Analyzing Vibe...</span>
                 </div>
               )}
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center z-20">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Change Photo
                  </button>
               </div>
            </div>
            <div className="p-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className="w-full text-xl font-bold text-slate-900 border-b-2 border-transparent focus:border-rose-500 focus:outline-none bg-transparent placeholder-slate-300"
                placeholder="Your Name"
              />
              <div className="flex gap-4 mt-4">
                 <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={profile.age}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-slate-50 rounded-lg text-sm font-medium focus:ring-2 focus:ring-rose-200 focus:outline-none"
                    />
                 </div>
                 <div className="flex-[2]">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Job</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={profile.jobTitle}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-slate-50 rounded-lg text-sm font-medium focus:ring-2 focus:ring-rose-200 focus:outline-none"
                    />
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
              <MapPin className="w-5 h-5 text-rose-500" />
              Location
            </div>
            <input
              type="text"
              name="location"
              value={profile.location}
              onChange={handleInputChange}
              className="w-full p-3 bg-slate-50 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-rose-200 focus:outline-none"
              placeholder="City, State"
            />
          </div>

          {/* New Section: Physical Attributes (Auto-detected) */}
          {(profile.hairColor || profile.eyeColor || profile.bodyType) && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-fade-in">
              <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
                <ScanFace className="w-5 h-5 text-indigo-500" />
                Appearance
                <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wide">Auto-Detected</span>
              </div>
              <div className="space-y-3">
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Hair Color</label>
                    <input
                      type="text"
                      name="hairColor"
                      value={profile.hairColor || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-slate-50 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Eye Color</label>
                    <input
                      type="text"
                      name="eyeColor"
                      value={profile.eyeColor || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-slate-50 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Body Type</label>
                    <input
                      type="text"
                      name="bodyType"
                      value={profile.bodyType || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-slate-50 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                    />
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle/Right Column: Bio, Interests & The "Looking For" Magic */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main "Looking For" Section - The Core Feature */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-rose-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
                    Who are you looking for?
                  </h2>
                  <p className="text-indigo-200 text-sm mt-1">This is the key to your AI coaching.</p>
                </div>
                <button 
                  onClick={runAiAnalysis}
                  disabled={isAnalyzing || profile.lookingForDescription.length < 10}
                  className="bg-white text-indigo-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-rose-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Wand2 className="w-4 h-4" /> Analyze Profile</>
                  )}
                </button>
              </div>

              <textarea
                name="lookingForDescription"
                value={profile.lookingForDescription}
                onChange={handleInputChange}
                className="w-full h-32 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white/20 transition-all resize-none leading-relaxed"
                placeholder="E.g., I'm looking for someone adventurous who loves the outdoors, enjoys deep conversations about philosophy, and wants to start a family someday. Someone kind, ambitious, and maybe a bit nerdy..."
              />
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-slate-400" />
              About You
            </h3>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              className="w-full h-32 p-4 bg-slate-50 rounded-xl text-slate-700 focus:ring-2 focus:ring-indigo-200 focus:outline-none resize-none"
              placeholder="Tell your story here..."
            />
          </div>

          {/* Interests */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Interests & Hobbies</h3>
             <form onSubmit={handleInterestAdd} className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={currentInterest}
                  onChange={(e) => setCurrentInterest(e.target.value)}
                  placeholder="Add an interest (e.g. Hiking)" 
                  className="flex-1 p-3 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <button type="submit" className="bg-slate-900 text-white px-6 rounded-xl font-semibold hover:bg-slate-700 transition-colors">Add</button>
             </form>
             <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 group hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-default">
                    {interest}
                    <button 
                      type="button" 
                      onClick={() => removeInterest(interest)}
                      className="text-slate-400 hover:text-rose-600 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {profile.interests.length === 0 && (
                  <span className="text-slate-400 text-sm italic py-2">No interests added yet.</span>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;