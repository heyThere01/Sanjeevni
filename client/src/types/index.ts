export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mood?: string;
  isCrisis?: boolean;
  sentiment?: SentimentData;
}

export interface SentimentData {
  score: number;
  comparative: number;
  mood: string;
  emotions: Array<{
    emotion: string;
    confidence: number;
    matches: string[];
  }>;
  positive: string[];
  negative: string[];
  timestamp: string;
}

export interface MoodEntry {
  id: string;
  mood: MoodType;
  intensity: number;
  note: string;
  timestamp: string;
  sentiment?: SentimentData;
}

export type MoodType = 
  | 'happy' 
  | 'sad' 
  | 'anxious' 
  | 'angry' 
  | 'neutral' 
  | 'excited' 
  | 'calm' 
  | 'lonely' 
  | 'grateful' 
  | 'confused';

export interface JournalEntry {
  id: string;
  content: string;
  prompt?: string;
  mood: string;
  sentiment: SentimentData;
  timestamp: string;
  wordCount: number;
}

export interface Affirmation {
  affirmation: string;
  category: string;
  date: string;
  timestamp: string;
}

export interface CalmingExercise {
  name: string;
  description: string;
  instructions: string;
  duration: string;
}

export interface SessionData {
  sessionId: string;
  createdAt: string;
  lastActivity?: string;
}

export interface APIResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MoodStats {
  totalEntries: number;
  averageIntensity: string;
  mostFrequentMood: string;
  moodDistribution: Record<string, number>;
  lastEntry?: MoodEntry;
}

export interface MoodTrend {
  trend: 'improving' | 'stable' | 'concerning' | 'insufficient_data';
  averageScore?: number;
  message: string;
  dataPoints?: number;
}

export interface JournalStats {
  totalEntries: number;
  totalWords: number;
  averageWordsPerEntry: number;
  mostFrequentMood: string;
  moodDistribution: Record<string, number>;
  writingStreak: number;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
}