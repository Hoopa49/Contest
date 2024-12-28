-- Проверяем существование таблицы
CREATE TABLE IF NOT EXISTS "Contests" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(255),
    "description" TEXT,
    "startDate" TIMESTAMP,
    "endDate" TIMESTAMP,
    "videoId" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем колонки, если их нет
DO $$ 
BEGIN 
    -- Добавляем title, если его нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='Contests' AND column_name='title') THEN
        ALTER TABLE "Contests" ADD COLUMN "title" VARCHAR(255);
    END IF;

    -- Добавляем description, если его нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='Contests' AND column_name='description') THEN
        ALTER TABLE "Contests" ADD COLUMN "description" TEXT;
    END IF;

    -- Добавляем startDate, если его нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='Contests' AND column_name='startDate') THEN
        ALTER TABLE "Contests" ADD COLUMN "startDate" TIMESTAMP;
    END IF;

    -- Добавляем endDate, если его нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='Contests' AND column_name='endDate') THEN
        ALTER TABLE "Contests" ADD COLUMN "endDate" TIMESTAMP;
    END IF;

    -- Добавляем createdAt, если его нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='Contests' AND column_name='createdAt') THEN
        ALTER TABLE "Contests" ADD COLUMN "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Добавляем updatedAt, если его нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='Contests' AND column_name='updatedAt') THEN
        ALTER TABLE "Contests" ADD COLUMN "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;