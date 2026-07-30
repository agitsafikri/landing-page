# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies (includes submodule setup via postinstall)
pnpm dev              # Start dev server at http://localhost:3000
pnpm build            # Build for production (Node.js server)
pnpm generate         # Build as static SPA (recommended for deployment)
pnpm preview          # Preview production build locally
```

## Architecture

This is a **Nuxt 4 / Vue 3 client-side SPA** (`ssr: false`) — a product landing page with checkout and order management, with all UI labels in Indonesian.

### Path aliases
- `~` → `./app` (project root)
- `@` → `./app/assets` (git submodule)

### Key architectural note: `app/assets` is a git submodule
All images, fonts, icons, and global SCSS styles live in a separate repo (`https://github.com/agitsafikri/assets-fe.git`). When cloning, run `git submodule update --init` to populate it. The global stylesheet entry is `app/assets/styles/index.scss`.

### Routing (file-based)
| Route | File |
|---|---|
| `/` | `app/pages/index.vue` |
| `/:slug` | `app/pages/[slug]/index.vue` |
| `/:slug/success` | `app/pages/[slug]/success.vue` |
| `/product-not-found` | `app/pages/product-not-found.vue` |

### State management (Pinia stores in `app/stores/`)
- `produkStore` — product checkout, POSTs to `/produk/checkout`
- `pesananStore` — order creation, POSTs to `/order/create`
- `locationStore` — province/city/district data from `/location/*`
- `alertStore` — global alert notifications, auto-dismisses after 3 seconds

### API layer (`app/apiConfigs/`)
- `client.ts` — Axios instance factory with configurable `baseURL`
- `method.ts` — `getData()`, `postData()`, `errorHelper()` wrappers

The API base URL is set via the `VITE_APP_API_URL` environment variable (exposed as `runtimeConfig.public.api_url` in `nuxt.config.ts`).

### Component conventions
- `app/components/bases/` — reusable base components (`ButtonCustom`, `InputCustom`, `SelectCustom`, `TextAreaCustom`, `carouselCustom`)
- `app/components/` — page-level feature components (`productDetail`, `productSale`, `recipient`, `orderSuccess`, etc.)
- `app/app.vue` — root component; renders `<Alert>` globally + `<NuxtPage>`

### Utilities (`app/functions/`)
- `delimiter.ts` — currency and thousands formatting
- `formater.ts` — phone number and case conversion
- `formHelper.ts` — form validation with Indonesian error messages, input masking helpers (uses `maska`)

## Environment

Copy `.env` and set:
```
VITE_APP_API_URL=https://your-api-base-url
```

## Deployment

Three supported methods documented in `DEPLOYMENT.md`:
1. **Static SPA** (`pnpm generate`) — recommended
2. **Node.js server** (`pnpm build && node .output/server/index.mjs`)
3. **Docker** — multi-stage build using Node 20-alpine (`Dockerfile` at repo root)
