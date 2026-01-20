
// This is a robust mock of the Firebase services required.
// In a real environment, you would use 'firebase/app', 'firebase/auth', etc.

import { UserProfile, Gender, TryOnSession } from '../types';

class MockFirebase {
  private currentUser: UserProfile | null = null;
  private storage: Record<string, string> = {};
  private sessions: TryOnSession[] = [];

  async login(email: string): Promise<UserProfile> {
    const user: UserProfile = {
      uid: 'user_' + Math.random().toString(36).substr(2, 9),
      email,
      gender: Gender.UNSET,
      createdAt: Date.now()
    };
    this.currentUser = user;
    // Check local storage for persistent mock session
    const saved = localStorage.getItem('fashionfit_mock_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email === email) return parsed;
    }
    return user;
  }

  async setGender(gender: Gender) {
    if (this.currentUser) {
      this.currentUser.gender = gender;
      localStorage.setItem('fashionfit_mock_user', JSON.stringify(this.currentUser));
    }
  }

  getCurrentUser() {
    if (!this.currentUser) {
      const saved = localStorage.getItem('fashionfit_mock_user');
      if (saved) this.currentUser = JSON.parse(saved);
    }
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('fashionfit_mock_user');
  }

  async uploadFile(path: string, dataUrl: string): Promise<string> {
    this.storage[path] = dataUrl;
    return dataUrl; // Return the URL (mocked)
  }

  async saveTryOn(session: Omit<TryOnSession, 'id' | 'timestamp'>) {
    const newSession = {
      ...session,
      id: 'session_' + Date.now(),
      timestamp: Date.now()
    };
    this.sessions.push(newSession);
    localStorage.setItem('fashionfit_sessions', JSON.stringify(this.sessions));
    return newSession;
  }

  getTryOns() {
    const saved = localStorage.getItem('fashionfit_sessions');
    return saved ? JSON.parse(saved) as TryOnSession[] : [];
  }
}

export const db = new MockFirebase();
