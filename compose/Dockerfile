# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:16 AS builder

LABEL maintainer="Ethan Andrews <eandrews@whoi.edu>"

ENV NPM_CONFIG_LOGLEVEL=error

WORKDIR /app

# Install all node packages
COPY ./react-frontend/package*.json /app/
# Uncomment to populate from a local node_modules directory
# COPY ./node_modules /app/node_modules
RUN npm install --no-audit

# Copy sources and build
COPY ./react-frontend /app
RUN npm run build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:alpine

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=builder /app/build .

# Copy nginx conf file to
COPY ./compose/nginx.conf /etc/nginx/conf.d/default.conf

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
