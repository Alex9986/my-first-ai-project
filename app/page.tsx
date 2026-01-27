 "use client"

 import React, { useState, useRef, useEffect } from 'react';

 const Home: React.FC = () => {
   const [messageHistory, setMessageHistory] = useState<string[]>([]);
   const [inputMessage, setInputMessage] = useState<string>('');
   const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
   const messagesEndRef = useRef<HTMLDivElement>(null);

   const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

   useEffect(() => {
    scrollToBottom();
   }, [messageHistory]);
 
   const askTheAI = async () => {
     if (inputMessage.trim() === '') return;
 
     try {
       setIsButtonDisabled(true);
 
       const response = await fetch('/api/openai', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ query: inputMessage }),
       });
 
       if (!response.ok) {
         throw new Error('Request failed');
       }
 
       const data = await response.json();
 
       setMessageHistory((prevHistory) => [
         ...prevHistory,
         `User: ${inputMessage}`,
         `Assistant: ${data.response}`,
       ]);
 
       setInputMessage('');
     } catch (error) {
       console.error('Error making the API call:', error);
     } finally {
       setIsButtonDisabled(false);
     }
   };
 
   return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="max-w-2xl w-full mx-auto p-4 md:p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Chat Assistant</h1>
          <p className="text-gray-600">Ask anything and get AI-powered responses</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
            <h2 className="text-white font-semibold text-lg">Conversation</h2>
          </div>
          
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messageHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-lg">No messages yet</p>
                <p className="text-sm">Start a conversation by typing below</p>
              </div>
            ) : (
              <>
                {messageHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        index % 2 === 0 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <div className={`w-2 h-2 rounded-full mr-2 ${index % 2 === 0 ? 'bg-blue-200' : 'bg-gray-400'}`} />
                        <span className="text-xs font-semibold">
                          {index % 2 === 0 ? 'You' : 'Assistant'}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{message.split(': ')[1] || message}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
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
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && askTheAI()}
            ></textarea>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                {inputMessage.length > 0 && `${inputMessage.length} characters`}
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
        </div>
      </div>
    </div>
  );
 };
 
 export default Home;
 

 
