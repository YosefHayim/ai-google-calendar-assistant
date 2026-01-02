"use client";

import * as React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: React.HTMLAttributes<HTMLDivElement> & {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}) {
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(date);
  const [isOpen, setIsOpen] = React.useState(false);

  // Update internal state when external date changes
  React.useEffect(() => {
    setInternalDate(date);
  }, [date]);

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setInternalDate(selectedDate);
    // Don't call setDate here - wait for Apply button
  };

  const handleApply = () => {
    if (internalDate?.from && internalDate?.to) {
      setDate(internalDate);
      setIsOpen(false);
      toast.success("Date range applied", { duration: 2000 });
    } else {
      toast.error("Please select both start and end dates");
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button id="date" variant={"outline"} className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={internalDate?.from || date?.from}
            selected={internalDate}
            onSelect={handleSelect}
            numberOfMonths={2}
            pagedNavigation
            showOutsideDays={false}
            className="rounded-lg border border-border p-2 bg-background"
            classNames={{
              months: "gap-8",
              month:
                "relative first-of-type:before:hidden before:absolute max-sm:before:inset-x-2 max-sm:before:h-px max-sm:before:-top-2 sm:before:inset-y-2 sm:before:w-px before:bg-border sm:before:-left-4",
            }}
          />
          <div className="p-3 border-t border-border flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInternalDate(date);
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleApply}
              disabled={!internalDate?.from || !internalDate?.to}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
