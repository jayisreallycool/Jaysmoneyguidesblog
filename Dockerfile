# Stage 1: Build application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and install all dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy package manifests and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built application and static assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 8080

CMD ["npm", "start"]
