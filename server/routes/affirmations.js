const express = require('express');
const { getSessionData, setSessionData } = require('../utils/redis');

const router = express.Router();

// Comprehensive affirmations categorized by mood and need
const AFFIRMATIONS = {
  general: [
    "You are enough, exactly as you are.",
    "Your feelings are valid and deserve acknowledgment.",
    "You are allowed to rest and take breaks.",
    "Progress, not perfection, is what matters.",
    "You have survived difficult times before, and you can do it again.",
    "Your presence in this world makes a difference.",
    "It's okay to not have all the answers right now.",
    "You are worthy of love and kindness, especially from yourself.",
    "Every small step forward is still progress.",
    "You are stronger than you know and braver than you feel."
  ],
  anxious: [
    "This feeling is temporary and will pass.",
    "You are safe in this moment.",
    "You have overcome anxiety before, and you can do it again.",
    "Your breath is an anchor that brings you back to the present.",
    "You don't need to be perfect to be worthy of peace.",
    "Uncertainty is uncomfortable, but it doesn't mean danger.",
    "You have the strength to handle whatever comes your way.",
    "It's okay to take things one moment at a time.",
    "Your anxiety doesn't define you or your capabilities.",
    "You are learning to trust yourself more each day."
  ],
  sad: [
    "It's okay to feel sad; your emotions are telling you something important.",
    "This sadness will not last forever, even though it feels heavy now.",
    "You are not alone in your pain.",
    "Healing is not linear, and that's perfectly normal.",
    "Your tears are not a sign of weakness, but of your humanity.",
    "You deserve comfort and compassion during difficult times.",
    "Even in sadness, there is strength in your vulnerability.",
    "You have weathered storms before and found light again.",
    "Your heart's capacity to feel deeply is also its capacity to love deeply.",
    "Tomorrow may bring a different perspective, and that's okay."
  ],
  angry: [
    "Your anger is information about what matters to you.",
    "You can feel angry and still choose how to respond.",
    "It's okay to set boundaries to protect your peace.",
    "Your feelings are valid, even when they're intense.",
    "You have the power to transform this energy constructively.",
    "You don't have to carry anger that doesn't serve you.",
    "You can advocate for yourself with both strength and compassion.",
    "Your worth isn't determined by others' actions or words.",
    "You can choose to respond rather than react.",
    "You are learning to honor your feelings while staying true to your values."
  ],
  lonely: [
    "You are worthy of connection and belonging.",
    "Being alone doesn't mean you are unwanted or unloved.",
    "You can be your own good company.",
    "Reaching out is a sign of strength, not weakness.",
    "You have value even when you feel disconnected from others.",
    "Your loneliness is temporary; connection is always possible.",
    "You deserve relationships that celebrate who you are.",
    "You are never as alone as you feel in this moment.",
    "Your presence matters to more people than you realize.",
    "You can create meaningful connections, starting with small steps."
  ],
  stressed: [
    "You can only do what you can do, and that's enough.",
    "You don't have to carry everything at once.",
    "It's okay to prioritize your well-being over productivity.",
    "You are capable of handling challenges one step at a time.",
    "Stress is temporary; your resilience is lasting.",
    "You have permission to say no to protect your energy.",
    "You are doing the best you can with what you have right now.",
    "Rest is productive and necessary, not selfish.",
    "You can ask for help when you need it.",
    "Your worth isn't measured by how much you accomplish."
  ],
  happy: [
    "You deserve all the joy you're experiencing right now.",
    "Your happiness is not selfish; it's a gift to the world.",
    "You have the power to create more moments like this.",
    "Joy multiplies when you acknowledge and appreciate it.",
    "You are allowed to feel good even when life isn't perfect.",
    "Your positive energy makes a difference to those around you.",
    "You can hold onto this feeling and return to it when needed.",
    "Happiness is your natural state; you're simply remembering who you are.",
    "You create beauty in the world just by being yourself.",
    "This joy is evidence of your resilience and capacity for growth."
  ],
  grateful: [
    "Gratitude is a strength that connects you to abundance.",
    "You have the ability to find light even in difficult situations.",
    "Your appreciation for life's gifts multiplies their power.",
    "Gratitude transforms what you have into enough.",
    "You notice beauty and goodness because you carry it within you.",
    "Your grateful heart is a source of joy for others.",
    "You can hold both gratitude and other emotions simultaneously.",
    "Appreciation is a practice that enriches every moment.",
    "You see the good in life because you choose to look for it.",
    "Your gratitude creates ripples of positivity around you."
  ],
  confident: [
    "You trust your inner wisdom and judgment.",
    "You are capable of learning and growing from any experience.",
    "Your unique perspective brings value to every situation.",
    "You have overcome challenges before and emerged stronger.",
    "You deserve to take up space and share your voice.",
    "Your confidence inspires others to believe in themselves too.",
    "You can handle uncertainty with grace and resilience.",
    "You are becoming more authentically yourself every day.",
    "Your dreams and goals are worthy of pursuit.",
    "You have everything within you to succeed in your own way."
  ]
};

// Breathing exercises and calming techniques
const CALMING_EXERCISES = [
  {
    name: "4-7-8 Breathing",
    description: "Breathe in for 4 counts, hold for 7 counts, exhale for 8 counts.",
    instructions: "1. Inhale through your nose for 4 seconds\n2. Hold your breath for 7 seconds\n3. Exhale through your mouth for 8 seconds\n4. Repeat 3-4 times",
    duration: "2-3 minutes"
  },
  {
    name: "5-4-3-2-1 Grounding",
    description: "Use your senses to ground yourself in the present moment.",
    instructions: "Notice:\n• 5 things you can see\n• 4 things you can touch\n• 3 things you can hear\n• 2 things you can smell\n• 1 thing you can taste",
    duration: "3-5 minutes"
  },
  {
    name: "Progressive Muscle Relaxation",
    description: "Tense and release muscle groups to reduce physical tension.",
    instructions: "1. Start with your toes, tense for 5 seconds\n2. Release and notice the relaxation\n3. Move up through each muscle group\n4. End with your face and scalp",
    duration: "10-15 minutes"
  },
  {
    name: "Box Breathing",
    description: "Equal counts for inhaling, holding, exhaling, and holding.",
    instructions: "1. Inhale for 4 counts\n2. Hold for 4 counts\n3. Exhale for 4 counts\n4. Hold empty for 4 counts\n5. Repeat",
    duration: "5-10 minutes"
  }
];

// Get daily affirmation
router.get('/daily', async (req, res) => {
  try {
    const { sessionId, mood } = req.query;
    
    let affirmations = AFFIRMATIONS.general;
    let category = 'general';

    // Get mood-specific affirmations if mood is provided
    if (mood && AFFIRMATIONS[mood]) {
      affirmations = AFFIRMATIONS[mood];
      category = mood;
    } else if (sessionId) {
      // Try to get recent mood from session data
      const moodHistory = await getSessionData(sessionId, 'mood_history') || [];
      const recentMood = moodHistory[moodHistory.length - 1];
      
      if (recentMood && AFFIRMATIONS[recentMood.mood]) {
        affirmations = AFFIRMATIONS[recentMood.mood];
        category = recentMood.mood;
      }
    }

    // Get today's affirmation (consistent for the day)
    const today = new Date().toDateString();
    const seedValue = today + category; // Make it consistent per day per category
    const index = seedValue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % affirmations.length;
    
    const dailyAffirmation = affirmations[index];

    // Track affirmation views if session provided
    if (sessionId) {
      let affirmationHistory = await getSessionData(sessionId, 'affirmation_history') || [];
      
      const viewEntry = {
        affirmation: dailyAffirmation,
        category,
        date: today,
        timestamp: new Date().toISOString()
      };

      // Only add if not already viewed today
      const alreadyViewedToday = affirmationHistory.some(entry => 
        entry.date === today && entry.category === category
      );

      if (!alreadyViewedToday) {
        affirmationHistory.push(viewEntry);
        
        // Keep only last 30 days
        if (affirmationHistory.length > 30) {
          affirmationHistory = affirmationHistory.slice(-30);
        }
        
        await setSessionData(sessionId, 'affirmation_history', affirmationHistory);
      }
    }

    res.json({
      affirmation: dailyAffirmation,
      category,
      date: today,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching daily affirmation:', error);
    res.status(500).json({ error: 'Failed to fetch daily affirmation' });
  }
});

// Get random affirmation
router.get('/random', async (req, res) => {
  try {
    const { mood } = req.query;
    
    let affirmations = AFFIRMATIONS.general;
    let category = 'general';

    if (mood && AFFIRMATIONS[mood]) {
      affirmations = AFFIRMATIONS[mood];
      category = mood;
    }

    const randomIndex = Math.floor(Math.random() * affirmations.length);
    const randomAffirmation = affirmations[randomIndex];

    res.json({
      affirmation: randomAffirmation,
      category,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching random affirmation:', error);
    res.status(500).json({ error: 'Failed to fetch random affirmation' });
  }
});

// Get calming exercise
router.get('/exercise', async (req, res) => {
  try {
    const { type } = req.query;
    
    let exercise;
    
    if (type === 'breathing') {
      const breathingExercises = CALMING_EXERCISES.filter(ex => 
        ex.name.toLowerCase().includes('breathing')
      );
      exercise = breathingExercises[Math.floor(Math.random() * breathingExercises.length)];
    } else if (type === 'grounding') {
      exercise = CALMING_EXERCISES.find(ex => ex.name.includes('Grounding'));
    } else {
      // Random exercise
      exercise = CALMING_EXERCISES[Math.floor(Math.random() * CALMING_EXERCISES.length)];
    }

    res.json({
      exercise,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching calming exercise:', error);
    res.status(500).json({ error: 'Failed to fetch calming exercise' });
  }
});

// Get all available affirmation categories
router.get('/categories', (req, res) => {
  try {
    const categories = Object.keys(AFFIRMATIONS).map(category => ({
      name: category,
      count: AFFIRMATIONS[category].length,
      description: getCategoryDescription(category)
    }));

    res.json({
      categories,
      totalAffirmations: Object.values(AFFIRMATIONS).flat().length
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch affirmation categories' });
  }
});

// Get affirmation history for a session
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { days = 7 } = req.query;

    const affirmationHistory = await getSessionData(sessionId, 'affirmation_history') || [];
    
    // Filter by days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const filteredHistory = affirmationHistory.filter(entry => 
      new Date(entry.timestamp) >= cutoffDate
    );

    res.json({
      history: filteredHistory,
      totalViewed: affirmationHistory.length,
      period: `${days} days`,
      stats: calculateAffirmationStats(filteredHistory)
    });

  } catch (error) {
    console.error('Error fetching affirmation history:', error);
    res.status(500).json({ error: 'Failed to fetch affirmation history' });
  }
});

// Helper function to get category descriptions
const getCategoryDescription = (category) => {
  const descriptions = {
    general: 'Universal affirmations for daily support and encouragement',
    anxious: 'Calming affirmations for managing anxiety and worry',
    sad: 'Comforting affirmations for processing sadness and grief',
    angry: 'Grounding affirmations for managing anger and frustration',
    lonely: 'Connecting affirmations for feelings of isolation',
    stressed: 'Relaxing affirmations for managing stress and overwhelm',
    happy: 'Celebrating affirmations for amplifying joy and positivity',
    grateful: 'Appreciative affirmations for cultivating gratitude',
    confident: 'Empowering affirmations for building self-confidence'
  };

  return descriptions[category] || 'Supportive affirmations for personal growth';
};

// Calculate affirmation viewing statistics
const calculateAffirmationStats = (history) => {
  if (history.length === 0) return {};

  const categoryCounts = {};
  const uniqueDays = new Set();

  history.forEach(entry => {
    categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
    uniqueDays.add(entry.date);
  });

  const mostViewedCategory = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  return {
    totalViews: history.length,
    uniqueDays: uniqueDays.size,
    mostViewedCategory,
    categoryDistribution: categoryCounts,
    consistency: uniqueDays.size > 3 ? 'good' : uniqueDays.size > 1 ? 'moderate' : 'low'
  };
};

module.exports = router;