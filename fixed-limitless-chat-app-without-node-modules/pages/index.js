// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import ChatInterface from '../components/ChatInterface';
import DailySummary from '../components/DailySummary';
import Header from '../components/Header';

export default function Home() {
  const [apiKeys, setApiKeys] = useState({
    limitless: '',
    openai: '',
    anthropic: '',
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activeTab, setActiveTab] = useState('chat');

  // Check if API keys are stored in localStorage on component mount
  useEffect(() => {
    const storedLimitlessKey = localStorage.getItem('limitlessApiKey');
    const storedOpenAIKey = localStorage.getItem('openaiApiKey');
    const storedAnthropicKey = localStorage.getItem('anthropicApiKey');
    
    if (storedLimitlessKey) {
      setApiKeys(prev => ({ ...prev, limitless: storedLimitlessKey }));
    }
    
    if (storedOpenAIKey) {
      setApiKeys(prev => ({ ...prev, openai: storedOpenAIKey }));
    }
    
    if (storedAnthropicKey) {
      setApiKeys(prev => ({ ...prev, anthropic: storedAnthropicKey }));
    }
    
    setIsConfigured(!!storedLimitlessKey && (!!storedOpenAIKey || !!storedAnthropicKey));
  }, []);

  // Save API keys to localStorage
  const saveApiKeys = () => {
    localStorage.setItem('limitlessApiKey', apiKeys.limitless);
    localStorage.setItem('openaiApiKey', apiKeys.openai);
    localStorage.setItem('anthropicApiKey', apiKeys.anthropic);
    setIsConfigured(true);
  };

  // Handle API key input changes
  const handleApiKeyChange = (key, value) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Limitless Chat App</title>
        <meta name="description" content="Chat with your Limitless pendant data" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="container mx-auto px-4 py-8">
        {!isConfigured ? (
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Setup Your API Keys</h2>
            <p className="mb-4 text-gray-600">
              To use this application, you need to provide your API keys for Limitless and at least one LLM provider.
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="limitlessKey">
                Limitless API Key (Required)
              </label>
              <input
                id="limitlessKey"
                type="password"
                className="w-full p-2 border rounded"
                value={apiKeys.limitless}
                onChange={(e) => handleApiKeyChange('limitless', e.target.value)}
                placeholder="sk-2a4a4d9e-..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="openaiKey">
                OpenAI API Key
              </label>
              <input
                id="openaiKey"
                type="password"
                className="w-full p-2 border rounded"
                value={apiKeys.openai}
                onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                placeholder="sk-proj-W1Jn2wQ7g..."
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="anthropicKey">
                Anthropic API Key
              </label>
              <input
                id="anthropicKey"
                type="password"
                className="w-full p-2 border rounded"
                value={apiKeys.anthropic}
                onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                placeholder="sk-ant-api03-BT8Q2PA..."
              />
            </div>
            
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
              onClick={saveApiKeys}
              disabled={!apiKeys.limitless || (!apiKeys.openai && !apiKeys.anthropic)}
            >
              Save and Continue
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-center">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    activeTab === 'chat'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('chat')}
                >
                  Chat
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'daily'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('daily')}
                >
                  Daily Summary
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    activeTab === 'settings'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </button>
              </div>
            </div>

            {activeTab === 'chat' && (
              <ChatInterface 
                apiKeys={apiKeys}
                selectedDate={selectedDate}
              />
            )}

            {activeTab === 'daily' && (
              <DailySummary 
                apiKeys={apiKeys}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            )}

            {activeTab === 'settings' && (
              <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="limitlessKey">
                    Limitless API Key
                  </label>
                  <input
                    id="limitlessKey"
                    type="password"
                    className="w-full p-2 border rounded"
                    value={apiKeys.limitless}
                    onChange={(e) => handleApiKeyChange('limitless', e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="openaiKey">
                    OpenAI API Key
                  </label>
                  <input
                    id="openaiKey"
                    type="password"
                    className="w-full p-2 border rounded"
                    value={apiKeys.openai}
                    onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2" htmlFor="anthropicKey">
                    Anthropic API Key
                  </label>
                  <input
                    id="anthropicKey"
                    type="password"
                    className="w-full p-2 border rounded"
                    value={apiKeys.anthropic}
                    onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                  />
                </div>
                
                <button
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                  onClick={saveApiKeys}
                >
                  Update Settings
                </button>
                
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h3 className="font-bold mb-2">About API Keys</h3>
                  <p className="text-sm text-gray-600">
                    Your API keys are stored locally in your browser and are never sent to our servers.
                    They are only used to make direct API calls to the respective services.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Limitless Chat App - Chat with your personal data</p>
        </div>
      </footer>
    </div>
  );
}
