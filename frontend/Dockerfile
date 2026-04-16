# stage 1: build react app
FROM node:20-alpine AS build

WORKDIR /app

# add dependencies to the layer
COPY package*.json ./
RUN npm install

# build with vite environment variables
ARG VITE_API_BASE_URL=http://localhost:8081/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# stage 2: serve with nginx
FROM nginx:alpine

# copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# use custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
