# Use the official image as a parent image.
FROM debian:latest

RUN apt update
RUN apt install nodejs npm curl zip -y

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