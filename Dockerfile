FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build


FROM node:22-alpine

RUN apk add --no-cache wget

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

RUN addgroup -S app && adduser -S app -G app
USER app

ARG APP_PORT=3000
ENV APP_PORT=${APP_PORT}

EXPOSE ${APP_PORT}

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${APP_PORT}/health || exit 1

CMD ["sh", "-c", "yarn migration:run:prod && node dist/main.js"]