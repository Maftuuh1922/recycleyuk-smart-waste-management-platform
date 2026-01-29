# Cloudflare Workers Full-Stack Chat Demo

[![Deploy to Cloudflare][cloudflarebutton]]

A production-ready full-stack chat application built on Cloudflare Workers. Features a React frontend with shadcn/ui, Tailwind CSS, and a Hono backend powered by Durable Objects for scalable, multi-tenant entity storage (Users, Chats, Messages). Demonstrates real-time chat boards with CRUD operations, pagination, and indexing.

## Features

- **Backend**: Hono API with Durable Objects for entities (Users, ChatBoards with embedded Messages)
- **Frontend**: Modern React 18 app with Vite, TypeScript, Tailwind CSS, and shadcn/ui components
- **Data Layer**: Global Durable Object for KV-like storage with CAS, indexes for listing/pagination
- **API**: RESTful endpoints for users, chats, messages (list, create, delete, paginate)
- **State Management**: TanStack Query for data fetching/caching
- **UI/UX**: Responsive design, dark mode, theme toggle, sidebar layout, toast notifications
- **Development**: Hot reload, type-safe TypeScript, Bun-powered workflows
- **Deployment**: Zero-config to Cloudflare Workers with Pages for static assets

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Backend** | Cloudflare Workers, Hono, Durable Objects |
| **Frontend** | React 18, Vite, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui, Lucide icons |
| **Data** | TanStack Query, Immer, Zod |
| **Utils** | clsx, tailwind-merge, uuid |
| **Build** | Bun, Wrangler, Cloudflare Vite plugin |

## Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Cloudflare CLI (Wrangler)](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (optional for local dev)
- Cloudflare account (free tier sufficient)

## Installation

1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd <project-name>
   ```

2. Install dependencies:
   ```
   bun install
   ```

## Running Locally

1. Start the development server:
   ```
   bun dev
   ```
   - Frontend: http://localhost:3000 (Vite)
   - Backend: Automatically deployed to Workers preview or use `bun dev` with Wrangler

2. Open http://localhost:3000 in your browser.

3. Seed data is auto-loaded on first API call (mock users/chats/messages).

## Development Workflow

- **Hot Reload**: Edit `src/` for instant UI updates; `worker/` for API.
- **Type Generation**: `bun cf-typegen` (generates `worker.d.ts`).
- **Linting**: `bun lint`
- **Build**: `bun build` (produces `dist/` for Pages).
- **Preview**: `bun preview`
- **API Testing**: Use `curl` or Postman against `/api/*` endpoints.

### Example API Usage

```bash
# List users (paginated)
curl "http://localhost:8787/api/users?limit=10"

# Create user
curl -X POST "http://localhost:8787/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'

# List chats
curl "http://localhost:8787/api/chats"

# Create chat
curl -X POST "http://localhost:8787/api/chats" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Chat"}'

# Send message to chat
curl -X POST "http://localhost:8787/api/chats/c1/messages" \
  -H "Content-Type: application/json" \
  -d '{"userId": "u1", "text": "Hello!"}'

# Health check
curl "http://localhost:8787/api/health"
```

**Full API Docs**:
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/deleteMany` - Bulk delete
- `GET /api/chats` - List chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:id/messages` - List messages
- `POST /api/chats/:id/messages` - Send message
- `DELETE /api/chats/:id` - Delete chat
- `POST /api/chats/deleteMany` - Bulk delete

## Deployment

Deploy to Cloudflare Workers with one command:

```
bun deploy
```

Or use the button:

[cloudflarebutton]

### Manual Deployment Steps

1. **Login**:
   ```
   wrangler login
   ```

2. **Configure** (edit `wrangler.jsonc`):
   - Set account ID if needed.

3. **Deploy**:
   ```
   bun deploy
   ```
   - Deploys Worker + binds Durable Object.
   - Static assets served via Pages.

4. **Custom Domain** (optional):
   ```
   wrangler pages publish dist --project-name=<pages-project> --branch=main
   ```

5. **Environment Variables** (if any):
   ```
   wrangler secret put MY_SECRET
   ```

## Customization

- **Add Entities**: Extend `worker/entities.ts` using `IndexedEntity`.
- **New Routes**: Add to `worker/user-routes.ts`.
- **UI Components**: Install via `bunx shadcn-ui@latest add <component>`.
- **Theme**: Edit `tailwind.config.js` / `src/index.css`.
- **Pages**: Update `src/main.tsx` router.

## Contributing

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit changes (`git commit -m 'Add some AmazingFeature'`).
4. Push (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

MIT License. See [LICENSE](LICENSE) for details.