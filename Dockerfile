FROM node:16
WORKDIR /app
COPY ./backend ./backend
WORKDIR /app/backend
RUN npm install
CMD ["node", "app.js"]
