FROM node:18

WORKDIR /app
#COPY package.json package-lock.json /app/
COPY . /app
RUN npm install --no-audit --legacy-peer-deps

CMD ["npm", "run", "dev", "--", "--host"]
