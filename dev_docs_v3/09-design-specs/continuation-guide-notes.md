# Continuation Guide Notes

**Source:** `dev_docs/12-Rabih-design-Process/_continuation-guide/`
**Purpose:** Guidelines for Rabih's ongoing design spec creation process

---

## Content

The `_continuation-guide` directory contains 1 file with instructions for continuing the design specification process beyond the initial 38 services. It covers:

1. **Template structure** — How to create new service design specs following the 15-section format
2. **Naming conventions** — Directory numbering (`00-global`, `01-auth-admin`, etc.) and file numbering within each directory
3. **Section requirements** — Each screen spec must include:
   - Service overview (00 file)
   - Screen purpose and user stories
   - Layout and component hierarchy
   - Data model and API requirements
   - State management
   - Interactions and animations
   - Error states and edge cases
   - Accessibility requirements
   - Mobile responsiveness
   - Print/export layouts (if applicable)
4. **Cross-referencing** — How specs reference each other (e.g., carrier portal → carrier module)
5. **Version control** — How to update existing specs when requirements change

---

## Usage

This guide is for the design process itself, not for development. When building screens, use the integration files in this `09-design-specs/` directory to find the right spec, then read the full spec in `dev_docs/12-Rabih-design-Process/` for UX/UI details.
