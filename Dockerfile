# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Production image for Rails API + static frontend
FROM ruby:3.4-slim

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential libpq-dev libyaml-dev pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

WORKDIR /rails

COPY backend/Gemfile backend/Gemfile.lock ./
RUN bundle config set without 'development test' && bundle install

COPY backend/ ./

COPY --from=frontend-builder /app/dist /rails/public

RUN chmod +x bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./bin/docker-entrypoint.sh"]

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
