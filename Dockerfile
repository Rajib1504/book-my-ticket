# Base image is Node.js
FROM node:20-alpine

# Working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy all source code
COPY . .

# Port exposed by the app
EXPOSE 8080

# Start the server (uses node directly — no nodemon)
CMD ["npm", "start"]