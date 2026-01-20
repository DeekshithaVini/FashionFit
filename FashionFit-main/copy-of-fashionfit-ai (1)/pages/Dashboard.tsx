
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { aiService } from '../services/aiProcessing';
import { getRecommendation } from '../services/geminiService';
import { HAIRSTYLES } from '../constants';
import { UserProfile, Hairstyle, AIRecommendation, TryOnSession } from '../types';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [dressImage, setDressImage] = useState<string | null>(null);
  const [selectedHair, setSelectedHair] = useState<Hairstyle | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedResult, setMergedResult] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [history, setHistory] = useState<TryOnSession[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(db.getTryOns());
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Please allow camera access or upload a photo manually.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      setUserImage(canvasRef.current.toDataURL('image/png'));
      // Stop webcam
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleUserUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUserImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDressUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setDressImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const runTryOn = async () => {
    if (!userImage || !dressImage) return;
    setIsProcessing(true);
    setMergedResult(null);
    setRecommendation(null);

    try {
      const uImg = new Image();
      uImg.src = userImage;
      const dImg = new Image();
      dImg.src = dressImage;

      await Promise.all([uImg.decode(), dImg.decode()]);

      const hImg = selectedHair ? new Image() : null;
      if (hImg) {
        hImg.crossOrigin = 'anonymous';
        hImg.src = selectedHair!.imageUrl;
        await hImg.decode();
      }

      // 1. Detect Landmarks
      const landmarks = await aiService.detectLandmarks(uImg);

      // 2. Merge
      const canvas = document.createElement('canvas');
      const finalResult = await aiService.mergeImages(uImg, dImg, hImg, landmarks, canvas);
      setMergedResult(finalResult);

      // 3. AI Feedback via Gemini
      const rec = await getRecommendation(finalResult, user.gender);
      setRecommendation(rec);

      // 4. Save to mock db
      const session = await db.saveTryOn({
        userId: user.uid,
        userImageUrl: userImage,
        dressImageUrl: dressImage,
        hairstyleId: selectedHair?.id,
        mergedImageUrl: finalResult
      });
      setHistory(prev => [session, ...prev]);

    } catch (err) {
      console.error(err);
      alert("Try-on processing failed. Ensure your full body is visible in the photo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredHairstyles = HAIRSTYLES.filter(h => h.gender === user.gender);

  return (
    <div className="space-y-12">
      {/* 1. Selection Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Photo */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</span>
            Your Photo
          </h2>
          <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center">
            {userImage ? (
              <img src={userImage} className="w-full h-full object-cover" alt="User" />
            ) : (
              <div className="text-center p-6">
                <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover hidden" />
                <div className="space-y-4">
                  <button onClick={startWebcam} className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium shadow-lg hover:bg-indigo-700 transition">
                    Open Camera
                  </button>
                  <p className="text-slate-400 text-sm">OR</p>
                  <input type="file" ref={fileInputRef} onChange={handleUserUpload} className="hidden" accept="image/*" />
                  <button onClick={() => fileInputRef.current?.click()} className="text-indigo-600 font-medium hover:underline">
                    Upload Photo
                  </button>
                </div>
              </div>
            )}
            {videoRef.current?.srcObject && !userImage && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 shadow-xl active:scale-95 transition"></button>
              </div>
            )}
            {userImage && (
              <button onClick={() => setUserImage(null)} className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:text-red-500 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            )}
          </div>
        </div>

        {/* Dress & Hair */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
              Pick Dress
            </h2>
            <div className="flex gap-4">
              <div className="flex-1 aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center relative overflow-hidden">
                {dressImage ? (
                  <>
                    <img src={dressImage} className="w-full h-full object-contain" alt="Selected Dress" />
                    <button onClick={() => setDressImage(null)} className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-slate-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <input type="file" ref={dressInputRef} onChange={handleDressUpload} className="hidden" accept="image/*" />
                    <button onClick={() => dressInputRef.current?.click()} className="text-indigo-600 text-sm font-semibold">Upload Dress</button>
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center gap-2">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Common styles</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Red Gown', 'Blue Shirt', 'Black Tux', 'Summer Dress'].map(label => (
                    <button key={label} className="text-[10px] px-2 py-1 bg-slate-100 rounded border hover:bg-slate-200" onClick={() => setDressImage(`https://picsum.photos/400/600?random=${label}`)}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">3</span>
              Select Hairstyle
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {filteredHairstyles.map(h => (
                <button 
                  key={h.id} 
                  onClick={() => setSelectedHair(h)}
                  className={`relative group rounded-xl overflow-hidden border-2 transition ${selectedHair?.id === h.id ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent'}`}
                >
                  <img src={h.imageUrl} className="w-full aspect-square object-cover" alt={h.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition">
                    <span className="text-[10px] text-white font-medium truncate">{h.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={!userImage || !dressImage || isProcessing}
            onClick={runTryOn}
            className="w-full py-4 bg-indigo-600 disabled:bg-slate-300 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition transform active:scale-[0.98]"
          >
            {isProcessing ? 'AI Processing...' : 'Generate Try-On'}
          </button>
        </div>
      </section>

      {/* 2. Result Section */}
      {(mergedResult || isProcessing) && (
        <section className="bg-indigo-900 rounded-3xl p-8 lg:p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path></svg>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 w-full max-w-md">
              <div className="aspect-[3/4] bg-white/5 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center relative">
                {isProcessing ? (
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-indigo-200 animate-pulse">Analyzing body landmarks...</p>
                  </div>
                ) : (
                  <img src={mergedResult!} className="w-full h-full object-cover" alt="Merged Try-On Result" />
                )}
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-serif font-bold">Try-On Result</h2>
              
              {recommendation ? (
                <div className="space-y-6 bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-400 flex items-center justify-center relative">
                      <span className="text-2xl font-bold">{recommendation.score}</span>
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="226" strokeDashoffset={226 - (226 * recommendation.score) / 100} className="text-indigo-400" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">AI Fashion Analysis</h3>
                      <p className="text-indigo-200 text-sm">Based on skin tone and fit</p>
                    </div>
                  </div>
                  <p className="text-lg italic leading-relaxed">"{recommendation.feedback}"</p>
                </div>
              ) : isProcessing ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-white/10 rounded w-1/2"></div>
                  <div className="h-24 bg-white/10 rounded"></div>
                </div>
              ) : null}

              <div className="flex gap-4">
                <button className="flex-1 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-slate-100 transition">Save to Lookbook</button>
                <button className="p-3 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. History Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-slate-800">Your Recent Looks</h2>
          <button className="text-indigo-600 font-medium hover:underline text-sm">View All</button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {history.length > 0 ? history.map(item => (
            <div key={item.id} className="group cursor-pointer">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 mb-2 relative">
                <img src={item.mergedImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="History item" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition"></div>
              </div>
              <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</p>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
              Your generated looks will appear here.
            </div>
          )}
        </div>
      </section>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Dashboard;
