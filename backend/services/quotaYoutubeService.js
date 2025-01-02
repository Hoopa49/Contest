const { QuotaHistory, QuotaSettings } = require("../models/Connection");
const emailService = require("./emailService");

class QuotaYoutubeService {
  constructor() {
    this.dailyLimit = 10000;
    this.quotaUsed = 0;
    this.resetDate = new Date();
    this.quotaCosts = {
      search: 100,
      videoDetails: 1,
      channelDetails: 1
    };
    this.initialized = false;
    this.lastAlertSent = null;
  }

  async init() {
    if (this.initialized) return;
    
    // Загружаем последнюю запись квоты
    const lastQuota = await QuotaHistory.findOne({
      order: [['resetDate', 'DESC']]
    });

    if (lastQuota) {
      const lastResetDate = new Date(lastQuota.resetDate);
      if (this._isSameDay(lastResetDate, new Date())) {
        this.quotaUsed = lastQuota.quotaUsed;
        this.resetDate = lastResetDate;
      } else {
        await this._createNewQuotaRecord();
      }
    } else {
      await this._createNewQuotaRecord();
    }
    
    this.initialized = true;
  }

  async checkQuota(operation) {
    await this.init();
    await this._resetIfNeeded();
    
    const cost = this.quotaCosts[operation];
    if (!cost) {
      throw new Error(`Неизвестная операция: ${operation}`);
    }
    
    if (this.quotaUsed + cost > this.dailyLimit) {
      throw new Error('Достигнут дневной лимит квоты');
    }
    
    this.quotaUsed += cost;
    await this._updateQuotaRecord();
    return cost;
  }

  async _resetIfNeeded() {
    const now = new Date();
    if (!this._isSameDay(now, this.resetDate)) {
      await this._createNewQuotaRecord();
    }
  }

  _isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  async _createNewQuotaRecord() {
    this.quotaUsed = 0;
    this.resetDate = new Date();
    await QuotaHistory.create({
      quotaUsed: this.quotaUsed,
      dailyLimit: this.dailyLimit,
      resetDate: this.resetDate
    });
  }

  async _updateQuotaRecord() {
    await QuotaHistory.update(
      { quotaUsed: this.quotaUsed },
      { 
        where: {
          resetDate: this.resetDate
        }
      }
    );
  }

  getCurrentQuota() {
    return {
      used: this.quotaUsed,
      remaining: this.dailyLimit - this.quotaUsed,
      limit: this.dailyLimit,
      resetDate: this.resetDate
    };
  }

  async getQuotaStatus() {
    await this.init();
    await this._resetIfNeeded();

    const settings = await this._getSettings();
    const now = new Date();
    const resetTime = new Date(this.resetDate);
    resetTime.setDate(resetTime.getDate() + 1);
    
    const quotaPercentage = (this.quotaUsed / this.dailyLimit) * 100;
    
    // Проверяем необходимость отправки уведомления
    await this._checkAndSendAlert(quotaPercentage, settings);

    return {
      used: this.quotaUsed,
      total: this.dailyLimit,
      percentage: quotaPercentage,
      resetTime: resetTime.toISOString()
    };
  }

  async _checkAndSendAlert(percentage, settings) {
    if (!settings.emailNotifications) return;
    
    const now = new Date();
    // Отправляем уведомление не чаще раза в час
    if (this.lastAlertSent && (now - this.lastAlertSent) < 3600000) return;

    if (percentage >= settings.criticalThreshold) {
      await this._sendQuotaAlert('critical', percentage);
      this.lastAlertSent = now;
    } else if (percentage >= settings.warningThreshold) {
      await this._sendQuotaAlert('warning', percentage);
      this.lastAlertSent = now;
    }
  }

  async _sendQuotaAlert(level, percentage) {
    const subject = level === 'critical' 
      ? 'Критический уровень квоты YouTube API' 
      : 'Предупреждение о квоте YouTube API';
    
    const message = `
      Уровень использования квоты достиг ${percentage.toFixed(2)}%
      
      Текущая статистика:
      - Использовано единиц: ${this.quotaUsed}
      - Дневной лимит: ${this.dailyLimit}
      - Сброс квоты: ${this.resetDate.toLocaleString()}
      
      ${level === 'critical' ? 'Требуется немедленное внимание!' : 'Рекомендуется проверить настройки сборщика.'}
    `;

    await emailService.sendEmail(subject, message);
  }

  async _getSettings() {
    let settings = await QuotaSettings.findOne();
    if (!settings) {
      settings = await QuotaSettings.create({
        warningThreshold: 70,
        criticalThreshold: 90,
        emailNotifications: false
      });
    }
    return settings;
  }

  // Добавим метод для обновления настроек
  async updateSettings(newSettings) {
    let settings = await QuotaSettings.findOne();
    if (settings) {
      await settings.update(newSettings);
    } else {
      settings = await QuotaSettings.create(newSettings);
    }
    return settings;
  }

  async getDetailedStats() {
    await this.init();
    
    // Получаем статистику по часам за текущий день
    const hourlyStats = await QuotaHistory.findAll({
      where: {
        resetDate: this.resetDate
      },
      order: [['createdAt', 'ASC']]
    });

    // Получаем статистику по операциям
    const operationStats = await this._getOperationStats();

    return {
      hourlyUsage: hourlyStats.map(stat => ({
        hour: stat.createdAt,
        used: stat.quotaUsed
      })),
      operationStats,
      currentUsage: this.quotaUsed,
      dailyLimit: this.dailyLimit,
      resetDate: this.resetDate
    };
  }

  async _getOperationStats() {
    // Получаем статистику использования по типам операций
    const stats = {};
    for (const operation of Object.keys(this.quotaCosts)) {
      stats[operation] = await this._countOperations(operation);
    }
    return stats;
  }

  async _countOperations(operation) {
    // Здесь можно добавить логику подсчета операций из логов или другого источника
    return 0; // Заглушка, нужно реализовать реальный подсчет
  }
}

module.exports = new QuotaYoutubeService(); 