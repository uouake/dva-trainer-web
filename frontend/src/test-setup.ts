// Test setup file for Vitest
import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

// Reset TestBed before each test to avoid "test module already instantiated" errors
beforeEach(() => {
  TestBed.resetTestingModule();
});

// Mock global crypto for UUID generation
if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }),
    },
  });
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});
