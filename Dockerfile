FROM node:16-alpine
VOLUME [ "/whatever_man" ]
# Create app directory
WORKDIR /usr/whatever
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install\
    && npm install typescript -g

COPY . .
RUN tsc
EXPOSE 3000
ENTRYPOINT [ "node" ]
CMD [ "./build/server/server.js" ]