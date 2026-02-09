import { TestBed } from '@angular/core/testing';
import { UserIdService } from './user-id.service';

describe('UserIdService', () => {
  let service: UserIdService;
  const STORAGE_KEY = 'dva.userId';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserIdService);
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOrCreate', () => {
    it('should create a new UUID when localStorage is empty', () => {
      const id = service.getOrCreate();
      
      expect(id).toBeTruthy();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should store the new UUID in localStorage', () => {
      const id = service.getOrCreate();
      
      expect(localStorage.getItem(STORAGE_KEY)).toBe(id);
    });

    it('should return existing UUID from localStorage if present', () => {
      const existingId = '550e8400-e29b-41d4-a716-446655440000';
      localStorage.setItem(STORAGE_KEY, existingId);
      
      const id = service.getOrCreate();
      
      expect(id).toBe(existingId);
    });

    it('should not generate new UUID when one already exists', () => {
      const existingId = '550e8400-e29b-41d4-a716-446655440000';
      localStorage.setItem(STORAGE_KEY, existingId);
      
      // Mock crypto.randomUUID to verify it's not called
      const randomUUIDSpy = vi.spyOn(crypto, 'randomUUID');
      
      service.getOrCreate();
      
      expect(randomUUIDSpy).not.toHaveBeenCalled();
      randomUUIDSpy.mockRestore();
    });

    it('should generate different UUIDs for different calls when localStorage is cleared', () => {
      const id1 = service.getOrCreate();
      localStorage.clear();
      const id2 = service.getOrCreate();
      
      expect(id1).not.toBe(id2);
    });
  });

  describe('reset', () => {
    it('should remove userId from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, '550e8400-e29b-41d4-a716-446655440000');
      
      service.reset();
      
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should not throw when localStorage is already empty', () => {
      expect(() => service.reset()).not.toThrow();
    });

    it('should allow creating new UUID after reset', () => {
      const id1 = service.getOrCreate();
      service.reset();
      const id2 = service.getOrCreate();
      
      expect(id1).not.toBe(id2);
    });
  });
});
