const { sequelize, ContentMakerYoutube } = require('../models/Connection');
const { Op } = require('sequelize');

class ContentMakerService {
  async findOrCreateMaker(channelData, transaction) {
    try {
      let maker = await ContentMakerYoutube.findOne({
        where: { youtubeId: channelData.youtubeId },
        transaction
      });

      if (!maker) {
        maker = await ContentMakerYoutube.create({
          youtubeId: channelData.youtubeId,
          title: channelData.title,
          lastVideoCheck: new Date()
        }, { transaction });
      }

      return maker;
    } catch (error) {
      console.error('Ошибка при создании/поиске контент-мейкера:', error);
      throw error;
    }
  }

  async updateContestCount(youtubeId) {
    try {
      const maker = await ContentMakerYoutube.findOne({
        where: { youtubeId }
      });

      if (maker) {
        maker.contestCount += 1;
        await maker.save();
      }
    } catch (error) {
      console.error('Ошибка при обновлении количества конкурсов:', error);
    }
  }

  async getActiveContentMakers() {
    try {
      return await ContentMakerYoutube.findAll({
        where: { 
          isActive: true,
          contestCount: {
            [Op.gt]: 0 // Больше 0 конкурсов
          }
        },
        order: [['contestCount', 'DESC']]
      });
    } catch (error) {
      console.error('Ошибка при получении активных контент-мейкеров:', error);
      return [];
    }
  }
}

module.exports = new ContentMakerService();