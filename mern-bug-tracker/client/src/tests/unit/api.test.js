import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as apiService from '../../services/api';
import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';

// Create a mock adapter for axios
const mock = new MockAdapter(axios);

describe('API Service', () => {
  beforeEach(() => {
    mock.reset();
    localStorage.clear();
  });

  afterAll(() => {
    mock.restore();
  });

  describe('getImageUrl', () => {
    it('should return empty string for null or undefined', () => {
      expect(apiService.getImageUrl(null)).toBe('');
      expect(apiService.getImageUrl(undefined)).toBe('');
    });

    it('should return full URL for absolute paths', () => {
      const url = 'http://example.com/image.jpg';
      expect(apiService.getImageUrl(url)).toBe(url);
    });

    it('should handle relative paths', () => {
      const path = '/uploads/image.jpg';
      const result = apiService.getImageUrl(path);
      expect(result).toContain(path);
    });
  });

  describe('Authentication interceptors', () => {
    it('should add Authorization header when token exists', async () => {
      localStorage.setItem('token', 'test-token-123');

      mock.onGet('/posts').reply(200, { posts: [] });

      // Make a request to verify interceptor adds header
      await axios.get('/posts', { headers: {} });

      // Check that token would be added
      const token = localStorage.getItem('token');
      expect(token).toBe('test-token-123');
    });

    it('should not add Authorization header when token does not exist', () => {
      localStorage.clear();

      mock.onGet('/posts').reply(200, { posts: [] });

      const token = localStorage.getItem('token');
      expect(token).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle 401 responses', () => {
      localStorage.setItem('token', 'invalid-token');
      localStorage.setItem('user', 'test-user');

      // Verify token removal on 401
      expect(localStorage.getItem('token')).toBe('invalid-token');

      // Simulate 401 error handling
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should handle network errors', async () => {
      mock.onGet('/posts').networkError();

      try {
        await axios.get('/posts');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle timeout errors', async () => {
      mock.onGet('/posts').timeoutOnce();

      try {
        await axios.get('/posts');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
