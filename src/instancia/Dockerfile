FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8012

ENV PORT=8012

ENV HOSTNAME="0.0.0.0"

CMD ["node", "/app/instancia.js"]
