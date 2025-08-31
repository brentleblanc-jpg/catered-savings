# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with timeout and retry, skip optional deps
RUN npm install --timeout=300000 --retry=3 --no-optional

# Copy source code
COPY . .

# Generate Prisma client (after copying source code)
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
