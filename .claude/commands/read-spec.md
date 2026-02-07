Read a design spec and extract a structured implementation brief. Screen reference: $ARGUMENTS

## Instructions

### Step 1: Find the Design Spec

1. **Parse the arguments**: The user provides a screen reference like:
   - Full path: `04-tms-core/08-dispatch-board`
   - Screen name: `dispatch board` or `carrier list`
   - Service name: `tms` or `carrier`

2. **Search for the spec file** in `dev_docs/12-Rabih-design-Process/`:
   - If full path given, read directly: `dev_docs/12-Rabih-design-Process/{path}.md`
   - If screen name given, search all subdirectories for a matching filename
   - If service name given, list all files in that service folder and let user pick
   - If not found, check if it's a placeholder file and note that

3. **Read the spec file** completely.

### Step 2: Determine Spec Quality

4. **Check if this is a detailed spec or placeholder**:
   - **Detailed spec** (15 sections): Has ASCII wireframes, data fields, component inventory, status states, role matrix, API endpoints, WebSocket events, Stitch prompts
   - **Placeholder** (minimal): Has screen type, description, dependencies only
   - Report which type it is

### Step 3: Extract Implementation Brief

5. For **detailed specs**, extract and present:

```
## Implementation Brief: [Screen Name]

### Overview
- **Screen type:** [list / detail / form / dashboard / modal / etc.]
- **Service:** [service name]
- **Wave:** [1-7]
- **Build status:** [not built / partial / enhancement needed]

### Data Fields
[Table of all fields with: name, type, required?, source table]

### Components Needed
| Component | Source | Status |
|-----------|--------|--------|
| [name]    | shadcn/ui or custom | exists / needs building |

### Status States
[State machine: which statuses exist, transitions between them, who can trigger each]

### Role Access Matrix
| Role | Can View | Can Create | Can Edit | Can Delete | Special |
|------|----------|------------|----------|------------|---------|
| [role] | Y/N | Y/N | Y/N | Y/N | [notes] |

### API Endpoints Required
| Method | Path | Purpose | Auth Roles |
|--------|------|---------|------------|
| GET | /api/v1/... | List | ADMIN, ... |

### Real-Time Features
[WebSocket events needed, if any]

### Key UX Notes
[Important design decisions, interactions, edge cases from the spec]

### Stitch Prompt
[The copy-paste prompt for stitch.withgoogle.com, if present in the spec]
```

6. For **placeholder specs**, extract what's available and note:
```
## Implementation Brief: [Screen Name] (PLACEHOLDER)

### Available Info
- Screen type: [type]
- Description: [description]
- Dependencies: [list]

### Missing (needs spec upgrade)
- No wireframes
- No data field mapping
- No component inventory
- No role matrix
- No API endpoints defined

### Recommendation
Run the placeholder upgrade process from `dev_docs/12-Rabih-design-Process/_continuation-guide/continue-placeholder-upgrades.md` to create a full spec before building this screen.
```

### Step 4: Cross-Reference

7. **Check the contract registry** at `dev_docs/09-contracts/76-screen-api-contract-registry.md` for this screen's build status (DB, API, FE, INT, VER).

8. **Check existing code** to see if any part of this screen is already built:
   - Backend: `apps/api/src/modules/`
   - Frontend: `apps/web/app/(dashboard)/`

### Step 5: Suggest Next Steps

9. Based on what exists vs what's needed, suggest:
   - "Spec is detailed and ready. Use `/preflight` to verify readiness, then `/scaffold-api` and `/scaffold-screen` to build."
   - "Spec is a placeholder. Upgrade the spec first before building."
   - "Backend exists but frontend is missing. Use `/scaffold-screen` to generate the page."
   - etc.
