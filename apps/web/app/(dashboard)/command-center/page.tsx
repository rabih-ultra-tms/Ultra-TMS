import type { Metadata } from 'next';
import { CommandCenter } from '@/components/tms/command-center/command-center';

export const metadata: Metadata = {
  title: 'Command Center | Ultra TMS',
  description:
    'Unified dispatch operations hub — loads, quotes, carriers, tracking, and alerts.',
};

export default function CommandCenterPage() {
  return <CommandCenter />;
}
