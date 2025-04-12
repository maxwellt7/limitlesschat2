// pages/api/chat.js
import { createLimitlessClient } from '../../lib/limitless';
import { createLLMService } from '../../lib/llm';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get request body
    const { message, chatHistory = [], date, model = 'openai' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get API keys from environment variables or headers
    const limitlessApiKey = process.env.LIMITLESS_API_KEY || req.headers['x-limitless-api-key'];
    const openaiApiKey = process.env.OPENAI_API_KEY || req.headers['x-openai-api-key'];
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY || req.headers['x-anthropic-api-key'];
    
    if (!limitlessApiKey) {
      return res.status(401).json({ error: 'Limitless API key is required' });
    }

    // Create Limitless client
    const limitlessClient = createLimitlessClient(limitlessApiKey);
    
    // Get lifelogs for context
    // If date is provided, get lifelogs for that date, otherwise get recent lifelogs
    const lifelogs = date 
      ? await limitlessClient.getDailySummary(date)
      : await limitlessClient.getLifelogs({ limit: 20 });
    
    // Create LLM service
    const llmService = createLLMService();
    
    // Initialize the appropriate LLM client and generate response
    let response;
    if (model === 'anthropic' && anthropicApiKey) {
      llmService.initAnthropic(anthropicApiKey);
      response = await llmService.chatWithAnthropic(lifelogs, message, chatHistory);
    } else if (openaiApiKey) {
      llmService.initOpenAI(openaiApiKey);
      response = await llmService.chatWithOpenAI(lifelogs, message, chatHistory);
    } else {
      return res.status(401).json({ error: `API key for ${model} is required` });
    }
    
    // Return response
    return res.status(200).json({ 
      response,
      model,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in chat API route:', error);
    return res.status(500).json({ error: 'Failed to generate chat response' });
  }
}
