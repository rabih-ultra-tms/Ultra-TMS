/**
 * Dispatch Board Page
 *
 * The operational nerve center of Ultra TMS. Dispatchers manage 50+ loads/day here.
 * Features real-time updates, drag-drop status management, and multi-view workspace.
 *
 * Route: /(dashboard)/operations/dispatch
 * Access: dispatcher, ops_manager, admin roles
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { DispatchBoard } from '@/components/tms/dispatch/dispatch-board';
import { DispatchBoardSkeleton } from '@/components/tms/dispatch/dispatch-board-skeleton';

export const metadata: Metadata = {
  title: 'Dispatch Board | Ultra TMS',
  description: 'Real-time load dispatch and carrier assignment',
};

export default function DispatchBoardPage() {
  return (
    <div className="flex h-full flex-col">
      <Suspense fallback={<DispatchBoardSkeleton />}>
        <DispatchBoard />
      </Suspense>
    </div>
  );
}
