# Use Node.js 22 as the base image
FROM node:22-alpine AS base

# Install Python 3 and other dependencies
RUN apk add --no-cache python3 py3-pip ffmpeg

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the declaration file separately
COPY src/fluent-ffmpeg.d.ts ./src/

# Copy the rest of the application code
COPY . .

# Create a types directory and move the declaration file
RUN mkdir -p /app/types && mv /app/src/fluent-ffmpeg.d.ts /app/types/

# Update tsconfig.json to include the new types directory
RUN sed -i 's/"include": \[/"include": \[\n    "types\/**\/*.d.ts",/' tsconfig.json

# Build the Next.js app
RUN npm run build

# Start the application
CMD ["npm", "start"]
