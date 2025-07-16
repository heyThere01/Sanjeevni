import axios from 'axios';
import { 
  ChatMessage, 
  MoodEntry, 
  MoodType, 
  JournalEntry, 
  Affirmation, 
  CalmingExercise,
  APIResponse,
  MoodStats,
  MoodTrend,
  JournalStats
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Chat API
export const chatAPI = {
  startConversation: async (): Promise<{ sessionId: string; message: string; timestamp: string }> => {
    const response = await api.post('/api/chat/start');
    return response.data;
  },

  sendMessage: async (sessionId: string, message: string): Promise<{
    response: string;
    isCrisis: boolean;
    sentiment: any;
    messageCount: number;
    timestamp: string;
  }> => {
    const response = await api.post('/api/chat/message', {
      sessionId,
      message,
    });
    return response.data;
  },

  getHistory: async (sessionId: string): Promise<{
    history: ChatMessage[];
    messageCount: number;
    createdAt: string;
    lastActivity: string;
  }> => {
    const response = await api.get(`/api/chat/history/${sessionId}`);
    return response.data;
  },

  endSession: async (sessionId: string): Promise<{ message: string; timestamp: string }> => {
    const response = await api.delete(`/api/chat/session/${sessionId}`);
    return response.data;
  },
};

// Mood API
export const moodAPI = {
  recordMoodCheckin: async (
    sessionId: string, 
    mood: MoodType, 
    intensity: number = 5, 
    note: string = ''
  ): Promise<{
    message: string;
    insight: string;
    trend: MoodTrend;
    entry: MoodEntry;
    timestamp: string;
  }> => {
    const response = await api.post('/api/mood/checkin', {
      sessionId,
      mood,
      intensity,
      note,
    });
    return response.data;
  },

  getMoodHistory: async (sessionId: string, days: number = 7): Promise<{
    history: MoodEntry[];
    stats: MoodStats;
    trend: MoodTrend;
    totalEntries: number;
    period: string;
  }> => {
    const response = await api.get(`/api/mood/history/${sessionId}?days=${days}`);
    return response.data;
  },

  getMoodInsights: async (sessionId: string): Promise<{
    insights: Array<{
      type: string;
      title: string;
      message: string;
    }>;
    stats: MoodStats;
    suggestions: string[];
  }> => {
    const response = await api.get(`/api/mood/insights/${sessionId}`);
    return response.data;
  },
};

// Journal API
export const journalAPI = {
  getPrompt: async (mood?: string, sessionId?: string): Promise<{
    prompt: string;
    category: string;
    timestamp: string;
  }> => {
    const params = new URLSearchParams();
    if (mood) params.append('mood', mood);
    if (sessionId) params.append('sessionId', sessionId);
    
    const response = await api.get(`/api/journal/prompt?${params.toString()}`);
    return response.data;
  },

  createEntry: async (
    sessionId: string,
    content: string,
    prompt?: string,
    mood?: string
  ): Promise<{
    message: string;
    entry: {
      id: string;
      timestamp: string;
      wordCount: number;
      mood: string;
    };
    sentiment: any;
    insight: string;
    encouragement: string;
  }> => {
    const response = await api.post('/api/journal/entry', {
      sessionId,
      content,
      prompt,
      mood,
    });
    return response.data;
  },

  getEntries: async (sessionId: string, days: number = 30, limit: number = 20): Promise<{
    entries: Array<{
      id: string;
      timestamp: string;
      mood: string;
      wordCount: number;
      prompt?: string;
      sentiment: {
        mood: string;
        score: number;
      };
    }>;
    totalEntries: number;
    period: string;
    stats: JournalStats;
  }> => {
    const response = await api.get(`/api/journal/entries/${sessionId}?days=${days}&limit=${limit}`);
    return response.data;
  },

  getEntry: async (sessionId: string, entryId: string): Promise<{
    entry: JournalEntry;
    insight: string;
  }> => {
    const response = await api.get(`/api/journal/entry/${sessionId}/${entryId}`);
    return response.data;
  },

  getInsights: async (sessionId: string): Promise<{
    insights?: Array<{
      type: string;
      title: string;
      message: string;
    }>;
    stats?: JournalStats;
    suggestions: string[];
    message?: string;
  }> => {
    const response = await api.get(`/api/journal/insights/${sessionId}`);
    return response.data;
  },
};

// Affirmations API
export const affirmationsAPI = {
  getDailyAffirmation: async (sessionId?: string, mood?: string): Promise<Affirmation> => {
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    if (mood) params.append('mood', mood);
    
    const response = await api.get(`/api/affirmations/daily?${params.toString()}`);
    return response.data;
  },

  getRandomAffirmation: async (mood?: string): Promise<Affirmation> => {
    const params = new URLSearchParams();
    if (mood) params.append('mood', mood);
    
    const response = await api.get(`/api/affirmations/random?${params.toString()}`);
    return response.data;
  },

  getCalamingExercise: async (type?: 'breathing' | 'grounding'): Promise<{
    exercise: CalmingExercise;
    timestamp: string;
  }> => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const response = await api.get(`/api/affirmations/exercise?${params.toString()}`);
    return response.data;
  },

  getCategories: async (): Promise<{
    categories: Array<{
      name: string;
      count: number;
      description: string;
    }>;
    totalAffirmations: number;
  }> => {
    const response = await api.get('/api/affirmations/categories');
    return response.data;
  },

  getHistory: async (sessionId: string, days: number = 7): Promise<{
    history: Array<{
      affirmation: string;
      category: string;
      date: string;
      timestamp: string;
    }>;
    totalViewed: number;
    period: string;
    stats: {
      totalViews: number;
      uniqueDays: number;
      mostViewedCategory: string;
      categoryDistribution: Record<string, number>;
      consistency: 'good' | 'moderate' | 'low';
    };
  }> => {
    const response = await api.get(`/api/affirmations/history/${sessionId}?days=${days}`);
    return response.data;
  },
};

// Health check API
export const healthAPI = {
  check: async (): Promise<{
    status: string;
    timestamp: string;
    service: string;
  }> => {
    const response = await api.get('/api/health');
    return response.data;
  },
};

export default api;