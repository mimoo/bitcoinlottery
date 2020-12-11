FROM node:stretch

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . /app

RUN npm install -g nodemon

ENV DEBUG=express:*
EXPOSE 80
CMD [ "nodemon", "./bin/www" ]

#CMD ["npm", "start"]