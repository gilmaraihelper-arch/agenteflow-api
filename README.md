# 🚀 AgenteFlow API

Backend API para a plataforma AgenteFlow - Agentes de IA conversacionais para profissionais autônomos.

> **Status:** ✅ Backend completo (2026-02-26)  
> **Último commit:** Initial commit (2026-02-19)

## 📋 Stack Tecnológico

- **Framework**: Next.js 16 + App Router
- **Database**: PostgreSQL + Prisma ORM
- **Autenticação**: JWT (jsonwebtoken)
- **Senhas**: bcryptjs
- **Validação**: TypeScript

## 🏗️ Estrutura do Projeto

```
my-app/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts      # POST /api/auth/login
│       │   ├── register/route.ts   # POST /api/auth/register
│       │   └── me/route.ts         # GET/PATCH /api/auth/me
│       ├── agents/
│       │   ├── route.ts            # GET/POST /api/agents
│       │   └── [id]/route.ts       # GET/PATCH/DELETE /api/agents/:id
│       ├── conversations/
│       │   └── route.ts            # GET/POST /api/conversations
│       └── webhooks/
│           └── whatsapp/route.ts   # GET/POST /api/webhooks/whatsapp
├── lib/
│   ├── prisma.ts                   # Cliente Prisma
│   ├── jwt.ts                      # Utilitários JWT
│   ├── password.ts                 # Hash de senhas
│   ├── auth.ts                     # Middleware de autenticação
│   └── types.ts                    # Tipos TypeScript
├── prisma/
│   └── schema.prisma               # Schema do banco de dados
└── .env                            # Variáveis de ambiente
```

## 🚀 Começando

### 1. Instalar Dependências

```bash
cd my-app
npm install
```

### 2. Configurar Banco de Dados

```bash
# Criar banco PostgreSQL
createdb agenteflow

# Configurar .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agenteflow?schema=public"

# Rodar migrações
npx prisma migrate dev --name init

# Gerar cliente Prisma
npx prisma generate
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agenteflow?schema=public"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# OpenAI (para integração futura)
OPENAI_API_KEY="sk-your-openai-api-key"

# WhatsApp Business API (para integração futura)
WHATSAPP_BUSINESS_ID=""
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_WEBHOOK_VERIFY_TOKEN="agenteflow-webhook-secret"

# Frontend URL (CORS)
FRONTEND_URL="http://localhost:5173"
```

### 4. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

API disponível em: `http://localhost:3000`

## 📚 Documentação da API

### Autenticação

Todas as rotas protegidas requerem header:
```
Authorization: Bearer <token>
```

### Endpoints

#### POST /api/auth/register
Registra novo usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123",
  "name": "João Silva",
  "phone": "+5511999999999",
  "businessName": "Clínica Silva",
  "segment": "médico"
}
```

#### POST /api/auth/login
Realiza login.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

#### GET /api/auth/me
Retorna dados do usuário logado.

#### PATCH /api/auth/me
Atualiza dados do usuário.

---

#### GET /api/agents
Lista todos os agentes do usuário.

#### POST /api/agents
Cria novo agente.

**Body:**
```json
{
  "name": "Agente Dra. Maria",
  "objective": "agendar",
  "tone": "profissional",
  "serviceInfo": "Somos uma clínica odontológica...",
  "faq": "Pergunta 1? Resposta 1.",
  "workHours": "Seg-Sex: 8h às 18h",
  "calendarProvider": "google",
  "whatsappNumber": "5511999999999"
}
```

---

#### GET /api/agents/:id
Retorna detalhes do agente.

#### PATCH /api/agents/:id
Atualiza agente.

#### DELETE /api/agents/:id
Remove agente.

---

#### GET /api/conversations?agentId=:id
Lista conversas do agente.

#### POST /api/conversations
Cria/atualiza conversa (usado pelo webhook).

---

#### GET/POST /api/webhooks/whatsapp
Webhook para receber mensagens do WhatsApp Business API.

---

#### POST /api/whatsapp/send
Envia mensagem via WhatsApp (requer auth).

**Body:**
```json
{
  "to": "5511999999999",
  "message": "Olá! Como posso ajudar?",
  "agentId": "uuid-do-agente"
}
```

---

## 📱 Configuração WhatsApp Business API

### 1. Criar Conta Meta Business
Acesse: https://business.facebook.com

### 2. Configurar WhatsApp Business
- Vá em **Configurações** → **Contas do WhatsApp Business**
- Adicione um número de telefone
- Obtenha o **Phone Number ID** e **Access Token**

### 3. Configurar Webhook (Desenvolvimento)

Para testar webhooks localmente, use **ngrok**:

```bash
# Instalar ngrok
brew install ngrok/ngrok/ngrok

# Iniciar túnel
ngrok http 3000

# Copie a URL HTTPS gerada (ex: https://abc123.ngrok.io)
```

No Meta Business Manager:
- URL do webhook: `https://sua-url-ngrok.io/api/webhooks/whatsapp`
- Token de verificação: `agenteflow-webhook-secret`
- Assine os campos: `messages`, `message_status`

### 4. Configurar .env

```env
WHATSAPP_PHONE_NUMBER_ID="123456789012345"
WHATSAPP_ACCESS_TOKEN="EAAxxxxxxxxxxxxxxxx"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="agenteflow-webhook-secret"
```

### 5. Registrar Número de Teste

Antes de enviar mensagens, registre o número:

```bash
curl -X POST https://graph.facebook.com/v18.0/SEU_PHONE_NUMBER_ID/messages \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "5511999999999",
    "type": "text",
    "text": { "body": "Teste!" }
  }'
```

📖 **Guia completo:** Veja `/control-center/data/whatsapp-setup-guide.md`

---

## 🗄️ Schema do Banco de Dados

### User
- `id`: UUID (PK)
- `email`: String (unique)
- `password`: String (hashed)
- `name`: String
- `phone`: String?
- `businessName`: String?
- `segment`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Agent
- `id`: UUID (PK)
- `userId`: UUID (FK)
- `name`: String
- `objective`: String
- `tone`: String
- `serviceInfo`: Text
- `faq`: Text?
- `workHours`: String
- `calendarProvider`: String?
- `whatsappNumber`: String?
- `status`: String (pending/active/paused)
- `totalConversations`: Int
- `totalAppointments`: Int

### Conversation
- `id`: UUID (PK)
- `agentId`: UUID (FK)
- `customerName`: String?
- `customerPhone`: String
- `status`: String (active/closed/waiting_human)
- `messages`: JSON
- `context`: JSON?

### Appointment
- `id`: UUID (PK)
- `agentId`: UUID (FK)
- `conversationId`: UUID? (FK)
- `customerName`: String
- `customerPhone`: String
- `date`: DateTime
- `time`: String
- `service`: String?
- `notes`: String?
- `status`: String (scheduled/confirmed/cancelled/completed)

## 📝 Próximos Passos

- [x] **Backend API completo** - Next.js, PostgreSQL, JWT Auth
- [x] **Estrutura WhatsApp** - Webhook, envio de mensagens
- [ ] **Configurar conta Meta** - WhatsApp Business API
- [ ] **Testar integração** - Envio/recebimento real
- [ ] **Integração OpenAI GPT-4**
- [ ] **Integração Google Calendar**
- [ ] **Dashboard de métricas**
- [ ] **Sistema de pagamentos (Stripe)**
- [ ] **Integração GPT Realtime API** (voz em tempo real)

## 📄 Licença

MIT

---

*Última atualização: 2026-05-17*
*QA Engineer: Carol (Revisão docs - 17/05/2026)*
