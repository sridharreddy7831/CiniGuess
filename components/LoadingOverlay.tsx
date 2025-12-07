import React from 'react';

export const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-cinema-900 z-[100] flex flex-col items-center justify-center p-4">
      
      {/* GIF Loader */}
      <div className="relative mb-8 flex items-center justify-center">
        <img
          src="./loader.gif"   // <-- change to your GIF path
          alt="Loading..."
          className="w-30 h-30 object-contain" // Maintain same dimensions
        />
      </div>
      
      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500 tracking-[0.5em] animate-pulse">
        LOADING...
      </h2>
    </div>
  );
};
