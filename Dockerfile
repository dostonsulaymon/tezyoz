# STAGE 1: Installing dependencies
FROM node:22 AS dependencies

ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/
RUN npm ci

# Stage 2: Building the application
FROM node:22 AS build

ENV NODE_ENV=production

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules


COPY . .

RUN npm run build
RUN if [ -f prisma/schema.prisma ] && grep -q 'model' prisma/schema.prisma; then npx prisma generate; else echo "No models defined; skipping Prisma Client generation"; fi

# Stage 3: Creating image to run the application
FROM node:22 AS production

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

CMD ["npm", "run", "start:prod"]
