# Sanjeevani - Mental Health Companion Chatbot 🌿

A compassionate, empathetic mental health chatbot that provides emotional support, journaling prompts, mood tracking, and crisis assistance without clinical advice.

## Features ✨

- **Empathetic Conversations**: Non-judgmental, supportive chat interface
- **Mood Check-ins**: Regular mood tracking with emotional insights
- **Journaling Prompts**: Guided self-reflection exercises
- **Daily Affirmations**: Rotating positive messages for mental wellness
- **Crisis Detection**: Immediate helpline resources for crisis situations
- **Privacy-First**: Anonymous sessions with temporary data storage
- **Breathing Exercises**: Guided calming techniques

## Tech Stack 🛠️

### Frontend
- **React.js** - Modern, responsive user interface
- **Tailwind CSS** - Utility-first styling with calming colors
- **Framer Motion** - Smooth animations and transitions

### Backend
- **Node.js + Express** - RESTful API server
- **Redis** - Temporary data storage with TTL for privacy
- **OpenAI API** - AI-powered conversational responses
- **Content Moderation** - Automatic harmful content detection

### Additional Services
- **Sentiment Analysis** - Emotion detection from user messages
- **Crisis Detection** - Rule-based safety keyword monitoring

## Quick Start 🚀

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**:
   ```bash
   # Copy and configure environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. **Start development servers**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Environment Setup 🔧

### Server (.env)
```
OPENAI_API_KEY=your_openai_api_key
REDIS_URL=your_redis_connection_string
PORT=5000
NODE_ENV=development
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## Privacy & Safety 🔒

- **Anonymous Sessions**: No user registration required
- **Temporary Storage**: All data auto-deletes after 1 hour
- **Crisis Resources**: Immediate helpline information for emergencies
- **Content Moderation**: Automatic filtering of harmful content
- **No Medical Advice**: Strictly emotional support, not clinical treatment

## Crisis Resources 🆘

If you're experiencing a mental health crisis:

- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

## Contributing 🤝

We welcome contributions that improve mental health support while maintaining privacy and safety standards.

## License 📄

MIT License - See LICENSE file for details.

---

*Sanjeevani means "life-giving" in Sanskrit. This chatbot aims to provide emotional nourishment and support for mental wellness.*