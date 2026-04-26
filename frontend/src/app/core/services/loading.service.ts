import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service for managing global loading state across the application.
 * 
 * This service tracks the number of active HTTP requests and provides
 * a reactive loading state that components can subscribe to for displaying
 * loading indicators.
 * 
 * @example
 * ```typescript
 * // In a component
 * constructor(private loadingService: LoadingService) {}
 * 
 * ngOnInit() {
 *   this.loadingService.loading$.subscribe(isLoading => {
 *     // Update UI based on loading state
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  /**
   * Counter to track the number of active HTTP requests.
   * When this counter is greater than 0, the application is in a loading state.
   */
  private activeRequests = 0;

  /**
   * BehaviorSubject that holds the current loading state.
   * Emits true when there are active requests, false otherwise.
   */
  private loadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * Observable that components can subscribe to for loading state changes.
   * Emits true when HTTP requests are in progress, false when all requests complete.
   */
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  /**
   * Updates the loading state by incrementing or decrementing the active request counter.
   * 
   * This method should be called when an HTTP request starts (loading = true)
   * and when it completes (loading = false).
   * 
   * The loading state is true when activeRequests > 0, false otherwise.
   * 
   * @param loading - true to increment the counter (request started), 
   *                  false to decrement (request completed)
   * 
   * @example
   * ```typescript
   * // Request starting
   * loadingService.setLoading(true);
   * 
   * // Request completed
   * loadingService.setLoading(false);
   * ```
   */
  setLoading(loading: boolean): void {
    // Increment counter when request starts, decrement when it completes
    this.activeRequests += loading ? 1 : -1;

    // Ensure counter never goes below 0
    if (this.activeRequests < 0) {
      this.activeRequests = 0;
    }

    // Emit loading state: true if any requests are active, false otherwise
    this.loadingSubject.next(this.activeRequests > 0);
  }

  /**
   * Returns the current loading state synchronously.
   * 
   * @returns true if there are active requests, false otherwise
   * 
   * @example
   * ```typescript
   * if (loadingService.isLoading()) {
   *   console.log('Application is loading...');
   * }
   * ```
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Resets the loading state by clearing all active requests.
   * This is useful for error recovery or cleanup scenarios.
   * 
   * @example
   * ```typescript
   * // Reset loading state on error
   * loadingService.reset();
   * ```
   */
  reset(): void {
    this.activeRequests = 0;
    this.loadingSubject.next(false);
  }
}
