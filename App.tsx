
import React, { useState, useCallback } from 'react';
import { GameState, GameStage, GameMode, GeneratedImage, Group } from './types';
import { SetupPhase } from './components/SetupPhase';
import { GamePhase } from './components/GamePhase';
import { ParticipantSetup } from './components/ParticipantSetup';
import { LoadingOverlay } from './components/LoadingOverlay';
import { GameOverPhase } from './components/GameOverPhase';
import { generateMovieChallenge, generateSceneImage, checkApiKey } from './services/gemini';
import { AlertTriangle, Clapperboard, LogIn, Film, PlayCircle, Smile, Skull, Music, Gamepad2, ArrowLeft } from 'lucide-react';

// Optimized delay: 500ms is safe for free tier but faster than 1s
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const INITIAL_TIME = 60;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    stage: GameStage.LANDING,
    mode: GameMode.VISUAL, // Default
    selectedEra: '',
    currentChallenge: null,
    images: [],
    timeLeft: INITIAL_TIME,
    error: null,
    groups: [],
    adminScore: 0,
    isTeamMode: true
  });

  const handleError = (msg: string) => {
    setGameState(prev => ({ ...prev, stage: GameStage.ERROR, error: msg }));
  };

  const handleEnterApp = () => {
    setGameState(prev => ({ ...prev, stage: GameStage.PARTICIPANT_SETUP }));
  };

  // Back Navigation Handlers
  const handleBackToLanding = () => {
    setGameState(prev => ({ ...prev, stage: GameStage.LANDING }));
  };

  const handleBackToParticipants = () => {
    setGameState(prev => ({ ...prev, stage: GameStage.PARTICIPANT_SETUP }));
  };

  const handleBackToGameSelection = () => {
    setGameState(prev => ({ ...prev, stage: GameStage.GAME_SELECTION, error: null }));
  };

  const handleSetupComplete = (groups: Group[], isTeamMode: boolean) => {
    setGameState(prev => ({ 
      ...prev, 
      groups: groups,
      isTeamMode: isTeamMode,
      stage: GameStage.GAME_SELECTION 
    }));
  };

  const handleSelectGame = (mode: GameMode) => {
     if (mode === GameMode.EMOJI || mode === GameMode.HANGMAN || mode === GameMode.LYRICS) {
       // Skip Setup Phase for Emoji/Hangman/Lyrics, auto-select "All Time"
       setGameState(prev => ({ ...prev, mode }));
       handleStartGame("All Time", mode);
     } else {
       setGameState(prev => ({ ...prev, mode, stage: GameStage.SETUP }));
     }
  }

  const handleStartGame = async (era: string, modeOverride?: GameMode) => {
    if (!checkApiKey()) {
      handleError("API Key is missing. Please check your environment variables.");
      return;
    }

    const currentMode = modeOverride || gameState.mode;

    setGameState(prev => ({ 
      ...prev, 
      stage: GameStage.LOADING, 
      selectedEra: era,
      mode: currentMode,
      error: null,
      images: [],
    }));

    try {
      // 1. Generate the Movie Challenge (Text)
      const challenge = await generateMovieChallenge(era, currentMode);
      
      let generatedImages: GeneratedImage[] = [];

      if ((currentMode === GameMode.VISUAL) && challenge.visualPrompts) {
        // Generate Images Sequentially to avoid Quota Limits
        for (const prompt of challenge.visualPrompts) {
          const base64 = await generateSceneImage(prompt);
          generatedImages.push({ prompt, data: base64 });
          // Delay to prevent 429 Quota Exceeded on free tier
          await delay(500); 
        }
      } 
      // Emoji/Hangman/Lyrics mode doesn't need image generation

      setGameState(prev => ({
        ...prev,
        stage: GameStage.PLAYING,
        currentChallenge: challenge,
        images: generatedImages,
        timeLeft: INITIAL_TIME
      }));

    } catch (err: any) {
      handleError(err.message || "Failed to generate game content. Please try again.");
    }
  };

  const handleReveal = () => {
    setGameState(prev => ({ ...prev, stage: GameStage.REVEALED }));
  };

  // Score Update Logic
  const handleScoreUpdate = (winnerGroupId: string | null) => {
    setGameState(prev => {
      // If null, admin gets points
      if (!winnerGroupId) {
        return { ...prev, adminScore: prev.adminScore + 1 };
      }
      
      // Update specific group score
      const updatedGroups = prev.groups.map(g => {
        if (g.id === winnerGroupId) {
          return { ...g, score: g.score + 1 };
        }
        return g;
      });
      return { ...prev, groups: updatedGroups };
    });
  };

  // Restarts the game with the SAME era and SAME mode
  const handleNextQuestion = () => {
    if (gameState.selectedEra) {
      handleStartGame(gameState.selectedEra);
    } else {
      setGameState(prev => ({ ...prev, stage: GameStage.GAME_SELECTION }));
    }
  };

  const handleBackToHome = () => {
    setGameState(prev => ({
      ...prev,
      stage: GameStage.GAME_SELECTION,
      currentChallenge: null,
      images: [],
      timeLeft: INITIAL_TIME,
      error: null
    }));
  };

  const handleFinishGame = () => {
    setGameState(prev => ({ ...prev, stage: GameStage.GAME_OVER }));
  };

  const handleRestartApp = () => {
    setGameState({
      stage: GameStage.LANDING,
      mode: GameMode.VISUAL,
      selectedEra: '',
      currentChallenge: null,
      images: [],
      timeLeft: INITIAL_TIME,
      error: null,
      groups: [],
      adminScore: 0,
      isTeamMode: true
    });
  };

  const updateTimer = useCallback((time: number) => {
    setGameState(prev => {
      if (time <= 0) {
        return { ...prev, timeLeft: 0 };
      }
      return { ...prev, timeLeft: time };
    });
  }, []);

  // Landing Page Component
  const LandingPage = () => (
    <div className="flex-grow flex flex-col items-center justify-center animate-fade-in text-center p-6">
       <div className="relative mb-12 group">
          <div className="absolute inset-0 bg-cinema-pop/20 rounded-full blur-3xl animate-pulse-slow group-hover:bg-cinema-pop/30 transition-all"></div>
          <div className="relative bg-gradient-to-br from-cinema-800 to-cinema-900 p-10 rounded-[2rem] border border-cinema-700 shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500 hover:scale-105">
            <Clapperboard className="w-24 h-24 text-cinema-pop" />
          </div>
       </div>
       
       <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cinema-pop to-cinema-accent mb-8 tracking-tighter drop-shadow-lg">
          CINEGUESS
       </h1>
       
       <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-lg leading-relaxed font-light">
          The ultimate AI-powered <span className="text-white font-semibold">Tollywood</span> trivia experience.
       </p>

       <button 
        onClick={handleEnterApp}
        className="group px-12 py-6 bg-white text-cinema-900 rounded-full font-bold text-xl shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300 flex items-center gap-4"
       >
          <span>Start Playing</span>
          <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
       </button>
    </div>
  );

  // Game Selection Component
  const GameSelectionPage = () => (
    <div className="flex-grow flex flex-col items-center justify-center animate-fade-in text-center p-6 max-w-6xl mx-auto w-full">
      <div className="w-full flex items-center justify-start mb-8">
        <button onClick={handleBackToParticipants} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
        </button>
      </div>

      <h2 className="text-4xl md:text-6xl font-black text-white mb-4">Choose Your Challenge</h2>
      <p className="text-slate-400 mb-12 text-lg">Select a game mode to test your movie knowledge</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {/* Visual Game Card */}
        <div 
          onClick={() => handleSelectGame(GameMode.VISUAL)}
          className="group relative bg-cinema-800 rounded-3xl p-6 border border-cinema-700 hover:border-cinema-pop cursor-pointer transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] text-left flex flex-col"
        >
          <div className="absolute top-4 right-4 bg-cinema-pop text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse shadow-lg shadow-cinema-pop/50">
            HOT
          </div>
          <div className="w-16 h-16 bg-cinema-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-cinema-700/50">
             <Film className="w-8 h-8 text-cinema-pop" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cinema-pop transition-colors">Visual Trivia</h3>
          <p className="text-slate-400 text-sm mb-6 flex-grow">
            Guess the movie from 3 abstract AI-generated images.
          </p>
          <div className="flex items-center gap-2 text-cinema-pop font-bold group-hover:gap-3 transition-all text-sm mt-auto">
            <span>Play Now</span>
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Emoji Game Card */}
        <div 
           onClick={() => handleSelectGame(GameMode.EMOJI)}
           className="group relative bg-cinema-800 rounded-3xl p-6 border border-cinema-700 hover:border-yellow-400 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] text-left flex flex-col"
        >
           <div className="w-16 h-16 bg-cinema-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-cinema-700/50">
             <Smile className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">Emoji Decode</h3>
          <p className="text-slate-400 text-sm mb-6 flex-grow">
             Decipher the movie title from a sequence of emojis.
          </p>
          <div className="flex items-center gap-2 text-yellow-500 font-bold group-hover:gap-3 transition-all text-sm mt-auto">
            <span>Play Now</span>
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Hangman Game Card */}
        <div 
           onClick={() => handleSelectGame(GameMode.HANGMAN)}
           className="group relative bg-cinema-800 rounded-3xl p-6 border border-cinema-700 hover:border-emerald-400 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] text-left flex flex-col"
        >
           <div className="w-16 h-16 bg-cinema-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-cinema-700/50">
             <Skull className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Hangman</h3>
          <p className="text-slate-400 text-sm mb-6 flex-grow">
             Save the scene by guessing the movie title letter by letter.
          </p>
          <div className="flex items-center gap-2 text-emerald-500 font-bold group-hover:gap-3 transition-all text-sm mt-auto">
            <span>Play Now</span>
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Lyrics Game Card */}
        <div 
           onClick={() => handleSelectGame(GameMode.LYRICS)}
           className="group relative bg-cinema-800 rounded-3xl p-6 border border-cinema-700 hover:border-purple-400 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] text-left flex flex-col"
        >
           <div className="w-16 h-16 bg-cinema-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-cinema-700/50">
             <Music className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Lyric Challenge</h3>
          <p className="text-slate-400 text-sm mb-6 flex-grow">
             Complete the missing lyrics from popular songs.
          </p>
          <div className="flex items-center gap-2 text-purple-500 font-bold group-hover:gap-3 transition-all text-sm mt-auto">
            <span>Play Now</span>
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Flappy Sing (Upcoming) */}
        <div className="group relative bg-cinema-900/40 rounded-3xl p-6 border border-cinema-800 cursor-not-allowed overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center"></div>
            <div className="absolute top-4 right-4 bg-cinema-800 text-slate-300 border border-cinema-700 text-[10px] font-bold px-3 py-1 rounded-full z-20">
              COMING SOON
            </div>
            
            <div className="w-16 h-16 bg-cinema-900 rounded-2xl flex items-center justify-center mb-6 grayscale opacity-50 border border-cinema-800">
               <Gamepad2 className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-500 mb-2">Flappy Sing</h3>
            <p className="text-slate-600 text-sm mb-6 flex-grow">
               Control the bird's flight by singing the correct pitch.
            </p>
            <div className="flex items-center gap-2 text-slate-600 font-bold text-sm mt-auto">
              <span>Locked</span>
            </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cinema-900 text-white flex flex-col font-sans overflow-hidden relative selection:bg-cinema-pop selection:text-white">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cinema-accent/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cinema-pop/5 rounded-full blur-[120px]"></div>
      </div>

      <main className="flex-grow flex flex-col p-4 md:p-6 relative z-10 w-full h-full">
        {gameState.stage === GameStage.LOADING && (
          <LoadingOverlay />
        )}

        {gameState.stage === GameStage.ERROR && (
          <div className="max-w-md mx-auto mt-32 p-10 bg-red-950/40 border border-red-500/30 rounded-3xl text-center backdrop-blur-xl shadow-2xl">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">Technical Glitch</h2>
            <p className="text-slate-400 mb-8">{gameState.error}</p>
            <button 
              onClick={handleBackToHome}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-red-900/50"
            >
              Back to Home
            </button>
          </div>
        )}

        {gameState.stage === GameStage.LANDING && <LandingPage />}
        
        {gameState.stage === GameStage.PARTICIPANT_SETUP && (
          <div className="flex-grow flex items-center justify-center">
            <ParticipantSetup 
              onComplete={handleSetupComplete} 
              onBack={handleBackToLanding}
            />
          </div>
        )}
        
        {gameState.stage === GameStage.GAME_SELECTION && <GameSelectionPage />}

        {gameState.stage === GameStage.SETUP && (
          <div className="flex-grow flex items-center justify-center">
            <SetupPhase 
                onStart={(era) => handleStartGame(era)} 
                mode={gameState.mode}
                onBack={handleBackToGameSelection}
            />
          </div>
        )}

        {(gameState.stage === GameStage.PLAYING || gameState.stage === GameStage.REVEALED) && (
          <GamePhase 
            gameState={gameState} 
            onReveal={handleReveal}
            onNextRound={handleNextQuestion}
            onHome={handleBackToHome}
            setTimer={updateTimer}
            onScoreUpdate={handleScoreUpdate}
            onFinishGame={handleFinishGame}
            onExit={handleBackToGameSelection}
          />
        )}

        {gameState.stage === GameStage.GAME_OVER && (
          <GameOverPhase 
            groups={gameState.groups} 
            adminScore={gameState.adminScore}
            isTeamMode={gameState.isTeamMode}
            onRestart={handleRestartApp}
          />
        )}
      </main>
      
      {gameState.stage !== GameStage.LOADING && gameState.stage !== GameStage.PLAYING && gameState.stage !== GameStage.REVEALED && gameState.stage !== GameStage.GAME_OVER && (
         <footer className="py-6 text-center text-cinema-700 text-xs font-medium uppercase tracking-widest relative z-10 opacity-50">
          Built for Movie Buffs
        </footer>
      )}
    </div>
  );
};

export default App;
