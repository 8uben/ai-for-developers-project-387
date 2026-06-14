import { test, expect } from '@playwright/test';
import { createEventType, listSlots, getAvailableSlot, createBooking, uniqueId } from '../fixtures/api';

test.describe('Double booking protection', () => {
  test('should prevent booking an already taken slot', async ({ page, request }) => {
    const eventTypeId = uniqueId('double');

    await createEventType(request, {
      id: eventTypeId,
      title: 'Double Booking Test',
      description: 'Test for slot conflict',
      durationMinutes: 30,
    });

    const slots = await listSlots(request, eventTypeId);
    const availableSlot = getAvailableSlot(slots);
    expect(availableSlot).not.toBeNull();

    const firstBooking = await createBooking(request, eventTypeId, {
      start: availableSlot!.start,
      guestName: 'First Guest',
      guestEmail: 'first@test.com',
    });
    expect(firstBooking.ok()).toBe(true);

    const secondBooking = await createBooking(request, eventTypeId, {
      start: availableSlot!.start,
      guestName: 'Second Guest',
      guestEmail: 'second@test.com',
    });
    expect(secondBooking.status()).toBe(409);

    const errorBody = await secondBooking.json();
    expect(errorBody.code).toBe('slot_taken');
  });

  test('should prevent booking same slot across different event types', async ({ request }) => {
    const typeA = uniqueId('type-a');
    const typeB = uniqueId('type-b');

    await createEventType(request, {
      id: typeA,
      title: 'Type A',
      description: 'First event type',
      durationMinutes: 30,
    });
    await createEventType(request, {
      id: typeB,
      title: 'Type B',
      description: 'Second event type',
      durationMinutes: 30,
    });

    const slotsA = await listSlots(request, typeA);
    const availableSlot = getAvailableSlot(slotsA);
    expect(availableSlot).not.toBeNull();

    const bookingA = await createBooking(request, typeA, {
      start: availableSlot!.start,
      guestName: 'Guest A',
      guestEmail: 'a@test.com',
    });
    expect(bookingA.ok()).toBe(true);

    const bookingB = await createBooking(request, typeB, {
      start: availableSlot!.start,
      guestName: 'Guest B',
      guestEmail: 'b@test.com',
    });
    expect(bookingB.status()).toBe(409);
  });
});
