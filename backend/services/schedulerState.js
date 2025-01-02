const state = {
  isRunning: false,
  lastRunTime: null,
  currentProgress: {
    totalVideos: 0,
    processedVideos: 0,
    foundContests: 0,
    status: "idle",
  }
};

function updateProgress(progress) {
  state.currentProgress = { ...state.currentProgress, ...progress };
  if (global.wsService) {
    global.wsService.broadcast({
      type: 'scheduler_progress',
      data: state.currentProgress
    });
  }
}

module.exports = {
  state,
  updateProgress
}; 