export type Gender = 'Male' | 'Female';

export type PoliticalView = 'Liberal' | 'Conservative' | 'Moderate' | 'Apolitical';
export type WantsChildren = 'Yes' | 'No' | 'Maybe';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  location: string;
  bio: string;
  interests: string[];
  jobTitle: string;
  lookingForDescription: string; // The "prompt" for the AI
  photoUrl?: string;
  interestedIn: Gender[];
  ageRangePreference: { min: number; max: number };
  onboardingCompleted: boolean;
  // Extracted Metadata
  hairColor?: string;
  eyeColor?: string;
  bodyType?: string;
}

export interface AiSuggestion {
  category: string;
  advice: string;
  exampleRewrite?: string;
  impactScore: number; // 1-10
}

export interface AiAnalysisResult {
  matchScore: number; // 0-100 compatibility with "lookingFor"
  overallVibe: string;
  suggestions: AiSuggestion[];
}

export enum AppView {
  PROFILE = 'PROFILE',
  DISCOVER = 'DISCOVER',
  CHAT = 'CHAT'
}

export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  bio: string;
  matchPercentage: number;
  imageUrl: string;
  interests: string[];
  politicalView: PoliticalView;
  wantsChildren: WantsChildren;
  hasChildren: boolean;
}