FROM node:20-alpine

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

WORKDIR /app
COPY . .

RUN yarn install

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
