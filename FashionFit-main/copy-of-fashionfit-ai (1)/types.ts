
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  UNSET = 'unset'
}

export interface UserProfile {
  uid: string;
  email: string | null;
  gender: Gender;
  createdAt: number;
}

export interface Hairstyle {
  id: string;
  name: string;
  imageUrl: string;
  gender: Gender;
  offsetY: number; // For alignment tweaking
  scale: number;
}

export interface TryOnSession {
  id: string;
  userId: string;
  userImageUrl: string;
  dressImageUrl: string;
  hairstyleId?: string;
  mergedImageUrl?: string;
  timestamp: number;
}

export interface AIRecommendation {
  score: number;
  feedback: string;
}
