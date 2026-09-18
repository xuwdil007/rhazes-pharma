FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
COPY public ./public
COPY backend/data/content.json ./backend/data/content.json
ENV VITE_BASE_PATH=/ VITE_STATIC_SITE=false
RUN npm run build

FROM golang:1.25-alpine AS backend
WORKDIR /build
COPY backend/server.go ./server.go
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /server server.go

FROM alpine:3.22 AS runtime
RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S -g 10001 app \
    && adduser -S -D -H -u 10001 -G app app
WORKDIR /app
COPY --from=frontend --chown=app:app /app/dist ./dist
COPY --from=backend /server /usr/local/bin/rhazes-server
COPY --chown=app:app backend/data/content.json ./backend/data/content.json
RUN printf '[]\n' > backend/data/applications.json \
    && chown -R app:app backend/data
ENV PORT=4173 TZ=Asia/Dushanbe
USER app
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:4173/healthz || exit 1
CMD ["rhazes-server"]
