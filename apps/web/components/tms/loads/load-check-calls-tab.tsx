'use client';

import { CheckCallTimeline } from '@/components/tms/checkcalls/check-call-timeline';
import { CheckCallForm } from '@/components/tms/checkcalls/check-call-form';

interface LoadCheckCallsTabProps {
  loadId: string;
}

export function LoadCheckCallsTab({ loadId }: LoadCheckCallsTabProps) {
  return (
    <div className="space-y-6">
      <CheckCallForm loadId={loadId} />
      <CheckCallTimeline loadId={loadId} />
    </div>
  );
}
