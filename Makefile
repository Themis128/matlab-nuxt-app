## Simple Makefile for local development inside the devcontainer (Linux)

.PHONY: dev
dev:
	@echo "Starting Full Stack development (Nuxt + Python API)..."
	@./scripts/shell/start.sh

.PHONY: health
health:
	@echo "Running devcontainer health check..."
	@bash ./.devcontainer/health-check.sh
