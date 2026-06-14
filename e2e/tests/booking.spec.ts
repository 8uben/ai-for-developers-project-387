import { test, expect } from '@playwright/test';
import { createEventType, listSlots, getAvailableSlot, uniqueId } from '../fixtures/api';

test.describe('Guest booking flow', () => {
  test('should complete full booking path: view events -> select slot -> book', async ({ page, request }) => {
    const eventTypeId = uniqueId('booking');
    const eventTitle = `Booking Test ${Date.now()}`;

    await createEventType(request, {
      id: eventTypeId,
      title: eventTitle,
      description: 'Meeting for E2E booking test',
      durationMinutes: 30,
    });

    await page.goto('/book');
    await expect(page.getByText('Выберите тип события')).toBeVisible();
    await expect(page.getByText(eventTitle).first()).toBeVisible();

    await page.getByText(eventTitle).first().click();
    await expect(page).toHaveURL(new RegExp(`/book/${eventTypeId}`));

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const slots = await listSlots(request, eventTypeId, timezone);
    const availableSlot = getAvailableSlot(slots);
    expect(availableSlot).not.toBeNull();

    const slotDate = new Date(availableSlot!.start);
    const dayNumber = slotDate.getDate();

    const dayButtons = page.getByRole('button', { name: String(dayNumber) });
    const clickableDay = dayButtons.first();
    await clickableDay.click();

    await page.waitForTimeout(500);

    const slotRow = page.locator('text="Свободно"').first();
    await slotRow.click();

    await page.waitForTimeout(300);

    const continueBtn = page.getByRole('button', { name: 'Продолжить' });
    await expect(continueBtn).toBeEnabled({ timeout: 5000 });
    await continueBtn.click();

    await expect(page.getByText('Подтверждение записи')).toBeVisible();

    await page.getByLabel('Имя').fill('E2E Guest');
    await page.getByLabel('Email').fill('e2e-guest@test.com');

    await page.getByRole('button', { name: 'Записаться' }).click();

    await expect(page.getByText('Вы записаны!')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Запись создана')).toBeVisible();
  });
});
