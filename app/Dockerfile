FROM node:latest

EXPOSE 80

WORKDIR /app

COPY package.json package.json
RUN npm install

COPY . .

# RUN npm install -g nodemon
# CMD [ "nodemon", "index.js" ]

ENV DEBUG=express:*

CMD ["npm", "start"]