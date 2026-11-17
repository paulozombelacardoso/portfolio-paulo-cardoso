.PHONY: all dev api start build preview lint test seed db migrate up down typecheck

all: build

# Base de dados PostgreSQL (docker compose, porta 5434)
up:
	@docker compose up -d postgres

down:
	@docker compose down

# Frontend (Vite, porta 5174) — encaminha /api para o backend
dev:
	@npm run dev

# Backend / painel admin (porta 4000) com reload automático
api:
	@npm run dev:api

start:
	@npm run start

build:
	@npm run build

preview:
	@npm run preview

typecheck:
	@npm run typecheck

lint:
	@npm run lint

test:
	@npm run test

db migrate:
	@npm run migrate

seed:
	@npm run seed
