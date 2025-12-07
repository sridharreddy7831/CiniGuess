
import React, { useState } from 'react';
import { Calendar, Play, Layers, ArrowLeft } from 'lucide-react';
import { GameMode } from '../types';

interface SetupPhaseProps {
  onStart: (era: string) => void;
  mode: GameMode;
  onBack: () => void;
}

const ALL_ERAS = [
  "Classics (Pre-2000)",
  "2000 - 2010",
  "2010 - 2020",
  "Latest (2021 - Present)",
  "All Eras (Random Mix)"
];

export const SetupPhase: React.FC<SetupPhaseProps> = ({ onStart, mode, onBack }) => {
  const [selectedEra, setSelectedEra] = useState<string | null>(null);

  // Filter out "All Eras" if mode is Visual
  const availableEras = mode === GameMode.VISUAL 
    ? ALL_ERAS.filter(e => !e.includes("All Eras"))
    : ALL_ERAS;

  return (
    <div className="max-w-3xl mx-auto w-full bg-cinema-800/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-8 md:p-10 border border-cinema-700 animate-fade-in relative">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
        title="Back"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="text-center mb-12 mt-4">
        <h2 className="text-4xl font-bold text-white mb-3">
          Select Movie Era
        </h2>
        <p className="text-slate-400 text-lg">
          Pick a time period for your Telugu movie challenge.
        </p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableEras.map((era) => {
             const isAll = era.includes("All Eras");
             return (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className={`p-6 rounded-2xl text-lg font-semibold transition-all duration-200 border-2 flex items-center justify-center gap-3 ${
                  selectedEra === era
                    ? 'bg-cinema-accent border-cinema-pop text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] scale-[1.03]'
                    : 'bg-cinema-900 border-cinema-700 text-slate-300 hover:border-cinema-500 hover:text-white hover:bg-cinema-800'
                } ${isAll ? 'md:col-span-2' : ''}`}
              >
                {isAll ? <Layers className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                {era}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => selectedEra && onStart(selectedEra)}
          disabled={!selectedEra}
          className={`w-full py-6 rounded-2xl font-bold text-xl text-white shadow-xl transition-all flex items-center justify-center gap-3 ${
            selectedEra 
              ? 'bg-gradient-to-r from-cinema-pop to-orange-600 hover:shadow-[0_0_30px_rgba(244,63,94,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer' 
              : 'bg-cinema-700 text-slate-500 cursor-not-allowed grayscale opacity-50'
          }`}
        >
          <Play className={`w-6 h-6 fill-current ${!selectedEra ? 'opacity-50' : ''}`} />
          Start Game
        </button>
      </div>
    </div>
  );
};
