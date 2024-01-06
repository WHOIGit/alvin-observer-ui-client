# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:18.17-bullseye AS builder

LABEL maintainer="Ethan Andrews <eandrews@whoi.edu>"

ENV NPM_CONFIG_LOGLEVEL=error

WORKDIR /app

# Uncomment this section to install our CA certificate to the container, and use
#   --build-arg http_proxy=http://199.92.162.241:3128 \
#   --build-arg https_proxy=http://199.92.162.241:3128
#RUN wget -O /usr/local/share/ca-certificates/squid-ca-cert.crt \
#        http://199.92.162.241/squid-ca-cert.crt \
# && update-ca-certificates
ARG npm_config_cafile=/etc/ssl/certs/ca-certificates.crt 

# Update NPM to latest version
RUN npm i npm@latest -g

# Install all node packages
COPY ./react-frontend/package*.json /app/
RUN npm install --no-audit --legacy-peer-deps
RUN npx update-browserslist-db@latest
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
