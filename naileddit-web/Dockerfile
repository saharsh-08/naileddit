# Step 1: Install dependencies
FROM node:24-alpine AS deps

# Creating a working directory for the application
WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

# strict-ssl should only be set to false in development environments
RUN yarn config set "strict-ssl" false -g
RUN yarn install

# Step 2: Build the app
FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SERVER_URL
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL

RUN yarn build

# Step 3: Run the app
FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]

USER node