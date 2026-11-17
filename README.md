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
# 1. Clonar e instalar dependências
git clone <repo>
cd portfolio-paulo-cardoso
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com seus valores (ver abaixo)

# 3. Iniciar PostgreSQL
docker compose up -d postgres
# Aguardar health check

# 4. Executar migrações e seed
make db    # ou: npx tsx server/db.ts
make seed  # ou: npx tsx server/db/seed.ts

# 5. Iniciar servidores
make dev   # Vite (frontend) na porta 5174
# Em outro terminal:
make build && npm run preview  # ou apenas o backend
```

## 🔐 Acesso ao Painel Admin

### Credenciais Padrão

As credenciais são lidas do ficheiro `.env`:

```
ADMIN_EMAIL=paulozombelacardoso@gmail.com
ADMIN_PASSWORD=AfonsoAfonso12@
```

### Login

1. Inicie o backend: `npx tsx server/app.ts` (porta 4000)
2. Aceda à login: `POST http://localhost:4000/api/admin/auth/login`
3. Body JSON: `{ "email": "paulozombelacardoso@gmail.com", "password": "AfonsoAfonso12@" }`
4. Cookie `pc_admin_session` será definido automaticamente pelo navegador

### Acesso Protegido

Depois de logado, todas as rotas `/api/admin/*` exigem o cookie:
- `GET /api/admin/profile` - Dados do perfil
- `GET /api/admin/media` - Lista de ficheiros
- `POST /api/admin/media/upload` - Upload de arquivos
- `GET/POST /api/admin/projects` - Gestão de projetos
- Entre outras...

### Header CSRF

Requisições POST/PUT/DELETE devem incluir um dos:

```
X-Requested-With: portfolio-csrf
```
OU
```
Origin: http://localhost:5174 (deve estar em ALLOWED_ORIGINS)
```

### Testando com cURL

```bash
# 1. Fazer login
curl -X POST http://localhost:4000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"paulozombelacardoso@gmail.com","password":"AfonsoAfonso12@"}'

# 2. Usar o cookie retornado nas requisições seguintes
curl -b "pc_admin_session=SESSAO_TOKEN" http://localhost:4000/api/admin/media

# 3. Listar mídias
curl -b "pc_admin_session=SESSAO_TOKEN" http://localhost:4000/api/admin/media?folder=projects
```

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
make build && npx tsx server/app.ts
```

**Causa 2: PostgreSQL não conectado**
```bash
# Verificar se o PostgreSQL está rodando
docker compose ps
# Ver logs
docker compose logs postgres
# Testar conexão
pg_isready -h localhost -p 5432 -U admin
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
- Adicionar `X-Requested-With: portfolio-csrf` header
- Ou garantir que `ALLOWED_ORIGINS` inclui a origem do frontend

**Causa 3: Cookie não definido**
- Verificar se `COOKIE_SECURE` condiz com o ambiente (false para development, true para production)
- Verificar se o domínio não está bloqueando cookies de terceiros

**Causa 4: PostgreSQL errors no login**
```bash
# Verificar se o pool conecta
npx tsx -e "import { pool } from './server/db.js'; pool.query('SELECT 1').then(r => console.log('DB OK', r.rows)).catch(e => console.log('DB ERRO', e))"
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

## 📦 Deploy

### Desenvolvimento Local
```bash
make dev          # Vite dev server (porta 5174)
# Backend Express roda implicitamente através da config Vite
```

### Produção
```bash
make build        # tsc + vite build
# Definir NODE_ENV=production no .env
# Garantir que COOKIE_SECURE=true
# Garantir CLOUDINARY_* vars estão preenchidas
# Rodar com um servidor Node.js ou Docker
```

### Docker
```bash
docker compose up --build
# Services definidos: postgres + api
# Ports: 5434 (PostgreSQL), 4001 (API)
```

## 📜 Licença

Este projeto está licenciado sob os termos da MIT License.

## 👨‍💻 Desenvolvido por

**Portfólio de Paulo Cardoso** - Software Engineer & FullStack Developer