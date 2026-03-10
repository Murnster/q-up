FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/
RUN npm install && cd client && npm install && cd ../server && npm install
COPY client/ ./client/
COPY server/ ./server/
RUN cd client && npm run build
RUN cd server && npm run build

FROM node:20-slim AS production
WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install --omit=dev
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/dist/server/src/server.js"]
