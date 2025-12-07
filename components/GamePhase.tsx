
import React, { useEffect, useState } from 'react';
import { Clock, Eye, Star, Lock, AlertTriangle, Home, ArrowRight, Play, HelpCircle, Trophy, UserX, Flag, Calendar, Hash, Type, User, Clapperboard, Users, Skull, Music, EyeOff, ArrowLeft } from 'lucide-react';
import { GameState, GameStage, GameMode } from '../types';

interface GamePhaseProps {
  gameState: GameState;
  onReveal: () => void;
  onNextRound: () => void; // Keeps same era
  onHome: () => void; // Goes back to game selection (full reset)
  setTimer: (time: number) => void;
  onScoreUpdate: (groupId: string | null) => void; // null for admin
  onFinishGame: () => void;
  onExit: () => void; // Exit mid-game
}

// Sub-component for a single hint row
const HintRow = ({ 
  icon: Icon, 
  label, 
  value, 
  isRevealed,
  onReveal,
  tooltip
}: { 
  icon: any, 
  label: string, 
  value: string | undefined, 
  isRevealed: boolean,
  onReveal: () => void,
  tooltip?: string
}) => (
  <button
    onClick={!isRevealed ? onReveal : undefined}
    disabled={isRevealed}
    className={`w-full group relative p-3 rounded-xl border transition-all duration-300 flex items-center gap-4 text-left overflow-hidden ${
      isRevealed 
        ? 'bg-cinema-800/80 border-cinema-500/50 text-white shadow-lg' 
        : 'bg-cinema-900/40 border-cinema-800 text-slate-400 hover:bg-cinema-800 hover:border-cinema-600 hover:shadow-md cursor-pointer'
    }`}
    title={tooltip}
  >
    <div className={`p-2.5 rounded-full transition-colors ${isRevealed ? 'bg-cinema-accent/20 text-cinema-accent' : 'bg-cinema-950/50 text-slate-600'}`}>
      <Icon className="w-5 h-5" />
    </div>
    
    <div className="flex-grow min-w-0 flex flex-col justify-center">
      <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-0.5">{label}</span>
      <div className="relative h-6 flex items-center">
        {/* Actual Value (Shown or Blurred) */}
        <span className={`font-medium text-sm transition-all duration-500 block truncate ${isRevealed ? 'opacity-100 blur-0 translate-y-0' : 'opacity-40 blur-sm select-none translate-y-0'}`}>
           {value || "Unknown"}
        </span>
        
        {/* Hidden State Overlay */}
        {!isRevealed && (
          <div className="absolute inset-0 flex items-center">
             <EyeOff className="w-4 h-4 text-slate-500/80 mr-2" />
             <span className="text-xs text-slate-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to reveal</span>
          </div>
        )}
      </div>
    </div>
    
    {!isRevealed && (
       <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity">
         <div className="w-2 h-2 rounded-full bg-cinema-pop animate-pulse"></div>
       </div>
    )}

    {/* Tooltip on Hover */}
    <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
       <span className="text-[9px] text-cinema-accent bg-black/50 px-1 rounded">{tooltip}</span>
    </div>
  </button>
);

const MobileHintBox = ({ 
  label, 
  value, 
  isRevealed, 
  onReveal 
}: { 
  label: string, 
  value: string | number | undefined, 
  isRevealed: boolean, 
  onReveal: () => void 
}) => (
  <button 
    onClick={!isRevealed ? onReveal : undefined}
    className={`p-2 rounded-lg border text-center transition-all relative overflow-hidden ${
      isRevealed 
        ? 'bg-cinema-800 border-cinema-500 text-white' 
        : 'bg-cinema-900 border-cinema-800 active:bg-cinema-800'
    }`}
  >
    <span className="text-[10px] text-slate-500 uppercase block mb-1">{label}</span>
    <div className="relative h-5 flex items-center justify-center">
       <span className={`font-bold text-xs truncate transition-all ${isRevealed ? 'blur-0 opacity-100' : 'blur-sm opacity-30'}`}>
         {value}
       </span>
       {!isRevealed && (
         <div className="absolute inset-0 flex items-center justify-center">
           <EyeOff className="w-3 h-3 text-slate-500" />
         </div>
       )}
    </div>
  </button>
);

// Hangman SVG Drawing
const HangmanDrawing = ({ mistakes }: { mistakes: number }) => {
  return (
    <div className="relative w-48 h-48 mx-auto mb-6 opacity-90">
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-white stroke-[3px] fill-none drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
        {/* Base */}
        <line x1="10" y1="95" x2="90" y2="95" className="stroke-slate-500" />
        <line x1="30" y1="95" x2="30" y2="5" className="stroke-slate-500" />
        <line x1="30" y1="5" x2="70" y2="5" className="stroke-slate-500" />
        <line x1="70" y1="5" x2="70" y2="20" className="stroke-slate-500" />
        
        {/* Head */}
        {mistakes >= 1 && <circle cx="70" cy="30" r="10" className="animate-fade-in stroke-cinema-pop drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]" />}
        
        {/* Body */}
        {mistakes >= 2 && <line x1="70" y1="40" x2="70" y2="70" className="animate-fade-in stroke-white" />}
        
        {/* Left Arm */}
        {mistakes >= 3 && <line x1="70" y1="50" x2="50" y2="60" className="animate-fade-in stroke-white" />}
        
        {/* Right Arm */}
        {mistakes >= 4 && <line x1="70" y1="50" x2="90" y2="60" className="animate-fade-in stroke-white" />}
        
        {/* Left Leg */}
        {mistakes >= 5 && <line x1="70" y1="70" x2="50" y2="90" className="animate-fade-in stroke-white" />}
        
        {/* Right Leg */}
        {mistakes >= 6 && <line x1="70" y1="70" x2="90" y2="90" className="animate-fade-in stroke-white" />}
      </svg>
    </div>
  );
};

export const GamePhase: React.FC<GamePhaseProps> = ({ 
  gameState, 
  onReveal, 
  onNextRound, 
  onHome,
  setTimer,
  onScoreUpdate,
  onFinishGame,
  onExit
}) => {
  const { currentChallenge, images, timeLeft, stage, selectedEra, mode, groups, adminScore, isTeamMode } = gameState;
  
  const [revealedClues, setRevealedClues] = useState<boolean[]>([false, false, false]);
  const [timerStarted, setTimerStarted] = useState(false);
  const [preStartCountdown, setPreStartCountdown] = useState<number | null>(null); // 3, 2, 1, null
  
  // Individual Hint Visibility State
  const [visibleHints, setVisibleHints] = useState({
    year: false,
    length: false,
    firstLetter: false,
    hero: false,
    heroine: false,
    director: false,
    cast: false
  });
  
  // Hangman specific state
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const MAX_MISTAKES = 6;
  
  const [winnerSelected, setWinnerSelected] = useState(false);

  // Pre-Start Countdown Logic
  useEffect(() => {
    if (preStartCountdown !== null) {
      if (preStartCountdown > 0) {
        const timer = setTimeout(() => {
          setPreStartCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Countdown finished (0)
        setPreStartCountdown(null);
        setTimerStarted(true); // Start actual game timer
      }
    }
  }, [preStartCountdown]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (stage === GameStage.PLAYING && timeLeft > 0 && timerStarted) {
      interval = setInterval(() => {
        setTimer(timeLeft - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, timeLeft, setTimer, timerStarted]);

  useEffect(() => {
    setRevealedClues([false, false, false]);
    setTimerStarted(false);
    setPreStartCountdown(null);
    setWinnerSelected(false);
    
    // Reset Hints
    setVisibleHints({
        year: false,
        length: false,
        firstLetter: false,
        hero: false,
        heroine: false,
        director: false,
        cast: false
    });
    
    // Reset Hangman
    setGuessedLetters(new Set());
    setMistakes(0);
  }, [currentChallenge]);

  // Hangman Win/Loss Check
  useEffect(() => {
    if (mode === GameMode.HANGMAN && stage === GameStage.PLAYING && currentChallenge) {
      const title = currentChallenge.title.toUpperCase();
      const cleanTitle = title.replace(/[^A-Z0-9]/g, '');
      const allGuessed = cleanTitle.split('').every(char => guessedLetters.has(char));
      
      if (allGuessed) {
        setTimerStarted(false);
      }
      
      if (mistakes >= MAX_MISTAKES) {
        setTimerStarted(false);
      }
    }
  }, [guessedLetters, mistakes, mode, currentChallenge, stage]);

  const handleStartSequence = () => {
    if (!timerStarted && preStartCountdown === null) {
      setPreStartCountdown(3);
    }
  };

  const handleRevealClue = (index: number) => {
    if (stage !== GameStage.PLAYING && stage !== GameStage.REVEALED) return;
    setRevealedClues(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handleFullReveal = () => {
      // Force stop timer INSTANTLY
      setTimerStarted(false);
      onReveal();
      // Auto reveal all hints on full answer reveal
      setVisibleHints({
        year: true,
        length: true,
        firstLetter: true,
        hero: true,
        heroine: true,
        director: true,
        cast: true
      });
  };

  const handleRevealHint = (key: keyof typeof visibleHints) => {
    setVisibleHints(prev => ({ ...prev, [key]: true }));
  };

  const handleSelectWinner = (groupId: string | null) => {
    onScoreUpdate(groupId);
    setWinnerSelected(true);
  };

  // Hangman Logic
  const handleLetterGuess = (letter: string) => {
    if (stage !== GameStage.PLAYING || !timerStarted || mistakes >= MAX_MISTAKES) return;
    if (guessedLetters.has(letter)) return;

    setGuessedLetters(prev => new Set(prev).add(letter));
    
    const title = currentChallenge?.title.toUpperCase() || "";
    if (!title.includes(letter)) {
      setMistakes(prev => prev + 1);
    }
  };

  // Derived Hints
  const movieLength = currentChallenge?.title.replace(/[^a-zA-Z]/g, "").length || 0;
  const firstLetter = currentChallenge?.title.charAt(0).toUpperCase() || "?";

  if (!currentChallenge) return null;
  const isTimeUp = timeLeft === 0;
  const isHangmanLost = mode === GameMode.HANGMAN && mistakes >= MAX_MISTAKES;

  // Render Title for Hangman
  const renderHangmanTitle = () => {
    if (!currentChallenge) return null;
    const title = currentChallenge.title.toUpperCase();
    return (
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {title.split('').map((char, idx) => {
          if (/[^A-Z0-9]/.test(char)) {
            return <span key={idx} className="w-10 h-12 flex items-center justify-center text-slate-400 text-3xl font-light">{char}</span>;
          }
          const isGuessed = guessedLetters.has(char) || stage === GameStage.REVEALED;
          return (
            <span key={idx} className={`w-10 h-14 flex items-center justify-center border-b-[3px] text-3xl font-bold transition-all ${isGuessed ? 'text-white border-white' : 'text-transparent border-slate-600'} ${isHangmanLost && !isGuessed ? 'text-red-500' : ''}`}>
              {isGuessed || (isHangmanLost && char) ? char : ''}
            </span>
          );
        })}
      </div>
    );
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  return (
    <div className="w-full h-full min-h-screen flex flex-col relative overflow-hidden">
      
      {/* PRE-START COUNTDOWN OVERLAY */}
      {preStartCountdown !== null && preStartCountdown > 0 && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center">
          <div className="relative">
             <div className="absolute inset-0 bg-cinema-pop/50 rounded-full animate-ping-slow"></div>
             <div key={preStartCountdown} className="text-[10rem] font-black text-white animate-scale-in drop-shadow-[0_0_50px_rgba(244,63,94,0.8)]">
               {preStartCountdown}
             </div>
          </div>
        </div>
      )}

      {/* 1. Header / Top Bar */}
      <div className="w-full h-16 md:h-20 bg-cinema-900/90 backdrop-blur-md border-b border-cinema-700 flex items-center justify-between px-4 md:px-8 fixed top-0 left-0 z-50 shadow-lg">
         <div className="flex items-center gap-4">
            <button 
                onClick={onExit} 
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                title="Exit Game"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>

             <div className="hidden md:flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Playing Mode</span>
                <span className="text-white font-bold text-lg leading-none">
                  {mode === GameMode.VISUAL ? 'Visual Trivia' : mode === GameMode.EMOJI ? 'Emoji Decode' : mode === GameMode.HANGMAN ? 'Hangman' : 'Lyric Challenge'}
                </span>
             </div>
         </div>

         <div className="absolute left-1/2 transform -translate-x-1/2">
            <button 
              onClick={handleStartSequence}
              disabled={timerStarted || isTimeUp || preStartCountdown !== null || isHangmanLost}
              className={`flex items-center gap-3 text-xl font-mono font-bold px-8 py-2 rounded-full transition-all border-2 whitespace-nowrap shadow-xl ${
                isTimeUp || isHangmanLost
                  ? 'bg-red-600 border-red-500 text-white' 
                  : timerStarted
                    ? 'bg-cinema-800 border-cinema-700 text-white'
                    : 'bg-cinema-accent border-cinema-pop text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:scale-105'
              }`}
            >
              {isTimeUp && <AlertTriangle className="w-6 h-6 animate-bounce" />}
              {isHangmanLost && <Skull className="w-6 h-6 animate-pulse" />}
              
              {!isTimeUp && !isHangmanLost && !timerStarted && <Play className="w-6 h-6 fill-current" />}
              {!isTimeUp && !isHangmanLost && timerStarted && <Clock className="w-6 h-6" />}
              
              {isHangmanLost ? "GAME OVER" : isTimeUp ? "TIME'S UP" : !timerStarted ? "START" : `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
            </button>
         </div>

         {/* Finish Game Button */}
         <div className="flex items-center">
            <button 
              onClick={onFinishGame} 
              className="flex items-center gap-2 px-4 py-2 bg-red-950/30 text-red-400 rounded-full border border-red-900/50 hover:bg-red-900/50 transition-colors"
              title="End Game"
            >
              <Flag className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline font-bold text-sm">Finish</span>
            </button>
         </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex flex-col md:flex-row w-full h-full pt-20 md:pt-24 pb-12 px-2 md:px-4 gap-4">
        
        {/* LEFT COLUMN: Floating Hints */}
        <div className="hidden md:flex flex-col w-64 fixed left-6 top-24 bottom-6 gap-4 z-40 pointer-events-none">
        <div className="pointer-events-auto bg-cinema-800/80 backdrop-blur-lg border border-cinema-700 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
            <h3 className="text-white font-bold border-b border-cinema-600/50 pb-3 flex items-center gap-2 mb-1 text-sm uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-cinema-accent" />
            Hints
            </h3>
            
            {stage === GameStage.PLAYING && (
            <div className="flex flex-col gap-3">
                <HintRow 
                icon={Calendar} 
                label="Release Year" 
                value={currentChallenge.year} 
                isRevealed={visibleHints.year} 
                onReveal={() => handleRevealHint('year')}
                tooltip="Year movie was released"
                />
                
                <HintRow 
                icon={Hash} 
                label="Word Length" 
                value={`${movieLength} Letters`} 
                isRevealed={visibleHints.length}
                onReveal={() => handleRevealHint('length')} 
                tooltip="Total letters in the name/title"
                />

                <HintRow 
                icon={Type} 
                label="Starting Letter" 
                value={firstLetter} 
                isRevealed={visibleHints.firstLetter}
                onReveal={() => handleRevealHint('firstLetter')} 
                tooltip="First letter of the name/title"
                />
                
                <div className="border-t border-cinema-700/50 my-1"></div>
                <HintRow 
                icon={User} 
                label="Hero Name" 
                value={currentChallenge.hero || "Unknown"} 
                isRevealed={visibleHints.hero}
                onReveal={() => handleRevealHint('hero')} 
                tooltip="Leading Actor"
                />
                <HintRow 
                icon={User} 
                label="Heroine Name" 
                value={currentChallenge.heroine || "Unknown"} 
                isRevealed={visibleHints.heroine}
                onReveal={() => handleRevealHint('heroine')} 
                tooltip="Leading Actress"
                />

                <div className="border-t border-cinema-700/50 my-1"></div>

                <HintRow 
                icon={Clapperboard} 
                label="Director" 
                value={currentChallenge.director} 
                isRevealed={visibleHints.director}
                onReveal={() => handleRevealHint('director')} 
                tooltip="Who directed the movie"
                />

                <HintRow 
                icon={Users} 
                label="Other Cast" 
                value={currentChallenge.cast?.join(", ")} 
                isRevealed={visibleHints.cast}
                onReveal={() => handleRevealHint('cast')} 
                tooltip="Supporting actors"
                />
            </div>
            )}
        </div>
        </div>

        {/* CENTER COLUMN: Content (Images/Emoji/Hangman) */}
        <div className="flex-grow md:mx-72 flex flex-col items-center justify-start overflow-y-auto">
          
          {(isTimeUp || isHangmanLost) && stage === GameStage.PLAYING && (
            <div className="mb-6 bg-red-950/80 backdrop-blur border border-red-500 text-red-100 px-8 py-4 rounded-2xl flex items-center gap-4 animate-fade-in w-full max-w-2xl justify-center shadow-2xl">
              {isHangmanLost ? <Skull className="w-8 h-8 text-red-500" /> : <AlertTriangle className="w-8 h-8 text-red-500" />}
              <span className="font-bold text-xl">{isHangmanLost ? "Game Over! Too many mistakes." : "Time's Up! The answer is locked."}</span>
            </div>
          )}

          {/* VISUAL MODE GRID */}
          {(mode === GameMode.VISUAL) && (
            <div className="flex flex-col items-center w-full max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
                {images.map((img, index) => {
                    const isRevealed = revealedClues[index] || stage === GameStage.REVEALED;
                    return (
                    <div key={index} className="flex flex-col gap-4">
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden group shadow-2xl transition-all duration-500 hover:shadow-cinema-accent/30 bg-black">
                            {/* Inner Border */}
                            <div className="absolute inset-0 border border-white/10 rounded-3xl z-20 pointer-events-none"></div>
                            
                            <img 
                              src={img.data} 
                              alt={`Clue ${index + 1}`} 
                              className={`w-full h-full object-cover transition-all duration-700 ${isRevealed ? 'blur-0 scale-100' : 'blur-2xl scale-125 opacity-50'}`}
                            />
                            
                            {!isRevealed && (
                              <button 
                                  onClick={() => handleRevealClue(index)}
                                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 hover:bg-black/30 transition-colors z-30 cursor-pointer backdrop-blur-sm"
                              >
                                  <div className="bg-white/10 p-4 rounded-full mb-3 backdrop-blur-xl border border-white/20 shadow-lg group-hover:scale-110 transition-transform">
                                    <Eye className="w-8 h-8 text-white" />
                                  </div>
                                  <span className="text-white font-bold tracking-widest text-sm uppercase">Tap to Reveal</span>
                              </button>
                            )}
                            
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-white z-20 border border-white/20 shadow-lg tracking-wider uppercase">
                              Visual {index + 1}
                            </div>
                        </div>
                        {/* Explicit Reveal Button Below Image */}
                        {!isRevealed && stage === GameStage.PLAYING && (
                            <button 
                                onClick={() => handleRevealClue(index)}
                                className="w-full py-3 bg-cinema-800 hover:bg-cinema-700 text-slate-300 hover:text-white border border-cinema-700 hover:border-cinema-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Eye className="w-4 h-4" /> Reveal Clue
                            </button>
                        )}
                    </div>
                    );
                })}
              </div>
            </div>
          )}

          {/* EMOJI MODE */}
          {mode === GameMode.EMOJI && (
            <div className="w-full max-w-4xl mt-6 md:mt-12">
               <div className="bg-cinema-800/50 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-14 border border-cinema-600/50 shadow-[0_0_80px_rgba(0,0,0,0.6)] text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
                  
                  <h3 className="text-lg md:text-xl text-slate-400 mb-8 uppercase tracking-[0.2em] font-bold">Guess from Emojis</h3>
                  
                  <div className="text-6xl md:text-8xl tracking-widest leading-relaxed animate-pulse-slow filter drop-shadow-2xl py-8 px-4 bg-cinema-900/50 rounded-3xl border border-white/5 break-words">
                      {currentChallenge.emojiSequence}
                  </div>
               </div>
            </div>
          )}

          {/* LYRICS MODE */}
          {mode === GameMode.LYRICS && (
             <div className="w-full max-w-4xl mt-6 md:mt-12">
                <div className="bg-cinema-800/50 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-14 border border-cinema-600/50 shadow-[0_0_80px_rgba(168,85,247,0.15)] relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-400 to-indigo-600"></div>
                    <Music className="w-16 h-16 md:w-20 md:h-20 text-purple-500/20 mx-auto mb-6 absolute top-4 left-4" />
                    <Music className="w-16 h-16 md:w-20 md:h-20 text-purple-500/20 mx-auto mb-6 absolute bottom-4 right-4" />
                    
                    <h3 className="text-lg md:text-xl text-slate-400 mb-8 uppercase tracking-[0.2em] font-bold">Complete the Lyrics</h3>
                    
                    <div className="text-2xl md:text-5xl font-serif italic leading-relaxed text-white whitespace-pre-line drop-shadow-lg py-4">
                        {currentChallenge.lyricSnippet}
                    </div>

                     {stage === GameStage.REVEALED && (
                         <div className="mt-8 p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>
                            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Full Lyrics</p>
                            <p className="text-xl md:text-2xl text-emerald-100 whitespace-pre-line font-serif italic leading-relaxed">{currentChallenge.fullLyrics}</p>
                            <div className="mt-4 pt-4 border-t border-emerald-500/20 flex justify-center">
                                <p className="text-slate-400 text-sm">Song: <span className="text-white font-bold text-lg ml-1">{currentChallenge.songName}</span></p>
                            </div>
                         </div>
                     )}
                </div>
             </div>
          )}

          {/* HANGMAN MODE */}
          {mode === GameMode.HANGMAN && (
             <div className="w-full max-w-5xl mt-6">
               <div className="bg-cinema-800/60 rounded-[2.5rem] p-8 md:p-12 border border-cinema-600/50 shadow-2xl backdrop-blur-xl flex flex-col items-center">
                  <HangmanDrawing mistakes={mistakes} />
                  
                  {renderHangmanTitle()}

                  {/* Keyboard */}
                  <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-4xl mx-auto mt-6">
                    {alphabet.map((char) => {
                      const isGuessed = guessedLetters.has(char);
                      const isWrong = isGuessed && !currentChallenge?.title.toUpperCase().includes(char);
                      
                      return (
                        <button
                          key={char}
                          onClick={() => handleLetterGuess(char)}
                          disabled={isGuessed || !timerStarted || mistakes >= MAX_MISTAKES}
                          className={`w-10 h-12 md:w-12 md:h-14 rounded-xl font-bold text-lg md:text-xl transition-all border-b-4 active:border-b-0 active:translate-y-1 shadow-lg ${
                            !timerStarted && !isGuessed ? 'opacity-40 cursor-not-allowed bg-cinema-700 text-slate-400 border-cinema-900' :
                            isWrong 
                              ? 'bg-red-600 text-white border-red-800 opacity-40 cursor-not-allowed'
                              : isGuessed 
                                ? 'bg-emerald-600 text-white border-emerald-800 opacity-40 cursor-not-allowed'
                                : 'bg-cinema-700 text-white border-cinema-900 hover:bg-cinema-600 hover:border-cinema-800'
                          }`}
                        >
                          {char}
                        </button>
                      );
                    })}
                  </div>
               </div>
             </div>
          )}
          
          {/* Mobile Hints */}
          <div className="md:hidden w-full mt-4 grid grid-cols-2 gap-2">
              <MobileHintBox 
                  label="Year"
                  value={currentChallenge.year} 
                  isRevealed={visibleHints.year} 
                  onReveal={() => handleRevealHint('year')} 
              />
              <MobileHintBox 
                  label="Length" 
                  value={movieLength} 
                  isRevealed={visibleHints.length} 
                  onReveal={() => handleRevealHint('length')} 
              />
              <div className="col-span-2">
                  <MobileHintBox 
                  label="Hero"
                  value={currentChallenge.hero} 
                  isRevealed={visibleHints.hero} 
                  onReveal={() => handleRevealHint('hero')} 
                  />
              </div>
          </div>

          {/* REVEAL BUTTON */}
          {stage === GameStage.PLAYING && (
            <div className="mt-10 md:mt-16 pb-24 md:pb-0">
              <button
                onClick={handleFullReveal}
                className={`px-10 py-4 md:px-12 md:py-5 rounded-full font-black text-lg md:text-xl text-white shadow-2xl transition-all hover:scale-105 flex items-center gap-4 ${
                  isTimeUp || isHangmanLost
                    ? 'bg-red-600 animate-bounce shadow-red-900/50' 
                    : 'bg-gradient-to-r from-cinema-accent to-violet-600 hover:to-violet-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]'
                }`}
              >
                {isTimeUp || isHangmanLost ? <Lock className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                <span>{isTimeUp || isHangmanLost ? "Reveal Answer" : "I Know It! Reveal Answer"}</span>
              </button>
            </div>
          )}

          {/* ANSWER REVEALED CARD */}
          {stage === GameStage.REVEALED && (
            <div className="mt-8 md:mt-10 mb-24 md:mb-0 w-full max-w-4xl animate-fade-in text-center bg-gradient-to-b from-cinema-800/90 to-cinema-900/90 border border-cinema-pop/30 p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_80px_rgba(244,63,94,0.15)] backdrop-blur-xl relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cinema-pop text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-cinema-pop/40 uppercase tracking-widest text-sm">
                The Answer
              </div>
              
              <h2 className="text-4xl md:text-7xl font-black text-white mb-4 drop-shadow-xl">{currentChallenge.title}</h2>
              
              <div className="flex items-center justify-center gap-4 text-slate-300 text-lg mb-8 md:mb-12">
                <span className="font-bold bg-white/10 px-3 py-1 rounded-lg">{currentChallenge.year}</span>
                <span className="flex items-center gap-1 text-yellow-400 font-bold"><Star className="w-5 h-5 fill-current"/> Super Hit</span>
              </div>

              {!winnerSelected ? (
                <div className="bg-black/30 p-8 rounded-3xl border border-white/5 mb-8">
                  <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest">Select Winner</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {groups.map(group => (
                      <button
                        key={group.id}
                        onClick={() => handleSelectWinner(group.id)}
                        className="px-8 py-4 bg-cinema-800 hover:bg-emerald-600 border border-cinema-700 hover:border-emerald-500 rounded-2xl font-bold transition-all text-white shadow-lg hover:shadow-emerald-500/30 text-lg"
                      >
                        {group.name}
                      </button>
                    ))}
                    <button
                      onClick={() => handleSelectWinner(null)}
                      className="px-8 py-4 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-2xl font-bold flex items-center gap-2 transition-all hover:border-red-500"
                    >
                      <UserX className="w-5 h-5" />
                      None / Admin
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-6 justify-center animate-fade-in mt-8">
                  <button onClick={onHome} className="px-8 py-4 bg-cinema-800 text-slate-300 hover:bg-cinema-700 hover:text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors">
                    <Home className="w-5 h-5" /> Back to Home
                  </button>
                  <button onClick={onNextRound} className="px-10 py-4 bg-white text-cinema-900 hover:bg-slate-200 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 transform hover:-translate-y-1 transition-all text-lg">
                    Next Question <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Scoreboard & Finish */}
        <div className="hidden md:flex flex-col w-64 fixed right-6 top-24 bottom-6 gap-4 z-40 pointer-events-none">
           <div className="pointer-events-auto bg-cinema-900/80 backdrop-blur-lg border border-cinema-700 p-4 rounded-2xl shadow-2xl overflow-visible max-h-[70%]">
              <h4 className="text-cinema-accent font-bold text-xs uppercase mb-4 flex items-center gap-2 border-b border-cinema-700 pb-2 tracking-widest">
                <Trophy className="w-4 h-4" /> 
                {isTeamMode ? 'Team Standings' : 'Leaderboard'}
              </h4>
              <div className="space-y-3">
                {groups.sort((a,b) => b.score - a.score).map((g, idx) => (
                  <div key={g.id} className="relative group">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-cinema-800/50 border border-cinema-700/50 hover:bg-cinema-800 hover:border-cinema-500 transition-colors cursor-help">
                        <div className="flex items-center gap-3 overflow-hidden">
                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg ${idx === 0 ? 'bg-yellow-500 text-black shadow-yellow-500/50 shadow-sm' : 'bg-cinema-700 text-slate-400'}`}>{idx + 1}</span>
                        <span className="text-white font-bold text-sm truncate">{g.name}</span>
                        </div>
                        <span className="bg-cinema-accent/10 text-cinema-accent border border-cinema-accent/20 px-2 py-0.5 rounded font-bold text-sm">{g.score}</span>
                    </div>
                    
                    {/* Hover Member List */}
                    {isTeamMode && g.members.length > 0 && (
                        <div className="absolute right-full top-0 mr-3 w-48 bg-black/90 backdrop-blur-xl border border-cinema-600 p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 invisible group-hover:visible">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-widest">Team Members</p>
                            <div className="flex flex-wrap gap-1.5">
                                {g.members.map(m => (
                                    <span key={m} className="text-xs text-white bg-cinema-800 px-2 py-1 rounded-md border border-cinema-700">{m}</span>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 rounded-xl border border-red-900/30 bg-red-900/10 mt-2">
                   <span className="text-red-300 font-bold text-sm pl-9">Admin</span>
                   <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold text-sm border border-red-500/20">{adminScore}</span>
                </div>
              </div>
           </div>

           {/* FINISH GAME BUTTON (Desktop Sidebar - Keeping for redundancy) */}
           <div className="pointer-events-auto mt-auto">
             <button 
               onClick={onFinishGame}
               className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-red-900/50 transition-all flex items-center justify-center gap-3 border border-red-500/50 group"
             >
               <Flag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
               End Game Session
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};
