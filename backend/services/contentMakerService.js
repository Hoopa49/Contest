const { sequelize, DataTypes } = require('../models/Connection');
const contentMakerYoutube = require('../models/contentMakerYoutube')(sequelize, DataTypes);
const { Op } = require('sequelize');

class ContentMakerService {
  async findOrCreateMaker(channelData) {
    try {
      let maker = await contentMakerYoutube.findOne({
        where: { youtubeId: channelData.youtubeId }
      });

      if (!maker) {
        maker = await contentMakerYoutube.create({
          youtubeId: channelData.youtubeId,
          title: channelData.title,
          lastVideoCheck: new Date()
        });
      }

      return maker;
    } catch (error) {
      console.error('Ошибка при создании/поиске контент-мейкера:', error);
      throw error;
    }
  }

  async updateContestCount(youtubeId) {
    try {
      const maker = await contentMakerYoutube.findOne({
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
      return await contentMakerYoutube.findAll({
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