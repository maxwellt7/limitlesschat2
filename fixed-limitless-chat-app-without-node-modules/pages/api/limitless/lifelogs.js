// pages/api/limitless/lifelogs.js
import { createLimitlessClient } from '../../../lib/limitless';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from environment variable
    const apiKey = process.env.LIMITLESS_API_KEY || req.headers['x-limitless-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'Limitless API key is required' });
    }

    // Create Limitless client
    const limitlessClient = createLimitlessClient(apiKey);
    
    // Get query parameters
    const { limit, direction, date } = req.query;
    
    // Get lifelogs
    const lifelogs = await limitlessClient.getLifelogs({
      limit: limit ? parseInt(limit) : 10,
      direction: direction || 'desc',
      date: date || null,
    });
    
    // Return lifelogs
    return res.status(200).json({ lifelogs });
  } catch (error) {
    console.error('Error in lifelogs API route:', error);
    return res.status(500).json({ error: 'Failed to fetch lifelogs' });
  }
}
