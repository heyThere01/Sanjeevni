import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ChatMessage, SessionData, MoodEntry, JournalEntry, Affirmation } from '../types';

interface AppState {
  session: SessionData | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  currentMood: string | null;
  dailyAffirmation: Affirmation | null;
  isConnected: boolean;
}

type AppAction =
  | { type: 'SET_SESSION'; payload: SessionData }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MOOD'; payload: string }
  | { type: 'SET_AFFIRMATION'; payload: Affirmation }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'CLEAR_SESSION' };

const initialState: AppState = {
  session: null,
  messages: [],
  isLoading: false,
  error: null,
  currentMood: null,
  dailyAffirmation: null,
  isConnected: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_MOOD':
      return { ...state, currentMood: action.payload };
    case 'SET_AFFIRMATION':
      return { ...state, dailyAffirmation: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'CLEAR_SESSION':
      return { 
        ...initialState, 
        isConnected: state.isConnected,
        dailyAffirmation: state.dailyAffirmation 
      };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  addMessage: (message: ChatMessage) => void;
  setSession: (session: SessionData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSession: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const addMessage = (message: ChatMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const setSession = (session: SessionData) => {
    dispatch({ type: 'SET_SESSION', payload: session });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearSession = () => {
    dispatch({ type: 'CLEAR_SESSION' });
  };

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('sanjeevani_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setSession(session);
      } catch (error) {
        console.error('Failed to load saved session:', error);
        localStorage.removeItem('sanjeevani_session');
      }
    }
  }, []);

  // Save session to localStorage when it changes
  useEffect(() => {
    if (state.session) {
      localStorage.setItem('sanjeevani_session', JSON.stringify(state.session));
    } else {
      localStorage.removeItem('sanjeevani_session');
    }
  }, [state.session]);

  const value: AppContextType = {
    state,
    dispatch,
    addMessage,
    setSession,
    setLoading,
    setError,
    clearSession,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};