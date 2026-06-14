import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  
} from "@mantine/core";
import { useState } from "react";
import { createBooking } from "../api/queries";
import type { Booking, EventType, Slot } from "../api/client";
import { formatDateTime } from "../lib/datetime";

interface BookingModalProps {
  opened: boolean;
  onClose: () => void;
  eventType: EventType | undefined;
  slot: Slot | null | undefined;
  onSuccess: (booking: Booking) => void;
}

/** Модалка подтверждения брони: форма имя/email. Обработка 400/404/409. */
export function BookingModal({
  opened,
  onClose,
  eventType,
  slot,
}: BookingModalProps) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<Booking | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot || !eventType) return;

    setSubmitting(true);
    setError(undefined);

    const result = await createBooking(eventType.id, {
      start: slot.start,
      guestName,
      guestEmail,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(result.data!);
  };

  const handleClose = () => {
    setGuestName("");
    setGuestEmail("");
    setError(undefined);
    setSuccess(null);
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        success ? "Вы записаны!" : "Подтверждение записи"
      }
      centered
    >
      {success ? (
        <Stack>
          <Alert color="green" title="Запись создана">
            Мы зарезервировали выбранное время.
          </Alert>
          <Text size="sm">
            Тип: <b>{eventType?.title}</b>
          </Text>
          <Text size="sm">
            Время: <b>{formatDateTime(success.start)}</b>
          </Text>
          <Text size="sm">
            Гость: <b>{success.guestName}</b> ({success.guestEmail})
          </Text>
          <Button color="orange" onClick={handleClose}>
            Закрыть
          </Button>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack>
            {eventType && slot && (
              <>
                <Text size="sm" c="dimmed">
                  Тип события: <b>{eventType.title}</b> ({eventType.durationMinutes} мин)
                </Text>
                <Text size="sm" c="dimmed">
                  Время: <b>{formatDateTime(slot.start)}</b>
                </Text>
              </>
            )}

            {error && (
              <Alert color="red" title="Не удалось записаться">
                {error}
              </Alert>
            )}

            <TextInput
              label="Имя"
              placeholder="Как к вам обращаться"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.currentTarget.value)}
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.currentTarget.value)}
            />
            <Group justify="flex-end" mt="sm">
              <Button variant="light" onClick={handleClose}>
                Отмена
              </Button>
              <Button type="submit" color="orange" loading={submitting}>
                Записаться
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}