import { test, expect } from '@playwright/test';
import { createEventType, listSlots, getAvailableSlot, createBooking, uniqueId } from '../fixtures/api';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

test.describe('Booking cancellation', () => {
  test('guest can cancel their own booking via public API', async ({ request }) => {
    const eventTypeId = uniqueId('cancel');
    const guestName = `Cancel Guest ${Date.now()}`;
    const guestEmail = `cancel-${Date.now()}@test.com`;

    await createEventType(request, {
      id: eventTypeId,
      title: 'Cancel Test Meeting',
      description: 'Meeting for cancel test',
      durationMinutes: 30,
    });

    const slots = await listSlots(request, eventTypeId);
    const availableSlot = getAvailableSlot(slots);
    expect(availableSlot).not.toBeNull();

    const bookingResp = await createBooking(request, eventTypeId, {
      start: availableSlot!.start,
      guestName,
      guestEmail,
    });
    expect(bookingResp.ok()).toBe(true);
    const booking = await bookingResp.json();

    const delResp = await request.delete(`${BACKEND_URL}/public/bookings/${booking.id}`);
    expect(delResp.ok()).toBe(true);
    const deleted = await delResp.json();
    expect(deleted.id).toBe(booking.id);
    expect(deleted.guestName).toBe(guestName);
  });

  test('admin can cancel any booking via admin API', async ({ request }) => {
    const eventTypeId = uniqueId('admin-cancel');
    const guestName = `Admin Cancel ${Date.now()}`;
    const guestEmail = `admin-cancel-${Date.now()}@test.com`;

    await createEventType(request, {
      id: eventTypeId,
      title: 'Admin Cancel Test',
      description: 'Meeting for admin cancel test',
      durationMinutes: 30,
    });

    const slots = await listSlots(request, eventTypeId);
    const availableSlot = getAvailableSlot(slots);
    expect(availableSlot).not.toBeNull();

    const bookingResp = await createBooking(request, eventTypeId, {
      start: availableSlot!.start,
      guestName,
      guestEmail,
    });
    expect(bookingResp.ok()).toBe(true);
    const booking = await bookingResp.json();

    const delResp = await request.delete(`${BACKEND_URL}/admin/bookings/${booking.id}`);
    expect(delResp.ok()).toBe(true);
    const deleted = await delResp.json();
    expect(deleted.id).toBe(booking.id);
  });

  test('returns 404 when cancelling non-existent booking', async ({ request }) => {
    const delResp = await request.delete(`${BACKEND_URL}/public/bookings/non-existent-id`);
    expect(delResp.status()).toBe(404);
  });
});
