/**
 * Movie Controller
 * Handles movie detail page logic
 */
const Movie = require('../models/Movie');
const Review = require('../models/Review');

/**
 * GET /movies/:id
 * Display movie detail page with all reviews
 */
exports.getMovieDetail = async (req, res, next) => {
    try {
        const movieId = req.params.id;

        // Get movie details
        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).render('error', {
                title: 'Movie Not Found',
                message: 'The requested movie could not be found.',
                error: { status: 404 }
            });
        }

        // Get all reviews for this movie
        const reviews = await Review.getReviewsWithUsernames(movieId);

        // Find current user's review if logged in
        const userReview = req.session.user
            ? reviews.find(r => r.user_id === req.session.user.id)
            : null;

        // Get flash messages from session
        const successMessage = req.session.successMessage;
        const errors = req.session.errors;

        // Clear flash messages
        delete req.session.successMessage;
        delete req.session.errors;

        res.render('movies/detail', {
            title: movie.title,
            movie,
            reviews,
            userReview,
            successMessage: successMessage || null,
            errors: errors || []
        });
    } catch (error) {
        console.error('Error fetching movie detail:', error);
        next(error);
    }
};
