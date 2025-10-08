FROM node
LABEL maintainer="minhduc"
# Create app directory
RUN mkdir -p /usr/src/server
WORKDIR /usr/src/server
# Install app dependencies
COPY package.json /usr/src/server/
RUN npm install --legacy-peer-deps
RUN npm install -g nodemon --legacy-peer-deps
RUN npm uninstall bcrypt --legacy-peer-deps
RUN npm install bcryptjs --save --legacy-peer-deps
# Bundle app source
COPY . /usr/src/server
RUN mkdir -p /usr/src/server/uploads
RUN mkdir -p /usr/src/server/uploads/users
RUN mkdir -p /usr/src/server/uploads/guilds
EXPOSE 8080
CMD ["npm", "start"]