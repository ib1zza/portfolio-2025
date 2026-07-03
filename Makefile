PACKAGE_MANAGER := yarn

.PHONY: dev lint build build-github lint-fix preview ci install test coverage storybook build-storybook

dev: install
	$(PACKAGE_MANAGER) dev

install:
	$(PACKAGE_MANAGER) install

lint:
	$(PACKAGE_MANAGER) lint

lint-fix:
	$(PACKAGE_MANAGER) lint:fix

build:
	$(PACKAGE_MANAGER) build

build-github:
	$(PACKAGE_MANAGER) build:github

preview:
	$(PACKAGE_MANAGER) preview

test:
	$(PACKAGE_MANAGER) test

coverage:
	$(PACKAGE_MANAGER) coverage

storybook:
	$(PACKAGE_MANAGER) storybook

build-storybook:
	$(PACKAGE_MANAGER) build-storybook

ci: lint build