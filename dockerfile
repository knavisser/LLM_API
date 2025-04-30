# Base image with Node.js
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy only the package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Ensure .env is NOT included (you'll mount it or inject it later)
# Expose the API port
EXPOSE 3000

# Start the API
CMD ["npm", "start"]
