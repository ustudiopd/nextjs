# 단계 1: 빌드 환경
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 단계 2: 실행 환경
FROM node:16-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./
ENV NODE_ENV production
ENV PORT 8080
EXPOSE 8080
CMD ["npm", "start"]
