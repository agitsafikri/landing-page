###1
# FROM node:20-alpine AS builder

# WORKDIR /app

# COPY package*.json pnpm-lock.yaml ./
# RUN npm install -g pnpm && pnpm install

# COPY . .

# RUN pnpm run build

# # Production Stage
# FROM node:20-alpine

# WORKDIR /app

# COPY --from=builder /app/.output ./.output

# ENV PORT=3000
# EXPOSE 3000

# CMD ["node", ".output/server/index.mjs"]
# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Production Stage
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV PORT=3500
EXPOSE 3500

CMD ["node", ".output/server/index.mjs"]

