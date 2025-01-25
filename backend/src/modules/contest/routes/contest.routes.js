const express = require('express')
const router = express.Router()
const contestController = require('../controllers/contest.controller')
const contestCommentController = require('../controllers/contest_comment.controller')
const contestReviewController = require('../controllers/contest_review.controller')
const contestShareStatsController = require('../controllers/contest_share_stats.controller')
const { authMiddleware } = require('../../../middleware/auth.middleware')

// Публичные маршруты без параметров
router.get('/', contestController.getContests)
router.get('/recent', contestController.getRecentContests)

// Защищенные маршруты без параметров
router.get('/favorites', authMiddleware, contestController.getFavoriteContests)

// Публичные маршруты с параметрами
router.get('/:id', contestController.getContestById)
router.get('/:id/stats', contestController.getContestStats)
router.get('/:id/comments', contestCommentController.getComments)
router.get('/:id/reviews', contestReviewController.getReviews)
router.get('/:id/share-stats', contestShareStatsController.getContestShareStats)
router.post('/:id/share-stats', contestShareStatsController.incrementShareCount)

// Все остальные защищенные маршруты
router.use(authMiddleware)

// Управление конкурсами
router.post('/', contestController.createContest)
router.put('/:id', contestController.updateContest)
router.delete('/:id', contestController.deleteContest)
router.post('/:id/participate', contestController.participate)
router.post('/:id/favorite', contestController.toggleFavorite)

// Управление комментариями
router.post('/:id/comments', contestCommentController.addComment)
router.post('/:id/comments/:commentId/replies', contestCommentController.addReply)
router.put('/comments/:id', contestCommentController.updateComment)
router.delete('/comments/:id', contestCommentController.deleteComment)

// Управление отзывами
router.post('/:id/reviews', contestReviewController.addReview)
router.put('/reviews/:reviewId', contestReviewController.updateReview)
router.delete('/reviews/:reviewId', contestReviewController.deleteReview)
router.post('/reviews/:reviewId/like', contestReviewController.toggleLike)
router.post('/reviews/:reviewId/report', contestReviewController.reportReview)

module.exports = router 