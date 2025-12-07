
export enum GameStage {
  LANDING = 'LANDING',
  PARTICIPANT_SETUP = 'PARTICIPANT_SETUP',
  GAME_SELECTION = 'GAME_SELECTION',
  SETUP = 'SETUP',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  REVEALED = 'REVEALED',
  GAME_OVER = 'GAME_OVER',
  ERROR = 'ERROR'
}

export enum GameMode {
  VISUAL = 'VISUAL',
  EMOJI = 'EMOJI',
  HANGMAN = 'HANGMAN',
  LYRICS = 'LYRICS'
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  score: number;
}

export interface MovieChallenge {
  title: string;
  language: string;
  year: string;
  difficulty: string;
  // Visual Mode Props
  visualPrompts?: string[];
  // Emoji Mode Props
  emojiSequence?: string;
  // Lyric Mode Props
  lyricSnippet?: string; // Text with blanks
  fullLyrics?: string;   // Text without blanks
  songName?: string;
  
  hint?: string; // General text hint
  cast?: string[]; // Other key actors
  hero?: string; // Leading Actor
  heroine?: string; // Leading Actress
  director?: string; // Director
}

export interface GeneratedImage {
  prompt: string;
  data: string; // base64
}

export interface GameState {
  stage: GameStage;
  mode: GameMode;
  selectedEra: string;
  currentChallenge: MovieChallenge | null;
  images: GeneratedImage[];
  timeLeft: number;
  error: string | null;
  // Group Logic
  groups: Group[];
  adminScore: number;
  isTeamMode: boolean; 
}