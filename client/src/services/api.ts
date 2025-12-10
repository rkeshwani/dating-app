import { UserProfile, AiAnalysisResult } from '@aura-match/shared';

// API helpers
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || response.statusText);
  }
  return response.json();
};

export const fetchProfile = async (): Promise<UserProfile> => {
  const response = await fetch('/api/profile');
  return handleResponse(response);
};

export const updateProfile = async (profile: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  return handleResponse(response);
};

export const analyzeProfile = async (profile: UserProfile): Promise<AiAnalysisResult> => {
  const response = await fetch('/api/analyze-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  return handleResponse(response);
};

export const analyzeImageMetadata = async (base64DataUrl: string): Promise<{ hairColor: string; eyeColor: string; bodyType: string }> => {
  const response = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64DataUrl })
  });
  return handleResponse(response);
};

export const getCurrentUser = async () => {
  const response = await fetch('/auth/me');
  if (response.status === 401) return null;
  return handleResponse(response);
};

export const logout = async () => {
  await fetch('/auth/logout', { method: 'POST' });
  window.location.href = '/login';
};
