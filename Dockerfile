FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json ./
RUN npm install --omit=dev

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 8080

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
	CMD wget -qO- http://localhost:8080/healthcheck || exit 1

CMD ["node", "app.js"]
