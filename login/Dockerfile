# Use the official Node.js 16 image as a parent image
FROM node:16

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Your app binds to port 3002 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3002

# Define the command to run your app
CMD [ "node", "auth.js" ]
