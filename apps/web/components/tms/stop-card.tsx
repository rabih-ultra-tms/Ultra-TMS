import { StatusBadge } from "@/components/tms/primitives/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { MapPin, Calendar, Clock, Navigation } from "lucide-react"

export type StopType = "PICKUP" | "DELIVERY" | "STOP"
export type StopStatus = "PENDING" | "ARRIVED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"

export interface StopLocation {
    name?: string
    address: string
    city: string
    state: string
    zip?: string
}

export interface StopData {
    id: string
    sequence?: number
    type: StopType
    status: StopStatus
    location: StopLocation
    scheduledTime: string | Date
    actualTime?: string | Date
    instructions?: string
}

interface StopCardProps {
    stop: StopData
    compact?: boolean
    className?: string
    onClick?: () => void
}

export function StopCard({ stop, compact = false, className, onClick }: StopCardProps) {
    const isPickup = stop.type === "PICKUP"
    const isDelivery = stop.type === "DELIVERY"

    // Status Badge Logic
    const getStatusProps = (status: StopStatus) => {
        switch (status) {
            case "COMPLETED": return { status: "delivered" as const }
            case "IN_PROGRESS": return { status: "transit" as const }
            case "ARRIVED": return { intent: "info" as const }
            case "SKIPPED": return { intent: "warning" as const }
            case "PENDING":
            default: return { status: "unassigned" as const }
        }
    }

    // Type Label
    const getTypeLabel = (type: StopType) => {
        switch (type) {
            case "PICKUP": return "Pickup"
            case "DELIVERY": return "Delivery"
            default: return "Stop"
        }
    }

    return (
        <Card
            className={cn(
                "relative overflow-hidden transition-all hover:shadow-sm border-l-4",
                isPickup ? "border-l-green-500" : isDelivery ? "border-l-blue-500" : "border-l-gray-400",
                onClick && "cursor-pointer hover:bg-muted/50",
                className
            )}
            onClick={onClick}
        >
            <CardContent className={cn("p-3 space-y-2", compact ? "text-xs" : "text-sm")}>
                <div className="flex items-start justify-between">
                    <div className="font-semibold flex items-center gap-2">
                        <span className={cn(
                            "uppercase text-[10px] tracking-wider font-bold px-1.5 py-0.5 rounded-sm bg-muted",
                            isPickup ? "text-green-700 bg-green-50" : isDelivery ? "text-blue-700 bg-blue-50" : "text-gray-700 bg-gray-50"
                        )}>
                            {getTypeLabel(stop.type)} {stop.sequence && `#${stop.sequence}`}
                        </span>
                        {stop.location.name && <span>{stop.location.name}</span>}
                    </div>
                    <StatusBadge {...getStatusProps(stop.status)} size="sm">
                        {stop.status.replace("_", " ")}
                    </StatusBadge>
                </div>

                <div className="grid gap-1 text-muted-foreground">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                            {stop.location.address}, {stop.location.city}, {stop.location.state} {stop.location.zip}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {format(new Date(stop.scheduledTime), "MMM d, yyyy h:mm a")}
                        </span>
                        {stop.actualTime && (
                            <span className="text-xs text-green-600 font-medium ml-1">
                                (Actual: {format(new Date(stop.actualTime), "h:mm a")})
                            </span>
                        )}
                    </div>

                    {!compact && stop.instructions && (
                        <div className="mt-1 pt-2 border-t text-xs italic">
                            "{stop.instructions}"
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
