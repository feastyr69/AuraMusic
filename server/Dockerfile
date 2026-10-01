FROM node:20-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build the TypeScript code
RUN npm run build

EXPOSE 8000

# Start the application using the compiled entrypoint
CMD ["node", "dist/index.js"]
