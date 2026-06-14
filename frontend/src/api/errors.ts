import type { ApiError } from "./client";

/**
 * Человекочитаемые сообщения для машинных кодов ошибок из контракта.
 * Используется как fallback и для маппинга известных кодов.
 */
const CODE_MESSAGES: Record<string, string> = {
  slot_taken: "Это время уже занято. Выберите другой слот.",
  out_of_window: "Выбранное время вне окна записи (14 дней).",
  not_found: "Запрашиваемый ресурс не найден.",
  event_type_exists: "Тип события с таким идентификатором уже существует.",
  invalid_slug:
    "Некорректный идентификатор: только строчные латинские буквы, цифры и дефис.",
  validation_error: "Проверьте правильность заполнения полей.",
};

/** Сообщения по HTTP-статусу, когда тело ошибки отсутствует. */
const STATUS_MESSAGES: Record<number, string> = {
  400: "Некорректный запрос.",
  404: "Ресурс не найден.",
  409: "Конфликт: ресурс уже существует или занят.",
};

/**
 * Превращает ошибку контракта (Error) и/или HTTP-статус в текст для пользователя.
 */
export function describeError(
  status: number,
  body: ApiError | undefined,
): string {
  if (body?.code && CODE_MESSAGES[body.code]) {
    return CODE_MESSAGES[body.code];
  }
  if (body?.message) {
    return body.message;
  }
  return STATUS_MESSAGES[status] ?? "Произошла ошибка. Попробуйте позже.";
}
