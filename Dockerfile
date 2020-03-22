FROM node:12

WORKDIR /www/jumpy
COPY . .
RUN rm -rf node_modules
RUN npm install && npm run build

EXPOSE 8082

CMD ["node", "./server.js"]
