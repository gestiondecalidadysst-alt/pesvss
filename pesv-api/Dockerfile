# Backend pesv-api — build y ejecución en producción.
FROM node:20-slim AS build
WORKDIR /app

# Prisma necesita openssl para su motor.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000
# Sincroniza el esquema, carga el catálogo de requisitos y arranca.
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/prisma/seed.js && node dist/src/server.js"]
