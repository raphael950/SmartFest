# ──────────────────────────────────────────────────────────────────────────────
# Stage 1: Build
# ──────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS build

WORKDIR /app

# Copie les dépendances
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Installe les dépendances (adjust package manager selon ton setup)
RUN npm ci

# Copie le code source
COPY . .

# Build l'app AdonisJS (ignore les erreurs TS)
RUN npm run build -- --ignore-ts-errors

# Ensure frontend assets are available in /app/public (some builds output to build/public)
RUN mkdir -p public \
    && if [ -d build/public ]; then cp -r build/public/* public/; fi

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2: Production
# ──────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine

WORKDIR /app

# Installe dumb-init pour les signaux
RUN apk add --no-cache dumb-init

# Copie les fichiers buildés depuis la phase 1
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public
COPY --from=build /app/resources ./resources

# Variables env
ENV NODE_ENV=production
EXPOSE 3333

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3333', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Démarre l'app
ENTRYPOINT ["dumb-init"]
CMD ["node", "build/bin/server.js"]
