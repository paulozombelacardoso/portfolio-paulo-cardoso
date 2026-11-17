FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx vite build
ENV NODE_ENV=production PORT=4000
EXPOSE 4000
CMD ["npx", "tsx", "server/index.ts"]
