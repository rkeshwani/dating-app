import { UserProfile, AiAnalysisResult } from '@aura-match/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// API helpers
const getUrl = (endpoint: string) => {
  // If API_BASE_URL is present, prepend it.
  // Ensure we don't end up with double slashes if endpoint starts with /
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

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

const fetchWithCreds = async (endpoint: string, options: RequestInit = {}) => {
  return fetch(getUrl(endpoint), {
    ...options,
    credentials: 'include', // Important for cross-origin sessions
  });
};

export const fetchProfile = async (): Promise<UserProfile> => {
  const response = await fetchWithCreds('/api/profile');
  return handleResponse(response);
};

export const updateProfile = async (profile: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await fetchWithCreds('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  return handleResponse(response);
};

export const analyzeProfile = async (profile: UserProfile): Promise<AiAnalysisResult> => {
  const response = await fetchWithCreds('/api/analyze-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  return handleResponse(response);
};

export const analyzeImageMetadata = async (base64DataUrl: string): Promise<{ hairColor: string; eyeColor: string; bodyType: string }> => {
  const response = await fetchWithCreds('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64DataUrl })
  });
  return handleResponse(response);
};

export const getAdminDashboardMetrics = async () => {
  const response = await fetchWithCreds('/api/admin/dashboard');
  if (response.status === 403) throw new Error("Forbidden");
  return handleResponse(response);
};

export const getCurrentUser = async () => {
  const response = await fetchWithCreds('/auth/me');
  if (response.status === 401) return null;
  return handleResponse(response);
};

export const logout = async () => {
  await fetchWithCreds('/auth/logout', { method: 'POST' });
  window.location.href = '/';
};
