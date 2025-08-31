# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies without running any scripts
RUN npm install --timeout=300000 --retry=3 --no-optional --ignore-scripts

# Copy source code
COPY . .

# Generate Prisma client manually
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]