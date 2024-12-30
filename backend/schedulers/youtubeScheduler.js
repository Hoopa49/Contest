const cron = require("node-cron");
const videoService = require("../services/videoService");
const youtubeApi = require("../utils/youtubeApi");
const videoAnalyzer = require("../services/videoAnalyzerService");

// Массив ключевых слов для поиска
const SEARCH_KEYWORDS = [
  "конкурс розыгрыш",
  "giveaway приз",
  "розыгрыш приза",
  "конкурс приз",
  "раздача призов",
];

// Функция для обработки найденных видео
async function processVideo(videoData) {
  try {
    // Проверяем, существует ли уже это видео
    const existingVideo = await videoService.findVideoByYoutubeId(
      videoData.videoId
    );
    if (existingVideo) {
      console.log(
        `Пропускаем видео ${videoData.videoId}: уже существует в базе`
      );
      return null;
    }

    // Получаем полную информацию о видео
    let fullVideoInfo;
    try {
      fullVideoInfo = await youtubeApi.getVideoDetails(videoData.videoId);
    } catch (error) {
      console.error(
        `Ошибка при получении данных видео ${videoData.videoId}:`,
        error.message
      );
      return null;
    }

    // Проверяем дату публикации
    const publishDate = new Date(videoData.publishedAt);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (publishDate < oneWeekAgo) {
      console.log(`Пропускаем видео ${videoData.videoId}: старше 7 дней`);
      return null;
    }

    if (!fullVideoInfo) {
      console.log(`Пропускаем видео ${videoData.videoId}: нет данных`);
      return null;
    }

    // Анализируем видео
    const analysisResult = videoAnalyzer.analyzeVideo(fullVideoInfo);

    // Комбинируем данные
    const combinedData = {
      title: videoData.title,
      link: `https://www.youtube.com/watch?v=${videoData.videoId}`,
      author: videoData.channelTitle,
      source: "youtube",
      publicationDate: videoData.publishedAt,
      description: videoData.description,
      channelTitle: videoData.channelTitle,
      viewCount: fullVideoInfo.viewCount,
      likeCount: fullVideoInfo.likeCount,
      youtubeId: videoData.videoId,
      status: analysisResult.isContest ? "contest" : "not_contest",
      metadata: {
        ...fullVideoInfo,
        thumbnails: videoData.thumbnails,
        analysis: analysisResult,
      },
    };

    // Добавляем видео в базу данных
    const savedVideo = await videoService.addVideoFromUrl(combinedData);

    // Если видео определено как конкурс, создаем запись в Contest
    if (analysisResult.isContest) {
      console.log("Обнаружен конкурс, создаем запись...", {
        title: savedVideo.title,
        youtubeId: savedVideo.youtubeId,
        status: savedVideo.status,
      });
      await createContestFromVideo(savedVideo);
    }

    console.log(
      `Видео "${videoData.title}" успешно обработано. Статус: ${combinedData.status}`
    );
  } catch (error) {
    console.error(
      `Ошибка при обработке видео ${videoData.videoId}:`,
      error.message
    );
    return null; // Пропускаем это видео и продолжаем с следующим
  }
}

// Добавляем новую функцию для создания конкурса
async function createContestFromVideo(video) {
  try {
    const { Contest } = require("../models/Connection");

    // Извлекаем даты из описания или используем текущую дату
    const dates = extractDatesFromDescription(video.description);

    await Contest.create({
      name: video.title,
      title: video.title,
      description: video.description,
      startDate: dates.startDate || new Date(),
      endDate: dates.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // По умолчанию неделя
      videoId: video.youtubeId,
      status: "active",
      prize: extractPrizeFromDescription(video.description) || "Не указано",
      conditions:
        extractConditionsFromDescription(video.description) ||
        "Условия не указаны",
    });

    console.log(`Создан новый конкурс на основе видео: ${video.title}`);
  } catch (error) {
    console.error("Ошибка при создании конкурса:", error);
    throw error; // Пробрасываем ошибку дальше для обработки
  }
}

// Функция для извлечения дат из описания
function extractDatesFromDescription(description) {
  // Простая реализация - можно улучшить с помощью регулярных выражений или библиотек для парсинга дат
  const dates = {
    startDate: new Date(),
    endDate: null,
  };

  try {
    // Ищем упоминания дат в описании
    const dateRegex = /(\d{1,2}[-.\/]\d{1,2}[-.\/]\d{2,4})/g;
    const foundDates = description.match(dateRegex);

    if (foundDates && foundDates.length > 0) {
      // Если нашли хотя бы одну дату
      dates.startDate = new Date(foundDates[0].replace(/[-./]/g, "/"));

      // Если нашли вторую дату
      if (foundDates.length > 1) {
        dates.endDate = new Date(foundDates[1].replace(/[-./]/g, "/"));
      } else {
        // Если вторая дата не найдена, устанавливаем endDate на неделю вперед
        dates.endDate = new Date(
          dates.startDate.getTime() + 7 * 24 * 60 * 60 * 1000
        );
      }
    }
  } catch (error) {
    console.error("Ошибка при извлечении дат из описания:", error);
  }

  return dates;
}

function extractPrizeFromDescription(description) {
    try {
      const prizes = [];
      const prizeRegex = /приз[ыов]?:?.*?(?:\d+\.|[-•])\s*(.*?)(?=\n|$)/gi;
      let match;
  
      while ((match = prizeRegex.exec(description)) !== null) {
        if (match[1].trim()) {
          prizes.push(match[1].trim());
        }
      }
  
      // Если призы не найдены, проверяем другие варианты
      if (prizes.length === 0) {
        const simpleRegex = /разыгрыва[ею]м\s+(.*?)(?=\n|$)/i;
        const simpleMatch = description.match(simpleRegex);
        if (simpleMatch && simpleMatch[1].trim()) {
          prizes.push(simpleMatch[1].trim());
        }
      }
  
      return prizes.length > 0 ? prizes : [];
    } catch (error) {
      console.error('Ошибка при извлечении призов из описания:', error);
      return [];
    }
  }

function extractConditionsFromDescription(description) {
  try {
    // Ищем условия участия в описании
    const conditionsRegex =
      /услови[яй].*?:|правила.*?:|для участия.*?:|участник.*?:/i;
    const parts = description.split(conditionsRegex);

    if (parts.length > 1) {
      // Берем текст после найденного маркера до следующего разделителя
      const conditions = parts[1].split(/\n\n|\r\n\r\n/)[0].trim();
      return conditions || "Условия не указаны";
    }

    return "Условия не указаны";
  } catch (error) {
    console.error("Ошибка при извлечении условий из описания:", error);
    return "Условия не указаны";
  }
}

// Функция для запуска поиска
async function runYouTubeScheduler() {
  console.log("Запуск задачи по сбору видео с YouTube...");

  try {
    // Получаем дату последней недели
    const publishedAfter = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    for (const keyword of SEARCH_KEYWORDS) {
      console.log(`Поиск видео по ключевым словам: ${keyword}`);

      // Получаем список видео
      const videos = await youtubeApi.searchVideos(keyword, 5, publishedAfter); // Ограничиваем до 5 видео на каждое ключевое слово

      // Обрабатываем каждое видео
      for (const video of videos) {
        await processVideo(video);
      }
    }

    console.log("Задача по сбору видео с YouTube завершена.");
  } catch (error) {
    console.error("Ошибка при выполнении задачи:", error);
  }
}

// Запускаем задачу каждый день в полночь
cron.schedule("0 0 * * *", runYouTubeScheduler);

module.exports = { runYouTubeScheduler };
