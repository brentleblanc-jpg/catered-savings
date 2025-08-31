FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install --ignore-scripts
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]