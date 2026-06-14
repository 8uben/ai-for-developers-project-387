import { APIRequestContext } from '@playwright/test';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

export async function createEventType(
  request: APIRequestContext,
  data: { id: string; title: string; description: string; durationMinutes: number }
) {
  const response = await request.post(`${BACKEND_URL}/admin/event-types`, {
    data,
  });
  if (!response.ok()) {
    const body = await response.json();
    throw new Error(`Failed to create event type: ${response.status()} ${JSON.stringify(body)}`);
  }
  return response.json();
}

export async function listEventTypes(request: APIRequestContext) {
  const response = await request.get(`${BACKEND_URL}/public/event-types`);
  return response.json();
}

export async function listSlots(request: APIRequestContext, eventTypeId: string, timezone?: string) {
  const params: Record<string, string> = {};
  if (timezone) params.timezone = timezone;
  const response = await request.get(`${BACKEND_URL}/public/event-types/${eventTypeId}/slots`, { params });
  return response.json();
}

export async function createBooking(
  request: APIRequestContext,
  eventTypeId: string,
  data: { start: string; guestName: string; guestEmail: string }
) {
  const response = await request.post(`${BACKEND_URL}/public/event-types/${eventTypeId}/bookings`, {
    data,
  });
  return response;
}

export async function listBookings(request: APIRequestContext) {
  const response = await request.get(`${BACKEND_URL}/admin/bookings`);
  return response.json();
}

export function getAvailableSlot(slots: Array<{ start: string; end: string; available: boolean }>) {
  return slots.find((s) => s.available) || null;
}

export function getTomorrowAtHour(hour: number): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(hour, 0, 0, 0);
  return tomorrow.toISOString();
}
