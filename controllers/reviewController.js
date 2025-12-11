/**
 * Review Controller
 * Handles review CRUD operations
 */
const Review = require('../models/Review');
const { validationResult } = require('express-validator');

/**
 * POST /movies/:id/review
 * Add or update a review for a movie
 */
exports.addReview = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Store errors in session flash for display
            req.session.errors = errors.array();
            return res.redirect(`/movies/${req.params.id}`);
        }

        const userId = req.session.user.id;
        const movieId = req.params.id;
        const reviewText = req.body.review;

        // Use upsert to create or update review
        await Review.upsert(userId, movieId, reviewText);

        // Set success message
        req.session.successMessage = 'Review saved successfully!';

        // Redirect back to movie detail page
        res.redirect(`/movies/${movieId}`);
    } catch (error) {
        console.error('Error adding/updating review:', error);
        next(error);
    }
};

/**
 * DELETE /movies/:movieId/reviews/:userId
 * Delete a user's review (Phase 4)
 */
exports.deleteReview = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const movieId = req.params.movieId;

        // Verify user owns this review (authorization check)
        const deleted = await Review.deleteReview(userId, movieId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Review not found or unauthorized'
            });
        }

        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete review'
        });
    }
};
