FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8014

CMD ["node", "/app/instancia.js"]
