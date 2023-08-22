# syntax=docker/dockerfile:1

FROM node:18
ENV NODE_ENV=production

RUN apt update && apt install -y \
    nginx

COPY nginx/staticproxy.conf /etc/nginx/conf.d/staticproxy.conf

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

CMD service nginx start && npm start

