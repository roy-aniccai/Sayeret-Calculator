require('@testing-library/jest-dom');

// Mock fetch
global.fetch = jest.fn();

// Mock Firebase
jest.mock('./src/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock API functions
jest.mock('./utils/api', () => ({
  submitData: jest.fn().mockResolvedValue({}),
  trackEvent: jest.fn().mockResolvedValue({}),
  getSubmissions: jest.fn().mockResolvedValue([]),
  getEvents: jest.fn().mockResolvedValue([]),
}));