# 构建阶段
FROM node:alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用代码
COPY . .

# 运行阶段
FROM node:alpine

# 设置工作目录
WORKDIR /app

# 从构建阶段复制所需文件
COPY --from=builder /app /app

# 设置环境变量，指示 Node.js 以生产模式运行
ENV NODE_ENV=production

# 公开应用端口
EXPOSE 3000

# 启动应用
CMD ["node", "index.js"]
