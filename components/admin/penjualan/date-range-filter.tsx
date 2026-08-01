"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangeFilterProps {
  dateFrom?: string;
  dateTo?: string;
  onChange: (from?: string, to?: string) => void;
}

export function DateRangeFilter({ dateFrom, dateTo, onChange }: DateRangeFilterProps) {
  const [date, setDate] = React.useState<{
    from: Date | undefined
    to?: Date | undefined
  }>({
    from: dateFrom ? new Date(dateFrom) : undefined,
    to: dateTo ? new Date(dateTo) : undefined,
  })

  const [prevProps, setPrevProps] = React.useState({ dateFrom, dateTo });

  // Sync prop changes without useEffect to avoid cascading renders
  if (dateFrom !== prevProps.dateFrom || dateTo !== prevProps.dateTo) {
    setPrevProps({ dateFrom, dateTo });
    setDate({
      from: dateFrom ? new Date(dateFrom) : undefined,
      to: dateTo ? new Date(dateTo) : undefined,
    });
  }

  const handleSelect = (selectedDate: { from: Date | undefined, to?: Date | undefined } | undefined) => {
    setDate(selectedDate || { from: undefined, to: undefined });
    
    if (selectedDate?.from && selectedDate?.to) {
      // Both dates selected, apply filter
      const fromStr = format(selectedDate.from, "yyyy-MM-dd");
      const toStr = format(selectedDate.to, "yyyy-MM-dd");
      onChange(fromStr, toStr);
    } else if (!selectedDate?.from && !selectedDate?.to) {
      // Cleared
      onChange(undefined, undefined);
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate({ from: undefined, to: undefined });
    onChange(undefined, undefined);
  }

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger 
          render={
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-full lg:w-[240px] justify-start text-left font-normal h-10",
                !date.from && "text-muted-foreground"
              )}
            />
          }
        >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd MMM yyyy", { locale: id })} -{" "}
                  {format(date.to, "dd MMM yyyy", { locale: id })}
                </>
              ) : (
                format(date.from, "dd MMM yyyy", { locale: id })
              )
            ) : (
              <span>Filter Rentang Tanggal</span>
            )}
            
            {date.from && (
              <div 
                className="ml-auto p-1 hover:bg-muted rounded-full"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </div>
            )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
