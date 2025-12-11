/**
 * Movie routes
 * Handles movie detail pages and review operations
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { isAuthenticated } = require('../middlewares/auth');
const movieController = require('../controllers/movieController');
const reviewController = require('../controllers/reviewController');

// Validation rules for review submission
const reviewValidation = [
    body('review')
        .trim()
        .notEmpty()
        .withMessage('Review text is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Review must be between 10 and 1000 characters')
];

// GET /movies/:id - View movie detail page with reviews
router.get('/:id', movieController.getMovieDetail);

// POST /movies/:id/review - Add/update review (authenticated users only)
router.post('/:id/review', isAuthenticated, reviewValidation, reviewController.addReview);

// DELETE /movies/:id - Delete review for current user (Phase 4)
router.delete('/:id', isAuthenticated, reviewController.deleteReview);

module.exports = router;
