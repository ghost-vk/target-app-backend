FROM node:16.14.2-alpine3.14

WORKDIR /usr/src/app

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python3 git curl

COPY package*.json .
RUN npm install --only=production && \
  npm install node-gyp -g

COPY . .

EXPOSE 8080

CMD ["node", "app.js"]
