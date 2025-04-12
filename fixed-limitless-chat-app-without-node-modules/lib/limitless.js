// lib/limitless.js
import axios from 'axios';

/**
 * Client for interacting with the Limitless API
 */
export class LimitlessClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.limitless.ai';
  }

  /**
   * Get lifelogs from the Limitless API
   * @param {Object} options - Options for the request
   * @param {number} options.limit - Maximum number of lifelogs to retrieve
   * @param {string} options.direction - Direction to sort lifelogs ('asc' or 'desc')
   * @param {string} options.date - Date to filter lifelogs
   * @returns {Promise<Array>} - Array of lifelogs
   */
  async getLifelogs({ limit = 10, direction = 'desc', date = null } = {}) {
    try {
      const params = {
        limit,
        direction,
        includeMarkdown: true,
        includeHeadings: false,
      };

      if (date) {
        params.date = date;
      }

      const response = await axios.get(`${this.baseUrl}/v1/lifelogs`, {
        headers: {
          'X-API-KEY': this.apiKey,
        },
        params,
      });

      if (!response.data || !response.data.data || !response.data.data.lifelogs) {
        return [];
      }

      return response.data.data.lifelogs;
    } catch (error) {
      console.error('Error fetching lifelogs:', error);
      throw error;
    }
  }

  /**
   * Get a daily summary of lifelogs
   * @param {string} date - Date to summarize (YYYY-MM-DD)
   * @returns {Promise<Array>} - Array of lifelogs for the specified date
   */
  async getDailySummary(date) {
    try {
      return await this.getLifelogs({
        date,
        limit: 50, // Get more lifelogs for a comprehensive summary
      });
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      throw error;
    }
  }
}

/**
 * Create a new Limitless client instance
 * @param {string} apiKey - Limitless API key
 * @returns {LimitlessClient} - Limitless client instance
 */
export function createLimitlessClient(apiKey) {
  return new LimitlessClient(apiKey);
}
