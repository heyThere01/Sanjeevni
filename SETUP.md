# Sanjeevani Setup Guide 🌿

This guide will help you set up and run the Sanjeevani mental health chatbot locally.

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Redis** (v6 or higher)
- **OpenAI API Key** (for chatbot functionality)

## Installation Steps

### 1. Clone and Navigate
```bash
cd /path/to/sanjeevani-mental-health-chatbot
```

### 2. Install Dependencies

#### Backend (Server)
```bash
cd server
npm install
```

#### Frontend (Client)
```bash
cd ../client
npm install
```

### 3. Environment Configuration

#### Server Configuration
Create `server/.env`:
```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your values:
```env
OPENAI_API_KEY=your_actual_openai_api_key
REDIS_URL=redis://localhost:6379
PORT=5000
NODE_ENV=development
SESSION_TTL=3600
CORS_ORIGIN=http://localhost:3000
```

#### Client Configuration
Create `client/.env`:
```bash
cp client/.env.example client/.env
```

The client `.env` should contain:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Start Redis Server

#### Ubuntu/Debian:
```bash
sudo systemctl start redis-server
# or
redis-server
```

#### macOS (with Homebrew):
```bash
brew services start redis
# or
redis-server
```

#### Docker:
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 5. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new secret key
5. Add it to your `server/.env` file

## Running the Application

### Option 1: Run Both Services (Recommended)
From the project root:
```bash
npm run dev
```

This starts both the server (port 5000) and client (port 3000) simultaneously.

### Option 2: Run Services Separately

#### Terminal 1 - Start Backend:
```bash
cd server
npm run dev
```

#### Terminal 2 - Start Frontend:
```bash
cd client
npm start
```

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Features Available

### 🏠 Home Page
- Welcome message with time-based greetings
- Daily affirmation display
- Quick access to all features
- Session management

### 💬 Chat Interface (Placeholder)
- Will include empathetic AI conversations
- Crisis detection and support resources
- Sentiment analysis of messages
- Conversation history

### ❤️ Mood Tracking (Placeholder)
- Daily mood check-ins
- Emotional pattern analysis
- Mood insights and trends
- Visual mood history

### 📝 Journaling (Placeholder)
- Guided writing prompts
- Sentiment analysis of entries
- Writing streak tracking
- Personal insights

### ✨ Affirmations (Placeholder)
- Daily personalized affirmations
- Category-based affirmations
- Calming breathing exercises
- Affirmation history

## API Endpoints

### Chat
- `POST /api/chat/start` - Start new conversation
- `POST /api/chat/message` - Send message
- `GET /api/chat/history/:sessionId` - Get conversation history

### Mood Tracking
- `POST /api/mood/checkin` - Record mood
- `GET /api/mood/history/:sessionId` - Get mood history
- `GET /api/mood/insights/:sessionId` - Get mood insights

### Journaling
- `GET /api/journal/prompt` - Get writing prompt
- `POST /api/journal/entry` - Create journal entry
- `GET /api/journal/entries/:sessionId` - Get entries
- `GET /api/journal/insights/:sessionId` - Get writing insights

### Affirmations
- `GET /api/affirmations/daily` - Get daily affirmation
- `GET /api/affirmations/random` - Get random affirmation
- `GET /api/affirmations/exercise` - Get calming exercise

## Tech Stack

### Backend
- **Node.js + Express** - Server framework
- **Redis** - Session and data storage (with TTL for privacy)
- **OpenAI API** - AI-powered conversations
- **Sentiment Analysis** - Emotion detection
- **Content Moderation** - Safety filtering

### Frontend
- **React 18 + TypeScript** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Navigation
- **Heroicons** - Beautiful icons

### Key Features
- **Privacy-First**: Anonymous sessions, auto-expiring data
- **Crisis Detection**: Automatic safety resource provision
- **Responsive Design**: Works on desktop and mobile
- **Empathetic AI**: Carefully crafted prompts for support

## Development

### Adding New Features
1. Backend: Add routes in `server/routes/`
2. Frontend: Add components in `client/src/components/`
3. Update types in `client/src/types/index.ts`
4. Add API calls in `client/src/services/api.ts`

### Project Structure
```
sanjeevani-mental-health-chatbot/
├── server/                 # Backend API
│   ├── routes/            # API endpoints
│   ├── utils/             # Helper functions
│   └── middleware/        # Express middleware
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API service layer
│   │   └── types/         # TypeScript definitions
│   └── public/            # Static assets
└── README.md              # Project documentation
```

## Troubleshooting

### Common Issues

1. **Redis Connection Error**
   - Ensure Redis is running: `redis-cli ping`
   - Check Redis URL in `.env`

2. **OpenAI API Error**
   - Verify API key is correct
   - Check OpenAI account has credits
   - Ensure proper rate limits

3. **CORS Errors**
   - Verify CORS_ORIGIN in server `.env`
   - Check client API_URL in `.env`

4. **Port Already in Use**
   - Change PORT in server `.env`
   - Update client API_URL accordingly

### Health Checks
- Backend: `curl http://localhost:5000/api/health`
- Redis: `redis-cli ping` (should return "PONG")
- Frontend: Visit http://localhost:3000

## Security & Privacy

- **No User Registration**: Completely anonymous
- **Temporary Sessions**: Auto-expire after 1 hour
- **Local Storage Only**: No persistent user data
- **Crisis Safety**: Immediate helpline resources
- **Content Moderation**: Automatic harmful content filtering

## Next Steps

This is a foundational implementation. To complete the full chatbot:

1. **Expand Chat Interface**: Real-time messaging, typing indicators
2. **Complete Mood Tracking**: Visual charts, pattern analysis
3. **Enhance Journaling**: Rich text editor, search capabilities
4. **Add Therapy Booking**: Calendar integration, payment processing
5. **Mobile App**: React Native implementation
6. **Advanced Analytics**: Machine learning insights

## Support

For development questions or issues:
1. Check the troubleshooting section
2. Review API documentation in `README.md`
3. Examine console logs for error details
4. Verify environment configuration

Remember: This is a mental health application. Always prioritize user safety, privacy, and ethical AI practices.

---

*Sanjeevani means "life-giving" in Sanskrit. This application aims to provide emotional support and wellness tools while maintaining the highest standards of privacy and safety.*