@echo off

echo Останавливаем старые контейнеры...
docker-compose down

echo Очищаем неиспользуемые тома...
docker volume prune -f

echo Собираем и запускаем контейнеры...
docker-compose up --build -d

echo Проверяем статус контейнеров...
docker-compose ps

pause 

@REM команда cd Docker .\start.bat