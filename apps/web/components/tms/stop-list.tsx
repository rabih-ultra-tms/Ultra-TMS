import { cn } from "@/lib/utils"
import { StopCard, StopData } from "./stop-card"
import { Check } from "lucide-react"

interface StopListProps {
    stops: StopData[]
    compact?: boolean
    className?: string
    onStopClick?: (stop: StopData) => void
}

export function StopList({ stops, compact = false, className, onStopClick }: StopListProps) {
    return (
        <div className={cn("space-y-0", className)}>
            {stops.map((stop, index) => {
                const isLast = index === stops.length - 1
                const isPickup = stop.type === "PICKUP"
                const isDelivery = stop.type === "DELIVERY"
                const isCompleted = stop.status === "COMPLETED"

                // Determine dot color
                const dotColor = isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isPickup
                        ? "bg-background border-green-500 text-green-600"
                        : isDelivery
                            ? "bg-background border-blue-500 text-blue-600"
                            : "bg-background border-muted-foreground text-muted-foreground"

                return (
                    <div key={stop.id} className="relative pl-10 pb-6 last:pb-0 group">
                        {/* Connector Line */}
                        {!isLast && (
                            <div className="absolute left-[15px] top-8 bottom-[-8px] w-[2px] bg-border group-hover:bg-muted-foreground/50 transition-colors" />
                        )}

                        {/* Timeline Dot */}
                        <div
                            className={cn(
                                "absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors font-semibold text-xs",
                                dotColor
                            )}
                        >
                            {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                        </div>

                        {/* Card Content */}
                        <StopCard
                            stop={{ ...stop, sequence: index + 1 }} // Ensure sequence matches list order
                            compact={compact}
                            onClick={() => onStopClick?.(stop)}
                        />
                    </div>
                )
            })}
        </div>
    )
}
