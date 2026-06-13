PACKAGE_MANAGER := yarn

.PHONY: dev lint build build-github lint-fix preview ci install

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

ci: lint build