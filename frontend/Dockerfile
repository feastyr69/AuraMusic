FROM node:20-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

EXPOSE 5173

# Run Vite dev server, bound to 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host"]
