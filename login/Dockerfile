# Use the official Node.js 16 image.
FROM node:16

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Your app binds to port 3002, so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3002

CMD [ "node", "auth.js" ]