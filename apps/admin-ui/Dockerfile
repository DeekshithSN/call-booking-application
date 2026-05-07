FROM node:17.9.0-slim  AS build
LABEL maintainer="qzee-dev"
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force
COPY . .
RUN  npm run build

# ---- Production stage ----
FROM nginx:1.27-alpine AS production
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

# Security: run nginx as non-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]