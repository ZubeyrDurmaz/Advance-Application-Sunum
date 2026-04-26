# ResponsiveService Documentation

## Overview

The `ResponsiveService` is a centralized Angular service for viewport detection and responsive breakpoint management. It provides reactive signals for detecting mobile, tablet, and desktop viewports with automatic updates on window resize.

## Features

✅ **Viewport Width Signal**: Reactive signal tracking current viewport width  
✅ **Breakpoint Detection**: Computed signals for isMobile, isTablet, isDesktop  
✅ **Debounced Resize Handler**: 150ms debounce for optimal performance  
✅ **matchesBreakpoint() Method**: Convenient method for breakpoint checking  
✅ **SSR Compatible**: Safe for server-side rendering  
✅ **Fully Tested**: 10 unit tests covering all functionality  

## Breakpoints

| Breakpoint | Range | Signal |
|------------|-------|--------|
| Mobile | < 768px | `isMobile()` |
| Tablet | 768px - 1023px | `isTablet()` |
| Desktop | ≥ 1024px | `isDesktop()` |

## Installation

The service is already created at:
```
frontend/src/app/core/services/responsive.service.ts
```

It's provided in root, so no additional setup is needed.

## Usage

### 1. Basic Usage in Components

```typescript
import { Component } from '@angular/core';
import { ResponsiveService } from '@core/services/responsive.service';

@Component({
  selector: 'app-my-component',
  template: `
    <div>
      @if (responsive.isMobile()) {
        <app-mobile-menu />
      } @else {
        <app-desktop-menu />
      }
    </div>
  `
})
export class MyComponent {
  constructor(public responsive: ResponsiveService) {}
}
```

### 2. Using matchesBreakpoint()

```typescript
export class MyComponent {
  constructor(private responsive: ResponsiveService) {}

  ngOnInit() {
    if (this.responsive.matchesBreakpoint('mobile')) {
      // Mobile-specific initialization
      this.loadMobileAssets();
    }
  }
}
```

### 3. Reactive Updates with effect()

```typescript
import { Component, effect } from '@angular/core';
import { ResponsiveService } from '@core/services/responsive.service';

export class NavbarComponent {
  mobileMenuOpen = signal(false);

  constructor(private responsive: ResponsiveService) {
    // Auto-close mobile menu when resizing to desktop
    effect(() => {
      if (this.responsive.isDesktop() && this.mobileMenuOpen()) {
        this.mobileMenuOpen.set(false);
      }
    });
  }
}
```

### 4. Conditional Rendering in Templates

```html
<!-- Show different layouts based on viewport -->
@if (responsive.isMobile()) {
  <div class="mobile-layout">
    <button (click)="toggleMenu()">☰</button>
  </div>
}

@if (responsive.isTablet()) {
  <div class="tablet-layout">
    <nav class="compact-nav">...</nav>
  </div>
}

@if (responsive.isDesktop()) {
  <div class="desktop-layout">
    <nav class="full-nav">...</nav>
  </div>
}
```

### 5. Getting Current Viewport Width

```typescript
export class MyComponent {
  constructor(private responsive: ResponsiveService) {}

  logViewportInfo() {
    const width = this.responsive.getViewportWidth();
    console.log(`Current viewport: ${width}px`);
  }
}
```

## API Reference

### Properties

#### `isMobile: Signal<boolean>`
Computed signal that returns `true` when viewport width is less than 768px.

```typescript
const isMobile = this.responsive.isMobile();
```

#### `isTablet: Signal<boolean>`
Computed signal that returns `true` when viewport width is between 768px and 1023px (inclusive).

```typescript
const isTablet = this.responsive.isTablet();
```

#### `isDesktop: Signal<boolean>`
Computed signal that returns `true` when viewport width is 1024px or greater.

```typescript
const isDesktop = this.responsive.isDesktop();
```

### Methods

#### `matchesBreakpoint(breakpoint: Breakpoint): boolean`
Check if the current viewport matches a specific breakpoint.

**Parameters:**
- `breakpoint`: `'mobile' | 'tablet' | 'desktop'`

**Returns:** `boolean`

**Example:**
```typescript
if (this.responsive.matchesBreakpoint('mobile')) {
  // Mobile-specific logic
}
```

#### `getViewportWidth(): number`
Get the current viewport width in pixels.

**Returns:** `number`

**Example:**
```typescript
const width = this.responsive.getViewportWidth();
console.log(`Viewport is ${width}px wide`);
```

## Implementation Details

### Debounced Resize Handler

The service uses RxJS to debounce window resize events by 150ms, preventing excessive updates during resize operations:

```typescript
fromEvent(window, 'resize')
  .pipe(
    debounceTime(150),
    map(() => window.innerWidth)
  )
  .subscribe(width => this.viewportWidth.set(width));
```

### SSR Compatibility

The service checks for `window` availability to ensure compatibility with server-side rendering:

```typescript
private viewportWidth = signal(
  typeof window !== 'undefined' ? window.innerWidth : 1024
);
```

### Performance Considerations

- **Debouncing**: 150ms debounce prevents excessive signal updates
- **Computed Signals**: Breakpoint checks are computed, not recalculated on every access
- **Minimal DOM Access**: Only reads `window.innerWidth`, no layout thrashing

## Testing

The service includes comprehensive unit tests covering:

- ✅ Service creation
- ✅ Mobile viewport detection (<768px)
- ✅ Tablet viewport detection (768px-1023px)
- ✅ Desktop viewport detection (≥1024px)
- ✅ Edge case at 768px boundary
- ✅ Edge case at 1024px boundary
- ✅ getViewportWidth() method
- ✅ matchesBreakpoint() method
- ✅ Debounced resize handling

Run tests with:
```bash
npm test
```

## Common Patterns

### Pattern 1: Mobile Menu Toggle

```typescript
export class NavbarComponent {
  mobileMenuOpen = signal(false);

  constructor(public responsive: ResponsiveService) {
    effect(() => {
      // Auto-close menu when switching to desktop
      if (this.responsive.isDesktop() && this.mobileMenuOpen()) {
        this.mobileMenuOpen.set(false);
        document.body.style.overflow = '';
      }
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
    document.body.style.overflow = this.mobileMenuOpen() ? 'hidden' : '';
  }
}
```

### Pattern 2: Responsive Sidebar

```typescript
export class SidebarComponent {
  isOpen = signal(false);

  constructor(public responsive: ResponsiveService) {}

  toggleSidebar() {
    if (this.responsive.isMobile()) {
      this.isOpen.update(v => !v);
    }
  }
}
```

### Pattern 3: Conditional Component Loading

```typescript
export class DashboardComponent {
  constructor(public responsive: ResponsiveService) {}

  get chartConfig() {
    return {
      height: this.responsive.isMobile() ? 200 : 400,
      showLegend: !this.responsive.isMobile(),
      columns: this.responsive.isMobile() ? 1 : 
               this.responsive.isTablet() ? 2 : 4
    };
  }
}
```

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- ✅ **Requirement 1.1**: Breakpoint system with mobile (<768px), tablet (768px-1023px), desktop (≥1024px)
- ✅ **Requirement 1.2**: Mobile-first approach (base styles for mobile)
- ✅ **Requirement 1.3**: Tablet styles using min-width media queries
- ✅ **Requirement 1.4**: Desktop styles using min-width media queries
- ✅ **Requirement 1.5**: rem units for media query breakpoints

## Next Steps

After implementing the ResponsiveService, the next tasks in the responsive design implementation are:

1. **Task 2.2**: Create responsive directive for conditional rendering
2. **Task 2.3**: Update global styles with breakpoint custom properties
3. **Task 2.4**: Implement responsive navigation component
4. **Task 2.5**: Create responsive sidebar component

## Support

For questions or issues with the ResponsiveService, refer to:
- Design Document: `.kiro/specs/responsive-design-implementation/design.md`
- Requirements: `.kiro/specs/responsive-design-implementation/requirements.md`
- Test File: `frontend/src/app/core/services/responsive.service.spec.ts`
