
import React, { useEffect, useState, useRef } from 'react';
import { Trophy, RotateCcw, Crown, Star, Sparkles, Music } from 'lucide-react';
import { Group } from '../types';

interface GameOverPhaseProps {
  groups: Group[];
  adminScore: number;
  isTeamMode: boolean;
  onRestart: () => void;
}

// --- SOUND ENGINE (Web Audio API) ---
class VictorySound {
  private ctx: AudioContext | null = null;

  constructor() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("AudioContext not supported");
    }
  }

  private createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playBlast() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    
    // 1. Noise Burst (The Pop)
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.5);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.5);

    // 2. Low Thud (The Cannon Body)
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(10, t + 0.5);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  playFanfare() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    
    // Simple Major Chord Arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
    notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0, t + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.3, t + i * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 2);
    });
  }
}

// --- CONFETTI PARTICLE COMPONENT ---
interface ConfettiParticleProps {
  delay: number;
  color: string;
  side: 'left' | 'right';
}

const ConfettiParticle: React.FC<ConfettiParticleProps> = ({ delay, color, side }) => {
    // Random physics for each particle
    const angle = side === 'left' ? -45 - Math.random() * 45 : 45 + Math.random() * 45; // Shoot outwards
    const velocity = 15 + Math.random() * 15;
    const rotation = Math.random() * 360;
    
    const style: React.CSSProperties = {
        position: 'absolute',
        bottom: '0px',
        left: side === 'left' ? '0px' : 'auto',
        right: side === 'right' ? '0px' : 'auto',
        width: '12px',
        height: '12px',
        backgroundColor: color,
        transform: `rotate(${rotation}deg)`,
        animation: `blast-${side} 2s ease-out forwards`,
        animationDelay: `${delay}ms`,
        zIndex: 50
    };

    return <div style={style} className="rounded-sm" />;
};

export const GameOverPhase: React.FC<GameOverPhaseProps> = ({ groups, adminScore, isTeamMode, onRestart }) => {
  const [showContent, setShowContent] = useState(false);
  const [podiumHeight, setPodiumHeight] = useState({ first: false, second: false, third: false });
  const audioRef = useRef<VictorySound | null>(null);

  // Filter and Sort
  const sortedPlayers = [...groups].sort((a, b) => b.score - a.score);
  const first = sortedPlayers.length > 0 ? sortedPlayers[0] : null;
  const second = sortedPlayers.length > 1 ? sortedPlayers[1] : null;
  const third = sortedPlayers.length > 2 ? sortedPlayers[2] : null;
  const others = sortedPlayers.slice(3);

  // Falling Flowers from top
  const decorations = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    emoji: ['🌺', '🌻', '🌹', '💐', '🌷', '✨', '🎉', '🎊'][Math.floor(Math.random() * 8)],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${4 + Math.random() * 4}s`
  }));

  // Confetti Blast Arrays
  const colors = ['#f43f5e', '#8b5cf6', '#fbbf24', '#10b981', '#3b82f6', '#ec4899'];
  const particleCount = 40;
  
  useEffect(() => {
    audioRef.current = new VictorySound();
    
    // Animation Sequence
    setTimeout(() => setShowContent(true), 100);

    // Blast 1: Left & Right (0.5s)
    setTimeout(() => {
        audioRef.current?.playBlast();
    }, 500);

    // Blast 2: Left & Right (1.0s)
    setTimeout(() => {
        audioRef.current?.playBlast();
    }, 1200);

    // Fanfare & Podium Rise (1.5s)
    setTimeout(() => {
        audioRef.current?.playFanfare();
        setPodiumHeight({ first: true, second: true, third: true });
    }, 1500);

  }, []);

  const PodiumBar = ({ rank, group, heightClass, baseColor, accentColor, delayClass }: { rank: number, group: Group | null, heightClass: string, baseColor: string, accentColor: string, delayClass: string }) => {
     if (!group) return <div className="w-1/3 flex flex-col justify-end items-center opacity-0"></div>;
     
     const showBar = rank === 1 ? podiumHeight.first : rank === 2 ? podiumHeight.second : podiumHeight.third;

     return (
        <div className={`w-1/3 flex flex-col justify-end items-center relative z-20 ${rank === 1 ? '-mt-12' : ''}`}>
            
            {/* Winner Info (Popped up) */}
            <div className={`flex flex-col items-center mb-4 transition-all duration-700 transform ${showBar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${rank === 1 ? 400 : 200}ms` }}>
                {rank === 1 && <Crown className="w-12 h-12 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] animate-bounce mb-2" />}
                
                <h3 className={`font-black text-white text-center leading-tight drop-shadow-md ${rank === 1 ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                    {group.name}
                </h3>
                
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full mt-2 border border-white/10 shadow-lg">
                    <Star className={`w-4 h-4 fill-current ${rank === 1 ? 'text-yellow-400' : 'text-slate-400'}`} />
                    <span className="text-white font-mono font-bold text-lg">{group.score}</span>
                </div>
            </div>

            {/* The Bar */}
            <div 
                className={`w-full ${baseColor} rounded-t-2xl shadow-2xl relative group transition-all duration-[1500ms] ease-out flex flex-col justify-end overflow-hidden border-t border-white/20`}
                style={{ height: showBar ? (rank === 1 ? '350px' : rank === 2 ? '220px' : '160px') : '0px' }}
            >
               {/* Rank Number Background */}
               <div className="absolute bottom-0 w-full text-center text-black/10 font-black text-8xl select-none leading-none z-0">
                   {rank}
               </div>

               {/* Lighting Effect */}
               <div className={`absolute inset-0 bg-gradient-to-t ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity z-10`}></div>

               {/* Team Members List (Inside the bar for better integration) */}
               {isTeamMode && group.members.length > 0 && (
                   <div className="relative z-20 p-4 pb-8 text-center animate-fade-in w-full">
                      <div className="flex flex-wrap justify-center gap-1.5 opacity-90">
                         {group.members.map((m, i) => (
                             <span key={i} className="text-[10px] md:text-xs font-bold bg-black/20 text-white px-2 py-1 rounded-md shadow-sm border border-white/5 whitespace-nowrap">
                                 {m}
                             </span>
                         ))}
                      </div>
                   </div>
               )}
            </div>
        </div>
     );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-cinema-900 font-sans selection:bg-yellow-500 selection:text-black">
      
      {/* CSS for Particles */}
      <style>{`
        @keyframes blast-left {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            50% { opacity: 1; }
            100% { transform: translate(50vw, -80vh) rotate(720deg); opacity: 0; }
        }
        @keyframes blast-right {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            50% { opacity: 1; }
            100% { transform: translate(-50vw, -80vh) rotate(-720deg); opacity: 0; }
        }
      `}</style>

      {/* Confetti Cannons (Bottom Corners) */}
      <div className="absolute bottom-0 left-0 w-20 h-20 pointer-events-none z-50">
        {/* Blast 1 */}
        {Array.from({ length: particleCount }).map((_, i) => (
             <ConfettiParticle key={`l1-${i}`} delay={500 + Math.random() * 100} color={colors[i % colors.length]} side="left" />
        ))}
        {/* Blast 2 */}
        {Array.from({ length: particleCount }).map((_, i) => (
             <ConfettiParticle key={`l2-${i}`} delay={1200 + Math.random() * 100} color={colors[i % colors.length]} side="left" />
        ))}
      </div>
      <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none z-50">
        {/* Blast 1 */}
        {Array.from({ length: particleCount }).map((_, i) => (
             <ConfettiParticle key={`r1-${i}`} delay={500 + Math.random() * 100} color={colors[i % colors.length]} side="right" />
        ))}
        {/* Blast 2 */}
        {Array.from({ length: particleCount }).map((_, i) => (
             <ConfettiParticle key={`r2-${i}`} delay={1200 + Math.random() * 100} color={colors[i % colors.length]} side="right" />
        ))}
      </div>

      {/* Falling Flowers Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {decorations.map(d => (
          <div 
            key={d.id}
            className="absolute top-[-50px] text-3xl animate-fall drop-shadow-md opacity-80"
            style={{ 
              left: d.left, 
              animationDelay: d.delay,
              animationDuration: d.duration
            }}
          >
            {d.emoji}
          </div>
        ))}
      </div>

      <div className={`relative z-10 w-full max-w-5xl transition-all duration-1000 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        
        {/* Header Title */}
        <div className="text-center mb-8 relative">
            <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
            <h1 className="relative text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-500 drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)] animate-pulse-slow">
                CHAMPIONS
            </h1>
            <p className="relative text-slate-300 tracking-[0.5em] text-sm uppercase mt-2 font-bold">Of Tollywood Trivia</p>
        </div>

        {/* PODIUM CONTAINER */}
        <div className="relative mx-4 md:mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            
            {/* Spotlights */}
            <div className="absolute top-[-50%] left-1/4 w-32 h-[150%] bg-gradient-to-b from-white/10 to-transparent transform -rotate-12 pointer-events-none"></div>
            <div className="absolute top-[-50%] right-1/4 w-32 h-[150%] bg-gradient-to-b from-white/10 to-transparent transform rotate-12 pointer-events-none"></div>

            <div className="flex items-end justify-center gap-2 md:gap-6 px-2 md:px-8 pb-4 min-h-[400px]">
                {/* 2nd Place */}
                <PodiumBar 
                    rank={2} 
                    group={second} 
                    heightClass="h-[220px]"
                    baseColor="bg-gradient-to-b from-slate-400 to-slate-600"
                    accentColor="from-white/20 to-transparent"
                    delayClass="delay-200"
                />

                {/* 1st Place */}
                <PodiumBar 
                    rank={1} 
                    group={first} 
                    heightClass="h-[350px]"
                    baseColor="bg-gradient-to-b from-yellow-400 to-yellow-600"
                    accentColor="from-yellow-200/40 to-transparent"
                    delayClass="delay-500"
                />

                {/* 3rd Place */}
                <PodiumBar 
                    rank={3} 
                    group={third} 
                    heightClass="h-[160px]"
                    baseColor="bg-gradient-to-b from-orange-600 to-orange-800"
                    accentColor="from-orange-400/20 to-transparent"
                    delayClass="delay-200"
                />
            </div>
        </div>

        {/* BOTTOM SECTION: Others + Admin + Restart */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start px-4">
            
            {/* Left: Other Players */}
            <div className="md:col-span-2 bg-cinema-800/40 rounded-2xl p-4 border border-cinema-700/50 backdrop-blur-sm max-h-48 overflow-y-auto custom-scrollbar">
                <h4 className="text-xs uppercase font-bold text-slate-500 mb-3 tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Honorable Mentions
                </h4>
                {others.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {others.map((g, idx) => (
                            <div key={g.id} className="flex justify-between items-center p-2 bg-black/20 rounded-lg hover:bg-black/40 transition-colors">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-slate-500 font-bold w-5 text-right text-sm">#{idx + 4}</span>
                                    <div>
                                        <p className="text-slate-300 font-bold text-sm truncate">{g.name}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-xs text-white bg-white/10 px-2 py-0.5 rounded">{g.score}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-600 text-sm italic text-center py-4">No other participants.</p>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 bg-red-950/30 rounded-xl border border-red-900/30">
                    <span className="text-red-400 text-xs font-bold uppercase">Admin Score</span>
                    <span className="text-white font-mono font-bold">{adminScore}</span>
                </div>
                
                <button 
                    onClick={onRestart}
                    className="w-full py-4 bg-white text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-5 h-5" />
                    New Game
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
