const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Extended emotion keywords for better detection
const emotionKeywords = {
  happy: ['happy', 'joy', 'excited', 'elated', 'cheerful', 'glad', 'pleased', 'content', 'delighted', 'thrilled'],
  sad: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'sorrowful', 'dejected', 'gloomy', 'despondent'],
  anxious: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'apprehensive', 'fearful', 'uneasy', 'panicked'],
  angry: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'livid', 'enraged', 'upset'],
  neutral: ['okay', 'fine', 'alright', 'normal', 'average', 'neither', 'indifferent'],
  excited: ['excited', 'enthusiastic', 'energetic', 'pumped', 'thrilled', 'eager', 'passionate'],
  calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'composed', 'centered'],
  lonely: ['lonely', 'isolated', 'alone', 'disconnected', 'abandoned', 'solitary'],
  grateful: ['grateful', 'thankful', 'appreciative', 'blessed', 'fortunate'],
  confused: ['confused', 'lost', 'uncertain', 'puzzled', 'bewildered', 'unclear']
};

const analyzeSentiment = (text) => {
  const analysis = sentiment.analyze(text);
  const lowerText = text.toLowerCase();
  
  // Detect specific emotions
  const detectedEmotions = [];
  
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    const matches = keywords.filter(keyword => lowerText.includes(keyword));
    if (matches.length > 0) {
      detectedEmotions.push({
        emotion,
        confidence: matches.length / keywords.length,
        matches
      });
    }
  });

  // Sort by confidence
  detectedEmotions.sort((a, b) => b.confidence - a.confidence);

  // Determine overall mood based on sentiment score and detected emotions
  let mood = 'neutral';
  if (detectedEmotions.length > 0) {
    mood = detectedEmotions[0].emotion;
  } else if (analysis.score > 2) {
    mood = 'positive';
  } else if (analysis.score < -2) {
    mood = 'negative';
  }

  return {
    score: analysis.score,
    comparative: analysis.comparative,
    mood,
    emotions: detectedEmotions.slice(0, 3), // Top 3 emotions
    positive: analysis.positive,
    negative: analysis.negative,
    timestamp: new Date().toISOString()
  };
};

const getMoodInsight = (moodData) => {
  const { mood, score } = moodData;
  
  const insights = {
    happy: "It's wonderful that you're feeling positive! Remember to savor these good moments.",
    sad: "It's okay to feel sad sometimes. Your emotions are valid, and this feeling will pass.",
    anxious: "I notice you might be feeling anxious. Would you like to try a breathing exercise?",
    angry: "Feeling angry is natural. Let's find a healthy way to process these feelings.",
    lonely: "Feeling lonely can be difficult. Remember that reaching out, even to me, is a brave step.",
    excited: "Your excitement is beautiful! It's great to see you feeling energized.",
    calm: "It sounds like you're in a peaceful space. That's wonderful for your well-being.",
    grateful: "Gratitude is a powerful emotion. It's lovely that you're feeling appreciative.",
    confused: "Feeling uncertain is part of being human. Let's explore what might help clarify things.",
    neutral: "It's perfectly okay to feel neutral. Not every moment needs to be intense."
  };

  return insights[mood] || "I'm here to listen to whatever you're feeling right now.";
};

const trackMoodTrend = (moodHistory) => {
  if (!moodHistory || moodHistory.length < 2) {
    return { trend: 'insufficient_data', message: 'Keep tracking to see your mood patterns.' };
  }

  const recentMoods = moodHistory.slice(-5); // Last 5 entries
  const scores = recentMoods.map(entry => entry.score);
  
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const trend = avgScore > 0 ? 'improving' : avgScore < 0 ? 'concerning' : 'stable';
  
  const messages = {
    improving: "Your mood seems to be trending upward lately. That's encouraging!",
    stable: "Your mood has been relatively stable. Consistency can be a sign of balance.",
    concerning: "I notice your mood might be trending downward. Remember, I'm here for support."
  };

  return {
    trend,
    averageScore: avgScore,
    message: messages[trend],
    dataPoints: scores.length
  };
};

module.exports = {
  analyzeSentiment,
  getMoodInsight,
  trackMoodTrend,
  emotionKeywords
};