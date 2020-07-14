# Use the official image as a parent image.
FROM node:current-slim

RUN apt update
RUN apt install curl -y
RUN apt install zip -y
#Install rclone
RUN curl https://rclone.org/install.sh | bash

# Set the working directory.
WORKDIR /usr/src/app

# Copy the file from your host to your current location.
COPY package.json .

# Run the command inside your image filesystem.
RUN npm install

# Inform Docker that the container is listening on the specified port at runtime.
EXPOSE 3040

# Run the specified command within the container.
CMD [ "npm", "start" ]

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .
