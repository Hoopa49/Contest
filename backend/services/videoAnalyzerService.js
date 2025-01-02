const CONTEST_KEYWORDS = [
  'конкурс', 'розыгрыш', 'приз', 'giveaway', 'раздача',
  'разыграем', 'разыграю', 'подарок', 'подарим', 'дарим'
];

class VideoAnalyzerService {
  constructor() {
    // Убираем settings из конструктора, так как получаем их в analyzeVideo
  }

  async analyzeVideo(videoData) {
    const settings = await SchedulerSettings.findOne();
    if (!settings) {
      throw new Error('Настройки анализатора не найдены');
    }

    const score = {
      title: 0,
      description: 0,
      tags: 0
    };

    if (this._containsKeywords(videoData.title)) {
      score.title = settings.titleWeight;
    }

    if (this._containsKeywords(videoData.description)) {
      score.description = settings.descriptionWeight;
    }

    if (videoData.tags && videoData.tags.length > 0) {
      const tagScore = this._analyzeTagsScore(videoData.tags);
      score.tags = tagScore * settings.tagsWeight;
    }

    const totalScore = Object.values(score).reduce((a, b) => a + b, 0);

    return {
      isContest: totalScore >= settings.minimumTotalScore,
      score: totalScore,
      details: score,
    };
  }

  _containsKeywords(text) {
    if (!text) return false;
    text = text.toLowerCase();
    return CONTEST_KEYWORDS.some((keyword) =>
      text.includes(keyword.toLowerCase())
    );
  }

  _analyzeTagsScore(tags) {
    const matchingTags = tags.filter((tag) => this._containsKeywords(tag));
    return matchingTags.length / tags.length; // Нормализованный счет от 0 до 1
  }
}

module.exports = new VideoAnalyzerService();
