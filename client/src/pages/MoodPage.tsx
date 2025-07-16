import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';

const MoodPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-sage-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center">
          <HeartIcon className="w-16 h-16 text-calm-500 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold text-earth-800 mb-4">
            Mood Tracking
          </h1>
          <p className="text-earth-600 mb-8">
            Understand and track your emotional patterns over time
          </p>
          <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-8">
            <p className="text-earth-700">
              Mood tracking interface coming soon... This will include mood check-ins, analytics, and insights.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MoodPage;