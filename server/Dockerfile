FROM node
LABEL maintainer="minhduc"
# Create app directory
RUN mkdir -p /usr/src/server
WORKDIR /usr/src/server
# Install app dependencies
COPY package.json /usr/src/server/
RUN npm install
RUN npm install -g nodemon
RUN npm uninstall bcrypt
RUN npm install bcryptjs --save
# Bundle app source
COPY . /usr/src/server
RUN mkdir -p /usr/src/server/uploads
RUN mkdir -p /usr/src/server/uploads/users
RUN mkdir -p /usr/src/server/uploads/guilds
EXPOSE 8080
CMD ["npm", "start"]