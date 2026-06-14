import { useMemo } from "react";
import { Paper, Text, UnstyledButton } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { Slot } from "../api/client";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const GRID_COLS = "repeat(7, 1fr)";

interface DayInfo {
  date: Date;
  freeCount: number;
  inWindow: boolean;
}

interface MonthCalendarProps {
  slots: Slot[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  windowEnd: Date;
  viewMonth: number;
  viewYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function startOfMonthDow(year: number, month: number): number {
  const dow = new Date(year, month, 1).getDay();
  return dow === 0 ? 6 : dow - 1;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatMonthRu(year: number, month: number): string {
  const months = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ];
  return `${months[month]} ${year}`;
}

export function MonthCalendar({
  slots,
  selectedDate,
  onSelectDate,
  windowEnd,
  viewMonth,
  viewYear,
  onPrevMonth,
  onNextMonth,
}: MonthCalendarProps) {
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = startOfMonthDow(viewYear, viewMonth);

  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dayInfos = useMemo(() => {
    const map = new Map<string, { free: number }>();
    for (const s of slots) {
      const key = s.start.slice(0, 10);
      const info = map.get(key) ?? { free: 0 };
      if (s.available) info.free += 1;
      map.set(key, info);
    }

    const result: (DayInfo | null)[] = [];
    for (let i = 0; i < firstDow; i++) result.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      date.setHours(0, 0, 0, 0);
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const info = map.get(key);
      const inWindow = date >= now && date <= windowEnd;
      result.push({
        date,
        freeCount: info?.free ?? 0,
        inWindow,
      });
    }

    return result;
  }, [slots, viewYear, viewMonth, daysInMonth, firstDow, now, windowEnd]);

  const canGoPrev =
    viewYear > now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth > now.getMonth());
  const canGoNext = (() => {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    return new Date(nextYear, nextMonth, 1) <= windowEnd;
  })();

  const rows: (DayInfo | null)[][] = [];
  let row: (DayInfo | null)[] = [];
  for (const di of dayInfos) {
    row.push(di);
    if (row.length === 7) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length > 0) {
    while (row.length < 7) row.push(null);
    rows.push(row);
  }

  return (
    <Paper withBorder p="md" radius="md">
      {/* Навигация по месяцам */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <UnstyledButton
          onClick={canGoPrev ? onPrevMonth : undefined}
          style={{ opacity: canGoPrev ? 1 : 0.35, cursor: canGoPrev ? "pointer" : "default" }}
        >
          <IconChevronLeft size={20} />
        </UnstyledButton>
        <Text fw={600}>{formatMonthRu(viewYear, viewMonth)}</Text>
        <UnstyledButton
          onClick={canGoNext ? onNextMonth : undefined}
          style={{ opacity: canGoNext ? 1 : 0.35, cursor: canGoNext ? "pointer" : "default" }}
        >
          <IconChevronRight size={20} />
        </UnstyledButton>
      </div>

      {/* Заголовок недели */}
      <div style={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: 2, marginBottom: 2 }}>
        {WEEKDAYS.map((wd) => (
          <Text key={wd} size="xs" c="dimmed" fw={600} ta="center">
            {wd}
          </Text>
        ))}
      </div>

      {/* Сетка дней */}
      <div style={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: 2 }}>
        {rows.flat().map((di, idx) => {
          if (di === null) {
            return <div key={`empty-${idx}`} />;
          }

          const isSelected = selectedDate !== null && isSameDay(di.date, selectedDate);
          const clickable = di.inWindow;

          return (
            <UnstyledButton
              key={idx}
              onClick={clickable ? () => onSelectDate(di.date) : undefined}
              style={{
                padding: 4,
                borderRadius: 6,
                background: isSelected
                  ? "var(--mantine-color-orange-6)"
                  : clickable
                    ? "var(--mantine-color-gray-1)"
                    : "transparent",
                cursor: clickable ? "pointer" : "default",
                opacity: clickable ? 1 : 0.35,
                pointerEvents: clickable ? "auto" : "none",
                textAlign: "center",
              }}
            >
              <Text
                size="sm"
                fw={isSelected ? 700 : 400}
                c={isSelected ? "white" : "dark"}
              >
                {di.date.getDate()}
              </Text>
              {clickable && (
                <Text
                  size="xs"
                  c={di.freeCount > 0 ? "orange" : "dimmed"}
                  lh={1.1}
                >
                  {di.freeCount} св.
                </Text>
              )}
            </UnstyledButton>
          );
        })}
      </div>
    </Paper>
  );
}