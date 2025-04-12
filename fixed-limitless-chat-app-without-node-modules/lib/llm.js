// lib/llm.js
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

/**
 * LLM service for interacting with different language models
 */
export class LLMService {
  constructor() {
    this.openai = null;
    this.anthropic = null;
  }

  /**
   * Initialize OpenAI client
   * @param {string} apiKey - OpenAI API key
   */
  initOpenAI(apiKey) {
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Initialize Anthropic client
   * @param {string} apiKey - Anthropic API key
   */
  initAnthropic(apiKey) {
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  /**
   * Generate a summary of lifelogs using OpenAI
   * @param {Array} lifelogs - Array of lifelogs to summarize
   * @returns {Promise<string>} - Generated summary
   */
  async summarizeWithOpenAI(lifelogs) {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant that summarizes transcripts." },
          { role: "user", content: `Summarize the following transcripts: ${JSON.stringify(lifelogs)}` }
        ],
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating summary with OpenAI:', error);
      throw error;
    }
  }

  /**
   * Generate a summary of lifelogs using Anthropic Claude
   * @param {Array} lifelogs - Array of lifelogs to summarize
   * @returns {Promise<string>} - Generated summary
   */
  async summarizeWithAnthropic(lifelogs) {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized');
    }

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        messages: [
          { role: "user", content: `Summarize the following transcripts: ${JSON.stringify(lifelogs)}` }
        ],
        system: "You are a helpful assistant that summarizes transcripts."
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Error generating summary with Anthropic:', error);
      throw error;
    }
  }

  /**
   * Chat with lifelogs using OpenAI
   * @param {Array} lifelogs - Array of lifelogs to use as context
   * @param {string} userMessage - User's message
   * @param {Array} chatHistory - Previous chat history
   * @returns {Promise<string>} - Generated response
   */
  async chatWithOpenAI(lifelogs, userMessage, chatHistory = []) {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const messages = [
        { 
          role: "system", 
          content: "You are a helpful assistant that answers questions based on the user's personal data from their Limitless pendant. Use the provided transcripts as context for your answers." 
        },
        ...chatHistory,
        { 
          role: "user", 
          content: `Context from my Limitless pendant: ${JSON.stringify(lifelogs)}\n\nMy question: ${userMessage}` 
        }
      ];

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error chatting with OpenAI:', error);
      throw error;
    }
  }

  /**
   * Chat with lifelogs using Anthropic Claude
   * @param {Array} lifelogs - Array of lifelogs to use as context
   * @param {string} userMessage - User's message
   * @param {Array} chatHistory - Previous chat history
   * @returns {Promise<string>} - Generated response
   */
  async chatWithAnthropic(lifelogs, userMessage, chatHistory = []) {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized');
    }

    try {
      // Convert chat history to Anthropic format
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await this.anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        messages: [
          ...formattedHistory,
          { 
            role: "user", 
            content: `Context from my Limitless pendant: ${JSON.stringify(lifelogs)}\n\nMy question: ${userMessage}` 
          }
        ],
        system: "You are a helpful assistant that answers questions based on the user's personal data from their Limitless pendant. Use the provided transcripts as context for your answers."
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Error chatting with Anthropic:', error);
      throw error;
    }
  }
}

/**
 * Create a new LLM service instance
 * @returns {LLMService} - LLM service instance
 */
export function createLLMService() {
  return new LLMService();
}
