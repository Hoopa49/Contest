/**
 * Contest Processor Service
 * Сервис для обработки данных конкурсов
 */

const { 
  contest: Contest, 
  draft_contest: DraftContest, 
  youtube_video: YoutubeVideo, 
  youtube_channel: YoutubeChannel, 
  youtube_analytics: YoutubeAnalytics, 
  youtube_settings: YoutubeSettings 
} = require('../../../models');
const { Op } = require('sequelize');
const { logger } = require('../../../logging');
const youtubeApi = require('./youtube-api.service');

class ContestProcessorService {
  constructor() {
    this.settings = null
  }

  /**
   * Загрузка настроек
   */
  async loadSettings() {
    try {
      this.settings = await YoutubeSettings.findOne()
      if (!this.settings) {
        throw new Error('Настройки YouTube API не найдены')
      }
      return this.settings
    } catch (error) {
      logger.error('Ошибка при загрузке настроек YouTube API:', error)
      throw error
    }
  }

  /**
   * Получение настроек
   */
  async getSettings() {
    if (!this.settings) {
      await this.loadSettings()
    }
    return this.settings
  }

  /**
   * Обработка черновика конкурса
   */
  async processDraft(draftId) {
    try {
      // Получаем черновик
      const draft = await DraftContest.findOne({
        where: { id: draftId }
      })

      if (!draft) {
        throw new Error('Черновик не найден')
      }

      // Извлекаем данные из описания
      const description = draft.description
      const prizes = this.extractPrizes(description)
      const rules = this.extractRules(description)
      const requirements = this.extractRequirements(description)
      const dates = this.extractDates(description)

      // Создаем конкурс
      const contest = await Contest.create({
        videoId: draft.videoId,
        title: draft.title,
        description: draft.description,
        publishedAt: draft.publishedAt,
        thumbnails: draft.thumbnails,
        channelId: draft.channelId,
        channelTitle: draft.channelTitle,
        tags: draft.tags,
        duration: draft.duration,
        viewCount: draft.viewCount,
        likeCount: draft.likeCount,
        commentCount: draft.commentCount,
        prizes,
        rules,
        requirements,
        startDate: dates.startDate,
        endDate: dates.endDate
      })

      // Удаляем черновик
      await draft.destroy()

      return contest

    } catch (error) {
      logger.error('Ошибка при обработке черновика:', error)
      throw error
    }
  }

  /**
   * Извлечение призов из описания
   */
  extractPrizes(description) {
    const prizes = new Set()
    const prizeMatches = description.match(/(?:Приз|Подарок|Награда):\s*([^.]+)/g) || []
    
    prizeMatches.forEach(match => {
      const prize = match.replace(/(?:Приз|Подарок|Награда):\s*/, '').trim()
      prizes.add(prize)
    })

    return Array.from(prizes).map(description => ({ description }))
  }

  /**
   * Извлечение правил из описания
   */
  extractRules(description) {
    const rules = new Set()
    const ruleMatches = description.match(/(?:Правило|Условие):\s*([^.]+)/g) || []
    
    ruleMatches.forEach(match => {
      const rule = match.replace(/(?:Правило|Условие):\s*/, '').trim()
      rules.add(rule)
    })

    return Array.from(rules).map(description => ({ description }))
  }

  /**
   * Извлечение требований из описания
   */
  extractRequirements(description) {
    const requirements = new Set()
    const requirementMatches = description.match(/(?:Требование|Нужно):\s*([^.]+)/g) || []
    
    requirementMatches.forEach(match => {
      const requirement = match.replace(/(?:Требование|Нужно):\s*/, '').trim()
      // Пропускаем числовые значения
      if (!/^\d+$/.test(requirement)) {
        requirements.add(requirement)
      }
    })

    return Array.from(requirements).map(description => ({ description }))
  }

  /**
   * Извлечение дат из описания
   */
  extractDates(description) {
    const startDateMatch = description.match(/Начало:\s*(\d{4}-\d{2}-\d{2})/)
    const endDateMatch = description.match(/Конец:\s*(\d{4}-\d{2}-\d{2})/)

    let startDate = startDateMatch ? new Date(startDateMatch[1]) : null
    let endDate = endDateMatch ? new Date(endDateMatch[1]) : null

    // Проверяем валидность дат
    if (startDate && isNaN(startDate.getTime())) startDate = null
    if (endDate && isNaN(endDate.getTime())) endDate = null

    // Проверяем последовательность дат
    if (startDate && endDate && startDate > endDate) {
      startDate = null
      endDate = null
    }

    return { startDate, endDate }
  }

  /**
   * Анализ текста на наличие признаков конкурса
   */
  analyzeText(text) {
    if (!text) return 0
    
    text = text.toLowerCase()
    let score = 0
    let matchedKeywords = []

    for (const keyword of this.contestKeywords) {
      const regex = new RegExp(keyword, 'gi')
      const matches = text.match(regex)
      if (matches) {
        score += matches.length
        matchedKeywords.push(keyword)
      }
    }

    // Нормализуем оценку от 0 до 1
    const probability = Math.min(score / 5, 1)

    return {
      probability,
      matchedKeywords: [...new Set(matchedKeywords)]
    }
  }

  /**
   * Анализ видео на наличие конкурса
   */
  async analyzeVideo(videoData) {
    try {
      const settings = await this.getSettings()
      const { title, description } = videoData.snippet
      const contestKeywords = ['конкурс', 'розыгрыш', 'giveaway', 'раздача']
      const prizeKeywords = ['приз', 'подарок', 'prize', 'gift']
      const conditionKeywords = ['условия', 'подписаться', 'лайк', 'комментарий', 'subscribe', 'like', 'comment']

      // Подсчет ключевых слов
      const contestCount = contestKeywords.reduce((count, word) => 
        count + (title.toLowerCase().includes(word) ? 2 : 0) + 
        (description.toLowerCase().includes(word) ? 1 : 0), 0)

      const prizeCount = prizeKeywords.reduce((count, word) => 
        count + (title.toLowerCase().includes(word) ? 2 : 0) + 
        (description.toLowerCase().includes(word) ? 1 : 0), 0)

      const conditionCount = conditionKeywords.reduce((count, word) => 
        count + (description.toLowerCase().includes(word) ? 1 : 0), 0)

      // Расчет вероятности конкурса
      const probability = Math.min(
        (contestCount * 0.4 + prizeCount * 0.3 + conditionCount * 0.3) / 10,
        1
      )

      return {
        isContest: probability >= settings.contest_probability_threshold,
        probability,
        hasTitle: contestCount > 0,
        hasPrize: prizeCount > 0,
        hasConditions: conditionCount > 0
      }
    } catch (error) {
      logger.error('Ошибка при анализе видео:', error)
      throw error
    }
  }

  /**
   * Обработка видео
   * @param {string} videoId - ID видео на YouTube
   * @param {Object} searchParams - Параметры поиска
   */
  async processVideo(videoId) {
    try {
      // Проверяем, не обработано ли уже это видео
      const existingVideo = await YoutubeVideo.findOne({
        where: { youtube_id: videoId }
      });

      if (existingVideo) {
        logger.info('Видео уже обработано:', { videoId });
        return existingVideo;
      }

      // Получаем детали видео
      const videoDetails = await this.youtubeApi.getVideoDetails(videoId);

      if (!videoDetails) {
        logger.warn('Не удалось получить детали видео:', { videoId });
        return null;
      }

      // Анализируем видео на предмет конкурса
      const { isContest, probability } = await this.analyzeVideo(videoDetails);

      // Получаем или создаем канал
      const [channel] = await YoutubeChannel.findOrCreate({
        where: { channel_id: videoDetails.snippet.channelId },
        defaults: {
          title: videoDetails.snippet.channelTitle,
          status: 'active'
        }
      });

      // Создаем запись о видео
      const video = await YoutubeVideo.create({
        youtube_id: videoId,
        title: videoDetails.snippet.title,
        description: videoDetails.snippet.description,
        channel_id: channel.channel_id,
        channel_title: channel.title,
        publish_date: videoDetails.snippet.publishedAt,
        views_count: parseInt(videoDetails.statistics.viewCount) || 0,
        likes_count: parseInt(videoDetails.statistics.likeCount) || 0,
        comments_count: parseInt(videoDetails.statistics.commentCount) || 0,
        thumbnail_url: videoDetails.snippet.thumbnails.medium?.url || videoDetails.snippet.thumbnails.default?.url,
        is_contest: isContest,
        contest_probability: probability,
        status: 'processed'
      });

      // Если это конкурс, обновляем статистику канала
      if (isContest) {
        await channel.increment('contest_videos_count');
        if (channel.contest_videos_count >= 3) {
          await channel.update({ contest_channel: true });
        }
      }

      logger.info('Видео обработано:', { 
        videoId,
        isContest,
        probability 
      });

      return video;
    } catch (error) {
      logger.error('Ошибка обработки видео:', {
        videoId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Анализ видео на предмет конкурса
   */
  analyzeVideoForContest(videoDetails, searchParams) {
    const { title, description } = videoDetails.snippet;
    const contestKeywords = ['конкурс', 'розыгрыш', 'giveaway', 'приз', 'подарок'];
    const threshold = searchParams.contestProbabilityThreshold || 0.5;

    // Проверяем заголовок
    const titleMatch = contestKeywords.some(keyword => 
      title.toLowerCase().includes(keyword.toLowerCase())
    );

    // Проверяем описание
    const descriptionMatch = contestKeywords.some(keyword => 
      description.toLowerCase().includes(keyword.toLowerCase())
    );

    // Если есть совпадение в заголовке, даем больший вес
    if (titleMatch) {
      return { isContest: true, probability: 0.8 };
    }

    // Если есть совпадение в описании, даем меньший вес
    if (descriptionMatch) {
      return { isContest: true, probability: 0.6 };
    }

    return false;
  }

  /**
   * Определение типа конкурса
   */
  determineContestType(videoDetails) {
    const { title, description } = videoDetails.snippet;
    const text = (title + ' ' + description).toLowerCase();

    if (text.includes('розыгрыш')) return 'giveaway';
    if (text.includes('конкурс')) return 'contest';
    return 'other';
  }

  /**
   * Получение статистики по конкурсам
   */
  async getContestStats() {
    try {
      const settings = await this.getSettings()

      // Получаем общее количество конкурсных видео
      const totalContests = await YoutubeVideo.count({
        where: {
          is_contest: true
        }
      })

      // Получаем количество активных конкурсов
      const activeContests = await YoutubeVideo.count({
        where: {
          is_contest: true,
          published_at: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // За последние 30 дней
          }
        }
      })

      // Получаем количество каналов с конкурсами
      const channelsWithContests = await YoutubeChannel.count({
        where: {
          contest_count: {
            [Op.gte]: settings.min_contest_videos_for_channel
          }
        }
      })

      // Получаем статистику по конкурсам за последние 30 дней
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const dailyStats = await YoutubeAnalytics.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('AVG', sequelize.col('view_count')), 'avgViews'],
          [sequelize.fn('AVG', sequelize.col('like_count')), 'avgLikes'],
          [sequelize.fn('AVG', sequelize.col('comment_count')), 'avgComments']
        ],
        where: {
          created_at: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
      })

      return {
        total: totalContests,
        active: activeContests,
        channels: channelsWithContests,
        dailyStats: dailyStats.map(stat => ({
          date: stat.get('date'),
          count: parseInt(stat.get('count')),
          avgViews: Math.round(parseFloat(stat.get('avgViews'))),
          avgLikes: Math.round(parseFloat(stat.get('avgLikes'))),
          avgComments: Math.round(parseFloat(stat.get('avgComments')))
        }))
      }
    } catch (error) {
      logger.error('Ошибка при получении статистики конкурсов:', error)
      throw error
    }
  }

  /**
   * Обработка канала
   * @param {string} channelId - ID канала на YouTube
   */
  async processChannel(channelId) {
    try {
      const channel = await YoutubeChannel.findOne({
        where: { channel_id: channelId }
      });

      if (channel) {
        logger.debug('Обработка канала:', {
          channelId,
          title: channel.title,
          contestVideosCount: channel.contest_videos_count
        });

        const videos = await this.youtubeApi.getChannelVideos(channelId)
        
        logger.info('Получены видео канала:', { 
          channelId,
          count: videos.length 
        })

        const contests = []
        for (const video of videos) {
          try {
            const contest = await this.processVideo(video.id)
            if (contest) {
              contests.push(contest)
            }
          } catch (error) {
            logger.error('Ошибка обработки видео канала:', {
              channelId,
              videoId: video.id,
              error: error.message
            })
          }
        }

        logger.info('Обработка канала завершена:', { 
          channelId,
          processed: videos.length,
          contests: contests.length 
        })

        return contests
      }
    } catch (error) {
      logger.error('Ошибка при обработке канала:', {
        channelId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new ContestProcessorService() 