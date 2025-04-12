// components/DailySummary.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

export default function DailySummary({ apiKeys, selectedDate, onDateChange }) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState(apiKeys.openai ? 'openai' : 'anthropic');

  // Fetch summary when date or model changes
  useEffect(() => {
    if (selectedDate) {
      fetchSummary();
    }
  }, [selectedDate, model]);

  // Fetch summary from API
  const fetchSummary = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Prepare headers with API keys
      const headers = {};
      
      if (apiKeys.limitless) {
        headers['x-limitless-api-key'] = apiKeys.limitless;
      }
      
      if (model === 'openai' && apiKeys.openai) {
        headers['x-openai-api-key'] = apiKeys.openai;
      } else if (model === 'anthropic' && apiKeys.anthropic) {
        headers['x-anthropic-api-key'] = apiKeys.anthropic;
      }
      
      // Send request to summary API
      const response = await axios.get(`/api/limitless/summary?date=${selectedDate}&model=${model}`, { headers });
      
      if (response.data && response.data.summary) {
        setSummary(response.data.summary);
      } else {
        setSummary('No summary available for this date.');
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      setError('Failed to fetch summary. Please try again.');
      setSummary('');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (e) => {
    onDateChange(e.target.value);
  };

  // Handle model change
  const handleModelChange = (e) => {
    setModel(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-xl font-semibold mb-2 sm:mb-0">Daily Summary</h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="p-2 border rounded text-sm"
              max={format(new Date(), 'yyyy-MM-dd')}
            />
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
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : summary ? (
          <div className="prose max-w-none">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-center text-gray-500 p-4">
            Select a date to view a summary of your day
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-50 border-t">
        <p className="text-sm text-gray-500">
          This summary is generated from your Limitless pendant data for {selectedDate}
        </p>
      </div>
    </div>
  );
}
