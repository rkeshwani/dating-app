import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

const Login = () => {
  const handleLogin = (provider: string) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-rose-200">
          <Heart className="w-8 h-8 fill-current" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Aura Match</h1>
        <p className="text-slate-500 mb-8">Find your perfect match with AI-powered compatibility.</p>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin('google')}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <button
            onClick={() => handleLogin('facebook')}
            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-medium py-3 px-4 rounded-xl hover:bg-[#166fe5] transition-colors shadow-sm shadow-blue-200"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button>

          {import.meta.env.DEV && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Developer Option</span>
                </div>
              </div>

              <button
                onClick={() => handleLogin('mock')}
                className="w-full flex items-center justify-center gap-3 bg-slate-800 text-white font-medium py-3 px-4 rounded-xl hover:bg-slate-900 transition-colors shadow-sm"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Mock Login (Dev Only)
              </button>
            </>
          )}
        </div>

        <p className="mt-8 text-xs text-slate-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
