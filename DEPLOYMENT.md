# Deployment Guide

This guide outlines the steps to deploy the Nuxt 3 application.

## Prerequisites

- **Node.js**: Version 18.x or later (Recommended: v20.x LTS)
- **Package Manager**: pnpm (Recommended), npm, or yarn
- **Git**: For version control

## Environment Variables

Create a `.env` file in the root directory based on `.env.example` (if available).
Ensure the following variables are set:

```env
VITE_APP_API_URL=https://api.example.com
```

_Note: Since this is a client-side application (`ssr: false`), these variables are exposed to the browser._

## 1. Static Deployment (Recommended for SPA)

Since `ssr: false` is configured in `nuxt.config.ts`, the application is a standard Single Page Application (SPA). The most efficient way to deploy is as static files.

### Steps:

1.  **Install Dependencies**:

    ```bash
    pnpm install
    ```

2.  **Generate Static Files**:

    ```bash
    pnpm run generate
    ```

3.  **Deploy**:
    The build output will be in the `.output/public` directory.
    You can upload the contents of `.output/public` to any static hosting service like:
    - Nginx / Apache
    - Vercel / Netlify / Cloudflare Pages
    - AWS S3 + CloudFront

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/landing-page/.output/public;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 2. Node.js Server Deployment

If you prefer to run the application with a Node.js server (e.g., using Nuxt's Nitro server features), follow these steps.

### Steps:

1.  **Install Dependencies**:

    ```bash
    pnpm install
    ```

2.  **Build the Application**:

    ```bash
    pnpm run build
    ```

3.  **Run the Server**:
    The server entry point is `.output/server/index.mjs`.
    ```bash
    node .output/server/index.mjs
    ```

### Using PM2 (Process Manager)

For production, it is recommended to use PM2 to keep the comprehensive running.

1.  **Install PM2**:

    ```bash
    npm install -g pm2
    ```

2.  **Start the Application**:

    ```bash
    pm2 start .output/server/index.mjs --name "landing-page"
    ```

3.  **Save the Process List**:
    ```bash
    pm2 save
    ```

## 3. Docker Deployment

You can containerize the application using Docker.

### Dockerfile

Create a `Dockerfile` in the root directory:

```dockerfile
# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

RUN pnpm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV PORT=3000
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

### Build and Run Docker Container

1.  **Build the Image**:

    ```bash
    docker build -t landing-page .
    ```

2.  **Run the Container**:
    ```bash
    docker run -d -p 3000:3000 --env-file .env landing-page
    ```
