# Nommand Desk - API

API RESTful desenvolvida com Fastify e Socket.IO para gerenciamento de autenticação de usuários e comunicação em tempo real.

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Fastify** - Framework web de alta performance
- **TypeScript** - Superset JavaScript com tipagem estática
- **Prisma** - ORM para gerenciamento de banco de dados
- **PostgreSQL** - Banco de dados relacional
- **Socket.IO** - Biblioteca para comunicação em tempo real
- **JWT** - Autenticação via JSON Web Tokens
- **Zod** - Validação de schemas e tipos
- **Swagger/OpenAPI** - Documentação interativa da API
- **BCrypt** - Hash de senhas
- **Docker** - Containerização (opcional)

## Funcionalidades

### Autenticação e Usuários
- Criação de conta de usuário
- Autenticação com email e senha
- Recuperação de senha com token
- Reset de senha
- Perfil do usuário autenticado
- Tokens JWT com expiração de 7 dias

### Comunicação em Tempo Real (WebSocket)
- Conexão autenticada via Socket.IO
- Sistema de salas (rooms)
- Eventos de entrada e saída de salas
- Middleware de autenticação para sockets

## Estrutura do Projeto

```
model-server-node/
├── prisma/
│   ├── schema/
│   │   └── schema.prisma        # Schema do banco de dados
│   └── seed.ts                  # Seed para popular o banco
├── src/
│   ├── @types/                  # Tipos TypeScript customizados
│   │   ├── fastify.d.ts
│   │   └── socket.d.ts
│   ├── http/
│   │   ├── routes/
│   │   │   ├── auth/            # Rotas de autenticação
│   │   │   │   ├── authenticate-with-password.ts
│   │   │   │   ├── create-account.ts
│   │   │   │   ├── get-profile.ts
│   │   │   │   ├── request-password-recover.ts
│   │   │   │   └── reset-password.ts
│   │   │   └── _errors/         # Classes de erro customizadas
│   │   └── error-handler.ts     # Manipulador global de erros
│   ├── lib/
│   │   ├── env.ts               # Validação de variáveis de ambiente
│   │   ├── prisma.ts            # Cliente Prisma
│   │   └── can.ts               # Utilitários de autorização
│   ├── middlewares/
│   │   ├── auth.ts              # Middleware de autenticação HTTP
│   │   └── auth-socket.ts       # Middleware de autenticação Socket
│   ├── socket/
│   │   ├── events/
│   │   │   ├── join-room.ts     # Evento de entrada em sala
│   │   │   └── leave-room.ts    # Evento de saída de sala
│   │   └── disconnect.ts        # Evento de desconexão
│   ├── utils/
│   │   └── constants/           # Constantes da aplicação
│   ├── socket.ts                # Configuração do Socket.IO
│   └── server.ts                # Ponto de entrada da aplicação
├── .env                         # Variáveis de ambiente (não commitado)
├── API_CURLS.md                 # Exemplos de uso da API com curl
├── insomnia-collection.json     # Coleção do Insomnia
├── package.json
└── tsconfig.json
```

## Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm ou yarn

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd model-server-node
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV="development"
PORT="3333"
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nommand_desk"
JWT_SECRET="sua-chave-secreta-muito-segura"
```

### 4. Configure o banco de dados

Execute as migrations do Prisma:

```bash
npx prisma migrate dev
```

Opcionalmente, popule o banco com dados de teste:

```bash
npm run prisma:seed
```

### 5. Inicie o servidor

#### Desenvolvimento

```bash
npm run dev
```

#### Produção

```bash
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3333`

## Uso com Docker

Se você tiver o Docker Compose configurado:

```bash
# Iniciar os serviços (banco de dados)
npm run service:up

# Iniciar a aplicação + serviços
npm run dev:up
```

## Documentação da API

### Swagger/OpenAPI

Acesse a documentação interativa:
```
http://localhost:3333/docs
```

### Exemplos com cURL

Consulte o arquivo [API_CURLS.md](./API_CURLS.md) para exemplos práticos de uso da API.

### Importação no Insomnia

Importe o arquivo `insomnia-collection.json` no Insomnia para testar todos os endpoints.

## Endpoints Principais

### Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/users` | Criar nova conta | Não |
| POST | `/sessions/password` | Login com email/senha | Não |
| GET | `/profile` | Obter perfil do usuário | Sim |
| POST | `/password/recover` | Solicitar recuperação de senha | Não |
| POST | `/password/reset` | Resetar senha com token | Não |

## WebSocket (Socket.IO)

### Conectar ao servidor

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3333', {
  auth: {
    token: 'seu-jwt-token-aqui'
  }
});
```

### Eventos disponíveis

#### join-room
Entrar em uma sala específica

```javascript
socket.emit('join-room', {
  room: 'room-id',
  shouldReturnData: true
});
```

#### leave-room
Sair de uma sala específica

```javascript
socket.emit('leave-room', {
  room: 'room-id',
  shouldReturnData: true
});
```

## Modelo de Dados

### User (Usuário)
```typescript
{
  id: string (UUID)
  email: string (único)
  password: string (hash)
  fullName: string
  firstName: string
  lastName: string
  dateOfBirth: Date (opcional)
  isActive: boolean
  avatarUrl: string (opcional)
  createdAt: Date
  updatedAt: Date
  deletedAt: Date (opcional)
}
```

### Token (Recuperação de senha)
```typescript
{
  id: string (UUID)
  type: 'PASSWORD_RECOVER'
  createdAt: Date
  expiresAt: Date
  userId: string (FK para User)
}
```

### Account (Contas externas - preparado para OAuth)
```typescript
{
  id: string (UUID)
  provider: 'GOOGLE'
  providerAccountId: string (único)
  userId: string (FK para User)
}
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento com hot reload |
| `npm run build` | Compila o TypeScript para JavaScript |
| `npm start` | Inicia o servidor em modo produção |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:seed` | Popula o banco com dados de teste |
| `npm run service:up` | Inicia os serviços Docker |
| `npm run dev:up` | Inicia serviços + servidor em dev |

## Segurança

- Senhas são hasheadas com bcrypt antes de serem armazenadas
- Autenticação JWT com tokens que expiram em 7 dias
- Tokens de recuperação de senha expiram em 1 hora
- Validação de entrada com Zod em todas as rotas
- CORS habilitado para permitir requests de diferentes origens
- Middleware de autenticação para rotas protegidas
- Autenticação obrigatória para conexões WebSocket

## Tratamento de Erros

A API utiliza classes de erro customizadas:

- `BadRequestError` - Requisição inválida (400)
- `UnauthorizedError` - Não autorizado (401)

Erros de validação retornam mensagens detalhadas usando `zod-error`.

## Validação de Dados

Todas as rotas utilizam Zod para validação de entrada e TypeScript para type safety:

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

## Middleware de Autenticação

### HTTP (Fastify)

```typescript
// Adiciona métodos helper ao request
request.getCurrentUserId() // Retorna o ID do usuário autenticado
request.getCurrentUser()   // Retorna os dados do usuário autenticado
request.getUserMembership(slug) // Retorna a membership em uma empresa
```

### WebSocket (Socket.IO)

```typescript
// Autenticação automática via token JWT
socket.user // Dados do usuário autenticado
```

## Desenvolvimento

### Convenções de Código

- Usar TypeScript estrito
- Seguir padrões de nomenclatura camelCase
- Manter funções pequenas e focadas
- Documentar código complexo
- Usar async/await para operações assíncronas

### Adicionando Novas Rotas

1. Crie um arquivo na pasta apropriada em `src/http/routes/`
2. Use `fastify-type-provider-zod` para validação
3. Registre a rota em [src/server.ts](src/server.ts)

Exemplo:

```typescript
import type { FastifyInstance } from "fastify";
import { z } from "zod";

export async function myRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/my-route',
    {
      schema: {
        body: z.object({
          name: z.string(),
        }),
      },
    },
    async (request, reply) => {
      // Implementação
    }
  );
}
```

### Adicionando Eventos Socket.IO

1. Crie um arquivo em `src/socket/events/`
2. Registre o evento em [src/socket.ts](src/socket.ts:20)

## Troubleshooting

### Erro de conexão com banco de dados

Verifique se:
- PostgreSQL está rodando
- Credenciais em `.env` estão corretas
- Banco de dados foi criado
- Migrations foram executadas

### Token JWT inválido

- Verifique se o token não expirou (7 dias de validade)
- Confirme que o `JWT_SECRET` no `.env` está correto
- Certifique-se de enviar o header `Authorization: Bearer <token>`

### WebSocket não conecta

- Verifique se o token JWT é válido
- Confirme que o servidor está rodando
- Verifique configurações de CORS

## Próximos Passos

- [ ] Implementar OAuth2 (Google)
- [ ] Adicionar testes unitários e de integração
- [ ] Implementar rate limiting
- [ ] Adicionar logging estruturado
- [ ] Implementar envio de email para recuperação de senha
- [ ] Adicionar refresh tokens
- [ ] Implementar sistema de roles e permissões completo
- [ ] Adicionar documentação de eventos Socket.IO no Swagger

## Licença

ISC

## Suporte

Para problemas ou dúvidas, abra uma issue no repositório.
