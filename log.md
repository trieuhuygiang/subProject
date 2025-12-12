# 🎬 Movie Review Site - Full-Stack Features Presentation
**Student:** Quynh Dinh (QUYNHDINHHP)  
**Course:** CSC317 - Full-Stack Development  
**Date:** December 11, 2025  
**Project Status:** ✅ 100% COMPLETE

---

## 📌 Executive Summary

This presentation demonstrates a **fully functional Movie Review Site** with complete CRUD operations, comprehensive input validation, and complex features including OMDb API integration, intelligent caching, and ranking algorithms.

**Key Achievement:** All required features implemented with bonus functionality (delete account, forgot password).

---

## 🎯 What Was Assigned

Your team was tasked with implementing:
1. ✅ **CRUD Operations** - Create, Read, Update, Delete
2. ✅ **Input Validation** - Both client-side and server-side
3. ✅ **Complex Features** - At least one sophisticated feature

**Your Role:** Implement features, input validation, and advanced functionality

---

## ✨ What Was Delivered

### **1. CRUD Operations (Complete)**

#### **CREATE**
- ✅ **Create Movies** - Via OMDb API search (intelligent caching)
- ✅ **Create Reviews** - Users write reviews for movies (10-1000 characters)
- ✅ **Create Accounts** - User registration with validation

#### **READ**
- ✅ **View Movies** - Home page shows trending & popular movies
- ✅ **Search Movies** - Full-text search functionality
- ✅ **View Reviews** - Movie detail page displays all reviews
- ✅ **View User Reviews** - "My Reviews" page shows user's review history

#### **UPDATE**
- ✅ **Update Reviews** - Users can edit their reviews anytime
- ✅ **Update Profile** - Users can change username and profile picture

#### **DELETE**
- ✅ **Delete Reviews** - Users can remove their reviews (with confirmation)
- ✅ **Delete Account** - Users can delete their entire account (CASCADE deletes all reviews)

---

### **2. Input Validation (Comprehensive)**

#### **Server-Side Validation**
```
✅ Registration: Email format, password strength (≥8 chars), username uniqueness
✅ Login: Email exists, password correct
✅ Reviews: Text length (10-1000 chars), rating (1-5 stars)
✅ Profile: Username uniqueness, file type for images
```

#### **Client-Side Validation**
```
✅ HTML5 attributes: minlength, maxlength, required, pattern, type
✅ JavaScript: Live character counter, form validation before submit
✅ UX Feedback: Error messages, loading states, success notifications
✅ Character Counter: Real-time display of characters used (0/1000)
```

**Demo Example:**
- Try typing a review less than 10 characters → button disabled
- Try typing more than 1000 characters → text stops accepting input
- Live counter updates as you type

---

### **3. Complex Features (Multiple)**

#### **Feature 1: OMDb API Integration with Smart Caching**
**Problem Solved:** Movie data needs to be comprehensive and always available

**Solution:**
```
1. User searches for a movie
2. Check our database FIRST (fast)
3. If not found, fetch from OMDb API (comprehensive)
4. Cache the result in our database (avoid future API calls)
5. Use cached version on next search
```

**Benefits:**
- Reduced API calls (saves costs & increases speed)
- Always have movie poster, rating, genre, plot
- Works offline for previously cached movies

**Code Location:** `models/Movie.js` - `findMovieByTitle()` method

---

#### **Feature 2: Trending Algorithm (Time-Based Ranking)**
**Problem Solved:** How do we show what's popular RIGHT NOW?

**Solution:**
```sql
SELECT movies with reviews from LAST 7 DAYS
ORDER BY number of reviews (descending)
LIMIT 5
```

**Example:**
- Movie A: 5 reviews this week → Position 1 (Trending!)
- Movie B: 2 reviews this week → Position 2
- Movie C: 50 reviews last year → NOT shown (old data)

**Code Location:** `models/Movie.js` - `getTrendingMovies()` method

---

#### **Feature 3: Popular Algorithm (All-Time Ranking)**
**Problem Solved:** Which movies are the community's all-time favorites?

**Solution:**
```sql
SELECT all movies
ORDER BY total number of reviews (all time)
LIMIT 10
```

**Example:**
- Movie A: 100 reviews total → #1 Popular
- Movie B: 50 reviews total → #2 Popular
- New movie: 1 review → Lower ranking

**Code Location:** `models/Movie.js` - `getPopularMovies()` method

---

#### **Feature 4: Smart Deduplication**
**Problem Solved:** Some movies appear in both trending AND popular - how to prevent duplicates?

**Solution:**
```
1. Get top 5 trending movies
2. Get top 10 popular movies
3. Remove any movies that are already in trending
4. Display 5 trending + 5 unique popular = 10 total
```

**Code Location:** `routes/index.js` - Home route logic

---

### **4. Bonus Features (Exceeded Requirements)**

#### **✨ Bonus 1: Delete Review**
- Double confirmation before deletion
- Authorization check (can only delete own reviews)
- Smooth removal from page

#### **✨ Bonus 2: Delete Account**
- Double confirmation dialog
- Cascading deletes all user reviews automatically
- Session cleanup
- Visual "Danger Zone" warning section

#### **✨ Bonus 3: Forgot Password**
- Email + username verification
- Secure password reset functionality
- Flash message notification
- Smooth password update flow

---

## 📊 Technical Implementation

### **Architecture: MVC Pattern**

```
Models/          → Database operations (CRUD)
├── Movie.js     → Movie queries, API calls, algorithms
├── Review.js    → Review CRUD, database operations
└── User.js      → User auth, account management

Routes/          → HTTP endpoints
├── index.js     → Movies, search, reviews
├── auth.js      → Registration, login, forgot password
└── user.js      → Profile, settings, account deletion

Views/           → EJS templates
├── home.ejs     → Trending & popular movies
├── review.ejs   → Movie detail + review form
├── search-results.ejs → Search results with API fetch option
└── auth/        → Login, register, password reset
```

### **Database Schema**

```
users (id, username, email, password, profile_image, created_at)
   ↓
reviews (user_id → users.id, movie_id → movies.id, text, rating)
   ↓
movies (id, title, year, rating, genre, plot, image)
```

**Key Feature:** CASCADE DELETE constraints
- Delete user → automatically delete all their reviews
- Delete movie → automatically delete all its reviews

---

## 🔧 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL |
| **Frontend** | EJS Templates, Vanilla JavaScript, CSS |
| **External API** | OMDb API (movie data) |
| **Authentication** | express-session + bcrypt |
| **Validation** | express-validator + HTML5 |

---

## 📈 Git Commit History

### **Commits Made (in chronological order)**

```
5a85c14 - Implement delete review functionality with client validation
4b533e4 - Add delete account functionality with improved error handling and styling
cb8ac95 - Simplify delete account section - keep bullet list, remove warning text
c5bf8ed - Add forgot password functionality with email+username verification
b27f3f1 - Update forgot password and login views
```

**Total: 5 commits** implementing core features and refinements

---

## 🎬 Live Demo Flow (5 minutes)

### **Scenario: New User's First Experience**

**Step 1: Registration (30 seconds)**
```
1. Click "Register" button
2. Enter email, username, password
3. Submit form
→ Server validates: Email not taken, password ≥8 chars
→ Show success message, redirect to login
```

**Step 2: Login (20 seconds)**
```
1. Click "Login" button
2. Enter email and password
3. Submit form
→ Session created, redirected to home page
```

**Step 3: Browse Movies (30 seconds)**
```
1. Home page loads
2. See "Trending Now" (movies from last 7 days)
3. See "Most Popular" (all-time favorites)
4. Click on a movie to see details
```

**Step 4: Search for a Movie (1 minute)**
```
1. Use search box at top: "Inception"
2. Results show cached movie from our database
3. Click "Don't see your movie?" to fetch from OMDb API
4. New movie added and displayed
```

**Step 5: Write a Review (1 minute)**
```
1. Click movie link
2. Scroll to review form
3. Type review (watch character counter)
4. Select rating (1-5 stars)
5. Click submit
→ Review appears immediately
→ Movie appears in "Trending Now" (recent activity)
```

**Step 6: Manage Reviews (1 minute)**
```
1. Click "My Reviews" in navigation
2. See all your reviews
3. Edit a review - change text, rating
4. Delete a review (confirmation dialog)
→ Review removed from page and database
```

**Step 7: Account Management (30 seconds)**
```
1. Click "Settings"
2. See profile information
3. Scroll to "Delete Account"
4. Click delete (double confirmation)
→ Account deleted, all reviews deleted, redirected to home
```

---

## 📝 Code Quality Highlights

### **Security Features**
✅ Password hashing with bcrypt (not stored in plain text)  
✅ Session-based authentication (not cookies)  
✅ Authorization checks (can only modify own content)  
✅ SQL prepared statements (prevent injection)  

### **Best Practices**
✅ Separation of concerns (Models, Routes, Views)  
✅ DRY principle (reusable functions)  
✅ Error handling (try-catch, middleware)  
✅ Validation layers (client + server)  
✅ Database constraints (CASCADE, NOT NULL, UNIQUE)  

### **User Experience**
✅ Immediate feedback (success/error messages)  
✅ Loading states (visual indication of processing)  
✅ Confirmation dialogs (prevent accidental deletions)  
✅ Character counter (guide user input)  
✅ Real-time validation (form hints)  

---

## ✅ Testing Checklist

All features verified to work:

| Feature | Status | Test Case |
|---------|--------|-----------|
| Register new account | ✅ | Email not taken, password ≥8 chars |
| Login with credentials | ✅ | Correct email & password |
| Search existing movie | ✅ | "Inception" → returns cached data |
| Add movie from API | ✅ | "The Godfather" → fetched & cached |
| Write review (10-1000 chars) | ✅ | Text appears immediately |
| Edit review | ✅ | Changes saved to database |
| Delete review | ✅ | Removed with confirmation |
| View my reviews | ✅ | Shows all user's reviews |
| Update profile | ✅ | Username & image updated |
| Delete account | ✅ | User & reviews deleted |
| Forgot password | ✅ | Reset with email+username |
| Character counter | ✅ | Real-time updates (0/1000) |
| Trending algorithm | ✅ | Shows last 7 days reviews |
| Popular algorithm | ✅ | Shows all-time rankings |

---

## 🎓 Learning Outcomes

**What This Project Demonstrates:**

1. **Full-Stack Development**
   - Backend: RESTful API with Express.js
   - Database: PostgreSQL with relationships
   - Frontend: Dynamic EJS templates with JavaScript

2. **Software Engineering Principles**
   - MVC architecture
   - DRY (Don't Repeat Yourself)
   - SOLID principles
   - Separation of concerns

3. **Real-World Features**
   - Third-party API integration
   - Caching strategies
   - Authentication & authorization
   - Input validation & sanitization
   - Error handling & user feedback

4. **Professional Practices**
   - Git version control
   - Code organization
   - Security best practices
   - Database design

---

## 🚀 Summary

### **Requirements Met:**
✅ **CRUD Operations** - All 4 operations fully implemented  
✅ **Input Validation** - Client-side + server-side  
✅ **Complex Features** - OMDb API, 2 ranking algorithms, smart deduplication  
✅ **Code Quality** - Clean, secure, well-organized  
✅ **User Experience** - Intuitive, responsive, helpful feedback  

### **Bonus Delivered:**
✨ Delete account with CASCADE  
✨ Delete review functionality  
✨ Forgot password feature  
✨ Live character counter  
✨ Comprehensive error handling  

### **Result:**
🎉 **Production-ready application** that could be deployed and used by real users

---

## 📞 Questions?

**Demo Details:**
- OMDb API key: `7e70afff` (1000 calls/day limit)
- Test accounts available in database
- All features tested and working
- Code available on GitHub: `Mystic2122/CSC317`

**Key Files to Review:**
- `models/Movie.js` - API integration & algorithms
- `models/Review.js` - Review CRUD with authorization
- `routes/index.js` - Search, home, review endpoints
- `views/review.ejs` - Review form with validation
- `public/css/style.css` - Professional styling

---

**Thank you!** 🙏

This project demonstrates a complete understanding of full-stack web development, from database design through user interface implementation.
