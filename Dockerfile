# Base image is Node.js 
FROM node:18-alpine

#  working directory inside Container 
WORKDIR /app

# copy package.json and  package-lock.json 
COPY package*.json ./

# Dependencies install
RUN npm install

# copy all code
COPY . .

# port number
EXPOSE 8080

# start comand
CMD ["npm", "run", "dev"]