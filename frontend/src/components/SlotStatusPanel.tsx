import { Badge, Button, Group, Paper, Stack, Text } from "@mantine/core";
import type { Slot } from "../api/client";
import { formatTime } from "../lib/datetime";

interface SlotStatusPanelProps {
  slots: Slot[];
  selectedDate: Date | null;
  selectedSlot: Slot | null;
  onSelectSlot: (slot: Slot) => void;
  onBack: () => void;
  onContinue: () => void;
}

/** Правая колонка: статусы слотов выбранного дня + кнопки Назад/Продолжить. */
export function SlotStatusPanel({
  slots,
  selectedDate,
  selectedSlot,
  onSelectSlot,
  onBack,
  onContinue,
}: SlotStatusPanelProps) {
  return (
    <Paper withBorder p="md" radius="md" h="100%">
      <Stack h="100%" justify="space-between">
        <Stack gap="sm">
          <Text fw={600}>Статус слотов</Text>

          {selectedDate ? (
            <Text size="sm" c="dimmed">
              {selectedDate.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
              })}
            </Text>
          ) : (
            <Text size="sm" c="dimmed">
              Выберите день в календаре
            </Text>
          )}

          <Stack gap={4}>
            {selectedDate
              ? slots.map((slot) => {
                  const isSelected =
                    selectedSlot?.start === slot.start;
                  return (
                    <Group
                      key={slot.start}
                      wrap="nowrap"
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: isSelected
                          ? "var(--mantine-color-orange-1)"
                          : "transparent",
                        cursor: slot.available ? "pointer" : "default",
                        opacity: slot.available ? 1 : 0.5,
                      }}
                      onClick={() => slot.available && onSelectSlot(slot)}
                    >
                      <Text size="sm">
                        {formatTime(slot.start)} – {formatTime(slot.end)}
                      </Text>
                      <Badge
                        variant="light"
                        color={slot.available ? "green" : "red"}
                        size="sm"
                      >
                        {slot.available ? "Свободно" : "Занято"}
                      </Badge>
                    </Group>
                  );
                })
              : null}
          </Stack>
        </Stack>

        <Group justify="space-between" mt="md">
          <Button variant="light" onClick={onBack}>
            Назад
          </Button>
          <Button
            color="orange"
            disabled={!selectedSlot}
            onClick={onContinue}
          >
            Продолжить
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}