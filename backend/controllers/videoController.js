const videoService = require("../services/videoService");

class VideoController {
  async addVideo(req, res) {
    try {
      const { url } = req.body;
      const video = await videoService.addVideoFromUrl(url);

      res.status(201).json({
        success: true,
        data: video,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new VideoController();
