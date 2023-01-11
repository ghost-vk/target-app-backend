FROM node:18-alpine
WORKDIR /usr/src/app
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV
COPY .yarn .yarn
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn workspaces focus --production
COPY . .
EXPOSE 80
CMD ["node", "app.js"]
