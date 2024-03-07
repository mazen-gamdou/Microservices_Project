# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install any needed packages specified in package.json
RUN npm install --only=production

# Make port 3005 available to the world outside this container
EXPOSE 3005

# Define environment variable
ENV REDIS_URL=redis://host.docker.internal:6379

# Run app.js when the container launches
CMD ["node", "server.js"]