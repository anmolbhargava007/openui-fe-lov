# Step 1: Build the app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy files and install dependencies
COPY package.json package-lock.json* ./ 
COPY . .

# Install dependencies
RUN npm install

# Build the app
RUN npm run build

# Step 2: Serve with a static server
FROM nginx:alpine

# Copy the build output to nginx's html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Replace default nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]