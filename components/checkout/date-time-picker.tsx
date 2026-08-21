"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  /** Form field name for the date; submitted as yyyy-MM-dd. */
  dateName: string;
  dateLabel?: string;
  /** Omit to render a date-only picker. */
  timeName?: string;
  timeLabel?: string;
  defaultTime?: string;
};

export function DateTimePicker({
  dateName,
  dateLabel = "Preferred date",
  timeName,
  timeLabel = "Preferred time",
  defaultTime = "10:30",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  // The visible trigger is a button, so the value reaches FormData via a hidden input.
  return (
    <FieldGroup className="flex-row flex-wrap gap-4">
      <Field className="w-auto">
        <FieldLabel htmlFor={dateName} className="font-semibold">
          {dateLabel}
        </FieldLabel>
        <input
          type="hidden"
          name={dateName}
          value={date ? format(date, "yyyy-MM-dd") : ""}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                id={dateName}
                className="h-12 w-44 justify-between font-normal"
              >
                {date ? format(date, "PPP") : "Select date"}
                <ChevronDownIcon data-icon="inline-end" />
              </Button>
            }
          />
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              defaultMonth={date}
              disabled={{ before: new Date() }}
              onSelect={(next) => {
                setDate(next);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </Field>

      {timeName ? (
        <Field className="w-36">
          <FieldLabel htmlFor={timeName} className="font-semibold">
            {timeLabel}
          </FieldLabel>
          <Input
            type="time"
            id={timeName}
            name={timeName}
            step="60"
            defaultValue={defaultTime}
            className="h-12 appearance-none bg-card [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </Field>
      ) : null}
    </FieldGroup>
  );
}
