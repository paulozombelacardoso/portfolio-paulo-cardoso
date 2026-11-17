# Portfolio CMS - Administrativo Paulo Cardoso

## Visão Geral

Painel administrativo integrado com o portfólio de Paulo Cardoso, utilizando **Cloudinary** para armazenamento de imagens/vídeos e **PostgreSQL** para metadados. Sistema completo de gestão de conteúdo com autenticação, validação rigorosa e documentação Swagger.

## 🚀 Funcionalidades

### Painel Administrativo (`/api/admin`)
- **Autenticação**: Login via cookie httpOnly, sessão protegida
- **Recursos**: Projects, Experiences, Certifications, Education, Courses, Publications, Skills
- **Perfil**: Dados bilingues (PT/EN), foto, redes sociais
- **Configurações**: Seções visíveis, SEO, sitePublished
- **Mídia**: Upload, substituição e eliminação de arquivos via Cloudinary
- **CV**: Gestão de currículo ativo

### API Pública (`/api/public`)
- Portfólio completo apenas com conteúdo **publicado**
- Localização bilingue (PT/EN)
- SEO, configurações, estatísticas
- Acesso sem autenticação (somente leitura)

### Documentação
- **Swagger UI**: `/api/docs`
- **OpenAPI JSON**: `/api/openapi.json`

## 📦 Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env (ADMIN_EMAIL, ADMIN_PASSWORD, CLOUDINARY_*)

# 3. Iniciar o PostgreSQL deste projecto (porta 5434)
make up            # docker compose up -d postgres

# 4. Migrações + dados iniciais (idempotente)
make seed          # cria tabelas, utilizador admin e conteúdo de demonstração
```

## ▶️ Pôr tudo no ar (um só comando)

```bash
make dev   # PostgreSQL (5434) + API/admin (4000) + frontend Vite (5174)
```

O comando inicia o PostgreSQL via docker compose, espera que fique pronto e arranca a API e o frontend
no mesmo terminal (linhas prefixadas com `[api]` e `[web]`). **Ctrl+C pára tudo**; se um dos processos
terminar, o outro também é parado. Equivalente: `npm run dev:all`.

Comandos individuais, se precisar: `make up` (só a base de dados), `make api` (só a API), `make front` (só o Vite).

| URL | O quê |
|-----|-------|
| `http://localhost:4000/api/health` | Health check |
| `http://localhost:4000/api/docs` | Swagger UI (testar o admin no browser) |
| `http://localhost:4000/api/admin/*` | API do painel admin |
| `http://localhost:4000/api/public/portfolio` | API pública |
| `http://localhost:5174` | Portfólio (frontend) |

O arranque do backend (`server/index.ts`) espera pela base de dados, aplica migrações e faz o seed automaticamente.

### 🖥️ Painel admin (interface)

Abra **http://localhost:5174/admin** (desenvolvimento) ou **http://localhost:4000/admin** (build servido pelo backend)
e inicie sessão com `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

| Página | O que permite |
|--------|---------------|
| Dashboard | Totais por secção, publicados vs. rascunhos, últimas actualizações, estado do site |
| Perfil | Nome, título, frases, bio (PT/EN), fotografia, contactos e redes |
| CV | Upload de PDF, definir o CV activo (usado pelo botão "Download CV") |
| Projectos, Experiências, Certificações, Formação, Cursos, Publicações, Competências, Categorias | Listagem com pesquisa, filtros e paginação; criar/editar num painel lateral (PT/EN); publicar/despublicar; reordenar; eliminar com confirmação |
| Media | Biblioteca Cloudinary: upload com pré-visualização, texto alternativo, substituir (actualiza todas as referências), eliminar (bloqueado se estiver em uso) |
| Configurações | Site publicado / manutenção, secções visíveis e ordem, contactos, SEO e Open Graph |
| Conta | Alterar a palavra-passe |

O portfólio público (`/`) lê o conteúdo de `GET /api/public/portfolio` — só conteúdo **publicado**. Se a API
não estiver disponível (ex.: deploy estático), usa o conteúdo embutido em `src/data.ts` como alternativa.

Código: `src/admin/` (carregado num bundle separado, só em `/admin`) e `src/usePortfolio.ts`.

## 🔐 Acesso ao Painel Admin

### Credenciais

O utilizador admin é criado no primeiro seed a partir de `ADMIN_EMAIL` e `ADMIN_PASSWORD` do ficheiro `.env`
(nunca escreva a palavra-passe no README nem a coloque no git). Depois de criado, alterar o `.env` **não** muda a
palavra-passe: use `PUT /api/admin/auth/password`.

### Header CSRF (obrigatório)

Todos os pedidos `POST/PUT/PATCH/DELETE` para `/api/admin/*` (incluindo o login) têm de levar:

```
X-Requested-With: portfolio-cms
```

Se o pedido tiver header `Origin`, este tem de estar em `ALLOWED_ORIGINS`.

### Testar com cURL

```bash
# 1. Login (guarda o cookie pc_admin_session em cookies.txt)
curl -c cookies.txt -X POST http://localhost:4000/api/admin/auth/login \
  -H "Content-Type: application/json" -H "X-Requested-With: portfolio-cms" \
  -d '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}'

# 2. Pedidos autenticados
curl -b cookies.txt http://localhost:4000/api/admin/dashboard
curl -b cookies.txt "http://localhost:4000/api/admin/projects?q=docker&published=true"

# 3. Upload para o Cloudinary
curl -b cookies.txt -X POST http://localhost:4000/api/admin/media/upload \
  -H "X-Requested-With: portfolio-cms" \
  -F file=@foto.png -F folder=projects -F altText="Capa do projecto"
```

### Rotas principais

- `GET/PUT /api/admin/profile`, `GET/PUT /api/admin/settings`, `GET /api/admin/dashboard`
- `GET/POST /api/admin/{projects|experiences|certifications|education|courses|publications|skills|skill-categories}`
- `GET/PATCH/DELETE /api/admin/<recurso>/:id`, `POST /api/admin/<recurso>/reorder`
- `GET/POST /api/admin/cv`, `PATCH/DELETE /api/admin/cv/:id`, `POST /api/admin/cv/:id/activate`
- `GET /api/admin/media`, `POST /api/admin/media/upload`, `POST /api/admin/media/:id/replace`,
  `GET /api/admin/media/:id/usage`, `PATCH/DELETE /api/admin/media/:id`

## 🌐 API Pública

Aceda ao portfólio publicado sem autenticação:

```bash
# Portfolio completo (linguagem via query param ?lang=pt ou ?lang=en)
curl http://localhost:4000/api/public/portfolio

# Apenas dados SEO
curl http://localhost:4000/api/public/seo

# Health check
curl http://localhost:4000/api/health
```

Documentação interativa: `http://localhost:4000/api/docs`

## ⚙️ Variáveis de Ambiente (.env)

Copie `.env.example` para `.env` e preencha:

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | ✅ | `postgres://user:pass@host:port/db` |
| `ADMIN_EMAIL` | ✅ | Email do administrador |
| `ADMIN_PASSWORD` | ✅ | Senha (≥ 10 caracteres) |
| `MEDIA_DRIVER` | ✅ | `cloudinary` | `local` | `memory` |
| `CLOUDINARY_CLOUD_NAME` | ✅ (cloudinary) | Nome do cloud |
| `CLOUDINARY_API_KEY` | ✅ (cloudinary) | Chave da API |
| `CLOUDINARY_API_SECRET` | ✅ (cloudinary) | Secret da API (nunca expor no frontend) |
| `SESSION_TTL_HOURS` | | Tempo de vida da sessão (padrão: 8) |
| `COOKIE_SECURE` | | `true` em produção (HTTPS) |
| `ALLOWED_ORIGINS` | | Origens permitidas para CSRF (ex: `http://localhost:5174`) |
| `PUBLIC_ORIGIN` | | Origem pública do portfólio |
| `LOGIN_RATE_LIMIT` | | Tentativas de login por período |
| `MEDIA_MAX_IMAGE_MB` | | Limite imagem (padrão: 5) |
| `MEDIA_MAX_VIDEO_MB` | | Limite vídeo (padrão: 50) |
| `MEDIA_MAX_DOCUMENT_MB` | | Limite documento (padrão: 10) |

## 📁 Estrutura de Pastas no Cloudinary

Recursos organizados através de pastas lógicas:

```
portfolio/
  profile/       → Foto de perfil
  projects/      → Capa e galeria de projetos
  certifications/ → Certificados (PDF + thumbnail)
  experiences/   → Logotipos das empresas
  education/     → Logotipos das instituições
  documents/     → PDFs e documentos
  publications/  → Capas de publicações
```

Transformações automáticas aplicadas:
- Imagens: `f_auto/q_auto`, resize responsivo, thumbnails (320×240), card (900×900)
- Vídeos: thumbnail, preview, entrega otimizada
- PDFs: thumbnail, preview, download with attachment

## 🐛 Solução de Problemas

### Problema: "Connection refused" ou servidor não inicia

**Causa 1: Porta 4000 em uso**
```bash
# Verificar o que está na porta 4000
lsof -i :4000
# Matar o processo e reiniciar
kill <PID>
make api
```

**Causa 2: PostgreSQL não conectado**
```bash
# Verificar se o PostgreSQL está rodando
docker compose ps
# Ver logs
docker compose logs postgres
# Testar conexão
pg_isready -h localhost -p 5434 -U admin
```

**Causa 3: Variáveis de ambiente incompletas**
```bash
# Verificar .env
cat .env | grep -E '^(DATABASE_URL|CLOUDINARY|ADMIN)'
# Garantir que DATABASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET estão preenchidos
```

**Causa 4: Erro de módulo TypeScript**
```bash
# Rebuild para garantir types corretos
npm run typecheck
# Limpar cache e rebuild
rm -rf node_modules/package-lock.json && npm install
```

### Problema: Login não funciona

**Causa 1: Senha muito curta**
- Mínimo de 10 caracteres exigido no Zod validation

**Causa 2: CSRF header faltando**
- Adicionar o header `X-Requested-With: portfolio-cms`
- Se o pedido tiver `Origin`, garantir que `ALLOWED_ORIGINS` a inclui

**Causa 3: Cookie não definido**
- Verificar se `COOKIE_SECURE` condiz com o ambiente (false para development, true para production)
- Verificar se o domínio não está bloqueando cookies de terceiros

**Causa 4: PostgreSQL errors no login**
```bash
# Verificar se o pool conecta
docker exec portfolio-cms-postgres pg_isready -U admin
```

### Problema: Upload de ficheiros falha

**Causa 1: Cloudinary não configurado**
- Verificar se as 3 vars Cloudinary estão preenchidas no .env
- Em modo development, pode usar `MEDIA_DRIVER=local` para testar sem Cloudinary

**Causa 2: Formato/extensão não permitido**
- Apenas: JPG, JPEG, PNG, WebP para imagens
- Apenas: MP4, WebM para vídeos
- Apenas: PDF para documentos
- Tamanhos: img 5MB, video 50MB, document 10MB

**Causa 3: Magic bytes não correspondem**
- O backend verifica a assinatura real do ficheiro, não confia apenas no MIME type do navegador
- Ficheiros executáveis/scripts são rejeitados

**Causa 4: Limite de tamanho excedido**
- Verificar `config.storage.limits` em `server/config.ts`
- Valores padrão: image 5MB, video 50MB, document 10MB

## 🧪 Testes

```bash
make up      # o PostgreSQL tem de estar a correr
npm test     # Vitest + Supertest (48 testes)
```

Os testes usam uma base de dados isolada (`portfolio_cms_test`, recriada a cada execução; configurável com
`TEST_DATABASE_URL`) e armazenamento em memória — não tocam nos dados reais nem no Cloudinary. Cobrem
autenticação, protecção de rotas/CSRF, CRUD de todos os recursos, validação, uploads (magic bytes, extensão,
tamanho, ficheiros em uso, substituição), publicação/despublicação e integração com a API pública.

## 📦 Deploy

### Verificação
```bash
make typecheck    # frontend + servidor
make build        # typecheck + vite build
```

### Docker
```bash
docker compose up -d --build
# postgres → porta 5434 | api → porta 4001 (lê ADMIN_* e CLOUDINARY_* do .env)
```

### Produção
- `NODE_ENV=production`, `COOKIE_SECURE=true` (HTTPS), `MEDIA_DRIVER=cloudinary`
- `ALLOWED_ORIGINS` com o domínio público
- O backend serve também o frontend compilado (`dist/`)

## 📜 Licença

Este projeto está licenciado sob os termos da MIT License.

## 👨‍💻 Desenvolvido por

**Portfólio de Paulo Cardoso** - Software Engineer & FullStack Developer