import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import MoodPage from './pages/MoodPage';
import JournalPage from './pages/JournalPage';
import AffirmationsPage from './pages/AffirmationsPage';
import { healthAPI } from './services/api';

function App() {
  // Check API connection on app start
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await healthAPI.check();
        console.log('✅ Connected to Sanjeevani API');
      } catch (error) {
        console.error('❌ Failed to connect to API:', error);
      }
    };

    checkConnection();
  }, []);

  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/mood" element={<MoodPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/affirmations" element={<AffirmationsPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
