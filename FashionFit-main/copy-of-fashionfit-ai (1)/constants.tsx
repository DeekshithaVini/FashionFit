
import { Gender, Hairstyle } from './types';

export const HAIRSTYLES: Hairstyle[] = [
  { id: 'm1', name: 'Short Fade', gender: Gender.MALE, imageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&h=200', offsetY: -0.1, scale: 1.2 },
  { id: 'm2', name: 'Man Bun', gender: Gender.MALE, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200', offsetY: -0.15, scale: 1.3 },
  { id: 'f1', name: 'Beach Waves', gender: Gender.FEMALE, imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=200&h=200', offsetY: -0.05, scale: 1.4 },
  { id: 'f2', name: 'Elegant Bob', gender: Gender.FEMALE, imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200', offsetY: -0.1, scale: 1.1 },
  { id: 'f3', name: 'Long Straight', gender: Gender.FEMALE, imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=200&h=200', offsetY: -0.05, scale: 1.5 },
];

export const FIREBASE_CONFIG_PLACEHOLDER = `
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
`;

export const SECURITY_RULES = `
// Firestore Rules
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /tryons/{tryonId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}

// Storage Rules
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
`;
