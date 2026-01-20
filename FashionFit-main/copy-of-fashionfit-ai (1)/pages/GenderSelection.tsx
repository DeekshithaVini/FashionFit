
import React from 'react';
import { Gender } from '../types';

interface GenderSelectionProps {
  onSelect: (gender: Gender) => void;
}

const GenderSelection: React.FC<GenderSelectionProps> = ({ onSelect }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-2xl px-4">
        <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Select Your Preference</h2>
        <p className="text-slate-500 mb-12 text-lg">We use this to tailor hairstyle recommendations and body mapping presets for the best try-on accuracy.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <button 
            onClick={() => onSelect(Gender.MALE)}
            className="group p-8 bg-white rounded-3xl border-2 border-slate-100 hover:border-indigo-600 hover:shadow-2xl transition duration-300"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-50">
              <span className="text-4xl">🤵‍♂️</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Male</h3>
          </button>

          <button 
            onClick={() => onSelect(Gender.FEMALE)}
            className="group p-8 bg-white rounded-3xl border-2 border-slate-100 hover:border-indigo-600 hover:shadow-2xl transition duration-300"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-50">
              <span className="text-4xl">👩‍⚖️</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Female</h3>
          </button>
        </div>
        
        <p className="mt-12 text-slate-400 text-sm">You can change this anytime in your profile settings.</p>
      </div>
    </div>
  );
};

export default GenderSelection;
