const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { generateChatResponse, moderateContent } = require('../utils/openai');
const { analyzeSentiment } = require('../utils/sentiment');
const { setSessionData, getSessionData, extendSessionTTL } = require('../utils/redis');

const router = express.Router();

// Start new conversation session
router.post('/start', async (req, res) => {
  try {
    const sessionId = uuidv4();
    
    // Initialize session data
    const initialData = {
      createdAt: new Date().toISOString(),
      messageCount: 0,
      conversationHistory: []
    };
    
    await setSessionData(sessionId, 'conversation', initialData);
    
    res.json({
      sessionId,
      message: "Hi, I'm Sanjeevani—a quiet, kind space to share whatever's on your mind. How are you feeling today?",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// Send message to chatbot
router.post('/message', [
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('sessionId').isUUID().withMessage('Valid session ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, sessionId } = req.body;

    // Content moderation
    const moderation = await moderateContent(message);
    if (moderation.flagged) {
      return res.status(400).json({ 
        error: 'Message contains inappropriate content',
        categories: moderation.categories 
      });
    }

    // Get session data
    let sessionData = await getSessionData(sessionId, 'conversation');
    if (!sessionData) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    // Analyze sentiment
    const sentimentData = analyzeSentiment(message);

    // Prepare conversation history (keep last 10 messages for context)
    const conversationHistory = sessionData.conversationHistory || [];
    const recentHistory = conversationHistory.slice(-10);

    // Generate response
    const chatResponse = await generateChatResponse(message, recentHistory);

    // Update conversation history
    const updatedHistory = [
      ...recentHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString(), sentiment: sentimentData },
      { role: 'assistant', content: chatResponse.response, timestamp: new Date().toISOString() }
    ];

    // Update session data
    const updatedSessionData = {
      ...sessionData,
      messageCount: sessionData.messageCount + 1,
      conversationHistory: updatedHistory,
      lastActivity: new Date().toISOString()
    };

    await setSessionData(sessionId, 'conversation', updatedSessionData);
    
    // Extend session TTL
    await extendSessionTTL(sessionId, 'conversation');

    // Save mood data if sentiment analysis detected strong emotions
    if (sentimentData.emotions.length > 0) {
      const moodEntry = {
        mood: sentimentData.mood,
        score: sentimentData.score,
        emotions: sentimentData.emotions,
        timestamp: new Date().toISOString(),
        message: message.substring(0, 100) // Store snippet for context
      };

      let moodHistory = await getSessionData(sessionId, 'mood_history') || [];
      moodHistory.push(moodEntry);
      
      // Keep only last 20 mood entries
      if (moodHistory.length > 20) {
        moodHistory = moodHistory.slice(-20);
      }
      
      await setSessionData(sessionId, 'mood_history', moodHistory);
    }

    res.json({
      response: chatResponse.response,
      isCrisis: chatResponse.isCrisis,
      sentiment: sentimentData,
      messageCount: updatedSessionData.messageCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      fallbackResponse: "I'm here to listen. Would you like to share what's on your mind?"
    });
  }
});

// Get conversation history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const sessionData = await getSessionData(sessionId, 'conversation');
    if (!sessionData) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    // Return conversation history without sensitive data
    const history = sessionData.conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      mood: msg.sentiment?.mood
    }));

    res.json({
      history,
      messageCount: sessionData.messageCount,
      createdAt: sessionData.createdAt,
      lastActivity: sessionData.lastActivity
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

// End conversation (optional cleanup)
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Note: In Redis with TTL, we don't need to explicitly delete
    // Data will auto-expire for privacy
    
    res.json({ 
      message: 'Thank you for talking with me. Take care of yourself! 🌿',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

module.exports = router;