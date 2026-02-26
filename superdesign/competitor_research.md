# TMS Competitor UI Research — Feb 9, 2026

## Purpose
Shareholder feedback: V5_final color scheme rejected, table column separators needed. Research how real TMS platforms handle colors and table design.

---

## Competitor Branding Data (extracted via Firecrawl)

| Platform | Primary | Accent | Background | Font | Border Radius | Framework |
|----------|---------|--------|------------|------|---------------|-----------|
| **DAT** | #6C757D (gray) | #0046E0 (blue) | #FFFFFF | Sequel Sans | 5px, btns 25px | Bootstrap |
| **Samsara** | #00263E (dark navy) | #0369EA (blue) | #FFFFFF | Inter | 6px, btns pill | Tailwind |
| **Motive** | #0099FF (sky blue) | #FF0F00 (red) | #FFFFFF | MaisonNeue/Roboto | 8px, btns 160px | Custom |
| **project44** | #0072E9 (blue) | #005FCC (blue) | #FFFFFF | PP Mori | 0px (sharp!) | Custom |

### Screenshots captured:
- DAT Load Board: `screenshots/dat_loadboard.png`
- Samsara Platform: `screenshots/samsara_platform.png`
- Motive Dashboard: `screenshots/motive_dashboard.png`
- project44 Platform: `screenshots/project44_platform.png`

---

## Key Design Patterns Observed

### 1. Color Schemes
- **Blue dominates the TMS space.** Every single competitor uses blue as primary (DAT #0046E0, Samsara #0369EA, Motive #0099FF, project44 #0072E9)
- Our V5_final uses #1D4ED8 (sapphire) — falls right in line with industry standard
- **Differentiation opportunity:** Teal, green, or warm navy could distinguish Ultra TMS from the sea of blue competitors
- Samsara uses dark navy (#00263E) as primary with bright blue (#0369EA) as accent — creates depth
- Motive uses red (#FF0F00) as accent against blue — high contrast for alerts

### 2. Typography
- Samsara uses **Inter** (same as our project) — validates our font choice
- project44 uses PP Mori (geometric, modern)
- DAT uses Sequel Sans (custom, professional)
- Motive uses MaisonNeue (heading) + Roboto (body) — dual-font strategy

### 3. Sidebar Treatment
- Samsara: Dark navy (#00263E) sidebar — professional, creates depth
- Most platforms use dark sidebars to anchor the interface
- Our V5_final uses white sidebar (#FFFFFF) — could be part of what shareholders dislike

### 4. Table Design (Industry Patterns)
- **Enterprise TMS platforms (Trimble TMW, SAP TM):** Full grid borders, spreadsheet-style — familiar to dispatchers used to Excel
- **Modern SaaS TMS (Turvo, Samsara, project44):** Horizontal lines only, no vertical separators — modern but can be hard to read in dense data
- **Hybrid approach (DAT load board):** Horizontal rows with subtle alternating backgrounds (zebra striping) for readability
- **Shareholders want:** Vertical column separators — indicates they prefer the enterprise/traditional style for table readability

### 5. Border Radius
- project44 uses 0px (sharp corners) — enterprise, serious
- DAT uses 5px — moderate rounding
- Samsara uses 6px — same as our V5 (6px)
- Motive uses 8px — slightly softer

---

## Recommendations for New Variants

### Category A (V5_final tweaks — minor adjustments):
1. **A1:** Warmer sapphire + subtle vertical column lines (1px, low opacity)
2. **A2:** Slightly shifted hue (more indigo) + alternating column tints
3. **A3:** Deepened palette + full grid borders (subtle)

### Category B (Competitor-inspired):
1. **B1: "Samsara Style"** — Dark navy sidebar (#00263E), bright blue accent (#0369EA), Inter font, clean modern tables with thin grid
2. **B2: "Teal Differentiation"** — Teal primary (#0D9488), stands out from blue competitors, professional yet distinctive
3. **B3: "Enterprise Classic"** — Inspired by Trimble/SAP, full grid borders, warm gray backgrounds (#FAFAF9), serious corporate feel
4. **B4: "Green Operations"** — Emerald primary (#059669), logistics-identity color, full grid table

---

## V5_final Current Palette (for reference)
```
--bg-main: #F8F9FA
--bg-surface: #FFFFFF
--sapphire: #1D4ED8
--text-primary: #333333
--text-secondary: #6C757D
--border: #e5e7eb
Status: transit #3B82F6, unassigned #F59E0B, tendered #8B5CF6, dispatched #06B6D4, delivered #10B981, at-risk #EF4444
```
