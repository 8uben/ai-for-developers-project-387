/**
 * Утилиты форматирования времени. Контракт оперирует UTC ISO 8601 (utcDateTime),
 * поэтому на вход приходят ISO-строки; отображаем в локали пользователя.
 */

const dayKeyFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
  day: "2-digit",
  month: "long",
});

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

/** Ключ дня для группировки слотов (по локальной дате). */
export function dayKey(iso: string): string {
  return dayKeyFormatter.format(new Date(iso));
}

/** Время начала слота, напр. "09:30". */
export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

/** Дата и время, напр. "10 июня, 09:30". */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}
