import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChatBubbleBottomCenterTextIcon,
  HeartIcon,
  PencilSquareIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '../contexts/AppContext';
import { affirmationsAPI, chatAPI } from '../services/api';
import { Affirmation } from '../types';

const HomePage: React.FC = () => {
  const { state, setSession, dispatch } = useApp();
  const [dailyAffirmation, setDailyAffirmation] = useState<Affirmation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDailyAffirmation();
    checkConnection();
  }, []);

  const loadDailyAffirmation = async () => {
    try {
      const affirmation = await affirmationsAPI.getDailyAffirmation(
        state.session?.sessionId, 
        state.currentMood || undefined
      );
      setDailyAffirmation(affirmation);
      dispatch({ type: 'SET_AFFIRMATION', payload: affirmation });
    } catch (error) {
      console.error('Failed to load daily affirmation:', error);
    }
  };

  const checkConnection = async () => {
    try {
      dispatch({ type: 'SET_CONNECTED', payload: true });
    } catch (error) {
      dispatch({ type: 'SET_CONNECTED', payload: false });
    }
  };

  const startNewSession = async () => {
    setIsLoading(true);
    try {
      const session = await chatAPI.startConversation();
      setSession({
        sessionId: session.sessionId,
        createdAt: session.timestamp,
      });
      dispatch({ type: 'SET_CONNECTED', payload: true });
    } catch (error) {
      console.error('Failed to start session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to Sanjeevani. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      name: 'Start Chatting',
      description: 'Talk with Sanjeevani about how you\'re feeling',
      href: '/chat',
      icon: ChatBubbleBottomCenterTextIcon,
      color: 'sage',
    },
    {
      name: 'Check Your Mood',
      description: 'Track and understand your emotional patterns',
      href: '/mood',
      icon: HeartIcon,
      color: 'calm',
    },
    {
      name: 'Write in Journal',
      description: 'Reflect on your thoughts and experiences',
      href: '/journal',
      icon: PencilSquareIcon,
      color: 'earth',
    },
    {
      name: 'Daily Affirmation',
      description: 'Find strength in positive self-talk',
      href: '/affirmations',
      icon: SparklesIcon,
      color: 'sage',
    },
  ];

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-sage">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="mb-6">
            <div className="w-20 h-20 bg-sage-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌿</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-earth-800 mb-4">
              {getCurrentGreeting()}
            </h1>
            <p className="text-xl text-earth-600 max-w-2xl mx-auto">
              Welcome to Sanjeevani, your compassionate space for mental wellness. 
              I'm here to listen, support, and help you on your journey.
            </p>
          </div>

          {/* Session Status */}
          {!state.session ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-earth-800 mb-3">Ready to begin?</h3>
              <p className="text-earth-600 mb-4">
                Start your anonymous session to access all features safely and privately.
              </p>
              <button
                onClick={startNewSession}
                disabled={isLoading}
                className="primary-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connecting...' : 'Start Your Journey'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 mb-8"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-gentle" />
                <span className="text-earth-700 font-medium">Session Active</span>
              </div>
              <p className="text-earth-600 mt-2">
                Your private session is ready. All conversations are temporary and secure.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Daily Affirmation */}
        {dailyAffirmation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-sage-100 p-8 mb-8 text-center"
          >
            <SparklesIcon className="w-8 h-8 text-sage-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-earth-800 mb-3">Today's Affirmation</h3>
            <blockquote className="text-xl text-earth-700 font-medium italic mb-4">
              "{dailyAffirmation.affirmation}"
            </blockquote>
            <p className="text-earth-500 text-sm">
              Category: {dailyAffirmation.category}
            </p>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <h2 className="text-2xl font-serif font-semibold text-earth-800 text-center mb-8">
            How can I support you today?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              >
                <Link
                  to={action.href}
                  className="block group"
                >
                  <div className="section-card h-full hover:scale-105 transition-transform duration-200">
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center group-hover:bg-${action.color}-200 transition-colors duration-200`}>
                        <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-earth-800 group-hover:text-sage-700 transition-colors duration-200">
                          {action.name}
                        </h3>
                        <p className="text-earth-600 mt-1 text-sm">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRightIcon className="w-5 h-5 text-earth-400 group-hover:text-sage-500 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-earth-500 text-sm">
            Remember: You are not alone in this journey. Every step forward, no matter how small, is progress.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;