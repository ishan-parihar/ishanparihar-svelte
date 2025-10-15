"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, X } from "lucide-react";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range?: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [fromDate, setFromDate] = useState(
    value?.from ? value.from.toISOString().split("T")[0] : "",
  );
  const [toDate, setToDate] = useState(
    value?.to ? value.to.toISOString().split("T")[0] : "",
  );

  const handleFromDateChange = (dateString: string) => {
    setFromDate(dateString);
    if (dateString && toDate) {
      onChange({
        from: new Date(dateString),
        to: new Date(toDate),
      });
    } else if (!dateString && !toDate) {
      onChange(undefined);
    }
  };

  const handleToDateChange = (dateString: string) => {
    setToDate(dateString);
    if (fromDate && dateString) {
      onChange({
        from: new Date(fromDate),
        to: new Date(dateString),
      });
    } else if (!fromDate && !dateString) {
      onChange(undefined);
    }
  };

  const clearDateRange = () => {
    setFromDate("");
    setToDate("");
    onChange(undefined);
  };

  const setPresetRange = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);

    setFromDate(from.toISOString().split("T")[0]);
    setToDate(to.toISOString().split("T")[0]);
    onChange({ from, to });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Date Range</span>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearDateRange}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">From Date</label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
            max={toDate || undefined}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">To Date</label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => handleToDateChange(e.target.value)}
            min={fromDate || undefined}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Quick Presets</span>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPresetRange(1)}
            className="text-xs"
          >
            Last 24 hours
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPresetRange(7)}
            className="text-xs"
          >
            Last 7 days
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPresetRange(30)}
            className="text-xs"
          >
            Last 30 days
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPresetRange(90)}
            className="text-xs"
          >
            Last 3 months
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              const startOfMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                1,
              );
              setFromDate(startOfMonth.toISOString().split("T")[0]);
              setToDate(now.toISOString().split("T")[0]);
              onChange({ from: startOfMonth, to: now });
            }}
            className="text-xs"
          >
            This month
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              const lastMonth = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1,
              );
              const endOfLastMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                0,
              );
              setFromDate(lastMonth.toISOString().split("T")[0]);
              setToDate(endOfLastMonth.toISOString().split("T")[0]);
              onChange({ from: lastMonth, to: endOfLastMonth });
            }}
            className="text-xs"
          >
            Last month
          </Button>
        </div>
      </div>

      {value && (
        <div className="text-sm text-muted-foreground">
          Selected range: {value.from.toLocaleDateString()} -{" "}
          {value.to.toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
