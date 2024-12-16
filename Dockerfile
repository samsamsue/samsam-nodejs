# 第一阶段：构建阶段
FROM alpine AS builder
WORKDIR /usr/src/app
RUN apk add --no-cache --update nodejs nodejs-npm
COPY package*.json ./
RUN npm install --production

# 第二阶段：生产环境阶段
FROM alpine
WORKDIR /home/app
RUN apk add --no-cache --update nodejs nodejs-npm
COPY --from=builder /usr/src/app/node_modules ./node_modules  # 路径应一致
COPY . .
CMD [ 'npm', 'start' ]
