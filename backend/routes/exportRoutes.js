const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('./authRoutes');
const { Video } = require('../models/Connection');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');

router.get('/contests', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { type, dateRange, includeAnalysis } = req.query;
    
    // Формируем условия для выборки
    const where = { status: 'contest' };
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      where.createdAt = {
        [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      };
    }

    // Получаем данные
    const contests = await Video.findAll({ where });
    
    // Подготавливаем данные для экспорта
    const exportData = contests.map(contest => {
      const data = {
        title: contest.title,
        link: contest.link,
        author: contest.author,
        createdAt: contest.createdAt
      };
      
      if (includeAnalysis === 'true') {
        data.analysisScore = contest.metadata.analysis.score;
        data.analysisDetails = contest.metadata.analysis.details;
      }
      
      return data;
    });

    // Экспортируем в выбранном формате
    switch (type) {
      case 'csv':
        const parser = new Parser();
        const csv = parser.parse(exportData);
        res.header('Content-Type', 'text/csv');
        res.attachment('contests_export.csv');
        return res.send(csv);

      case 'excel':
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Contests');
        
        // Добавляем заголовки
        const headers = Object.keys(exportData[0]);
        worksheet.addRow(headers);
        
        // Добавляем данные
        exportData.forEach(contest => {
          worksheet.addRow(Object.values(contest));
        });
        
        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment('contests_export.xlsx');
        return workbook.xlsx.write(res);

      case 'json':
        res.header('Content-Type', 'application/json');
        res.attachment('contests_export.json');
        return res.json(exportData);

      default:
        throw new Error('Неподдерживаемый формат экспорта');
    }
  } catch (error) {
    console.error('Ошибка при экспорте:', error);
    res.status(500).json({ error: 'Ошибка при экспорте данных' });
  }
});

module.exports = router; 