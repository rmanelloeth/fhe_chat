FROM node:20-alpine

WORKDIR /app

# copy package files
COPY package*.json ./

# install dependencies
RUN npm ci

# copy rest of the code
COPY . .

# expose port
EXPOSE 3000

# default command
CMD ["npm", "run", "dev"]

