
## December 11, 2025 - quynh-p3 Branch - Full-Stack Features Review

### Chat Session Summary

**Context:** User on quynh-p3 branch asked to review current state of Full-Stack Features implementation for project requirements.

**Project Type:** Book/Movie Review Site  
**User's Responsibility:** Full-Stack Features
- CRUD operations
- Input validation (both client and server side)
- At least one complex feature unique to the project

---

### Current Implementation Status

#### ✅ What's Already Working:

**1. CRUD Operations (Partial)**
- **Movies:**
  - ✅ CREATE: `insert()` in models/Movie.js - Inserts movie from OMDb API
  - ✅ READ: Multiple query methods (findMovieByTitle, getPopularMovies, getTrendingMovies, findLocalMovies)
  - ❌ UPDATE: Not implemented (not needed for this project)
  - ❌ DELETE: Not implemented (admin feature, optional)

- **Reviews:**
  - ✅ CREATE/UPDATE: `upsert()` in models/Review.js - Creates or updates review (smart handling)
  - ✅ READ: `getReviewsByUser()`, `getReviewsByMovie()`
  - ❌ DELETE: Not implemented yet

- **Users:**
  - ✅ Full CRUD from template (User.js model)

**2. Input Validation**
- ✅ Server-side validation: express-validator in routes/auth.js (registration/login)
- ✅ Client-side validation: HTML5 + JavaScript in auth forms
- ❌ **MISSING**: Movie search validation
- ❌ **MISSING**: Review submission validation (text length, rating)

**3. Complex Features**
- ✅ **OMDb API Integration**: Automatically fetches movie data from external API
- ✅ **Intelligent Caching**: Checks database first, falls back to API, then stores result
- ✅ **Trending Algorithm**: Time-based review counting (last 7 days with JOIN queries)
- ✅ **Popular Algorithm**: All-time review ranking with LEFT JOIN
- ✅ **Smart Deduplication**: No duplicates between trending and popular lists

---

### 🔴 CURRENT STATUS - FEATURES NOT YET IMPLEMENTED

#### ❌ Priority 1: Movie Detail Page & Review Display
**Status:** NOT IMPLEMENTED - Files do not exist yet

**Files That Need to Be Created:**
```
❌ routes/movies.js              - Movie-specific routes (MISSING)
❌ controllers/movieController.js - Movie business logic (MISSING)
❌ controllers/reviewController.js - Review business logic (MISSING)
❌ views/movies/detail.ejs       - Movie detail page template (MISSING)
```

**Routes Needed:**
```javascript
❌ GET /movies/:id              - View movie + all reviews
❌ POST /movies/:id/review      - Add/update review (authenticated)
❌ DELETE /reviews/:id          - Delete own review (authenticated)
```

**Model Methods to Add:**
```javascript
// models/Movie.js
❌ findById(id)                 - Get movie by ID with review count

// models/Review.js
❌ getReviewsWithUsernames(movieId) - Get reviews with user info
❌ deleteReview(userId, movieId)    - Delete specific review
```

---

#### ❌ Priority 2: Input Validation for Reviews
**Status:** NOT IMPLEMENTED

**Server-Side (express-validator):**
```javascript
❌ Need to add to routes/movies.js:
const reviewValidation = [
  body('review')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review must be between 10 and 1000 characters'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5 stars')
];
```

**Client-Side (HTML5 + JavaScript):**
- ❌ Add to review form in views/movies/detail.ejs:
  - `required` attribute
  - `minlength="10"` and `maxlength="1000"`
  - Character counter display
  - Rating input validation

- ❌ Add to public/js/main.js:
  - Real-time validation feedback
  - Character counter logic
  - Submit button disable/enable based on validation

---

#### ❌ Priority 3: Complete CRUD - Delete Review
**Status:** NOT IMPLEMENTED

**Implementation:**
1. ❌ Add DELETE route in routes/movies.js
2. ❌ Create deleteReview controller method
3. ❌ Add deleteReview() to Review model
4. ❌ Add "Delete" button in views (only for user's own reviews)
5. ❌ Add authorization check (can only delete own reviews)
6. ❌ Confirm deletion with JavaScript prompt

---

#### ❌ Priority 4: Update Home Page Navigation
**Status:** NOT IMPLEMENTED

**Changes Needed in views/home.ejs:**
```html
<!-- Current: movie cards show info but no link -->
<!-- Change to: -->
❌ <a href="/movies/<%= movie.id %>" class="movie-card-link">
  <!-- existing movie card content -->
</a>
```

**Update app.js:**
```javascript
❌ // Add new route
const movieRoutes = require('./routes/movies');
app.use('/movies', movieRoutes);
```

---

### Implementation Plan (Step-by-Step)

#### Phase 1: Movie Detail Page (2-3 hours) ❌ NOT STARTED
1. ❌ Create routes/movies.js with GET /movies/:id
2. ❌ Create controllers/movieController.js with getMovieDetail()
3. ❌ Add findById() to models/Movie.js
4. ❌ Add getReviewsWithUsernames() to models/Review.js
5. ❌ Create views/movies/detail.ejs with movie info and review list
6. ❌ Update views/home.ejs to link to detail pages
7. ❌ Register movie routes in app.js
8. ❌ Test: Can view movie detail page with reviews

#### Phase 2: Add Review Form (1-2 hours) ❌ NOT STARTED
1. ❌ Add review form to views/movies/detail.ejs
2. ❌ Add POST /movies/:id/review route
3. ❌ Create controllers/reviewController.js with addReview()
4. ❌ Add server-side validation with express-validator
5. ❌ Add client-side validation (HTML5 + JS)
6. ❌ Test: Can add review when logged in

#### Phase 3: Edit Review (1 hour) ❌ NOT STARTED
1. ❌ Show user's existing review in form (pre-filled)
2. ❌ Change form submit to "Update Review" if user already reviewed
3. ❌ Test: Can update own review, upsert works correctly

#### Phase 4: Delete Review (1 hour) ❌ NOT STARTED
1. ❌ Add deleteReview() to models/Review.js
2. ❌ Add DELETE /reviews/:id route
3. ❌ Add delete button (only for user's own reviews)
4. ❌ Add authorization check in controller
5. ❌ Add JavaScript confirmation prompt
6. ❌ Test: Can delete own review, cannot delete others'

#### Phase 5: Polish & Test (1-2 hours) ❌ NOT STARTED
1. ❌ Style movie detail page (CSS)
2. ❌ Add character counter to review form
3. ❌ Add review count to user profile
4. ❌ Test all CRUD operations thoroughly
5. ❌ Test all validation (client and server)
6. ❌ Test authentication checks
7. ❌ Error handling for edge cases

**Total Estimated Time: 6-9 hours**

---

### Testing Checklist

#### CRUD Operations
- [ ] ❌ Can fetch movie from API (if not in DB)
- [ ] ❌ Can view movie list on home page
- [ ] ❌ Can click movie to view detail page
- [ ] ❌ Can add review (authenticated users only)
- [ ] ❌ Can edit own review (authenticated)
- [ ] ❌ Can delete own review (authenticated)
- [ ] ❌ Cannot edit/delete other users' reviews

#### Input Validation
- [ ] ❌ Review text minimum 10 characters (server-side)
- [ ] ❌ Review text maximum 1000 characters (server-side)
- [ ] ❌ Review text required (client-side)
- [ ] ❌ Character counter shows remaining chars (client-side)
- [ ] ❌ Empty reviews blocked (client-side)
- [ ] ❌ Validation errors display properly (both sides)

#### Authentication & Authorization
- [ ] ❌ Must be logged in to add review (redirects to login)
- [ ] ❌ Must be logged in to edit review
- [ ] ❌ Must be logged in to delete review
- [ ] ❌ Can only edit/delete own reviews
- [ ] ❌ Appropriate error messages shown

#### Complex Features
- [ ] ✅ OMDb API fetches correct movie data (WORKING)
- [ ] ✅ Movie is cached in DB after first fetch (WORKING)
- [ ] ✅ Trending shows movies reviewed in last 7 days (WORKING)
- [ ] ✅ Popular shows all-time most-reviewed movies (WORKING)
- [ ] ✅ No duplicate movies between trending and popular (WORKING)
- [ ] ✅ Minimum 10 movies shown on home page (WORKING)

---

### Demo Talking Points (5 minutes)

**Opening (30 seconds):**
"Our Movie Review Site allows users to search for movies via the OMDb API, view details, and add reviews. I'll demonstrate the Full-Stack Features I implemented."

**1. CRUD Operations (2 minutes):**
- "First, CREATE: I'll search for a movie. The system fetches from OMDb API and stores it."
- "READ: Here's the movie detail page showing all reviews from users."
- "UPDATE: As a logged-in user, I can edit my review. The system uses an upsert pattern."
- "DELETE: I can remove my review. Notice I can't delete others' reviews - that's authorization working."

**2. Input Validation (1 minute):**
- "Client-side: Watch this character counter update as I type. The form blocks empty submissions."
- "Server-side: If I bypass client validation, express-validator catches it and shows error messages."

**3. Complex Feature (1.5 minutes):**
- "Our unique feature: Intelligent movie ranking. 'Trending' shows movies reviewed in the last 7 days."
- "Popular shows all-time rankings. The system uses complex SQL JOINs and prevents duplicates."
- "The OMDb API integration is smart - it checks our database first for caching, then fetches externally."

**Closing (30 seconds):**
"All features work seamlessly with proper error handling, authentication, and responsive design. The code follows MVC architecture with PostgreSQL for persistence."

---

### Code Changes Required

#### New Files to Create:

1. **routes/movies.js**
```javascript
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const movieController = require('../controllers/movieController');
const reviewController = require('../controllers/reviewController');

// GET /movies/:id - View movie detail
router.get('/:id', movieController.getMovieDetail);

// POST /movies/:id/review - Add/update review (authenticated)
router.post('/:id/review', isAuthenticated, reviewController.addReview);

// DELETE /reviews/:id - Delete review (authenticated)
router.delete('/reviews/:id', isAuthenticated, reviewController.deleteReview);

module.exports = router;
```

2. **controllers/movieController.js**
```javascript
const Movie = require('../models/Movie');
const Review = require('../models/Review');

exports.getMovieDetail = async (req, res, next) => {
  try {
    const movieId = req.params.id;
    const movie = await Movie.findById(movieId);
    
    if (!movie) {
      return res.status(404).render('error', {
        title: 'Movie Not Found',
        message: 'The requested movie could not be found.'
      });
    }
    
    const reviews = await Review.getReviewsWithUsernames(movieId);
    const userReview = req.session.user 
      ? reviews.find(r => r.user_id === req.session.user.id)
      : null;
    
    res.render('movies/detail', {
      title: movie.title,
      movie,
      reviews,
      userReview
    });
  } catch (error) {
    next(error);
  }
};
```

3. **controllers/reviewController.js**
```javascript
const Review = require('../models/Review');
const { validationResult } = require('express-validator');

exports.addReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Handle validation errors
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.session.user.id;
    const movieId = req.params.id;
    const reviewText = req.body.review;
    
    await Review.upsert(userId, movieId, reviewText);
    res.redirect(`/movies/${movieId}`);
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const reviewId = req.params.id; // This needs to be movieId actually
    
    const deleted = await Review.deleteReview(userId, reviewId);
    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
```

4. **views/movies/detail.ejs**
```html
<%- include('../partials/header') %>

<div class="container movie-detail-container">
  <div class="movie-info">
    <img src="<%= movie.image %>" alt="<%= movie.title %> poster" class="movie-poster-large">
    <div class="movie-details">
      <h1><%= movie.title %></h1>
      <p class="movie-meta">
        <span><%= movie.year || 'N/A' %></span> • 
        <span><%= movie.rating || 'NR' %></span> • 
        <span><%= movie.genre || 'Unknown' %></span>
      </p>
      <p class="movie-plot"><%= movie.plot %></p>
      <p class="review-count"><%= movie.review_count || 0 %> reviews</p>
    </div>
  </div>
  
  <% if (isAuthenticated) { %>
    <div class="add-review-section">
      <h2><%= userReview ? 'Edit Your Review' : 'Add Your Review' %></h2>
      <form action="/movies/<%= movie.id %>/review" method="POST" id="reviewForm">
        <textarea 
          name="review" 
          id="reviewText"
          placeholder="Write your review..."
          required
          minlength="10"
          maxlength="1000"
        ><%= userReview ? userReview.review : '' %></textarea>
        <div class="char-counter">
          <span id="charCount">0</span>/1000 characters
        </div>
        <button type="submit" class="btn primary-btn">
          <%= userReview ? 'Update Review' : 'Submit Review' %>
        </button>
        <% if (userReview) { %>
          <button type="button" class="btn secondary-btn" onclick="deleteReview()">
            Delete Review
          </button>
        <% } %>
      </form>
    </div>
  <% } else { %>
    <p class="login-prompt">
      <a href="/auth/login">Login</a> to add a review
    </p>
  <% } %>
  
  <div class="reviews-section">
    <h2>User Reviews</h2>
    <% if (reviews && reviews.length > 0) { %>
      <% reviews.forEach(review => { %>
        <div class="review-card">
          <div class="review-header">
            <strong><%= review.username %></strong>
            <span class="review-date">
              <%= new Date(review.created_at).toLocaleDateString() %>
              <% if (review.edited) { %>(edited)<% } %>
            </span>
          </div>
          <p class="review-text"><%= review.review %></p>
        </div>
      <% }) %>
    <% } else { %>
      <p>No reviews yet. Be the first to review!</p>
    <% } %>
  </div>
</div>

<script>
// Character counter
const reviewText = document.getElementById('reviewText');
const charCount = document.getElementById('charCount');

if (reviewText && charCount) {
  reviewText.addEventListener('input', () => {
    charCount.textContent = reviewText.value.length;
  });
  // Initialize on page load
  charCount.textContent = reviewText.value.length;
}

// Delete review function
function deleteReview() {
  if (confirm('Are you sure you want to delete your review?')) {
    fetch('/movies/reviews/<%= movie.id %>', {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.location.reload();
      }
    })
    .catch(err => console.error(err));
  }
}
</script>

<%- include('../partials/footer') %>
```

#### Files to Modify:

1. **models/Movie.js - Add findById()**
```javascript
// Add after existing functions
const findById = async (id) => {
  const result = await query(
    `SELECT 
       m.id,
       m.title,
       m.year,
       m.rating,
       m.genre,
       m.plot,
       m.image,
       COUNT(r.user_id) AS review_count
     FROM movies m
     LEFT JOIN reviews r ON r.movie_id = m.id
     WHERE m.id = $1
     GROUP BY m.id`,
    [id]
  );
  return result.rows[0] || null;
};

// Add to module.exports
module.exports = {
  // ... existing exports
  findById,
};
```

2. **models/Review.js - Add methods**
```javascript
// Add after existing functions
const getReviewsWithUsernames = async (movieId) => {
  const result = await query(
    `SELECT 
       r.user_id,
       r.movie_id,
       r.review,
       r.created_at,
       r.edited,
       u.username
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.movie_id = $1
     ORDER BY r.created_at DESC`,
    [movieId]
  );
  return result.rows;
};

const deleteReview = async (userId, movieId) => {
  const result = await query(
    `DELETE FROM reviews
     WHERE user_id = $1 AND movie_id = $2
     RETURNING *`,
    [userId, movieId]
  );
  return result.rowCount > 0;
};

// Add to module.exports
module.exports = {
  // ... existing exports
  getReviewsWithUsernames,
  deleteReview,
};
```

3. **app.js - Register movie routes**
```javascript
// Add after other route imports (around line 20)
const movieRoutes = require('./routes/movies');

// Add after other app.use() calls (around line 100)
app.use('/movies', movieRoutes);
```

4. **views/home.ejs - Add links to movie cards**
```html
<!-- Find the movie card section and wrap in link -->
<article class="movie-card">
  <a href="/movies/<%= movie.id %>" class="movie-poster-link">
    <!-- existing poster and content -->
  </a>
</article>
```

5. **routes/movies.js - Add validation**
```javascript
const { body } = require('express-validator');

const reviewValidation = [
  body('review')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review must be between 10 and 1000 characters')
];

router.post('/:id/review', 
  isAuthenticated, 
  reviewValidation,
  reviewController.addReview
);
```

---

### Next Session Tasks

1. **🔴 CRITICAL - Immediate (Today/Tomorrow):**
   - [ ] ❌ Create routes/movies.js
   - [ ] ❌ Create controllers/movieController.js
   - [ ] ❌ Create controllers/reviewController.js
   - [ ] ❌ Add findById() to Movie model
   - [ ] ❌ Add getReviewsWithUsernames() to Review model
   - [ ] ❌ Add deleteReview() to Review model

2. **⚠️ HIGH PRIORITY - Short-term (This Week):**
   - [ ] ❌ Create views/movies/detail.ejs
   - [ ] ❌ Update home page links to movie detail pages
   - [ ] ❌ Add review form with validation
   - [ ] ❌ Implement delete review functionality
   - [ ] ❌ Test CRUD operations
   - [ ] ❌ Style movie detail page

3. **📋 Before Demo:**
   - [ ] ❌ Complete all testing checklist items
   - [ ] ❌ Prepare demo script
   - [ ] ❌ Test on fresh database
   - [ ] ❌ Verify all features work
   - [ ] ❌ Check responsive design

---

## 🔴 ACTUAL CURRENT STATUS (December 11, 2025)

### ✅ What IS Working:
- User authentication (login/register)
- OMDb API integration
- Movie search and display on home page
- Trending/Popular algorithms
- Database models for User, Movie, Review

### ❌ What IS NOT Working / Missing:
- **NO movie detail pages** - files don't exist
- **NO review system** - can't create, read, update, or delete reviews
- **NO CRUD implementation** for reviews
- **NO input validation** for reviews
- **NO RESTful API endpoints** for movies/reviews

### 📊 Completion Status: ~40%
- Backend models: ✅ Complete
- OMDb API: ✅ Complete
- Authentication: ✅ Complete
- **Review System: ❌ 0% Complete**
- **CRUD Operations: ❌ 0% Complete**
- **Input Validation: ❌ 0% Complete**

---

**End of Log**  
*⚠️ WARNING: Most Full-Stack Features NOT YET IMPLEMENTED*  
*Need to complete Phases 1-5 before demo*  
*Estimated 6-9 hours of work remaining*
