# Use the official image as a parent image.
FROM debian:latest

RUN apt update
RUN apt install nodejs npm curl zip -y

#Install rclone
RUN curl https://rclone.org/install.sh | bash

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3040

CMD [ "npm", "start" ]