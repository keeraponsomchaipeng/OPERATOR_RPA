# Start with the official Node.js image as our base
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Clear NPM cache
RUN npm cache clean --force

# Update NPM to the latest version
RUN npm install -g npm@latest

# Install the dependencies
RUN npm install

# Bundle app source
COPY . .

# # Build the Next.js app
# RUN npm run build

# Expose the port that our app will run on
EXPOSE 3000

# Start the app
CMD [ "npm", "run", "dev" ]

