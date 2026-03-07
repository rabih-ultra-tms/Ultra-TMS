# TMS Check Calls Components

**Location:** `apps/web/components/tms/checkcalls/`
**Component count:** 3

## Components

### CheckCallForm
- **File:** `check-call-form.tsx`
- **Props:** Load ID, carrier info, onSubmit callback
- **Used by:** Load detail check calls tab
- **Description:** Form for recording a driver/carrier check call. Captures location, status update, ETA, notes, and any issues. Uses React Hook Form with Zod validation.

### CheckCallTimeline
- **File:** `check-call-timeline.tsx`
- **Props:** Check calls array, load ID
- **Used by:** Load detail check calls tab
- **Description:** Chronological timeline view of all check calls for a load. Shows timestamps, locations, statuses, and notes in a vertical timeline format.

### OverdueCheckcalls
- **File:** `overdue-checkcalls.tsx`
- **Props:** Overdue check calls list
- **Used by:** Operations dashboard, dispatch board
- **Description:** Alert panel showing loads that are overdue for a check call. Highlights time since last check and provides quick action to record a new call.
