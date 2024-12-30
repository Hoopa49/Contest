const express = require("express");
const router = express.Router();
const { contentMakerYoutube } = require("../models/Connection");
const { authenticateToken } = require("./authRoutes");

// Получение всех активных контент-мейкеров
router.get("/content-makers", async (req, res) => {
  try {
    const contentMakers = await contentMakerYoutube.findAll({
      where: { isActive: true },
      order: [['contestCount', 'DESC']]
    });
    res.json(contentMakers);
  } catch (error) {
    console.error("Error fetching content makers:", error);
    res.status(500).json({ error: "Failed to fetch content makers" });
  }
});

// Получение топ-5 контент-мейкеров по количеству конкурсов
router.get("/content-makers/top", async (req, res) => {
  try {
    const topMakers = await contentMakerYoutube.findAll({
      where: { 
        isActive: true,
        contestCount: {
          [Op.gt]: 0
        }
      },
      order: [['contestCount', 'DESC']],
      limit: 5
    });
    res.json(topMakers);
  } catch (error) {
    console.error("Error fetching top content makers:", error);
    res.status(500).json({ error: "Failed to fetch top content makers" });
  }
});

// Обновление статуса контент-мейкера
router.patch("/content-makers/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const maker = await contentMakerYoutube.findByPk(id);
    if (!maker) {
      return res.status(404).json({ error: "Content maker not found" });
    }

    maker.isActive = isActive;
    await maker.save();

    res.json(maker);
  } catch (error) {
    console.error("Error updating content maker:", error);
    res.status(500).json({ error: "Failed to update content maker" });
  }
});

module.exports = router;