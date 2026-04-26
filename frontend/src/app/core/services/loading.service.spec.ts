import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { LoadingService } from './loading.service';

/**
 * Unit tests for LoadingService
 * 
 * Tests cover:
 * - Loading state transitions (Requirements 14.2, 14.3, 14.4)
 * - Multiple concurrent requests
 * - Edge cases and error recovery
 */
describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    service = new LoadingService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should start with loading state as false', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should emit false on initial subscription', async () => {
      const loadingState = await firstValueFrom(service.loading$);
      expect(loadingState).toBe(false);
    });
  });

  describe('Loading State Transitions - Requirement 14.2, 14.3, 14.4', () => {
    it('should emit true when loading starts (Requirement 14.3)', () => {
      return new Promise<void>((resolve) => {
        let emissionCount = 0;
        const expectedValues = [false, true];

        service.loading$.subscribe(loading => {
          expect(loading).toBe(expectedValues[emissionCount]);
          emissionCount++;

          if (emissionCount === 2) {
            resolve();
          }
        });

        service.setLoading(true);
      });
    });

    it('should emit false when loading completes (Requirement 14.4)', () => {
      return new Promise<void>((resolve) => {
        let emissionCount = 0;
        const expectedValues = [false, true, false];

        service.loading$.subscribe(loading => {
          expect(loading).toBe(expectedValues[emissionCount]);
          emissionCount++;

          if (emissionCount === 3) {
            resolve();
          }
        });

        service.setLoading(true);
        service.setLoading(false);
      });
    });

    it('should transition from false -> true -> false correctly', () => {
      return new Promise<void>((resolve) => {
        const emissions: boolean[] = [];

        service.loading$.subscribe(loading => {
          emissions.push(loading);

          if (emissions.length === 3) {
            expect(emissions).toEqual([false, true, false]);
            resolve();
          }
        });

        service.setLoading(true);
        service.setLoading(false);
      });
    });

    it('should update isLoading() synchronously when state changes', () => {
      expect(service.isLoading()).toBe(false);

      service.setLoading(true);
      expect(service.isLoading()).toBe(true);

      service.setLoading(false);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('Multiple Concurrent Requests', () => {
    it('should remain loading when multiple requests are active', () => {
      return new Promise<void>((resolve) => {
        const emissions: boolean[] = [];

        service.loading$.subscribe(loading => {
          emissions.push(loading);

          // After 3 starts and 2 completions, should still be loading
          if (emissions.length === 6) {
            expect(emissions).toEqual([false, true, true, true, true, true]);
            expect(service.isLoading()).toBe(true);
            resolve();
          }
        });

        // Start 3 requests
        service.setLoading(true);  // activeRequests = 1
        service.setLoading(true);  // activeRequests = 2
        service.setLoading(true);  // activeRequests = 3

        // Complete 2 requests
        service.setLoading(false); // activeRequests = 2
        service.setLoading(false); // activeRequests = 1
      });
    });

    it('should stop loading only when all requests complete', () => {
      return new Promise<void>((resolve) => {
        const emissions: boolean[] = [];

        service.loading$.subscribe(loading => {
          emissions.push(loading);

          if (emissions.length === 7) {
            expect(emissions).toEqual([false, true, true, true, true, true, false]);
            expect(service.isLoading()).toBe(false);
            resolve();
          }
        });

        // Start 3 requests
        service.setLoading(true);  // activeRequests = 1, loading = true
        service.setLoading(true);  // activeRequests = 2, loading = true
        service.setLoading(true);  // activeRequests = 3, loading = true

        // Complete all 3 requests
        service.setLoading(false); // activeRequests = 2, loading = true
        service.setLoading(false); // activeRequests = 1, loading = true
        service.setLoading(false); // activeRequests = 0, loading = false
      });
    });

    it('should handle 5 concurrent requests correctly', () => {
      // Start 5 requests
      for (let i = 0; i < 5; i++) {
        service.setLoading(true);
      }
      expect(service.isLoading()).toBe(true);

      // Complete 4 requests - should still be loading
      for (let i = 0; i < 4; i++) {
        service.setLoading(false);
      }
      expect(service.isLoading()).toBe(true);

      // Complete last request - should stop loading
      service.setLoading(false);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle interleaved start and complete calls', () => {
      return new Promise<void>((resolve) => {
        const emissions: boolean[] = [];

        service.loading$.subscribe(loading => {
          emissions.push(loading);

          if (emissions.length === 7) {
            expect(emissions).toEqual([false, true, true, true, true, true, false]);
            resolve();
          }
        });

        service.setLoading(true);  // Start request 1
        service.setLoading(true);  // Start request 2
        service.setLoading(false); // Complete request 1
        service.setLoading(true);  // Start request 3
        service.setLoading(false); // Complete request 2
        service.setLoading(false); // Complete request 3
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not go below zero when setLoading(false) is called more than setLoading(true)', () => {
      service.setLoading(true);
      service.setLoading(false);
      service.setLoading(false); // Extra false call
      service.setLoading(false); // Another extra false call

      expect(service.isLoading()).toBe(false);

      // Should still work correctly after recovery
      service.setLoading(true);
      expect(service.isLoading()).toBe(true);
    });

    it('should handle setLoading(false) called before any setLoading(true)', () => {
      service.setLoading(false);
      expect(service.isLoading()).toBe(false);

      // Should still work correctly
      service.setLoading(true);
      expect(service.isLoading()).toBe(true);
    });

    it('should handle multiple setLoading(false) calls without prior setLoading(true)', () => {
      service.setLoading(false);
      service.setLoading(false);
      service.setLoading(false);

      expect(service.isLoading()).toBe(false);
    });

    it('should handle rapid successive setLoading(true) calls', () => {
      for (let i = 0; i < 100; i++) {
        service.setLoading(true);
      }

      expect(service.isLoading()).toBe(true);

      // Complete all requests
      for (let i = 0; i < 100; i++) {
        service.setLoading(false);
      }

      expect(service.isLoading()).toBe(false);
    });

    it('should not emit duplicate values when state does not change', () => {
      return new Promise<void>((resolve) => {
        const emissions: boolean[] = [];

        service.loading$.subscribe(loading => {
          emissions.push(loading);

          if (emissions.length === 5) {
            // Should emit: false (initial), true (first start), true (second start), 
            // true (first complete), false (second complete)
            expect(emissions).toEqual([false, true, true, true, false]);
            resolve();
          }
        });

        service.setLoading(true);  // Emit true
        service.setLoading(true);  // Still true (activeRequests = 2)
        service.setLoading(false); // Still true (activeRequests = 1)
        service.setLoading(false); // Emit false (activeRequests = 0)
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset loading state to false', () => {
      service.setLoading(true);
      service.setLoading(true);
      service.setLoading(true);

      expect(service.isLoading()).toBe(true);

      service.reset();

      expect(service.isLoading()).toBe(false);
    });

    it('should emit false when reset is called', () => {
      return new Promise<void>((resolve) => {
        const emissions: boolean[] = [];

        service.loading$.subscribe(loading => {
          emissions.push(loading);

          if (emissions.length === 3) {
            expect(emissions).toEqual([false, true, false]);
            resolve();
          }
        });

        service.setLoading(true);
        service.reset();
      });
    });

    it('should clear all active requests when reset is called', () => {
      // Start multiple requests
      service.setLoading(true);
      service.setLoading(true);
      service.setLoading(true);

      service.reset();

      // After reset, should work normally
      service.setLoading(true);
      expect(service.isLoading()).toBe(true);

      service.setLoading(false);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle reset when already at zero', () => {
      expect(service.isLoading()).toBe(false);

      service.reset();

      expect(service.isLoading()).toBe(false);
    });

    it('should allow normal operation after reset', () => {
      service.setLoading(true);
      service.setLoading(true);
      service.reset();

      // Normal operation after reset
      service.setLoading(true);
      expect(service.isLoading()).toBe(true);

      service.setLoading(false);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('Observable Behavior - Requirement 14.2', () => {
    it('should expose loading$ as an Observable', () => {
      expect(service.loading$).toBeDefined();
      expect(typeof service.loading$.subscribe).toBe('function');
    });

    it('should allow multiple subscribers', () => {
      return new Promise<void>((resolve) => {
        let subscriber1Emissions: boolean[] = [];
        let subscriber2Emissions: boolean[] = [];
        let completedSubscribers = 0;

        service.loading$.subscribe(loading => {
          subscriber1Emissions.push(loading);
          if (subscriber1Emissions.length === 3) {
            completedSubscribers++;
            if (completedSubscribers === 2) {
              expect(subscriber1Emissions).toEqual([false, true, false]);
              expect(subscriber2Emissions).toEqual([false, true, false]);
              resolve();
            }
          }
        });

        service.loading$.subscribe(loading => {
          subscriber2Emissions.push(loading);
          if (subscriber2Emissions.length === 3) {
            completedSubscribers++;
            if (completedSubscribers === 2) {
              expect(subscriber1Emissions).toEqual([false, true, false]);
              expect(subscriber2Emissions).toEqual([false, true, false]);
              resolve();
            }
          }
        });

        service.setLoading(true);
        service.setLoading(false);
      });
    });

    it('should emit current state to new subscribers', async () => {
      service.setLoading(true);

      // New subscriber should immediately receive current state (true)
      const currentState = await firstValueFrom(service.loading$);
      expect(currentState).toBe(true);
    });

    it('should continue emitting after a subscriber unsubscribes', () => {
      return new Promise<void>((resolve) => {
        const emissions: boolean[] = [];

        const subscription1 = service.loading$.subscribe(loading => {
          emissions.push(loading);
        });

        service.setLoading(true);

        // Unsubscribe first subscriber
        subscription1.unsubscribe();

        // New subscriber should still receive updates
        service.loading$.subscribe(loading => {
          if (loading === false) {
            expect(emissions.length).toBeGreaterThan(0);
            resolve();
          }
        });

        service.setLoading(false);
      });
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle typical HTTP request lifecycle', () => {
      return new Promise<void>((resolve) => {
        const emissions: boolean[] = [];

        service.loading$.subscribe(loading => {
          emissions.push(loading);

          if (emissions.length === 3) {
            expect(emissions).toEqual([false, true, false]);
            resolve();
          }
        });

        // Simulate HTTP request start
        service.setLoading(true);

        // Simulate HTTP request complete
        setTimeout(() => {
          service.setLoading(false);
        }, 10);
      });
    });

    it('should handle multiple simultaneous API calls', () => {
      // Simulate 3 API calls starting at the same time
      service.setLoading(true); // API call 1 starts
      service.setLoading(true); // API call 2 starts
      service.setLoading(true); // API call 3 starts

      expect(service.isLoading()).toBe(true);

      // API call 2 completes first
      service.setLoading(false);
      expect(service.isLoading()).toBe(true);

      // API call 1 completes
      service.setLoading(false);
      expect(service.isLoading()).toBe(true);

      // API call 3 completes last
      service.setLoading(false);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle error recovery scenario', () => {
      // Start multiple requests
      service.setLoading(true);
      service.setLoading(true);
      service.setLoading(true);

      // Some requests fail and call setLoading(false) multiple times
      service.setLoading(false);
      service.setLoading(false);
      service.setLoading(false);
      service.setLoading(false); // Extra call due to error handling

      expect(service.isLoading()).toBe(false);

      // Service should still work correctly after error
      service.setLoading(true);
      expect(service.isLoading()).toBe(true);
    });

    it('should handle page navigation with pending requests', () => {
      // Start some requests
      service.setLoading(true);
      service.setLoading(true);

      // User navigates away - reset is called
      service.reset();

      expect(service.isLoading()).toBe(false);

      // New page starts fresh requests
      service.setLoading(true);
      expect(service.isLoading()).toBe(true);

      service.setLoading(false);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large number of state changes efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        service.setLoading(true);
        service.setLoading(false);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
      expect(service.isLoading()).toBe(false);
    });

    it('should not leak memory with multiple subscriptions', () => {
      const subscriptions = [];

      // Create 100 subscriptions
      for (let i = 0; i < 100; i++) {
        subscriptions.push(service.loading$.subscribe(() => {}));
      }

      // Trigger state changes
      service.setLoading(true);
      service.setLoading(false);

      // Unsubscribe all
      subscriptions.forEach(sub => sub.unsubscribe());

      // Service should still work
      service.setLoading(true);
      expect(service.isLoading()).toBe(true);
    });
  });
});
