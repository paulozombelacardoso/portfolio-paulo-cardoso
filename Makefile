.PHONY: all dev build preview lint test seed db

all: build

dev:
	@npm run dev

build:
	@npm run build

preview:
	@npm run preview

lint:
	@npm run lint

test:
	@npm run test

seed:
	@npm run seed

db:
	@npx tsx server/db.ts

migrate: db