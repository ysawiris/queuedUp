
FROM node:10

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json /app

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . /app

EXPOSE 8080

CMD [ "npm", "start" ]