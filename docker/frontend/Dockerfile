# Базовый образ Node.js
FROM node:18-alpine

# Рабочая директория
WORKDIR /app

# Копируем package.json и package-lock.json
COPY frontend/package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY frontend/ .

# Открываем порт
EXPOSE 5173

# Команда запуска в режиме разработки
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 