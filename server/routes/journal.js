const express = require('express');
const { body, validationResult } = require('express-validator');
const { analyzeSentiment, getMoodInsight } = require('../utils/sentiment');
const { setSessionData, getSessionData } = require('../utils/redis');
const { moderateContent } = require('../utils/openai');

const router = express.Router();

// Journaling prompts categorized by mood and situation
const JOURNAL_PROMPTS = {
  general: [
    "What are three things you're grateful for today?",
    "Describe a moment today when you felt proud of yourself.",
    "What's one small thing that brought you joy recently?",
    "If you could give your past self advice, what would it be?",
    "What does self-care look like for you today?"
  ],
  anxious: [
    "What specific thoughts are making you feel anxious right now?",
    "What are three things within your control in this situation?",
    "Describe a time when you overcame a similar worry.",
    "What would you tell a friend who was feeling this way?",
    "How can you break down this big worry into smaller, manageable parts?"
  ],
  sad: [
    "What emotions are you feeling right now, and where do you feel them in your body?",
    "Write about someone who makes you feel loved and supported.",
    "What are some ways you've coped with sadness before?",
    "What would bring you a small amount of comfort right now?",
    "How has sadness taught you something valuable in the past?"
  ],
  angry: [
    "What triggered your anger, and what might be underneath this feeling?",
    "If your anger could speak, what would it say?",
    "What would it look like to respond to this situation with compassion?",
    "What are some healthy ways you can release this energy?",
    "What boundaries might you need to set to protect your peace?"
  ],
  stressed: [
    "List everything that's overwhelming you right now, then circle what you can control.",
    "What would your ideal resolution to this stress look like?",
    "When you've felt this overwhelmed before, what helped you through it?",
    "What would you prioritize if you only had energy for three things today?",
    "How can you be gentler with yourself during this stressful time?"
  ],
  happy: [
    "What specifically is making you feel good right now?",
    "How can you capture and remember this feeling for harder days?",
    "Who in your life would you like to share this happiness with?",
    "What did you do to create or contribute to this positive feeling?",
    "How does this joy connect to your values and what matters to you?"
  ]
};

// Get a random journaling prompt
router.get('/prompt', async (req, res) => {
  try {
    const { mood, sessionId } = req.query;
    
    let prompts = JOURNAL_PROMPTS.general;
    
    // Get mood-specific prompts if mood is provided
    if (mood && JOURNAL_PROMPTS[mood]) {
      prompts = JOURNAL_PROMPTS[mood];
    } else if (sessionId) {
      // Try to get recent mood from session data
      const moodHistory = await getSessionData(sessionId, 'mood_history') || [];
      const recentMood = moodHistory[moodHistory.length - 1];
      
      if (recentMood && JOURNAL_PROMPTS[recentMood.mood]) {
        prompts = JOURNAL_PROMPTS[recentMood.mood];
      }
    }
    
    // Get random prompt
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    res.json({
      prompt: randomPrompt,
      category: mood || 'general',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Failed to fetch journaling prompt' });
  }
});

// Create a journal entry
router.post('/entry', [
  body('sessionId').isUUID().withMessage('Valid session ID required'),
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content must be between 1 and 5000 characters'),
  body('prompt').optional().trim().isLength({ max: 500 }).withMessage('Prompt must be less than 500 characters'),
  body('mood').optional().isIn(['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'calm', 'lonely', 'grateful', 'confused']).withMessage('Valid mood required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, content, prompt, mood } = req.body;

    // Content moderation
    const moderation = await moderateContent(content);
    if (moderation.flagged) {
      return res.status(400).json({ 
        error: 'Entry contains inappropriate content',
        categories: moderation.categories 
      });
    }

    // Analyze sentiment of the entry
    const sentimentData = analyzeSentiment(content);

    // Create journal entry
    const entry = {
      id: Date.now().toString(),
      content,
      prompt: prompt || null,
      mood: mood || sentimentData.mood,
      sentiment: sentimentData,
      timestamp: new Date().toISOString(),
      wordCount: content.split(/\s+/).length
    };

    // Get existing journal entries
    let journalEntries = await getSessionData(sessionId, 'journal_entries') || [];
    
    // Add new entry
    journalEntries.push(entry);

    // Keep only last 50 entries for privacy and performance
    if (journalEntries.length > 50) {
      journalEntries = journalEntries.slice(-50);
    }

    // Save updated entries
    await setSessionData(sessionId, 'journal_entries', journalEntries);

    // Update mood history if sentiment is strong
    if (sentimentData.emotions.length > 0) {
      let moodHistory = await getSessionData(sessionId, 'mood_history') || [];
      
      const moodEntry = {
        mood: sentimentData.mood,
        score: sentimentData.score,
        emotions: sentimentData.emotions,
        timestamp: new Date().toISOString(),
        source: 'journal',
        entryId: entry.id
      };
      
      moodHistory.push(moodEntry);
      
      if (moodHistory.length > 30) {
        moodHistory = moodHistory.slice(-30);
      }
      
      await setSessionData(sessionId, 'mood_history', moodHistory);
    }

    // Generate insight
    const insight = getMoodInsight(sentimentData);

    res.json({
      message: 'Journal entry saved successfully',
      entry: {
        id: entry.id,
        timestamp: entry.timestamp,
        wordCount: entry.wordCount,
        mood: entry.mood
      },
      sentiment: sentimentData,
      insight,
      encouragement: generateEncouragement(entry)
    });

  } catch (error) {
    console.error('Error saving journal entry:', error);
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
});

// Get journal entries
router.get('/entries/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { days = 30, limit = 20 } = req.query;

    const journalEntries = await getSessionData(sessionId, 'journal_entries') || [];
    
    // Filter by days if specified
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    let filteredEntries = journalEntries.filter(entry => 
      new Date(entry.timestamp) >= cutoffDate
    );

    // Sort by timestamp (newest first)
    filteredEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    filteredEntries = filteredEntries.slice(0, parseInt(limit));

    // Remove content for privacy, just return metadata
    const entriesMetadata = filteredEntries.map(entry => ({
      id: entry.id,
      timestamp: entry.timestamp,
      mood: entry.mood,
      wordCount: entry.wordCount,
      prompt: entry.prompt,
      sentiment: {
        mood: entry.sentiment.mood,
        score: entry.sentiment.score
      }
    }));

    res.json({
      entries: entriesMetadata,
      totalEntries: journalEntries.length,
      period: `${days} days`,
      stats: calculateJournalStats(filteredEntries)
    });

  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Get specific journal entry
router.get('/entry/:sessionId/:entryId', async (req, res) => {
  try {
    const { sessionId, entryId } = req.params;

    const journalEntries = await getSessionData(sessionId, 'journal_entries') || [];
    const entry = journalEntries.find(e => e.id === entryId);

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    res.json({
      entry,
      insight: getMoodInsight(entry.sentiment)
    });

  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

// Get journaling insights
router.get('/insights/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const journalEntries = await getSessionData(sessionId, 'journal_entries') || [];

    if (journalEntries.length === 0) {
      return res.json({
        message: 'Start journaling to see insights about your thoughts and feelings!',
        suggestions: [
          'Try writing for just 5 minutes a day',
          'Use prompts when you\'re not sure what to write',
          'Focus on how you\'re feeling rather than just events',
          'Be honest and kind to yourself in your writing'
        ]
      });
    }

    const insights = generateJournalInsights(journalEntries);

    res.json(insights);

  } catch (error) {
    console.error('Error generating journal insights:', error);
    res.status(500).json({ error: 'Failed to generate journal insights' });
  }
});

// Helper function to calculate journal statistics
const calculateJournalStats = (entries) => {
  if (entries.length === 0) return {};

  const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
  const moods = entries.map(entry => entry.mood);
  const moodCounts = {};
  
  moods.forEach(mood => {
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  const mostFrequentMood = Object.entries(moodCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  return {
    totalEntries: entries.length,
    totalWords,
    averageWordsPerEntry: Math.round(totalWords / entries.length),
    mostFrequentMood,
    moodDistribution: moodCounts,
    writingStreak: calculateWritingStreak(entries)
  };
};

// Calculate consecutive days of writing
const calculateWritingStreak = (entries) => {
  if (entries.length === 0) return 0;

  const dates = [...new Set(entries.map(entry => 
    new Date(entry.timestamp).toDateString()
  ))].sort();

  let streak = 1;
  const today = new Date().toDateString();
  
  for (let i = dates.length - 1; i > 0; i--) {
    const current = new Date(dates[i]);
    const previous = new Date(dates[i - 1]);
    const diffDays = (current - previous) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// Generate personalized insights from journal entries
const generateJournalInsights = (entries) => {
  const stats = calculateJournalStats(entries);
  const recentEntries = entries.slice(-7); // Last 7 entries
  
  const insights = [];

  // Writing consistency insight
  if (stats.writingStreak > 1) {
    insights.push({
      type: 'consistency',
      title: 'Writing Streak',
      message: `You've been journaling for ${stats.writingStreak} consecutive days! Consistency in self-reflection is a powerful practice.`
    });
  }

  // Mood pattern insight
  if (stats.mostFrequentMood) {
    insights.push({
      type: 'mood_pattern',
      title: 'Emotional Patterns',
      message: `Your entries often reflect feeling ${stats.mostFrequentMood}. ${getMoodInsight({ mood: stats.mostFrequentMood })}`
    });
  }

  // Word count insight
  if (stats.averageWordsPerEntry) {
    insights.push({
      type: 'expression',
      title: 'Expression Depth',
      message: stats.averageWordsPerEntry > 100 
        ? 'You tend to write detailed entries, which suggests deep self-reflection.'
        : 'Your entries are concise. Sometimes brevity captures feelings perfectly.'
    });
  }

  return {
    insights,
    stats,
    suggestions: [
      'Notice patterns in your emotional themes',
      'Celebrate your commitment to self-reflection',
      'Use different prompts to explore new aspects of yourself',
      'Review past entries to see your growth over time'
    ]
  };
};

// Generate encouraging message based on entry
const generateEncouragement = (entry) => {
  const encouragements = [
    "Thank you for taking time to reflect and share your thoughts.",
    "Writing about your feelings takes courage. You're doing great.",
    "Every word you write is a step toward understanding yourself better.",
    "Your thoughts and feelings matter. Thank you for expressing them.",
    "Journaling is a gift you give to your future self."
  ];

  if (entry.sentiment.score > 2) {
    return "It's wonderful to read about positive moments in your life. Savor these feelings!";
  } else if (entry.sentiment.score < -2) {
    return "Thank you for sharing these difficult feelings. You're not alone, and it's brave to express what's hard.";
  }

  return encouragements[Math.floor(Math.random() * encouragements.length)];
};

module.exports = router;