FROM node:12.13.1-alpine3.9
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
ENV NODE_ENV production

RUN npm ci --loglevel error

COPY . /app

CMD [ "npm", "start" ]
