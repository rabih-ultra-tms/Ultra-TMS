import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ORDER_STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-gray-50 text-gray-700 border-gray-200',
    QUOTED: 'bg-blue-50 text-blue-700 border-blue-200',
    BOOKED: 'bg-green-50 text-green-700 border-green-200',
    DISPATCHED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    IN_TRANSIT: 'bg-purple-50 text-purple-700 border-purple-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    INVOICED: 'bg-amber-50 text-amber-700 border-amber-200',
    COMPLETED: 'bg-teal-50 text-teal-700 border-teal-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    ON_HOLD: 'bg-orange-50 text-orange-700 border-orange-200',
};

const POSTING_STATUS_STYLES: Record<string, string> = {
    DRAFT: 'bg-gray-50 text-gray-700 border-gray-200',
    POSTED: 'bg-green-50 text-green-700 border-green-200',
    RESPONDED: 'bg-blue-50 text-blue-700 border-blue-200',
    COVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    EXPIRED: 'bg-orange-50 text-orange-700 border-orange-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

interface StatusBadgeProps {
    status: string;
    type: 'order' | 'posting';
    className?: string;
}

/**
 * Generic status badge for orders and load board postings.
 * For load-specific statuses, use LoadStatusBadge from components/tms/loads/.
 */
export function StatusBadge({ status, type, className }: StatusBadgeProps) {
    const styles =
        type === 'order'
            ? ORDER_STATUS_STYLES[status]
            : POSTING_STATUS_STYLES[status];

    const label = status.replace(/_/g, ' ');

    return (
        <Badge variant="outline" className={cn(styles, 'font-medium', className)}>
            {label}
        </Badge>
    );
}
