const CONTEST_KEYWORDS = [
  'конкурс', 'розыгрыш', 'приз', 'giveaway', 'раздача',
  'разыграем', 'разыграю', 'подарок', 'подарим', 'дарим'
];

class VideoAnalyzerService {
  analyzeVideo(videoData) {
    const score = {
      title: 0,
      description: 0,
      tags: 0,
      comments: 0,
    };

    // Анализ заголовка
    if (this._containsKeywords(videoData.title)) {
      score.title = 30; // Высокий вес для заголовка
    }

    // Анализ описания
    if (this._containsKeywords(videoData.description)) {
      score.description = 25; // Значительный вес для описания
    }

    // Анализ тегов
    if (videoData.tags && videoData.tags.length > 0) {
      const tagScore = this._analyzeTagsScore(videoData.tags);
      score.tags = tagScore * 20; // Умножаем на вес тегов
    }

    // Анализ комментариев
    if (videoData.comments && videoData.comments.length > 0) {
      const commentScore = this._analyzeCommentsScore(videoData.comments);
      score.comments = commentScore * 25; // Умножаем на вес комментариев
    }

    // Подсчет общего результата
    const totalScore = Object.values(score).reduce((a, b) => a + b, 0);

    return {
      isContest: totalScore >= 40, // Порог определения конкурса
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

  _analyzeCommentsScore(comments) {
    const contestComments = comments.filter((comment) =>
      this._containsKeywords(comment.text)
    );
    return Math.min(contestComments.length / comments.length, 1); // Нормализованный счет от 0 до 1
  }
}

module.exports = new VideoAnalyzerService();
