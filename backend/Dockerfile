# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Production stage ---
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Non-root user for defense in depth
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3001
CMD ["node", "dist/main.js"]
