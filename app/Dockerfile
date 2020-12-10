FROM node:stretch

EXPOSE 80

WORKDIR /app

COPY package.json package.json
RUN npm install

COPY . .


ENV DEBUG=express:*

RUN npm install -g nodemon
CMD [ "nodemon", "./bin/www" ]

#CMD ["npm", "start"]