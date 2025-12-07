
import React from 'react';

export const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-cinema-900 z-[100] flex flex-col items-center justify-center p-4">
      {/* Cinematic Loader Animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-8 border-cinema-800 border-t-cinema-pop animate-spin shadow-[0_0_50px_rgba(244,63,94,0.4)]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-cinema-800 animate-pulse"></div>
        </div>
      </div>
      
      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500 tracking-[0.5em] animate-pulse">
        LOADING...
      </h2>
    </div>
  );
};
