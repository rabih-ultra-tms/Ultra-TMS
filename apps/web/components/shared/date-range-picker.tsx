"use client"

import * as React from "react"
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
    className?: string
    date?: DateRange
    onDateChange?: (date: DateRange | undefined) => void
    placeholder?: string
    align?: "start" | "center" | "end"
}

export function DateRangePicker({
    className,
    date,
    onDateChange,
    placeholder = "Pick a date range",
    align = "start",
}: DateRangePickerProps) {
    const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(date)
    const [isOpen, setIsOpen] = React.useState(false)

    // Sync internal state with prop if controlled
    React.useEffect(() => {
        setInternalDate(date)
    }, [date])

    const handleSelect = (newDate: DateRange | undefined) => {
        setInternalDate(newDate)
        if (onDateChange) {
            onDateChange(newDate)
        }
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        setInternalDate(undefined)
        if (onDateChange) {
            onDateChange(undefined)
        }
    }

    const presets = [
        {
            label: "Today",
            getValue: () => ({ from: new Date(), to: new Date() }),
        },
        {
            label: "Last 7 days",
            getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }),
        },
        {
            label: "Last 30 days",
            getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }),
        },
        {
            label: "This Month",
            getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
        },
        {
            label: "Last Month",
            getValue: () => {
                const lastMonth = subMonths(new Date(), 1)
                return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
            },
        },
    ]

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>{placeholder}</span>
                        )}
                        {date?.from && (
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={handleClear}
                                className="ml-auto hover:bg-muted rounded-sm p-1"
                            >
                                <X className="h-3 w-3 opacity-50 hover:opacity-100" />
                            </div>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align={align}>
                    <div className="flex">
                        <div className="border-r p-2 space-y-1 w-[140px]">
                            <p className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">Presets</p>
                            {presets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start font-normal h-8 px-2"
                                    onClick={() => {
                                        const range = preset.getValue()
                                        handleSelect(range)
                                        setIsOpen(false)
                                    }}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                            <div className="my-1 border-b" />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start font-normal h-8 px-2 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    handleSelect(undefined)
                                    setIsOpen(false)
                                }}
                            >
                                Clear Range
                            </Button>
                        </div>
                        <div className="p-2">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={internalDate?.from}
                                selected={internalDate}
                                onSelect={handleSelect}
                                numberOfMonths={2}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
