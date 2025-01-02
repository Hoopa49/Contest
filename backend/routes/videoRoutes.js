const express = require("express");
const router = express.Router();
const { Video } = require("../models/Connection");
const youtubeApi = require("../utils/youtubeApi");
const videoService = require("../services/videoService");
const { authenticateToken } = require("./authRoutes");

// Анализ видео по URL
router.post("/videos/analyze", authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    const videoId = youtubeApi.extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const video = await videoService.addVideoFromUrl({
      link: url,
      author: req.user.email,
      source: "youtube"
    });

    res.status(201).json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({
      error: "Failed to analyze video",
      details: error.message
    });
  }
});

// Получение всех видео с фильтрацией
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, isContest } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }
    if (isContest === 'true') {
      where.status = 'contest';
    }

    const videos = await Video.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// Обновление статуса видео
router.patch("//:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const video = await Video.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    video.status = status;
    await video.save();

    res.json(video);
  } catch (error) {
    console.error("Error updating video status:", error);
    res.status(500).json({ error: "Failed to update video status" });
  }
});

module.exports = router;