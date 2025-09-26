import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

declare const global: typeof globalThis;

// Polyfill para TextEncoder/TextDecoder
Object.assign(global, {
  TextEncoder,
  TextDecoder,
});

// Mock completo e funcional do localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(() => null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});