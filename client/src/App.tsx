import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import ProfileEditor from './components/ProfileEditor';
import DiscoverFeed from './components/DiscoverFeed';
import Onboarding from './components/Onboarding';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { UserProfile } from '@aura-match/shared';
import { User, Compass, MessageCircle, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { updateProfile, logout } from './services/api';

const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50 md:top-0 md:bottom-auto md:px-8 md:py-4 md:border-b md:border-t-0">
      <div className="max-w-4xl mx-auto flex justify-between md:justify-start md:gap-8 items-center px-6 h-16 md:h-auto">
        <Link to="/" className="md:mr-auto flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-rose-200">
            A
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight text-slate-900">Aura Match</span>
        </Link>

        <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}>
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium md:hidden">Profile</span>
          <span className="hidden md:inline font-medium text-sm">My Profile</span>
        </Link>

        <Link to="/discover" className={`flex flex-col items-center gap-1 ${isActive('/discover') ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}>
          <Compass className="w-6 h-6" />
          <span className="text-[10px] font-medium md:hidden">Discover</span>
          <span className="hidden md:inline font-medium text-sm">Discover</span>
        </Link>

        <Link to="/matches" className={`flex flex-col items-center gap-1 ${isActive('/matches') ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}>
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium md:hidden">Chats</span>
          <span className="hidden md:inline font-medium text-sm">Chats</span>
        </Link>

        <button onClick={logout} className="flex flex-col items-center gap-1 text-slate-400 hover:text-rose-500 ml-auto md:ml-4">
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-medium md:hidden">Logout</span>
          <span className="hidden md:inline font-medium text-sm">Logout</span>
        </button>
      </div>
    </nav>
  );
};

const MatchesPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
      <MessageCircle className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-bold text-slate-700">No matches yet</h3>
    <p className="text-slate-500">Optimize your profile with AI to get more matches!</p>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AuthenticatedApp = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

  const handleProfileUpdate = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await updateProfile(newProfile);
    await refreshUser();
  };

  if (!profile) return null;

  if (!profile.onboardingCompleted) {
    return (
      <Onboarding
        initialProfile={profile}
        onComplete={handleProfileUpdate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pt-24">
      <Navigation />

      <main className="px-4 pt-6 max-w-4xl mx-auto">
        <Routes>
          <Route path="/" element={
            <div className="animate-fade-in">
              <header className="mb-8 md:hidden">
                <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
                <p className="text-slate-500">Craft your perfect vibe.</p>
              </header>
              <ProfileEditor profile={profile} setProfile={handleProfileUpdate} />
            </div>
          } />
          <Route path="/discover" element={
            <div className="animate-fade-in">
              <header className="mb-8 text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-900">Discover</h1>
                <p className="text-slate-500">Matches curated for your aura.</p>
              </header>
              <DiscoverFeed userProfile={profile} />
            </div>
          } />
          <Route path="/matches" element={<MatchesPlaceholder />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AuthenticatedApp />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
