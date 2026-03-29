FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @macro/core build
RUN pnpm --filter @macro/api build
EXPOSE 3002
CMD ["node", "apps/api/dist/index.js"]
