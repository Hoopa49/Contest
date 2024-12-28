# backend/Dockerfile

# 1) Базовый образ Node.js
FROM node:18-alpine

# 2) Создадим рабочую директорию внутри контейнера
WORKDIR /app

# 3) Скопируем package.json и package-lock.json
COPY package*.json ./

# 4) Установим зависимости
RUN npm install bcryptjs jsonwebtoken

# 5) Скопируем весь код (например, /backend) внутрь контейнера
COPY . .

# 6) Укажем порт
EXPOSE 3000

# 7) Команда запуска
CMD ["npm", "start"]
