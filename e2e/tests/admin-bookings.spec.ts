import { test, expect } from '@playwright/test';
import { createEventType, createBooking, listSlots, getAvailableSlot, uniqueId } from '../fixtures/api';

test.describe('Admin bookings page', () => {
  test('should show all bookings in a single list', async ({ page, request }) => {
    const eventTypeId = uniqueId('admin');
    const guestName = `Admin Guest ${Date.now()}`;
    const guestEmail = `admin-${Date.now()}@test.com`;

    await createEventType(request, {
      id: eventTypeId,
      title: 'Admin Test Meeting',
      description: 'Meeting for admin test',
      durationMinutes: 30,
    });

    const slots = await listSlots(request, eventTypeId);
    const availableSlot = getAvailableSlot(slots);
    expect(availableSlot).not.toBeNull();

    const booking = await createBooking(request, eventTypeId, {
      start: availableSlot!.start,
      guestName,
      guestEmail,
    });
    expect(booking.ok()).toBe(true);

    await page.goto('/admin/bookings');
    await expect(page.getByText('Предстоящие встречи')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(guestName).first()).toBeVisible();
    await expect(page.getByText(guestEmail).first()).toBeVisible();
    await expect(page.getByText(eventTypeId).first()).toBeVisible();
  });
});
