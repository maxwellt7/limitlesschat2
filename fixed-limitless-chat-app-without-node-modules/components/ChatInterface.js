// components/ChatInterface.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function ChatInterface({ apiKeys, selectedDate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState(apiKeys.openai ? 'openai' : 'anthropic');
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message to API
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Prepare headers with API keys
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (apiKeys.limitless) {
        headers['x-limitless-api-key'] = apiKeys.limitless;
      }
      
      if (model === 'openai' && apiKeys.openai) {
        headers['x-openai-api-key'] = apiKeys.openai;
      } else if (model === 'anthropic' && apiKeys.anthropic) {
        headers['x-anthropic-api-key'] = apiKeys.anthropic;
      }
      
      // Send request to chat API
      const response = await axios.post('/api/chat', {
        message: input,
        chatHistory: messages,
        date: selectedDate,
        model,
      }, { headers });
      
      // Add assistant response to chat
      if (response.data && response.data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle model change
  const handleModelChange = (e) => {
    setModel(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Chat with Your Data</h2>
          <div>
            <select
              value={model}
              onChange={handleModelChange}
              className="p-2 border rounded text-sm"
              disabled={isLoading}
            >
              {apiKeys.openai && <option value="openai">OpenAI GPT-4</option>}
              {apiKeys.anthropic && <option value="anthropic">Anthropic Claude</option>}
            </select>
          </div>
        </div>
        {selectedDate && (
          <p className="text-sm text-gray-500 mt-1">
            Using data from: {selectedDate}
          </p>
        )}
      </div>
      
      <div className="h-96 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="mb-2">Start a conversation with your Limitless data</p>
              <p className="text-sm">Try asking about your day, meetings, or conversations</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <ReactMarkdown className="prose prose-sm">
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-left mb-4">
            <div className="inline-block max-w-xs sm:max-w-md px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex">
          <textarea
            className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask a question about your data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            rows={2}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition disabled:bg-blue-300"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
