import "@typespec/http";
import "@typespec/openapi";

using Http;
using OpenAPI;

/**
 * «Запись на звонок» — упрощённый сервис бронирования времени по мотивам Cal.com.
 *
 * Роли (без регистрации и авторизации):
 *   - Владелец календаря: один заранее заданный профиль (Owner). Управляет типами
 *     событий и просматривает предстоящие встречи. Операции под префиксом /admin.
 *   - Гость: записывается на свободный слот без аккаунта. Операции под префиксом /public.
 *
 * Базовые правила поведения (фиксируются контрактом):
 *   1. Рабочее окно владельца и шаг сетки слотов определяются на стороне сервера.
 *      Шаг сетки слотов равен длительности выбранного типа события (durationMinutes).
 *   2. Окно записи — 14 дней, начиная с текущей даты.
 *   3. Глобальная занятость: на одно и то же время нельзя создать две записи,
 *      даже если это разные типы событий (нарушение → 409 Conflict).
 *   4. Всё время передаётся в UTC (ISO 8601, utcDateTime).
 */
@service({ title: "Запись на звонок" })
@info({ version: "1.0.0" })
namespace CallBooking;

// ============================================================================
// Доменные модели
// ============================================================================

/**
 * Владелец календаря — единственный заранее заданный профиль.
 * Используется по умолчанию в админской части. Read-only.
 */
model Owner {
  /** Отображаемое имя владельца. */
  name: string;

  /** Контактный email владельца (необязательно). */
  email?: string;
}

/**
 * Человекочитаемый идентификатор типа события (slug).
 * Задаётся владельцем, должен быть уникальным, используется в публичных URL
 * (напр. /public/event-types/30min/slots). Только строчные латинские буквы,
 * цифры и дефис. Пример: "30min".
 */
@minLength(1)
@maxLength(64)
@pattern("^[a-z0-9-]+$")
scalar EventTypeId extends string;

/**
 * Тип события — шаблон встречи, который публикует владелец.
 * Длительность задаёт шаг сетки доступных слотов для этого типа.
 */
model EventType {
  /** Человекочитаемый идентификатор (slug), заданный владельцем. Уникален. */
  id: EventTypeId;

  /** Название типа события. */
  title: string;

  /** Описание типа события. */
  description: string;

  /** Длительность встречи в минутах. Определяет шаг сетки слотов. */
  @minValue(1)
  durationMinutes: int32;
}

/**
 * Данные для создания типа события.
 * id — человекочитаемый идентификатор (slug), задаёт владелец; используется
 * в публичных URL и должен быть уникальным (дубль → 409 Conflict).
 */
model EventTypeCreate {
  /** Человекочитаемый идентификатор (slug), задаёт владелец. */
  id: EventTypeId;

  title: string;
  description: string;

  @minValue(1)
  durationMinutes: int32;
}

/**
 * Слот — производная сущность, не хранится в БД.
 * Формируется из рабочего окна владельца и длительности типа события
 * в пределах окна записи (14 дней от текущей даты).
 */
model Slot {
  /** Начало слота (UTC). */
  start: utcDateTime;

  /** Конец слота (UTC) = start + durationMinutes. */
  end: utcDateTime;

  /** Свободен ли слот (false, если уже занят любым бронированием). */
  available: boolean;
}

/**
 * Бронирование — запись гостя на конкретный слот.
 */
model Booking {
  /** Уникальный идентификатор брони (UUID). */
  @visibility(Lifecycle.Read)
  id: string;

  /** Идентификатор типа события (slug), к которому относится бронь. */
  eventTypeId: EventTypeId;

  /** Начало встречи (UTC). */
  start: utcDateTime;

  /** Конец встречи (UTC) = start + durationMinutes типа события. */
  end: utcDateTime;

  /** Имя гостя. */
  guestName: string;

  /** Email гостя. */
  guestEmail: string;

  /** Момент создания брони (UTC). */
  @visibility(Lifecycle.Read)
  createdAt: utcDateTime;
}

/** Данные для создания бронирования. Гость указывает слот и контактные данные. */
model BookingCreate {
  /** Начало выбранного свободного слота (UTC). */
  start: utcDateTime;

  /** Имя гостя. */
  guestName: string;

  /** Email гостя. */
  guestEmail: string;
}

/** Единая модель ошибки для всех 4xx-ответов. */
@error
model Error {
  /** Машиночитаемый код ошибки, напр. "slot_taken", "out_of_window", "not_found". */
  code: string;

  /** Человекочитаемое сообщение. */
  message: string;
}

// ============================================================================
// Операции владельца — /admin
// (без аутентификации; используется профиль владельца по умолчанию)
// ============================================================================

@route("/admin")
@tag("admin")
namespace Admin {
  /**
   * Создать тип события.
   * Владелец публикует новый шаблон встречи и задаёт его id (slug).
   *
   * Ошибки:
   *   - 400 Bad Request: невалидные данные (в т.ч. некорректный формат slug).
   *   - 409 Conflict: тип события с таким id (slug) уже существует.
   */
  @route("/event-types")
  @post
  op createEventType(@body body: EventTypeCreate):
    | {
        @statusCode statusCode: 201;
        @body eventType: EventType;
      }
    | {
        @statusCode statusCode: 400;
        @body error: Error;
      }
    | {
        @statusCode statusCode: 409;
        @body error: Error;
      };

  /**
   * Список типов событий, опубликованных владельцем.
   */
  @route("/event-types")
  @get
  op listEventTypes(): EventType[];

  /**
   * Список предстоящих встреч.
   * В одном списке показаны бронирования всех типов событий,
   * отсортированные по времени начала.
   */
  @route("/bookings")
  @get
  op listBookings(): Booking[];
}

// ============================================================================
// Операции гостя — /public
// ============================================================================

@route("/public")
@tag("public")
namespace Public {
  /**
   * Список видов брони, доступных гостю.
   * Возвращает название, описание и длительность.
   */
  @route("/event-types")
  @get
  op listEventTypes(): EventType[];

  /**
   * Свободные слоты для выбранного типа события.
   *
   * Слоты формируются на 14 дней, начиная с текущей даты, с шагом, равным
   * durationMinutes типа события. Занятые любым бронированием слоты
   * помечаются available: false (или исключаются — см. реализацию).
   */
  @route("/event-types/{eventTypeId}/slots")
  @get
  op listSlots(
    /** Идентификатор типа события (slug), напр. "30min". */
    @path eventTypeId: EventTypeId,
  ):
    | {
        @statusCode statusCode: 200;
        @body slots: Slot[];
      }
    | {
        @statusCode statusCode: 404;
        @body error: Error;
      };

  /**
   * Создать бронирование на выбранный слот.
   *
   * Ошибки:
   *   - 409 Conflict: слот уже занят (глобальная занятость по времени,
   *     даже если бронь была на другой тип события).
   *   - 400 Bad Request: слот вне окна записи (14 дней) либо не лежит
   *     на сетке слотов / невалидные данные.
   *   - 404 Not Found: тип события не найден.
   */
  @route("/event-types/{eventTypeId}/bookings")
  @post
  op createBooking(
    /** Идентификатор типа события (slug), напр. "30min". */
    @path eventTypeId: EventTypeId,

    @body body: BookingCreate,
  ):
    | {
        @statusCode statusCode: 201;
        @body booking: Booking;
      }
    | {
        @statusCode statusCode: 400;
        @body error: Error;
      }
    | {
        @statusCode statusCode: 404;
        @body error: Error;
      }
    | {
        @statusCode statusCode: 409;
        @body error: Error;
      };
}

// ============================================================================
// Трассировка сценариев → операции (проверка покрытия)
// ============================================================================
//
// Владелец календаря:
//   - Создаёт типы событий (id-slug, название, описание, длительность)
//       → Admin.createEventType (POST /admin/event-types)
//   - Просматривает страницу предстоящих встреч (все типы в одном списке)
//       → Admin.listBookings (GET /admin/bookings)
//   [вспомогательно] видит свои типы событий
//       → Admin.listEventTypes (GET /admin/event-types)
//
// Гость:
//   - Смотрит страницу с видами брони (название, описание, длительность)
//       → Public.listEventTypes (GET /public/event-types)
//   - Выбирает тип события, открывает календарь, видит свободные слоты на 14 дней
//       → Public.listSlots (GET /public/event-types/{eventTypeId}/slots)
//   - Создаёт бронирование на выбранный слот
//       → Public.createBooking (POST /public/event-types/{eventTypeId}/bookings)
//
// Инварианты:
//   - Уникальность id (slug) типа события → 409 в Admin.createEventType
//   - Глобальная занятость по времени     → 409 в Public.createBooking
//   - Окно записи 14 дней                 → 400 (out_of_window) в Public.createBooking
//   - Время в UTC                         → utcDateTime во всех моделях
// ============================================================================
