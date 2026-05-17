# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy rest of source code
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "src/app.js"]
