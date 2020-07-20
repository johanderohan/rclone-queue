# Use the official image as a parent image.
FROM node:14-alpine

RUN apk --no-cache add curl
RUN apk --no-cache add zip

#Install rclone
RUN curl https://rclone.org/install.sh | bash

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 3040

CMD [ "npm", "start" ]