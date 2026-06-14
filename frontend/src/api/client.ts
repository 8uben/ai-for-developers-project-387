import createClient from "openapi-fetch";
import type { components, paths } from "./schema";

/**
 * Базовый URL отдельно запущенного бэкенда (или Prism mock-сервера).
 * Задаётся через переменную окружения сборки Vite.
 */
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

/** Типизированный HTTP-клиент, сгенерированный из контракта (OpenAPI). */
export const api = createClient<paths>({ baseUrl });

// Удобные алиасы доменных моделей из контракта.
export type EventType = components["schemas"]["EventType"];
export type EventTypeCreate = components["schemas"]["EventTypeCreate"];
export type Slot = components["schemas"]["Slot"];
export type Booking = components["schemas"]["Booking"];
export type BookingCreate = components["schemas"]["BookingCreate"];
export type ApiError = components["schemas"]["Error"];
