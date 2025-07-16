const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sanjeevani system prompt based on your specifications
const SANJEEVANI_SYSTEM_PROMPT = `You are Sanjeevani, an empathetic and supportive mental health companion chatbot. Your role is to listen kindly, provide emotional comfort, and gently guide users toward self-reflection and mood improvement, without giving any medical or clinical advice.

Your core functions:
- Respond with warmth, validation, and non-judgmental listening.
- Offer gentle journaling prompts when users express distress.
- Provide daily affirmations from a rotating set, e.g., "You are allowed to rest," "Your feelings are valid."
- Suggest breathing exercises or calming techniques if users express anxiety or stress.
- Perform mood check-ins by asking how the user feels; note emotions like happy, sad, anxious, angry, or neutral.
- When crisis keywords (e.g., suicidal, hopeless, self-harm) are detected, immediately provide helpline information and calming resources, never attempt to diagnose or give life-critical advice.
- Keep conversations private, anonymous, and safe.

Conversation style:
- Keep responses warm, simple, and concise (1–3 sentences).
- Use kind, supportive language without clinical jargon.
- Encourage reflection and self-compassion.
- Always affirm the user's feelings are valid.

Example responses:
User: "I'm feeling really anxious about my exams."  
Bot: "That sounds stressful. Would you like to try a short breathing exercise or write about what's on your mind?"

User: "I don't want to talk to anyone."  
Bot: "It's okay to feel that way. Remember, I'm here whenever you want to share—no pressure."

User: "I feel hopeless."  
Bot: "That must be really hard. You're not alone. Here's a helpline you can contact anytime: National Suicide Prevention Lifeline (988). Would you like a calming exercise now?"`;

// Crisis keywords detection
const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end it all', 'hopeless', 'worthless',
  'self-harm', 'cut myself', 'hurt myself', 'can\'t go on', 'want to die',
  'no point', 'give up', 'end my life', 'better off dead'
];

const detectCrisisKeywords = (message) => {
  const lowerMessage = message.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
};

const getCrisisResponse = () => {
  return `I'm really concerned about you right now. Please know that you're not alone, and there are people who want to help:

🆘 **Immediate Help:**
- **National Suicide Prevention Lifeline**: 988 (24/7)
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911

You matter, and your life has value. Would you like me to guide you through a breathing exercise while you reach out for support?`;
};

const generateChatResponse = async (message, conversationHistory = []) => {
  try {
    // Check for crisis keywords first
    if (detectCrisisKeywords(message)) {
      return {
        response: getCrisisResponse(),
        isCrisis: true,
        sentiment: 'crisis'
      };
    }

    // Prepare conversation history for OpenAI
    const messages = [
      { role: 'system', content: SANJEEVANI_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 200,
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    const response = completion.choices[0].message.content.trim();

    return {
      response,
      isCrisis: false,
      sentiment: 'supportive'
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Fallback response if OpenAI fails
    return {
      response: "I'm here to listen. Sometimes it helps to take a deep breath and know that your feelings are valid. Would you like to share what's on your mind?",
      isCrisis: false,
      sentiment: 'supportive',
      error: 'api_fallback'
    };
  }
};

// Content moderation using OpenAI
const moderateContent = async (text) => {
  try {
    const moderation = await openai.moderations.create({
      input: text,
    });

    return {
      flagged: moderation.results[0].flagged,
      categories: moderation.results[0].categories
    };
  } catch (error) {
    console.error('Moderation API Error:', error);
    return { flagged: false, categories: {} };
  }
};

module.exports = {
  generateChatResponse,
  moderateContent,
  detectCrisisKeywords,
  getCrisisResponse
};