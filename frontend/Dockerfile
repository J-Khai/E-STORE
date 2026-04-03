# Stage 1: Build React app
FROM node:18-alpine AS build

WORKDIR /app

# Add dependencies to the layer
COPY package*.json ./
RUN npm install

# Build with Vite environment variables
ARG VITE_API_BASE_URL=http://localhost:8081/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Use our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
