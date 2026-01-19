/**
 * Jest global setup
 * Set test environment variables and load .env
 */

// Load environment variables from .env file
require('dotenv').config();

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Global timeout for async operations
jest.setTimeout(30000);
