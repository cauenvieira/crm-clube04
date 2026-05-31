FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* tsconfig.base.json ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install

FROM deps AS build
WORKDIR /app
COPY apps/worker apps/worker
COPY packages/shared packages/shared
RUN npm run build -w @clube04/shared && npm run build -w @clube04/worker

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install --omit=dev
COPY --from=build /app/apps/worker/dist apps/worker/dist
COPY --from=build /app/packages/shared/dist packages/shared/dist
CMD ["npm", "run", "start", "-w", "@clube04/worker", "--", "serve"]
