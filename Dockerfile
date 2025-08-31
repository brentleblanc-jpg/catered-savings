FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install --ignore-scripts
EXPOSE 3000
CMD ["npm", "start"]