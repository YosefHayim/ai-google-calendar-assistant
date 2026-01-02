'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Mic, Send, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAllySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAllySidebar: React.FC<AIAllySidebarProps> = ({ isOpen, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: number; text: string; isUser: boolean }>>([
    { id: 1, text: "Hello! I'm your AI Ally. How can I help you today?", isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { id: messages.length + 1, text: inputText, isUser: true }]);
    setInputText('');
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: "I understand. Let me help you with that!", isUser: false },
      ]);
    }, 1000);
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real implementation, this would start/stop audio recording
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed right-0 top-0 h-full z-50 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl ${
          isMinimized ? 'w-20' : 'w-96'
        } flex flex-col transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          {!isMinimized && (
            <div className="flex items-center gap-3">
              {/* 2D AI Ally Avatar */}
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                <div className="relative w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">AI Ally</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Your assistant</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.isUser
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              {/* Audio Input Button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={handleToggleRecording}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>

              {/* Text Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="p-2 rounded-md bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Minimized View */}
        {isMinimized && (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-2">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
              <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-primary" />
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">AI Ally</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAllySidebar;
