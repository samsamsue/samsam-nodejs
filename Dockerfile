#使用Node.js Alpine 镜像
#大幅减小镜像体积的最简单和最快的方法是选择一个小得多的基本镜像。Alpine是一个很小的Linux发行版，可以完成这项工作。只要选择Node.js的Alpine版本，就会有很大的改进。
FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm install 

COPY . .

EXPOSE 3000

CMD ["npm", "start"]