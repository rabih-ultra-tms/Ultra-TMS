# Load Planner Components

**Path:** `apps/web/components/load-planner/`

**PROTECT LIST: Load Planner is rated 9/10 (1,825 LOC in the page). DO NOT MODIFY these components.**

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| AddTruckTypeDialog | `AddTruckTypeDialog.tsx` | 190 | Dialog for adding custom truck types with dimensions |
| CargoEditDialog | `CargoEditDialog.tsx` | 276 | Dialog for editing extracted cargo item properties |
| ExtractedItemsList | `ExtractedItemsList.tsx` | 665 | AI-extracted cargo items list with edit/remove/reorder |
| LoadPlanPDFRenderer | `LoadPlanPDFRenderer.tsx` | 328 | PDF generation for load plans using react-pdf |
| LoadPlanVisualizer | `LoadPlanVisualizer.tsx` | 302 | Visual cargo placement on trailer diagram |
| PermitSummaryCard | `PermitSummaryCard.tsx` | 239 | Permit requirements summary based on cargo/route |
| PlanComparisonPanel | `PlanComparisonPanel.tsx` | 237 | Side-by-side comparison of multiple load plans |
| RouteMap | `route-map.tsx` | 316 | Google Maps route visualization with waypoints |
| RouteComparisonTab | `RouteComparisonTab.tsx` | 642 | Tab comparing route options with cost/time/distance |
| RouteIntelligence | `RouteIntelligence.tsx` | 1122 | AI-powered route intelligence with toll, fuel, weather data |
| TrailerDiagram | `TrailerDiagram.tsx` | 681 | SVG trailer cross-section with cargo placement |
| TruckSelector | `TruckSelector.tsx` | 590 | Truck/trailer type selector with dimension display |
| UniversalDropzone | `UniversalDropzone.tsx` | 346 | File dropzone for cargo documents (PDF, images, CSV) |

**Total:** 13 files, ~5,934 LOC (largest component directory)

## Usage Patterns

All components are used exclusively in `/load-planner/[id]/edit`:
1. `UniversalDropzone` - Upload cargo documents
2. `ExtractedItemsList` - AI extracts cargo items from documents
3. `CargoEditDialog` - Edit individual cargo properties
4. `TruckSelector` + `AddTruckTypeDialog` - Select truck/trailer type
5. `TrailerDiagram` + `LoadPlanVisualizer` - Visualize cargo placement
6. `RouteMap` - Display route on Google Maps
7. `RouteIntelligence` + `RouteComparisonTab` - AI route analysis
8. `PlanComparisonPanel` - Compare plan variants
9. `PermitSummaryCard` - Show required permits
10. `LoadPlanPDFRenderer` - Generate downloadable PDF

## Dependencies

- `@react-google-maps/api` (Google Maps)
- `@react-pdf/renderer` (PDF generation)
- `@/lib/hooks/load-planner/` (AI extraction, route analysis)
- `@/types/load-planner` (cargo, truck, route types)
- SVG rendering for `TrailerDiagram`
- This is the most complex component set in the app
