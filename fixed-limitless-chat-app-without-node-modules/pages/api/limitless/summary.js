// pages/api/limitless/summary.js
import { createLimitlessClient } from '../../../lib/limitless';
import { createLLMService } from '../../../lib/llm';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API keys from environment variables or headers
    const limitlessApiKey = process.env.LIMITLESS_API_KEY || req.headers['x-limitless-api-key'];
    const openaiApiKey = process.env.OPENAI_API_KEY || req.headers['x-openai-api-key'];
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY || req.headers['x-anthropic-api-key'];
    
    if (!limitlessApiKey) {
      return res.status(401).json({ error: 'Limitless API key is required' });
    }

    // Get query parameters
    const { date, model = 'openai' } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // Create Limitless client
    const limitlessClient = createLimitlessClient(limitlessApiKey);
    
    // Get lifelogs for the specified date
    const lifelogs = await limitlessClient.getDailySummary(date);
    
    if (lifelogs.length === 0) {
      return res.status(200).json({ summary: "No data available for this date." });
    }

    // Create LLM service
    const llmService = createLLMService();
    
    // Initialize the appropriate LLM client
    let summary;
    if (model === 'anthropic' && anthropicApiKey) {
      llmService.initAnthropic(anthropicApiKey);
      summary = await llmService.summarizeWithAnthropic(lifelogs);
    } else if (openaiApiKey) {
      llmService.initOpenAI(openaiApiKey);
      summary = await llmService.summarizeWithOpenAI(lifelogs);
    } else {
      return res.status(401).json({ error: `API key for ${model} is required` });
    }
    
    // Return summary
    return res.status(200).json({ summary, date });
  } catch (error) {
    console.error('Error in summary API route:', error);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}
