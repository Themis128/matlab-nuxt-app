## Simple Makefile for local development inside the devcontainer (Linux)

.PHONY: dev
dev:
	@echo "Starting Full Stack development (Nuxt + Python API)..."
	@./scripts/shell/start.sh

.PHONY: health
health:
	@echo "Running devcontainer health check..."
	@bash ./.devcontainer/health-check.sh

.PHONY: lint
lint:
	@echo "Running Python linting (black + isort + flake8 + pylint + mypy)..."
	@cd python_api && python -m black .
	@cd python_api && python -m isort .
	@cd python_api && python -m flake8 .
	@cd python_api && python -m pylint --rcfile=../pyproject.toml .
	@cd python_api && python -m mypy .

.PHONY: lint-python
lint-python:
	@echo "Running Python linting..."
	@cd python_api && python -m pylint --rcfile=../pyproject.toml .

.PHONY: format-python
format-python:
	@echo "Formatting Python code..."
	@cd python_api && python -m black .
	@cd python_api && python -m isort .
