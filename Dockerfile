# syntax=docker/dockerfile:1

FROM node:18
ENV NODE_ENV=production

RUN apt update && apt install -y \
    nginx

COPY ./docker/nginx/staticproxy.conf /etc/nginx/conf.d/staticproxy.conf
COPY ./docker/start.sh /start.sh

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

CMD ["/start.sh"]

