# 15 - Animation and Micro-Interactions

> All animations, transitions, and micro-interactions used across Ultra TMS.

---

## Page Transitions

- **No full-page transitions.** Navigation is instant via Next.js client-side routing.
- **Content area fade-in:** 100ms, opacity 0 to 1 on route change.

---

## Component Animations

| Element              | Trigger          | Animation                          | Duration | Easing        |
|----------------------|------------------|------------------------------------|----------|---------------|
| Modal open           | Click trigger    | Fade in + scale 95% to 100%       | 150ms    | ease-out      |
| Modal close          | Click close/overlay | Fade out + scale 100% to 95%   | 100ms    | ease-in       |
| Sheet/Drawer open    | Click trigger    | Slide from right                   | 200ms    | ease-out      |
| Sheet/Drawer close   | Click close      | Slide to right                     | 150ms    | ease-in       |
| Dropdown open        | Click trigger    | Scale Y 95% to 100% + fade        | 100ms    | ease-out      |
| Toast appear         | Auto/trigger     | Slide from right + fade            | 200ms    | ease-out      |
| Toast dismiss        | Auto/click       | Slide right + fade                 | 150ms    | ease-in       |
| Skeleton pulse       | Auto             | Opacity 50% to 100% to 50%        | 1.5s     | linear, infinite |
| Hover card lift      | Mouse enter      | translateY(-2px) + shadow increase | 150ms    | ease-out      |
| Button press         | Click            | Scale to 98%                       | 100ms    | ease-in-out   |
| Accordion expand     | Click            | Height 0 to auto                   | 200ms    | ease-out      |
| Tab switch           | Click            | Underline slide + content fade     | 150ms    | ease-out      |
| Badge count update   | Data change      | Scale 110% to 100% (bounce)       | 300ms    | spring        |
| Checkbox check       | Click            | SVG path draw                      | 150ms    | ease-out      |
| Switch toggle        | Click            | Thumb slide                        | 150ms    | ease-in-out   |
| Progress bar         | Data change      | Width transition                   | 300ms    | ease-out      |
| Bulk action bar      | Selection        | Slide up from bottom               | 200ms    | ease-out      |

---

## Drag and Drop (Dispatch Board)

| Phase              | Behavior                                                        |
|--------------------|-----------------------------------------------------------------|
| Drag start         | Card lifts with increased shadow; 50% opacity ghost remains at original position |
| Dragging           | Card follows cursor with subtle rotation (2 degrees)            |
| Over valid target  | Target lane highlights with dashed border                       |
| Drop               | Card snaps to new position with 100ms ease                      |
| Invalid drop       | Card returns to original position with 200ms spring animation   |

---

## Loading Patterns

| Pattern       | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| Skeleton      | Matches the exact content shape (not generic placeholder blocks)            |
| Spinner       | 20px diameter, Slate-400 color, used inline for buttons and small areas     |
| Progress bar  | Full-width bar at the top of the page for page-level loading                |
| Optimistic    | Item appears immediately with a subtle pending indicator until confirmed    |

---

## Status Transitions

| Element                       | Animation                                     | Duration |
|-------------------------------|-----------------------------------------------|----------|
| Status badge color change     | background-color transition                   | 200ms    |
| Dispatch board card lane change | Slide animation between lanes               | 300ms    |
| Map marker appearance         | Fade-in + scale from 0% to 100%               | 200ms    |
| Map marker move               | Smooth position transition (for GPS updates)  | 500ms    |

---

## Reduced Motion

All animations must respect the user's operating system preference via `@media (prefers-reduced-motion: reduce)`.

**When reduced motion is active:**

- Replace all slide, scale, and spring animations with instant state changes.
- **Keep** opacity transitions (they remain accessible and non-disorienting).
- Remove rotation effects during drag.
- Skeleton pulse animation is replaced with a static background at 50% opacity.
