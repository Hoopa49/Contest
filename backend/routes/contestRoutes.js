const express = require("express");
const router = express.Router();
const { Contest, Video } = require("../models/Connection");
const { authenticateToken } = require("./authRoutes");

// Получение всех конкурсов
router.get("/", authenticateToken, async (req, res) => {
  try {
    const contests = await Contest.findAll({
      include: [
        {
          model: Video,
          attributes: ["title", "link", "author", "description", "metadata"],
          required: false
        },
      ],
      order: [["startDate", "DESC"]],
    });
    res.json(contests);
  } catch (error) {
    console.error("Error fetching contests:", error);
    console.error("Detailed error:", error.stack);
    res.status(500).json({ 
      error: "Failed to fetch contests",
      details: error.message 
    });
  }
});

// Создание нового конкурса
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { videoId, startDate, endDate, title, description } = req.body;

    // Сначала проверяем существование видео
    const video = await Video.findByPk(videoId);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Затем проверяем статус
    if (video.status !== "contest") {
      return res
        .status(400)
        .json({ error: "This video is not marked as a contest" });
    }

    const contest = await Contest.create({
      name: title || video.title,
      title: title || video.title,
      description: description || video.description,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      videoId: video.youtubeId,
      status: "active",
      prize: "Не указано",
      conditions: "Условия не указаны"
    });

    res.status(201).json(contest);
  } catch (error) {
    console.error("Error creating contest:", error);
    res.status(500).json({ error: "Failed to create contest" });
  }
});

// Обновление конкурса
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const contest = await Contest.findByPk(id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    await contest.update(updateData);
    res.json(contest);
  } catch (error) {
    console.error("Error updating contest:", error);
    res.status(500).json({ error: "Failed to update contest" });
  }
});

// Удаление конкурса
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findByPk(id);

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    await contest.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting contest:", error);
    res.status(500).json({ error: "Failed to delete contest" });
  }
});

module.exports = router;
