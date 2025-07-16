const express = require('express');
const { body, validationResult } = require('express-validator');
const { analyzeSentiment, getMoodInsight, trackMoodTrend } = require('../utils/sentiment');
const { setSessionData, getSessionData } = require('../utils/redis');

const router = express.Router();

// Record mood check-in
router.post('/checkin', [
  body('sessionId').isUUID().withMessage('Valid session ID required'),
  body('mood').isIn(['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'calm', 'lonely', 'grateful', 'confused']).withMessage('Valid mood required'),
  body('intensity').optional().isInt({ min: 1, max: 10 }).withMessage('Intensity must be between 1 and 10'),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, mood, intensity = 5, note = '' } = req.body;

    // Create mood entry
    const moodEntry = {
      mood,
      intensity,
      note,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };

    // If there's a note, analyze its sentiment for additional insights
    let sentimentData = null;
    if (note.trim()) {
      sentimentData = analyzeSentiment(note);
    }

    // Get existing mood history
    let moodHistory = await getSessionData(sessionId, 'mood_history') || [];
    
    // Add new entry
    moodHistory.push({
      ...moodEntry,
      sentiment: sentimentData
    });

    // Keep only last 30 entries for privacy and performance
    if (moodHistory.length > 30) {
      moodHistory = moodHistory.slice(-30);
    }

    // Save updated history
    await setSessionData(sessionId, 'mood_history', moodHistory);

    // Generate insight
    const insight = getMoodInsight({ mood, score: intensity });
    
    // Analyze mood trend
    const trendAnalysis = trackMoodTrend(moodHistory);

    res.json({
      message: 'Mood recorded successfully',
      insight,
      trend: trendAnalysis,
      entry: moodEntry,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error recording mood:', error);
    res.status(500).json({ error: 'Failed to record mood check-in' });
  }
});

// Get mood history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { days = 7 } = req.query;

    const moodHistory = await getSessionData(sessionId, 'mood_history') || [];
    
    // Filter by days if specified
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const filteredHistory = moodHistory.filter(entry => 
      new Date(entry.timestamp) >= cutoffDate
    );

    // Calculate statistics
    const stats = calculateMoodStats(filteredHistory);
    
    // Analyze trends
    const trendAnalysis = trackMoodTrend(filteredHistory);

    res.json({
      history: filteredHistory,
      stats,
      trend: trendAnalysis,
      totalEntries: moodHistory.length,
      period: `${days} days`
    });

  } catch (error) {
    console.error('Error fetching mood history:', error);
    res.status(500).json({ error: 'Failed to fetch mood history' });
  }
});

// Get mood insights
router.get('/insights/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const moodHistory = await getSessionData(sessionId, 'mood_history') || [];
    
    if (moodHistory.length === 0) {
      return res.json({
        message: 'Start tracking your mood to see insights!',
        suggestions: [
          'Try checking in with your mood daily',
          'Add notes to understand patterns better',
          'Notice what activities affect your mood'
        ]
      });
    }

    const insights = generateMoodInsights(moodHistory);
    
    res.json(insights);

  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate mood insights' });
  }
});

// Helper function to calculate mood statistics
const calculateMoodStats = (moodHistory) => {
  if (moodHistory.length === 0) return {};

  const moodCounts = {};
  let totalIntensity = 0;
  
  moodHistory.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    totalIntensity += entry.intensity;
  });

  const mostFrequentMood = Object.entries(moodCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  return {
    totalEntries: moodHistory.length,
    averageIntensity: (totalIntensity / moodHistory.length).toFixed(1),
    mostFrequentMood,
    moodDistribution: moodCounts,
    lastEntry: moodHistory[moodHistory.length - 1]
  };
};

// Helper function to generate mood insights
const generateMoodInsights = (moodHistory) => {
  const recentEntries = moodHistory.slice(-7); // Last 7 entries
  const stats = calculateMoodStats(recentEntries);
  
  const insights = [];
  
  // Trend analysis
  if (recentEntries.length >= 3) {
    const recentIntensities = recentEntries.slice(-3).map(e => e.intensity);
    const isImproving = recentIntensities[2] > recentIntensities[0];
    
    insights.push({
      type: 'trend',
      title: isImproving ? 'Positive Trend' : 'Mood Pattern',
      message: isImproving 
        ? 'Your recent mood entries show an upward trend. Keep up the positive momentum!'
        : 'Your mood has been fluctuating. Remember that ups and downs are normal.'
    });
  }

  // Frequency insights
  if (stats.mostFrequentMood) {
    insights.push({
      type: 'frequency',
      title: 'Most Common Mood',
      message: `You've been feeling ${stats.mostFrequentMood} most often lately. ${getMoodInsight({ mood: stats.mostFrequentMood })}`
    });
  }

  // Intensity insights
  if (stats.averageIntensity) {
    const intensity = parseFloat(stats.averageIntensity);
    insights.push({
      type: 'intensity',
      title: 'Emotional Intensity',
      message: intensity > 7 
        ? 'Your emotions have been quite intense lately. Consider some calming activities.'
        : intensity < 4
        ? 'Your emotional intensity has been lower. This could be peace or numbness - how does it feel?'
        : 'Your emotional intensity seems balanced lately.'
    });
  }

  return {
    insights,
    stats,
    suggestions: [
      'Try to identify what triggers different moods',
      'Notice patterns in your mood timing',
      'Celebrate the positive moments',
      'Be gentle with yourself during difficult times'
    ]
  };
};

module.exports = router;