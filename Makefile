.DEFAULT_GOAL := help
PORT ?= 5173

help: ## Mostra os comandos disponíveis
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-10s %s\n", $$1, $$2}'

node_modules: package.json
	npm install
	@touch node_modules

install: node_modules ## Instala as dependências

dev: node_modules ## Servidor de desenvolvimento (PORT=5173)
	npm run dev -- --host --port $(PORT)

build: node_modules ## Gera a versão de produção em dist/
	npm run build

preview: build ## Serve a build de produção localmente
	npm run preview -- --host --port $(PORT)

check: ## Verifica se os PDFs dos CVs existem
	@for f in Paulo_Cardoso_CV_FullStack_PT CV_Paulo_Cardoso_IT Paulo_Cardoso_CV; do \
		[ -f public/cv/$$f.pdf ] && echo "OK      public/cv/$$f.pdf" || echo "FALTA   public/cv/$$f.pdf"; \
	done

clean: ## Remove dist/ e node_modules/
	rm -rf dist node_modules

.PHONY: help install dev build preview check clean
