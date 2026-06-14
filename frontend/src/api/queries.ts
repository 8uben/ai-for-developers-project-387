import { api } from "./client";
import type { Booking, BookingCreate, EventType, EventTypeCreate, Slot } from "./client";
import { describeError } from "./errors";

type Result<T> = { data: T | undefined; error: string | undefined };

function ok<T>(data: T): Result<T> {
  return { data, error: undefined };
}

function fail<T>(error: string): Result<T> {
  return { data: undefined, error };
}

// ---------- Гость (public) ----------

export async function fetchPublicEventTypes(): Promise<Result<EventType[]>> {
  const { data } = await api.GET("/public/event-types");
  if (!data) return fail("Не удалось загрузить виды брони.");
  return ok(data);
}

export async function fetchSlots(eventTypeId: string): Promise<Result<Slot[]>> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { data, error, response } = await api.GET(
    "/public/event-types/{eventTypeId}/slots",
    {
      params: {
        path: { eventTypeId },
        query: { timezone } as never,
      },
    },
  );
  if (error || !data) return fail(describeError(response.status, error));
  return ok(data);
}

export async function createBooking(
  eventTypeId: string,
  body: BookingCreate,
): Promise<Result<Booking>> {
  const { data, error, response } = await api.POST(
    "/public/event-types/{eventTypeId}/bookings",
    { params: { path: { eventTypeId } }, body },
  );
  if (error || !data) return fail(describeError(response.status, error));
  return ok(data);
}

// ---------- Владелец (admin) ----------

export async function fetchAdminEventTypes(): Promise<Result<EventType[]>> {
  const { data } = await api.GET("/admin/event-types");
  if (!data) return fail("Не удалось загрузить типы событий.");
  return ok(data);
}

export async function createEventType(
  body: EventTypeCreate,
): Promise<Result<EventType>> {
  const { data, error, response } = await api.POST("/admin/event-types", { body });
  if (error || !data) return fail(describeError(response.status, error));
  return ok(data);
}

export async function fetchAdminBookings(): Promise<Result<Booking[]>> {
  const { data } = await api.GET("/admin/bookings");
  if (!data) return fail("Не удалось загрузить список встреч.");
  return ok(data);
}
