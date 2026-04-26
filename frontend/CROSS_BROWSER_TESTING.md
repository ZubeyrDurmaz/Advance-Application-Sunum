# Cross-Browser Testing Checklist

## Overview

This document covers the cross-browser compatibility strategy for the CHRONOS responsive design implementation. It describes what was audited, what fallbacks were added, and how to verify the responsive design across all target browsers.

---

## Target Browsers

| Browser | Versions | Platform |
|---|---|---|
| Chrome | Latest 2 | Android / iOS |
| Safari | Latest 2 | iOS (iPhone & iPad) |
| Firefox | Latest 2 | Android |
| Samsung Internet | Latest | Android |

---

## CSS Compatibility Audit Results

### 1. `inset` Shorthand — Fixed

**Issue:** The `inset: 0` shorthand is not supported in older Safari (< 14.1) and Samsung Internet (< 14).

**Files fixed:**
- `frontend/src/styles.css` — `.modal-backdrop`
- `frontend/src/app/shared/sidebar/sidebar.css` — `.sidebar-overlay`
- `frontend/src/app/features/home/home.css` — `.hero-bg`, `.hero-overlay`, `.product-hover-overlay`
- `frontend/src/app/features/collection/collection.css` — `.brand-card-overlay`, `.filter-overlay`
- `frontend/src/app/features/product-detail/product-detail.css` — `.pd-hero-bg`, `.pd-hero-overlay`, `.review-backdrop`
- `frontend/src/app/features/member/vault/vault.css` — `.vault-featured-overlay`
- `frontend/src/app/features/member/order-history/order-history.css` — `.tracking-backdrop`
- `frontend/src/app/features/member/payments/payments.css` — `.pay-watch-promo-overlay`
- `frontend/src/app/features/deals/deals.css` — `.watch-hover-overlay`
- `frontend/src/app/features/auth/signup/signup.css` — `.signup-visual-img`, `.signup-visual-tint`
- `frontend/src/app/features/auth/login/login.css` — `.login-visual-img`, `.login-visual-tint`

**Fix applied:** Replaced `inset: 0` with explicit `top: 0; right: 0; bottom: 0; left: 0;`.

---

### 2. `backdrop-filter` — Fixed (webkit prefix)

**Issue:** `backdrop-filter` requires the `-webkit-` prefix for Safari iOS.

**Files fixed:**
- `frontend/src/styles.css` — `.modal-backdrop`
- `frontend/src/app/shared/sidebar/sidebar.css` — `.sidebar-overlay`
- `frontend/src/app/features/home/home.css` — `.btn-secondary`, `.bento-image-caption`
- `frontend/src/app/features/collection/collection.css` — `.filter-overlay`
- `frontend/src/app/features/product-detail/product-detail.css` — `.review-backdrop`
- `frontend/src/app/features/member/vault/vault.css` — `.badge-growth`
- `frontend/src/app/features/member/addresses/addresses.css` — `.logistics-globe-inner`
- `frontend/src/app/features/member/order-history/order-history.css` — `.tracking-backdrop`
- `frontend/src/app/features/chronos-ai/chronos-ai.css` — `.ai-input-area`
- `frontend/src/app/features/auth/login/login.css` — `.login-visual-tint`

**Already correct (both prefixes present):**
- `frontend/src/app/shared/navbar/navbar.css` — `.nav-bar`, `.nav-mobile-backdrop`

**Fix applied:** Added `-webkit-backdrop-filter` before each `backdrop-filter` declaration.

---

### 3. `aspect-ratio` — Fixed with `@supports`

**Issue:** `aspect-ratio` is not supported in Safari < 15 and older Samsung Internet.

**Files fixed:**
- `frontend/src/styles.css` — `.product-image`, `.card-image`, `.card-image--square`, `.card-image--portrait`

**Fix applied:** Wrapped `aspect-ratio` in `@supports (aspect-ratio: 1)` blocks. The base style omits `aspect-ratio` so images still display without it; the `@supports` block adds it for modern browsers.

**Note:** Component-level `aspect-ratio` usages (home, deals, collection, vault, product-detail, chronos-ai) are used on image wrapper `div` elements with `overflow: hidden`, which means images inside will still be constrained by the container height even without `aspect-ratio`. These are lower risk and acceptable for the target browser set.

---

### 4. `-webkit-text-size-adjust` — Added

**Issue:** iOS Safari automatically adjusts font sizes on orientation change, which can break layouts.

**Fix applied:** Added to `html` in `frontend/src/styles.css`:
```css
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
```

---

### 5. `scroll-behavior: smooth` — Added with `@supports`

**Issue:** `scroll-behavior` is not supported in older Safari (< 15.4).

**Fix applied:** Wrapped in `@supports` in `frontend/src/styles.css`:
```css
@supports (scroll-behavior: smooth) {
  html {
    scroll-behavior: smooth;
  }
}
```

---

### 6. `-webkit-overflow-scrolling: touch` — Added

**Issue:** iOS Safari requires this property for momentum (inertia) scrolling on overflow containers.

**Files updated:**
- `frontend/src/app/shared/sidebar/sidebar.css` — `.sidebar`
- `frontend/src/app/shared/navbar/navbar.css` — `.nav-mobile-menu`
- `frontend/src/styles.css` — `.modal`
- `frontend/src/app/features/member/dashboard/dashboard.css` — already present

---

### 7. CSS Custom Properties (`var()`) — No action needed

CSS custom properties are supported in all target browsers (Chrome 49+, Safari 9.1+, Firefox 31+, Samsung Internet 5+). All target browser versions are well above these thresholds.

---

### 8. `clamp()` — No action needed

`clamp()` is supported in Chrome 79+, Safari 13.1+, Firefox 75+, Samsung Internet 12+. All target browser versions support it.

---

### 9. CSS Grid with `fr` units — No action needed

CSS Grid with `fr` units is supported in all target browsers.

---

### 10. `gap` in Flexbox — No action needed

Flexbox `gap` is supported in Chrome 84+, Safari 14.1+, Firefox 63+, Samsung Internet 14+. All target browser versions support it.

---

### 11. `object-fit` / `object-position` — No action needed

Supported in all target browsers.

---

### 12. `@media (hover: none)` — No action needed

Supported in all target browsers.

---

### 13. CSS Containment (`contain`) — No action needed

`contain: layout` and `contain: layout style` are supported in Chrome 52+, Firefox 69+, Safari 15.4+. For older Safari, `contain` is simply ignored — the layout still works, just without the performance optimization.

---

## How to Test Using Browser DevTools Device Emulation

### Chrome DevTools (Recommended for initial testing)

1. Open Chrome and navigate to the app
2. Press `F12` or `Cmd+Option+I` to open DevTools
3. Click the **Toggle device toolbar** icon (or press `Ctrl+Shift+M` / `Cmd+Shift+M`)
4. Select a device from the dropdown or set a custom viewport size

**Recommended test devices:**
- iPhone SE (375×667) — smallest common mobile
- iPhone 14 Pro (393×852) — modern iOS
- iPad (768×1024) — tablet breakpoint
- Galaxy S20 Ultra (412×915) — Android flagship

**What to check:**
- [ ] Navigation hamburger menu appears at < 768px
- [ ] Mobile menu opens/closes correctly
- [ ] All touch targets are at least 44×44px
- [ ] Product grid shows 1 column on mobile, 3 on tablet, 4 on desktop
- [ ] Footer stacks vertically on mobile
- [ ] Modals occupy 95% width on mobile
- [ ] Forms stack vertically on mobile
- [ ] Dashboard sidebar is hidden on mobile, visible on tablet+
- [ ] Text remains readable at all sizes (no overflow, no truncation)
- [ ] Images maintain aspect ratios

### Safari iOS Testing

**Using Xcode Simulator (macOS only):**
1. Install Xcode from the Mac App Store
2. Open Simulator: `Xcode > Open Developer Tool > Simulator`
3. Select an iPhone or iPad model
4. Open Safari and navigate to the app

**Using Safari Web Inspector with a physical device:**
1. On iPhone/iPad: `Settings > Safari > Advanced > Web Inspector` (enable)
2. Connect device to Mac via USB
3. On Mac Safari: `Develop > [Your Device] > [Page]`

**What to check specifically for Safari iOS:**
- [ ] `backdrop-filter` blur effects render correctly (navbar, modals, overlays)
- [ ] Font sizes do not auto-adjust on orientation change
- [ ] Momentum scrolling works in mobile menu and sidebar
- [ ] `aspect-ratio` images display correctly (or gracefully degrade)
- [ ] No layout shifts on page load

### Firefox Mobile Testing

**Using Firefox DevTools:**
1. Open Firefox and navigate to the app
2. Press `F12` to open DevTools
3. Click the **Responsive Design Mode** icon (or press `Ctrl+Shift+M`)
4. Select a mobile device preset

**Using a physical Android device:**
1. Enable USB debugging on Android: `Settings > Developer Options > USB Debugging`
2. Connect to computer via USB
3. In Firefox desktop: `about:debugging > This Firefox > Remote Debugging`
4. Navigate to the app on the device

**What to check specifically for Firefox mobile:**
- [ ] CSS Grid layouts render correctly
- [ ] `clamp()` typography scales smoothly
- [ ] Touch targets are accessible
- [ ] Animations perform smoothly

### Samsung Internet Testing

**Using Chrome DevTools with Samsung Internet UA:**
1. Open Chrome DevTools
2. In the device toolbar, click the three-dot menu > **Add custom device**
3. Set User Agent to: `Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/19.0 Chrome/102.0.5005.125 Mobile Safari/537.36`
4. Set viewport to 412×915

**Using a physical Samsung device:**
1. Open Samsung Internet browser
2. Navigate to the app URL

**What to check specifically for Samsung Internet:**
- [ ] `inset` shorthand fallbacks work (top/right/bottom/left)
- [ ] CSS custom properties render correctly
- [ ] Grid layouts display correctly
- [ ] Touch interactions work as expected

---

## Known Issues and Workarounds

### Safari iOS < 15: `aspect-ratio` not supported

**Symptom:** Image containers may not maintain their aspect ratio.

**Workaround:** The `@supports (aspect-ratio: 1)` blocks in `styles.css` ensure that images without `aspect-ratio` support still display (they just won't be constrained to a specific ratio). Component-level image wrappers use `overflow: hidden` which provides implicit height constraints.

### Safari iOS < 14.1: `inset` shorthand not supported

**Symptom:** Overlay elements (modals, hero overlays) may not cover their parent.

**Workaround:** All `inset: 0` usages have been replaced with explicit `top: 0; right: 0; bottom: 0; left: 0;`.

### Safari iOS: `backdrop-filter` requires `-webkit-` prefix

**Symptom:** Blur effects on navbar, modals, and overlays don't appear.

**Workaround:** All `backdrop-filter` usages now include `-webkit-backdrop-filter` as well.

### iOS Safari: Text size adjustment on orientation change

**Symptom:** Font sizes increase when rotating from portrait to landscape.

**Workaround:** `-webkit-text-size-adjust: 100%` is set on `html`.

### iOS Safari: No momentum scrolling in overflow containers

**Symptom:** Scrolling in mobile menu, sidebar, and modals feels sluggish.

**Workaround:** `-webkit-overflow-scrolling: touch` is set on `.nav-mobile-menu`, `.sidebar`, and `.modal`.

---

## Testing Checklist by Feature

### Navigation
- [ ] Hamburger menu visible on mobile (< 768px)
- [ ] Hamburger menu hidden on tablet/desktop (≥ 768px)
- [ ] Mobile menu slides in from left
- [ ] Mobile menu closes on backdrop tap
- [ ] Body scroll locked when mobile menu is open
- [ ] Cart badge visible on all viewports
- [ ] User avatar visible on all viewports
- [ ] All nav links meet 44px touch target

### Sidebar (Dashboard/Corporate)
- [ ] Sidebar hidden on mobile by default
- [ ] Toggle button visible on mobile
- [ ] Sidebar overlays content when open on mobile
- [ ] Sidebar always visible on tablet/desktop
- [ ] Close button visible on mobile sidebar

### Product Grid
- [ ] 1 column on mobile (< 768px)
- [ ] 3 columns on tablet (768px–1023px)
- [ ] 4 columns on desktop (≥ 1024px)
- [ ] Product images maintain aspect ratio

### Modals
- [ ] 95% width on mobile
- [ ] Centered with max-width 28rem on tablet/desktop
- [ ] Scrollable when content exceeds viewport
- [ ] Close button meets 44px touch target
- [ ] Backdrop blur renders on Safari iOS

### Footer
- [ ] Stacks vertically on mobile
- [ ] Horizontal layout on tablet/desktop
- [ ] All links meet 44px touch target

### Forms
- [ ] Inputs stack vertically on mobile
- [ ] Multi-column layout on tablet/desktop
- [ ] All inputs at least 44px tall
- [ ] No zoom on input focus (font-size ≥ 16px)

### Typography
- [ ] Fluid scaling with `clamp()` works across all breakpoints
- [ ] No text overflow or truncation on mobile
- [ ] Minimum 14px body text on mobile
- [ ] No font size adjustment on iOS orientation change

---

## Automated Testing Notes

The responsive design can be partially validated with:

- **Lighthouse** (Chrome DevTools): Run in mobile mode to check performance, accessibility, and best practices
- **axe DevTools** browser extension: Accessibility audit including touch target sizes
- **BrowserStack** or **Sauce Labs**: Cloud-based cross-browser testing on real devices

For CI/CD integration, consider adding Playwright or Cypress tests with viewport configuration to catch regressions at each breakpoint.
