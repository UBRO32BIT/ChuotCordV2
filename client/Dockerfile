FROM node

RUN mkdir -p /usr/src/client
WORKDIR /usr/src/client

COPY public/ /usr/src/client/public/
COPY src/ /usr/src/client/src/
COPY package.json /usr/src/client/

# Increase memory limit for Node.js
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

RUN npm install
RUN npm install -g @craco/craco
# If you are building your code for production
# RUN npm ci --omit=dev

EXPOSE 3000
CMD [ "npm", "start" ]