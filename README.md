### Hexlet tests and linter status:
[![Actions Status](https://github.com/8uben/ai-for-developers-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/8uben/ai-for-developers-project-387/actions)


# «Запись на звонок»

Это упрощенный сервис бронирования времени по мотивам Cal.com. Владелец настраивает типы событий, а гости бронируют доступные слоты.

**Деплой**: https://call-booking-4je6.onrender.com

---

## Использование

### Гость (регистрация не нужна)

1. Откройте главную страницу, нажмите **Записаться**.
2. Выберите тип события.
3. На календаре выберите доступный день.
4. Нажмите на свободный слот, затем **Продолжить**.
5. Введите имя и email, нажмите **Записаться** для подтверждения.

### Владелец (один профиль, без входа)

1. Нажмите **Админка** в правом верхнем углу.
2. На вкладке **Типы событий**:
   - Просматривайте существующие типы.
   - Создавайте новые: укажите slug (латиница, цифры, дефисы), название, описание и длительность.
3. На вкладке **Встречи** — все предстоящие бронирования.

---

## Локальный запуск

Требуется Docker и Docker Compose.

```bash
make setup    # сборка образов, создание БД, миграции, сиды
make start    # запуск backend (Rails) + frontend (Vite)
```

После запуска:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

---

## Доступные команды

| Команда | Описание |
|---|---|
| `make setup` | Сборка образов, создание БД, миграции, сиды |
| `make start` | Запуск всех сервисов |
| `make build` | Пересборка Docker-образов |
| `make bash` | Открыть bash внутри контейнера backend |
| `make test` | Запуск RSpec-тестов backend |
| `make test-e2e` | Запуск Playwright E2E-тестов |
| `make lint` | Запуск всех линтеров (RuboCop + ESLint) |

---

## Стек технологий

- **Backend**: Ruby on Rails 8.1 (API-only), SQLite3, RSpec + FactoryBot
- **Frontend**: React 19 + Vite 6 + TypeScript + Mantine UI 7
- **E2E**: Playwright
- **API-контракт**: TypeSpec → OpenAPI 3.0
- **Инфраструктура**: Docker, Render

---

## Примечание

Данный проект был полностью сгенерирован ИИ (агентом) в рамках учебного курса по работе с ИИ-агентами для разработчиков.
