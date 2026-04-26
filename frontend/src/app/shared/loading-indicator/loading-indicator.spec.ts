import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';
import { LoadingIndicator } from './loading-indicator';

@Component({
  template: '<app-loading-indicator />',
  imports: [LoadingIndicator],
})
class HostComponent {}

describe('LoadingIndicator — Requirements 22.1, 22.2', () => {
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [LoadingService]
    });
    loadingService = TestBed.inject(LoadingService);
    loadingService.reset();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-loading-indicator')).toBeTruthy();
  });

  it('should not show loading bar when not loading', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.loading-bar')).toBeNull();
  });

  it('should show loading bar when loading starts', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    loadingService.setLoading(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.loading-bar')).toBeTruthy();
  });

  it('should hide loading bar when loading completes', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    loadingService.setLoading(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    loadingService.setLoading(false);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.loading-bar')).toBeNull();
  });
});
