.PHONY: dev lint build build-github lint-fix preview ci

dev:
	npm run dev

lint:
	npm run lint

lint-fix:
	npm run lint:fix

build:
	npm run build

build-github:
	npm run build:github

preview:
	npm run preview

ci: lint build
