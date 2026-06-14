SHELL := /bin/bash

.PHONY: setup start build bash test test-e2e lint lint-backend lint-frontend

setup:
	docker compose build
	docker compose run --rm backend bin/rails db:prepare
	docker compose run --rm -e RAILS_ENV=test backend bin/rails db:prepare

start:
	docker compose up

build:
	docker compose build

bash:
	docker compose exec backend bash

test:
	docker compose run --rm backend bundle exec rspec

test-e2e:
	@echo "==> Setting up test database..."
	docker compose -f docker-compose.yml -f docker-compose.e2e.yml run --rm backend bin/rails db:prepare
	@echo "==> Starting services..."
	docker compose -f docker-compose.yml -f docker-compose.e2e.yml up -d
	@echo "==> Waiting for backend..."
	@until curl -s http://localhost:3000/public/event-types > /dev/null 2>&1; do sleep 2; done
	@echo "==> Waiting for frontend..."
	@until curl -s http://localhost:5173 > /dev/null 2>&1; do sleep 2; done
	@echo "==> Installing Playwright browsers..."
	npx playwright install chromium
	@echo "==> Running e2e tests..."
	EXIT=0; npm run e2e || EXIT=$$?; \
	echo "==> Stopping services..."; \
	docker compose -f docker-compose.yml -f docker-compose.e2e.yml down; \
	exit $$EXIT

lint: lint-backend lint-frontend

lint-backend:
	docker compose run --rm backend bin/rubocop

lint-frontend:
	docker compose run --rm frontend npm run lint
