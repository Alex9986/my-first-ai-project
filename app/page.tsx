"use client"

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Home: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI assistant. How can I help you today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const askTheAI = async () => {
    if (inputMessage.trim() === '') return;

    try {
      setIsButtonDisabled(true);

      // Add user message to conversation
      const userMessage: Message = {
        role: 'user',
        content: inputMessage
      };
      
      // Create updated messages array with new user message
      const updatedMessages = [...messages, userMessage];
      
      // Update UI immediately with user message
      setMessages(updatedMessages);
      setInputMessage('');

      // Send the entire conversation history to the API
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();

      // Add AI response to conversation
      const aiMessage: Message = {
        role: 'assistant',
        content: data.response
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error making the API call:', error);
      // Add error message to conversation
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askTheAI();
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I am your AI assistant. How can I help you today?'
      }
    ]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="max-w-2xl w-full mx-auto p-4 md:p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Chat Assistant</h1>
          <p className="text-gray-600">Ask anything and get AI-powered responses with memory</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex justify-between items-center">
            <h2 className="text-white font-semibold text-lg">Conversation</h2>
            {messages.length > 1 && (
              <button
                onClick={clearConversation}
                className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                Clear Chat
              </button>
            )}
          </div>
          
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <div className={`w-2 h-2 rounded-full mr-2 ${message.role === 'user' ? 'bg-blue-200' : 'bg-gray-400'}`} />
                    <span className="text-xs font-semibold">
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
          <div className="relative">
            <textarea
              className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none text-gray-800 placeholder-gray-500"
              rows={4}
              placeholder="Type your message here..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            ></textarea>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                {inputMessage.length > 0 && `${inputMessage.length} characters`}
                {messages.length > 1 && ` • ${messages.length} messages`}
              </div>
              
              <button
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
                onClick={askTheAI}
                disabled={isButtonDisabled || inputMessage.trim() === ''}
              >
                {isButtonDisabled ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Ask the AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Press Enter to send, Shift+Enter for new line</p>
          <p className="mt-1">The AI now remembers our conversation history!</p>
        </div>
      </div>
    </div>
  );
};

export default Home;