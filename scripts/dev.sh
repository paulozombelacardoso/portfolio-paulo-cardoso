#!/usr/bin/env bash
# Arranca o ambiente de desenvolvimento completo com um só comando:
#   PostgreSQL (docker, porta 5434) + API/admin (porta 4000) + frontend Vite (porta 5174)
# Ctrl+C pára tudo. Se a API ou o Vite terminarem, o outro também é parado.
set -uo pipefail

cd "$(dirname "$0")/.."

bold=$'\033[1m'; dim=$'\033[2m'; red=$'\033[31m'; green=$'\033[32m'; blue=$'\033[34m'; magenta=$'\033[35m'; reset=$'\033[0m'

log() { printf '%s[dev]%s %s\n' "$bold" "$reset" "$*"; }
fail() { printf '%s[dev] %s%s\n' "$red" "$*" "$reset" >&2; exit 1; }

[ -f .env ] || fail "Falta o ficheiro .env (cp .env.example .env e preencha)."
[ -d node_modules ] || { log "A instalar dependências…"; npm install || fail "npm install falhou."; }

port_busy() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }
port_busy 4000 && fail "A porta 4000 já está em uso (outra API a correr?). Pare-a antes de continuar."
port_busy 5174 && fail "A porta 5174 já está em uso (outro Vite a correr?). Pare-o antes de continuar."

# 1. Base de dados
if command -v docker >/dev/null 2>&1; then
  log "A iniciar o PostgreSQL (docker compose)…"
  docker compose up -d postgres >/dev/null || fail "Não foi possível iniciar o PostgreSQL com docker compose."
  for _ in $(seq 1 30); do
    docker compose exec -T postgres pg_isready -U admin >/dev/null 2>&1 && break
    sleep 1
  done
  docker compose exec -T postgres pg_isready -U admin >/dev/null 2>&1 || fail "O PostgreSQL não ficou pronto a tempo."
  log "${green}PostgreSQL pronto${reset} ${dim}(localhost:5434)${reset}"
else
  log "${dim}docker não encontrado: a assumir que o PostgreSQL do DATABASE_URL já está a correr.${reset}"
fi

# 2. API + frontend, com prefixo em cada linha
pids=()

# Termina um processo e todos os descendentes (npx → tsx → node).
kill_tree() {
  local pid=$1 child
  for child in $(pgrep -P "$pid" 2>/dev/null); do kill_tree "$child"; done
  kill -TERM "$pid" 2>/dev/null
}

cleanup() {
  trap - INT TERM EXIT
  log "A parar…"
  for pid in "${pids[@]}"; do kill_tree "$pid"; done
  wait 2>/dev/null
  log "Parado."
}
trap cleanup INT TERM EXIT

prefix() {
  local name=$1 color=$2
  while IFS= read -r line; do printf '%s[%s]%s %s\n' "$color" "$name" "$reset" "$line"; done
}

run() {
  local name=$1 color=$2; shift 2
  # $! fica com o PID do comando (não do prefixo), para o wait/kill funcionarem.
  "$@" > >(prefix "$name" "$color") 2>&1 &
  pids+=($!)
}

run api "$blue" npx tsx watch server/index.ts
run web "$magenta" npx vite

# Espera pela API antes de anunciar os URLs
for _ in $(seq 1 40); do
  curl -sf -m 1 http://localhost:4000/api/health >/dev/null 2>&1 && break
  sleep 0.5
done

printf '\n%s  Portfólio:%s   http://localhost:5174\n' "$bold" "$reset"
printf '%s  Admin:%s       http://localhost:5174/admin\n' "$bold" "$reset"
printf '%s  API / docs:%s  http://localhost:4000/api/docs\n' "$bold" "$reset"
printf '%s  Ctrl+C para parar tudo%s\n\n' "$dim" "$reset"

# Se qualquer um terminar, pára tudo (cleanup no trap EXIT)
wait -n "${pids[@]}"
log "${red}Um dos processos terminou inesperadamente.${reset}"
exit 1
