import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleBottomCenterTextIcon,
  HeartIcon,
  PencilSquareIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '../contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { state } = useApp();

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Chat', href: '/chat', icon: ChatBubbleBottomCenterTextIcon },
    { name: 'Mood', href: '/mood', icon: HeartIcon },
    { name: 'Journal', href: '/journal', icon: PencilSquareIcon },
    { name: 'Affirmations', href: '/affirmations', icon: SparklesIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="fixed inset-0 bg-black/25" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-sage-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🌿</span>
                  </div>
                  <span className="text-xl font-serif font-semibold text-earth-800">Sanjeevani</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-earth-600 hover:text-earth-800"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="px-6 py-4">
                <ul className="space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                          isActive(item.href)
                            ? 'bg-sage-100 text-sage-700 font-medium'
                            : 'text-earth-600 hover:bg-sage-50 hover:text-sage-700'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Session info */}
              {state.session && (
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-sage-100">
                  <div className="text-sm text-earth-600">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${state.isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span>{state.isConnected ? 'Connected' : 'Offline'}</span>
                    </div>
                    <div className="mt-1 text-xs text-earth-500">
                      Session: {state.session.sessionId.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-sage-100 px-6 py-8">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sage-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌿</span>
            </div>
            <div>
              <h1 className="text-2xl font-serif font-semibold text-earth-800">Sanjeevani</h1>
              <p className="text-sm text-earth-600">Your wellness companion</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-sage-100 text-sage-700'
                        : 'text-earth-700 hover:text-sage-700 hover:bg-sage-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Session info */}
            {state.session && (
              <div className="mt-auto pt-6 border-t border-sage-100">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-sage-50">
                  <div className={`w-3 h-3 rounded-full ${state.isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div className="text-sm">
                    <div className="text-earth-700 font-medium">
                      {state.isConnected ? 'Connected' : 'Offline'}
                    </div>
                    <div className="text-earth-500 text-xs">
                      Session: {state.session.sessionId.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-sage-100 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-earth-700 lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="flex flex-1 items-center space-x-3">
          <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🌿</span>
          </div>
          <span className="text-lg font-serif font-semibold text-earth-800">Sanjeevani</span>
        </div>

        {state.session && (
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${state.isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="lg:pl-72">
        <div className="h-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;