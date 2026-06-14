import { Badge, Card, Container, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPublicEventTypes, fetchSlots } from "../api/queries";
import type { Slot } from "../api/client";
import { useApiQuery } from "../hooks/useApiQuery";
import { QueryBoundary } from "../components/QueryBoundary";
import { OwnerCard } from "../components/OwnerCard";
import { MonthCalendar } from "../components/MonthCalendar";
import { SlotStatusPanel } from "../components/SlotStatusPanel";
import { BookingModal } from "../components/BookingModal";
import { formatDateTime } from "../lib/datetime";

/** Гость: выбор слота (3 колонки) + модалка брони. */
export function SlotsPage() {
  const { eventTypeId = "" } = useParams();
  const navigate = useNavigate();

  const { data: eventTypes } = useApiQuery(fetchPublicEventTypes);
  const { data: slots, loading, error, reload } = useApiQuery(
    () => fetchSlots(eventTypeId),
    [eventTypeId],
  );

  const eventType = useMemo(
    () => eventTypes?.find((et) => et.id === eventTypeId),
    [eventTypes, eventTypeId],
  );

  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const windowEnd = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() + 14);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [now]);

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const daySlots = useMemo(() => {
    if (!selectedDate || !slots) return [];
    const key = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    return slots
      .filter((s) => s.start.startsWith(key))
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [selectedDate, slots]);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  }, []);

  const handlePrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  if (loading || error) {
    return (
      <Container size="md">
        <QueryBoundary loading={loading} error={error} empty={false} onRetry={reload}>
          <></>
        </QueryBoundary>
      </Container>
    );
  }

  return (
    <Container size="md">
      <SimpleGrid cols={{ base: 1, md: 3 }}>
        {/* Левая колонка: профиль + тип события + выбранная дата/время */}
        <Card withBorder padding="lg" radius="md">
          <Stack gap="md">
            <OwnerCard compact />
            <Divider label="Тип события" />
            {eventType ? (
              <Stack gap={4}>
                <Title order={5}>{eventType.title}</Title>
                <Badge variant="light" color="orange" w="fit-content">
                  {eventType.durationMinutes} мин
                </Badge>
                <Text size="sm" c="dimmed">
                  {eventType.description}
                </Text>
              </Stack>
            ) : (
              <Text c="dimmed">Загрузка…</Text>
            )}
            <Divider />
            <Text size="sm" fw={600}>
              Выбранная дата:
            </Text>
            <Text size="sm" c="dimmed">
              {selectedDate
                ? selectedDate.toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    weekday: "long",
                  })
                : "—"}
            </Text>
            <Text size="sm" fw={600}>
              Выбранное время:
            </Text>
            <Text size="sm" c="dimmed">
              {selectedSlot
                ? `${formatDateTime(selectedSlot.start)} – ${formatDateTime(selectedSlot.end)}`
                : "—"}
            </Text>
          </Stack>
        </Card>

        {/* Центр: месячный календарь */}
        <MonthCalendar
          slots={slots ?? []}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          windowEnd={windowEnd}
          viewMonth={viewMonth}
          viewYear={viewYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* Правая: статусы слотов */}
        <SlotStatusPanel
          slots={daySlots}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          onBack={() => navigate("/book")}
          onContinue={() => setModalOpened(true)}
        />
      </SimpleGrid>

      <BookingModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        eventType={eventType}
        slot={selectedSlot}
        onSuccess={() => {
          setModalOpened(false);
          reload();
        }}
      />
    </Container>
  );
}

function Divider({ label }: { label?: string }) {
  return (
    <div
      style={{
        borderTop: "1px solid var(--mantine-color-gray-3)",
        paddingTop: 8,
        paddingBottom: 4,
        fontSize: 12,
        color: "var(--mantine-color-gray-6)",
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  );
}
