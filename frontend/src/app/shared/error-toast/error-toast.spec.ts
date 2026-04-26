import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ErrorToast } from './error-toast';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

describe('ErrorToast — Requirements 23.1, 23.2', () => {
  let errorService: ErrorHandlerService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ErrorToast],
      providers: [ErrorHandlerService]
    });
    errorService = TestBed.inject(ErrorHandlerService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ErrorToast);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should start with no toasts', () => {
    const fixture = TestBed.createComponent(ErrorToast);
    fixture.detectChanges();
    expect(fixture.componentInstance.toasts.length).toBe(0);
  });

  it('should show a toast when show() is called', () => {
    const fixture = TestBed.createComponent(ErrorToast);
    fixture.detectChanges();

    fixture.componentInstance.show('Network error, check your connection');
    expect(fixture.componentInstance.toasts.length).toBe(1);
    expect(fixture.componentInstance.toasts[0].message).toBe('Network error, check your connection');
  });

  it('should dismiss a toast when dismiss is called', () => {
    const fixture = TestBed.createComponent(ErrorToast);
    fixture.detectChanges();

    fixture.componentInstance.show('Test error');
    const id = fixture.componentInstance.toasts[0].id;
    fixture.componentInstance.dismiss(id);

    const toast = fixture.componentInstance.toasts.find(t => t.id === id);
    expect(toast?.visible).toBe(false);
  });

  it('should accumulate multiple toasts', () => {
    const fixture = TestBed.createComponent(ErrorToast);
    fixture.detectChanges();

    fixture.componentInstance.show('Error 1');
    fixture.componentInstance.show('Error 2');
    fixture.componentInstance.show('Error 3');

    expect(fixture.componentInstance.toasts.length).toBe(3);
  });
});
