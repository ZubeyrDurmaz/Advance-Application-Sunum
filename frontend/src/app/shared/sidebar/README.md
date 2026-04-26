# Sidebar Component

A responsive sidebar navigation component that adapts to mobile and desktop viewports.

## Features

- **Mobile-first design**: Hidden by default on mobile with toggle button
- **Responsive behavior**: Fixed sidebar on tablet/desktop (≥768px)
- **Touch-friendly**: Minimum 44x44px touch targets
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Body scroll prevention**: Prevents scrolling when mobile sidebar is open
- **Auto-close on resize**: Automatically closes when viewport changes from mobile to desktop

## Usage

### Basic Example

```typescript
import { Component } from '@angular/core';
import { Sidebar, SidebarLink } from './shared/sidebar/sidebar';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [links]="sidebarLinks" />
      <main class="dashboard-content">
        <!-- Your content here -->
      </main>
    </div>
  `
})
export class DashboardComponent {
  sidebarLinks: SidebarLink[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Profile', route: '/dashboard/profile', icon: '👤' },
    { label: 'Settings', route: '/dashboard/settings', icon: '⚙️' },
    { label: 'Orders', route: '/dashboard/orders', icon: '📦' },
  ];
}
```

### With Icons

Icons are optional and can be any string (emoji, icon font class, etc.):

```typescript
const links: SidebarLink[] = [
  { label: 'Home', route: '/home', icon: '🏠' },
  { label: 'Products', route: '/products', icon: '🛍️' },
  { label: 'Cart', route: '/cart', icon: '🛒' },
];
```

### Layout Example

```css
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.dashboard-content {
  flex: 1;
  padding: var(--space-lg);
}

/* On mobile, sidebar is overlay, so content takes full width */
@media (max-width: 767px) {
  .dashboard-layout {
    flex-direction: column;
  }
}
```

## API

### Inputs

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `links` | `SidebarLink[]` | Yes | Array of navigation links to display |

### SidebarLink Interface

```typescript
interface SidebarLink {
  label: string;    // Display text for the link
  route: string;    // Router path
  icon?: string;    // Optional icon (emoji, icon class, etc.)
}
```

### Methods

| Method | Description |
|--------|-------------|
| `toggleSidebar()` | Toggles sidebar open/closed state (mobile only) |
| `closeSidebar()` | Closes the sidebar (mobile only) |

## Responsive Behavior

### Mobile (<768px)
- Sidebar hidden by default
- Toggle button visible
- Sidebar slides in as overlay when opened
- Backdrop overlay prevents interaction with content
- Body scroll prevented when open
- Close button visible in sidebar

### Tablet/Desktop (≥768px)
- Sidebar always visible
- Fixed position (sticky)
- Toggle button hidden
- No overlay
- Width: 16rem (tablet), 18rem (desktop)

## Styling

The component uses CSS custom properties for theming:

```css
:root {
  --surface: #ffffff;
  --on-surface: #1a1a1a;
  --primary: #2563eb;
  --primary-container: #dbeafe;
  --surface-container: #f5f5f5;
  --touch-target-min: 44px;
  --touch-spacing-min: 8px;
  --space-sm: 0.5rem;
  --space-md: 0.75rem;
  --space-lg: 1rem;
  --space-xl: 1.5rem;
  --space-2xl: 2rem;
  --font-size-base: 1rem;
}
```

## Accessibility

- All interactive elements meet WCAG 2.1 minimum touch target size (44x44px)
- Proper ARIA labels for toggle and close buttons
- `aria-hidden` attribute on sidebar when closed on mobile
- Focus indicators visible on all interactive elements
- Keyboard navigation supported
- Active route highlighted with distinct styling

## Requirements Satisfied

This component satisfies the following requirements from the responsive design spec:

- **3.1**: Hidden by default on mobile (<768px)
- **3.2**: Toggle button on mobile
- **3.3**: Overlay behavior on mobile
- **3.4**: Fixed sidebar on tablet/desktop (≥768px)
- **3.5**: Close button for mobile overlay
- **3.6**: Body scroll prevention
- **3.7**: Minimum touch target sizes

## Testing

The component includes comprehensive unit tests covering:
- Component creation and initialization
- Toggle functionality on mobile and desktop
- Body scroll prevention
- Viewport change effects (auto-close on resize)
- Template rendering (links, icons, buttons, overlay)
- Accessibility attributes

Run tests:
```bash
npm test -- --include='**/sidebar.spec.ts'
```
