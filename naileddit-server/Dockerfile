FROM node:24

# Creating a working directory for the application
WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

# strict-ssl should only be set to false in development environments
RUN yarn config set "strict-ssl" false -g
RUN yarn install

COPY . .

RUN yarn build

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/index.js"]

USER node
