FROM node:20-alpine AS build
LABEL maintainer="Qzee-dev"
WORKDIR /app
LABEL maintainer="Qzee-dev"
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine AS production
WORKDIR /app

# Copy only runtime files
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 1004
CMD ["node", "dist/server.js"]