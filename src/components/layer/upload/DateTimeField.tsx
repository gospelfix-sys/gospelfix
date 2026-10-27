"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HOURS, MINUTES } from "@/components/layer/upload/uploadEditorUtils";

interface DateTimeFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder: string;
}

// 할인 시작일/종료일 입력 — shadcn Calendar(react-day-picker)로 날짜를, 그 아래 시/분
// Select 2개로 시간을 고른다. macOS Safari의 <input type="time">은 OS 네이티브 피커라
// CSS로 꾸밀 수 없어서 이미 스타일이 잡혀 있는 Select로 대체했다. 값은 기존
// datetime-local과 동일한 "YYYY-MM-DDTHH:mm" 문자열로 합쳐 상위에 전달하므로 제출
// 로직(handleSubmit)은 그대로 둔다.
export function DateTimeField({ value, onChange, placeholder }: DateTimeFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(value) : undefined;
  const hour = value ? value.slice(11, 13) : "";
  const minute = value ? value.slice(14, 16) : "";

  function handleSelectDate(date: Date | undefined) {
    if (!date) return;
    onChange(`${format(date, "yyyy-MM-dd")}T${hour || "00"}:${minute || "00"}`);
    setOpen(false);
  }

  function handleChangeHour(next: string | null) {
    if (!selectedDate || !next) return;
    onChange(`${format(selectedDate, "yyyy-MM-dd")}T${next}:${minute || "00"}`);
  }

  function handleChangeMinute(next: string | null) {
    if (!selectedDate || !next) return;
    onChange(`${format(selectedDate, "yyyy-MM-dd")}T${hour || "00"}:${next}`);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-input bg-gf-white px-3 text-sm outline-none transition-colors",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-[rgba(255,85,0,0.5)]",
                !selectedDate && "text-muted-foreground",
              )}
            />
          }
        >
          <span className="truncate">
            {selectedDate ? format(selectedDate, "yyyy.MM.dd (EEE)", { locale: ko }) : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 shrink-0 text-gf-gray2" />
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-2xl p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDate}
            locale={ko}
            className="bg-transparent p-3"
          />
        </PopoverContent>
      </Popover>
      <div className="flex items-center gap-1.5">
        <Select value={hour || undefined} onValueChange={handleChangeHour} disabled={!selectedDate}>
          <SelectTrigger className="h-10 w-full flex-1 rounded-xl bg-gf-white">
            <SelectValue placeholder="시" />
          </SelectTrigger>
          <SelectContent>
            {HOURS.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-gf-gray2">:</span>
        <Select
          value={minute || undefined}
          onValueChange={handleChangeMinute}
          disabled={!selectedDate}
        >
          <SelectTrigger className="h-10 w-full flex-1 rounded-xl bg-gf-white">
            <SelectValue placeholder="분" />
          </SelectTrigger>
          <SelectContent>
            {MINUTES.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
