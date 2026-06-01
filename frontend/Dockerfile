# Stage 1: Build static assets
FROM node:20-alpine AS build

WORKDIR /workspace

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source files
COPY . .

# Set environment variable at build time (Vite requires build-time env vars)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Compile React SPA
RUN npm run build

# Stage 2: Serve compiled assets using Nginx
FROM nginx:alpine

# Copy built files
COPY --from=build /workspace/dist /usr/share/nginx/html

# Copy custom Nginx routing config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose served port
EXPOSE 3000

# Start server
CMD ["nginx", "-g", "daemon off;"]
