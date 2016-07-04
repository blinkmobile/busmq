FROM node:6.1

RUN ["mkdir", "-p", "/app/public"]

ADD package.json /app/
WORKDIR /app
RUN npm install

ADD plugins/ /app/plugins/
ADD ecosystem.json index.js /app/

EXPOSE 80
EXPOSE 443

CMD npm start -- --no-daemon
