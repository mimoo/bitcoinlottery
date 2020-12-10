FROM node:latest

ENV PORT=3000
EXPOSE 3000

WORKDIR /app

COPY package.json package.json
RUN npm install

COPY . .

# RUN npm install -g nodemon
# CMD [ "nodemon", "index.js" ]

CMD ["npm", "start"]