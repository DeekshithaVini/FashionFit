
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import GenderSelection from './pages/GenderSelection';
import { db } from './services/firebase';
import { UserProfile, Gender } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await db.getCurrentUser();
      setUser(currentUser);
      setInitialized(true);
    };
    checkUser();
  }, []);

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
  };

  const handleGenderSelect = async (gender: Gender) => {
    if (user) {
      await db.setGender(gender);
      setUser({ ...user, gender });
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  let content;
  if (!user) {
    content = <Login onLogin={handleLogin} />;
  } else if (user.gender === Gender.UNSET) {
    content = <GenderSelection onSelect={handleGenderSelect} />;
  } else {
    content = <Dashboard user={user} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {content}
    </Layout>
  );
};

export default App;
