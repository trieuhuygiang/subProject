# Project Presentation

## Application Overview

This is a **Full-Stack Web Application** built with Express.js, PostgreSQL, and EJS templating. The application features a complete user authentication system with profile management capabilities.

---

## Tech Stack

### Frontend
- **HTML/EJS**: Dynamic template rendering
- **CSS**: Responsive styling (Bootstrap-compatible)
- **JavaScript**: Client-side interactivity and validation

### Backend
- **Node.js + Express.js**: RESTful API server
- **PostgreSQL**: Relational database
- **Session Management**: Express-session with PostgreSQL store
- **Authentication**: bcrypt password hashing, CSRF protection

### Additional Tools
- **Multer**: File upload handling for profile images
- **Express-validator**: Input validation and sanitization
- **Dotenv**: Environment configuration management
- **Nodemon**: Development server with auto-reload

---

## Core Features

### 1. **User Authentication System**
Complete session-based authentication with multiple security layers:

- **User Registration** (`POST /auth/register`)
  - Username validation: 3-20 characters, alphanumeric only
  - Email validation: Valid email format, uniqueness check
  - Password requirements: Minimum 8 characters with uppercase, lowercase, and number
  - Password confirmation matching
  - bcrypt hashing (10 salt rounds) for password storage

- **User Login** (`POST /auth/login`)
  - Email and password validation
  - Secure password comparison using bcrypt
  - Session creation with PostgreSQL persistence
  - Flash messages for error feedback
  - Redirect to profile on successful login

- **Session Management**
  - Express-session with PostgreSQL store
  - 24-hour session timeout
  - Auto-cleanup of expired sessions via database indexes
  - httpOnly, secure, sameSite cookie settings

- **Logout** (`GET /auth/logout`)
  - Complete session destruction
  - Database session cleanup
  - Redirect to home page

### 2. **User Profiles & Dashboard**
Comprehensive user profile management system:

- **Profile View** (`GET /user/profile`)
  - Display username, email, registration date
  - Formatted date display (e.g., "December 10, 2025")
  - Profile image avatar (first letter or uploaded image)
  - Member since date calculation
  - Links to edit profile and view settings

- **Profile Settings** (`GET/POST /user/settings`)
  - Update username with duplicate checking
  - Profile image upload (jpg, jpeg, png, gif)
  - File upload validation via multer middleware
  - Maximum file size enforcement
  - Success/error flash messages

- **Profile Image Storage**
  - Binary image data stored in PostgreSQL
  - Automatic MIME type detection
  - Image retrieval endpoint: `GET /user/profile-image/:userId`
  - has_profile_image flag for quick lookup

### 3. **Data Persistence & Database**
PostgreSQL database with comprehensive schema:

- **Users Table**
  - id (PRIMARY KEY)
  - username (UNIQUE, NOT NULL)
  - email (UNIQUE, NOT NULL)
  - password_hash (NOT NULL, bcrypt hashed)
  - has_profile_image (BOOLEAN)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

- **Profile Images Table**
  - id (PRIMARY KEY)
  - user_id (FOREIGN KEY)
  - data (BYTEA - binary image data)
  - content_type (VARCHAR - MIME type)
  - created_at (TIMESTAMP)

- **Session Table** (auto-managed by connect-pg-simple)
  - sid (PRIMARY KEY - session ID)
  - sess (JSONB - session data)
  - expire (TIMESTAMP - expiration time)
  - Automatic cleanup of expired sessions

### 4. **Security Features**
Defense-in-depth security implementation:

- **Password Security**
  - bcrypt hashing with 10 salt rounds
  - Passwords never stored in plaintext
  - Secure password comparison (timing attack resistant)
  - Password confirmation on registration
  - 8-character minimum enforced on both client and server

- **SQL Injection Prevention**
  - Parameterized queries throughout (e.g., `$1, $2` placeholders)
  - User input never directly interpolated into SQL
  - Example: `SELECT * FROM users WHERE email = $1`

- **XSS Protection**
  - EJS template auto-escaping of user data
  - Form input sanitization via express-validator
  - HTML entity encoding in output

- **CSRF Protection** (configured, currently disabled for development)
  - CSRF tokens included in forms
  - Token validation on state-changing requests
  - Can be enabled by removing disable flag in app.js

- **Session Security**
  - httpOnly cookies (prevents JavaScript access)
  - secure flag (HTTPS only in production)
  - sameSite: 'lax' (prevents cross-site usage)
  - 24-hour expiration
  - Server-side session storage

- **Protected Routes**
  - Authentication middleware checks on all protected routes
  - Unauthorized users redirected to login
  - Return-to functionality preserves original URL
  - Session data validation on each request

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  has_profile_image BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Additional Tables
- **Images**: User profile images
- **Movies/Reviews**: Content management (extensible)

---

## Project Structure

```
├── config/
│   └── database.js              # PostgreSQL connection configuration
├── controllers/
│   ├── authController.js        # Authentication logic (register, login, logout)
│   └── userController.js        # User profile and settings management
├── models/
│   ├── User.js                  # User database operations
│   ├── Image.js                 # Image handling
│   ├── Movie.js                 # Movie data (extensible)
│   └── Review.js                # Review data (extensible)
├── routes/
│   ├── auth.js                  # Authentication routes
│   ├── index.js                 # Main/home routes
│   └── user.js                  # User profile routes
├── middlewares/
│   ├── auth.js                  # Authentication middleware
│   ├── error-handler.js         # Global error handling
│   ├── locals.js                # Template locals
│   └── upload.js                # File upload middleware
├── views/
│   ├── home.ejs                 # Home page
│   ├── index.ejs                # Main template
│   ├── error.ejs                # Error page
│   ├── auth/
│   │   ├── login.ejs            # Login form
│   │   └── register.ejs         # Registration form
│   ├── user/
│   │   ├── profile.ejs          # User profile view
│   │   └── settings.ejs         # User settings
│   └── partials/
│       ├── header.ejs           # Navigation header
│       ├── footer.ejs           # Page footer
│       ├── flash-message.ejs    # Alert messages
│       └── form-errors.ejs      # Validation errors
├── public/
│   ├── css/
│   │   ├── style.css            # Main stylesheet
│   │   └── home.css             # Home page styles
│   └── js/
│       └── main.js              # Client-side scripts
├── scripts/
│   ├── db_script.py             # Database initialization (Python)
│   └── init-db.js               # Database initialization (Node.js)
├── app.js                        # Express application entry point
├── package.json                  # Project dependencies
├── .env                          # Environment variables
└── README.md                     # Project documentation
```

---

## Key Routes

### Authentication Routes
- `GET /auth/register` - Registration form
- `POST /auth/register` - Create new user account
- `GET /auth/login` - Login form
- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - Logout user

### User Routes
- `GET /user/profile` - View user profile
- `POST /user/profile` - Update profile information
- `GET /user/settings` - User settings page
- `POST /user/settings` - Update settings

### Main Routes
- `GET /` - Home page
- `GET /about` - About page

---

## Environment Configuration

The application uses a `.env` file for configuration:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/csc317_project
SESSION_SECRET=your_secret_key_here
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 12+
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/CSC317Project-F25.git
   cd CSC317Project-F25
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Initialize database**
   ```bash
   npm run db:init
   ```

5. **Start the server**
   ```bash
   npm start          # Production mode
   npm run dev        # Development mode with hot reload
   ```

6. **Access the application**
   - Open browser and navigate to `http://localhost:3000`

---

## API Endpoints Summary

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required | Status Code |
|--------|----------|-------------|---|---|
| GET | `/auth/register` | Display registration form | No | 200 |
| POST | `/auth/register` | Create new user account | No | 201 (success), 400 (validation error) |
| GET | `/auth/login` | Display login form | No | 200 |
| POST | `/auth/login` | Authenticate user, create session | No | 302 (redirect to /user/profile), 401 (invalid credentials) |
| GET | `/auth/logout` | Destroy session and logout | Yes | 302 (redirect to /) |

**Validation Details:**
- **Register Validation:**
  ```javascript
  - username: 3-20 chars, alphanumeric, unique
  - email: valid format, unique
  - password: min 8 chars, 1 uppercase, 1 lowercase, 1 number
  - confirmPassword: must match password
  ```

- **Login Validation:**
  ```javascript
  - email: valid email format
  - password: minimum 8 characters
  ```

### User Profile Endpoints

| Method | Endpoint | Description | Auth Required | Status Code |
|--------|----------|-------------|---|---|
| GET | `/user/profile` | View user profile | Yes | 200 |
| POST | `/user/profile` | Update profile info | Yes | 302 (redirect), 400 (validation error) |
| GET | `/user/settings` | Display settings form | Yes | 200 |
| POST | `/user/settings` | Update settings and image | Yes | 302 (redirect), 400 (validation error), 413 (file too large) |
| GET | `/user/profile-image/:userId` | Retrieve profile image | No | 200 (image), 404 (not found) |

**Update Settings Validation:**
```javascript
- username: 3-20 chars, alphanumeric, unique
- profileImage: jpg, jpeg, png, gif only, max 5MB
```

### Main Routes

| Method | Endpoint | Description | Auth Required | Status Code |
|--------|----------|-------------|---|---|
| GET | `/` | Home page with feature overview | No | 200 |
| GET | `/about` | About page | No | 200 |

### Response Examples

**Successful Registration:**
```http
POST /auth/register HTTP/1.1
Content-Type: application/x-www-form-urlencoded

username=johndoe&email=john@example.com&password=SecurePass123&confirmPassword=SecurePass123

Response: 302 Found
Location: /auth/login

Set-Cookie: connect.sid=s%3Axyz123...; Path=/; HttpOnly; SameSite=Lax
```

**Successful Login:**
```http
POST /auth/login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

email=john@example.com&password=SecurePass123

Response: 302 Found
Location: /user/profile

Set-Cookie: connect.sid=s%3Axyz456...; Path=/; HttpOnly; Secure; SameSite=Lax
```

**Failed Login (Invalid Credentials):**
```http
POST /auth/login HTTP/1.1

Response: 401 Unauthorized
Body: Login page with error message "Invalid email or password"
```

**Protected Route Without Authentication:**
```http
GET /user/profile HTTP/1.1

Response: 302 Found
Location: /auth/login?returnTo=/user/profile
```

**Get Profile Image:**
```http
GET /user/profile-image/1 HTTP/1.1

Response: 200 OK
Content-Type: image/jpeg
Content-Length: 45678

[Binary image data...]
```

---

## CRUD Operations Implementation

### CREATE Operations (4 implemented)

**1. Create User Account**
- **Endpoint:** `POST /auth/register`
- **Controller:** `authController.js` - `postRegister()` function
- **Model Method:** `User.create()`
- **Database Query:**
  ```sql
  INSERT INTO users (username, email, password_hash, created_at, updated_at)
  VALUES ($1, $2, $3, NOW(), NOW())
  RETURNING id, username, email
  ```
- **Process:**
  - Validate input (username, email, password)
  - Hash password using bcrypt (10 rounds)
  - Create user in PostgreSQL users table
  - Return to login page on success
  - Display validation errors on failure

**2. Create Profile Image**
- **Endpoint:** `POST /user/settings` (with file upload)
- **Controller:** `userController.js` - `updateSettings()`
- **Model Method:** `Image.upsert()`
- **Database Query:**
  ```sql
  INSERT INTO profile_images (user_id, data, content_type, created_at)
  VALUES ($1, $2, $3, NOW())
  ON CONFLICT (user_id) DO UPDATE SET data = $2, content_type = $3
  ```
- **Middleware:** Multer for file upload handling
- **Validation:** 
  - File types: jpg, jpeg, png, gif
  - Maximum file size: 5MB
  - MIME type detection

---

### READ Operations (5 implemented)

**1. Read User Profile**
- **Endpoint:** `GET /user/profile`
- **Controller:** `userController.js` - `getProfile()`
- **Model Method:** `User.findById()`
- **Database Query:**
  ```sql
  SELECT id, username, email, has_profile_image, created_at
  FROM users WHERE id = $1
  ```
- **Authentication:** Required (middleware checks session)
- **Response:** Render user profile page with user data

**2. Read User Settings**
- **Endpoint:** `GET /user/settings`
- **Controller:** `userController.js` - `getSettings()`
- **Model Method:** `User.findById()`
- **Database Query:**
  ```sql
  SELECT id, username, email, has_profile_image, created_at
  FROM users WHERE id = $1
  ```
- **Authentication:** Required
- **Response:** Display settings form with current values

**3. Read User by Email (for login)**
- **Model Method:** `User.findByEmail()`
- **Database Query:**
  ```sql
  SELECT id, username, email, password_hash, has_profile_image, created_at
  FROM users WHERE email = $1
  ```
- **Used by:** Login process for credential verification
- **Returns:** User object with password hash for comparison

**4. Read User by ID**
- **Model Method:** `User.findById()`
- **Database Query:**
  ```sql
  SELECT id, username, email, has_profile_image, created_at, updated_at
  FROM users WHERE id = $1
  ```
- **Used by:** Profile page, settings page, session restoration
- **Returns:** Complete user object

**5. Read Profile Image**
- **Endpoint:** `GET /user/profile-image/:userId`
- **Controller:** `userController.js` - `getUserProfileImage()`
- **Model Method:** `Image.findByUserId()`
- **Database Query:**
  ```sql
  SELECT data, content_type FROM profile_images WHERE user_id = $1
  ```
- **Response:** 
  - Binary image data with correct MIME type header
  - 404 Not Found if no image exists
  - Content-Type set dynamically based on stored MIME type

---

### UPDATE Operations (3 implemented)

**1. Update Username**
- **Endpoint:** `POST /user/settings`
- **Controller:** `userController.js` - `updateSettings()`
- **Model Method:** `User.updateUsername()`
- **Database Queries:**
  ```sql
  -- Check for duplicate
  SELECT COUNT(*) FROM users WHERE username = $1 AND id != $2
  
  -- Update username
  UPDATE users SET username = $1, updated_at = NOW() WHERE id = $2
  RETURNING id, username, email
  ```
- **Validation:**
  - Username 3-20 characters
  - Alphanumeric only
  - Uniqueness check (excluding current user)
  - Server-side and client-side validation
- **Post-Update:** Session user data refreshed

**2. Update Profile Image**
- **Endpoint:** `POST /user/settings` (with file)
- **Controller:** `userController.js` - `updateSettings()`
- **Model Method:** `Image.upsert()`
- **Database Query:**
  ```sql
  INSERT INTO profile_images (user_id, data, content_type, created_at)
  VALUES ($1, $2, $3, NOW())
  ON CONFLICT (user_id) DO UPDATE SET 
    data = EXCLUDED.data,
    content_type = EXCLUDED.content_type,
    updated_at = NOW()
  ```
- **Process:**
  - Multer middleware extracts file
  - Read file buffer from temporary storage
  - Store binary data in database
  - Update has_profile_image flag

**3. Update Profile Image Flag**
- **Model Method:** `User.updateProfileImageFlag()`
- **Database Query:**
  ```sql
  UPDATE users SET has_profile_image = $1, updated_at = NOW() WHERE id = $2
  ```
- **Trigger:** After successful image upload or deletion
- **Purpose:** Quick lookup to determine if avatar needed

---

### DELETE Operations (1 implemented)

**1. Delete Session (Logout)**
- **Endpoint:** `GET /auth/logout` or `POST /auth/logout`
- **Controller:** `authController.js` - `logout()`
- **Process:**
  ```javascript
  req.session.destroy((err) => {
    res.redirect('/');
  })
  ```
- **Database Effect:**
  - Session record deleted from PostgreSQL session table
  - Expiration index ensures cleanup of old sessions
- **Cookie:** Session cookie cleared by browser
- **Result:** User logged out, no longer authenticated

---

### CRUD Summary Table

| Operation | Count | Examples |
|-----------|-------|----------|
| CREATE | 2 | User Registration, Image Upload |
| READ | 5 | User Profile, User Settings, Profile Image, User by Email, User by ID |
| UPDATE | 3 | Update Username, Update Image, Update Image Flag |
| DELETE | 1 | Session Destruction (Logout) |
| **TOTAL** | **11** | Complete CRUD coverage |

---

## Input Validation Architecture

### Client-Side Validation (HTML5 + JavaScript)

**Registration Form** (`/views/auth/register.ejs`):
```html
<input type="text" id="username" name="username" 
  minlength="3" maxlength="20" required 
  pattern="[a-zA-Z0-9]+" 
  title="Alphanumeric characters only">

<input type="email" id="email" name="email" required>

<input type="password" id="password" name="password" 
  minlength="8" required 
  title="Must be at least 8 characters">

<input type="password" id="confirmPassword" name="confirmPassword" 
  minlength="8" required>
```

**Login Form** (`/views/auth/login.ejs`):
```html
<input type="email" id="email" name="email" required>

<input type="password" id="password" name="password" 
  minlength="8" required>
```

**Settings Form** (`/views/user/settings.ejs`):
```html
<input type="text" id="username" name="username" 
  minlength="3" maxlength="20" required>

<input type="file" id="profileImage" name="profileImage" 
  accept="image/jpeg, image/png, image/gif" required>
```

### Server-Side Validation (Express-Validator)

**Registration Validation Chain** (`/routes/auth.js`):
```javascript
const registerValidation = [
  body('username')
    .trim()                                    // Remove whitespace
    .isLength({ min: 3, max: 20 })            // Length check
    .withMessage('Username must be 3-20 characters')
    .isAlphanumeric()                         // Format check
    .withMessage('Username must be alphanumeric')
    .custom(async value => {
      const exists = await User.usernameExists(value);
      if (exists) throw new Error('Username already taken');
    }),
  
  body('email')
    .trim()
    .isEmail()                                // Email format
    .withMessage('Invalid email address')
    .normalizeEmail()                         // Normalize to lowercase
    .custom(async value => {
      const exists = await User.emailExists(value);
      if (exists) throw new Error('Email already registered');
    }),
  
  body('password')
    .isLength({ min: 8 })                    // Minimum length
    .withMessage('Password must be 8+ characters')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)  // Complexity check
    .withMessage('Include uppercase, lowercase, and number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {            // Cross-field validation
      if (value !== req.body.password)
        throw new Error('Passwords do not match');
      return true;
    })
];
```

**Login Validation Chain** (`/routes/auth.js`):
```javascript
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be 8+ characters')
    .notEmpty()
    .withMessage('Password required')
];
```

### Error Handling & Display

**Server-Side Error Processing** (`/controllers/authController.js`):
```javascript
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).render('auth/register', {
    title: 'Register',
    errors: errors.array(),
    formData: {
      username: req.body.username,
      email: req.body.email
    }
  });
}
```

**Error Display in Template** (`/views/partials/form-errors.ejs`):
```ejs
<% if (typeof errors !== 'undefined' && errors.length > 0) { %>
  <div class="alert alert-danger">
    <h5>Please fix the following errors:</h5>
    <ul>
      <% errors.forEach(error => { %>
        <li><%= error.msg %></li>
      <% }); %>
    </ul>
  </div>
<% } %>
```

---

## Complex Feature: Session-Based Authentication

### Architecture Overview

```
User Request → Authentication Middleware → Session Check → Route Handler
                       ↓
                  Is Session Valid?
                  /              \
               YES              NO
               ↓                 ↓
            Next()           Redirect to Login
```

### Component Details

**1. Password Security (Bcrypt)**
- **Hashing:** 10 salt rounds (slow, resistant to brute force)
- **Comparison:** Timing-attack resistant comparison
- **Code:**
  ```javascript
  const bcrypt = require('bcrypt');
  
  // Hash password on registration
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Compare password on login
  const isValid = await bcrypt.compare(inputPassword, storedHash);
  ```

**2. Session Creation & Storage**
- **Store:** PostgreSQL `session` table
- **Middleware:** `express-session` + `connect-pg-simple`
- **Configuration:**
  ```javascript
  app.use(session({
    store: new pgSession({ pool: pool }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 86400000,  // 24 hours
      httpOnly: true,
      secure: true,      // HTTPS only in production
      sameSite: 'lax'
    }
  }));
  ```

**3. Session Data Storage**
- **Stored in Session:**
  ```javascript
  req.session.userId = user.id;
  req.session.user = {
    id: user.id,
    username: user.username,
    email: user.email
  };
  ```
- **Accessible in Templates:**
  ```ejs
  <p>Welcome, <%= user.username %>!</p>
  ```

**4. Authentication Middleware**
- **File:** `/middlewares/auth.js`
- **Function:** `isAuthenticated()`
  ```javascript
  const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/auth/login?returnTo=' + req.path);
    }
    next();
  };
  ```
- **Function:** `isNotAuthenticated()`
  ```javascript
  const isNotAuthenticated = (req, res, next) => {
    if (req.session.user) {
      return res.redirect('/user/profile');
    }
    next();
  };
  ```

**5. Template Locals Middleware**
- **File:** `/middlewares/locals.js`
- **Purpose:** Make authentication status available to all templates
  ```javascript
  exports.setLocals = (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = !!req.session.user;
    res.locals.path = req.path;
    next();
  };
  ```

### Authentication Flow Diagram

```
1. User Registration
   ↓
   Registration Form → POST /auth/register → Validation → Hash Password → 
   → Create User in DB → Redirect to Login

2. User Login
   ↓
   Login Form → POST /auth/login → Validate Email & Password → 
   → Find User by Email → Compare Password with bcrypt → 
   → Create Session → Store in DB → Set Cookie → Redirect to Profile

3. Authenticated Request
   ↓
   Browser sends request with session cookie → 
   → Express-session middleware retrieves session from DB → 
   → req.session contains user data → Route handler executes → 
   → Response includes Set-Cookie header

4. Session Expiration
   ↓
   24 hours pass → Session expires in DB → 
   → Cookie becomes invalid → User must login again

5. Logout
   ↓
   User clicks logout → GET /auth/logout → 
   → req.session.destroy() → Delete session from DB → 
   → Clear cookie → Redirect to home
```

### Security Implications

| Component | Security Benefit |
|-----------|------------------|
| bcrypt hashing | Passwords cannot be recovered from database |
| 10 salt rounds | Brute force attacks made computationally expensive |
| PostgreSQL session store | Sessions persist but are server-side (not client-controlled) |
| httpOnly cookies | JavaScript cannot access session cookie |
| Secure flag | Session cookie only sent over HTTPS (production) |
| sameSite='lax' | Prevents cross-site request forgery attacks |
| 24-hour expiration | Limits window of session hijacking risk |
| Parameterized queries | SQL injection prevention throughout |

---

---

## Features & Capabilities

✅ **Fully Implemented & Tested**
- Complete user registration with validation and uniqueness checks
- Secure login with password hashing (bcrypt)
- Session-based authentication with PostgreSQL persistence
- Profile management with image upload capability
- Protected routes that require authentication
- Input validation (both client-side HTML5 and server-side express-validator)
- Error handling with user-friendly messages
- Responsive design with Bootstrap framework
- CSRF protection framework (disabled for development, can be enabled)
- File upload middleware (multer) with type and size validation
- Flash messages for success/error feedback
- User logout with complete session cleanup

🔄 **Extensible Architecture**
- Add movie/review functionality (models and routes already started)
- Implement social features (follows, likes, comments)
- Add real-time notifications with Socket.io
- Integrate third-party APIs (social login, payment processing)
- Add advanced search and filtering capabilities
- Implement recommendation algorithms
- Add admin dashboard and user management
- Create API rate limiting
- Add email verification on registration
- Implement password reset functionality
- Add user roles and permissions system
- Create audit logs for security events

### Testing Verification Summary

**Registration Flow** ✅
- Username validation: 3-20 characters, alphanumeric
- Email validation: Valid format, uniqueness check passes
- Password requirements: 8+ chars with uppercase, lowercase, digit enforced
- Password confirmation matching verified
- User successfully stored in PostgreSQL users table
- Password properly hashed with bcrypt
- Redirect to login page successful
- Error messages displayed for invalid inputs

**Login Flow** ✅
- Email and password validation working
- Secure password comparison with bcrypt
- Session created and stored in PostgreSQL session table
- User data available in session after login
- 24-hour session timeout configured
- Successful redirect to /user/profile
- Invalid credentials return 401 with error message
- Failed login does not create session

**Profile Access** ✅
- Authenticated users can view /user/profile
- Unauthenticated users redirected to /auth/login
- returnTo parameter preserves original URL
- User data displayed correctly (username, email, registration date)
- Profile image avatar shows if image exists
- Edit Profile button links to settings
- User data persists across session

**Image Upload** ✅
- File upload via multer middleware working
- Supported formats: jpg, jpeg, png, gif
- File size validation (max 5MB)
- MIME type detection and storage
- Binary data stored in profile_images table
- Image retrieval endpoint returns correct image
- has_profile_image flag updated correctly
- Image displayed on profile page
- Upload errors handled gracefully

**Settings Update** ✅
- Username update with duplicate checking
- Uniqueness validation prevents conflicts
- Session updated after username change
- Form data preserved on validation error
- Image upload form submission working
- Success message displayed on update
- File upload with error handling

**Session Persistence** ✅
- Sessions stored in PostgreSQL session table
- Session data survives browser restart
- 24-hour expiration enforced
- Expired sessions automatically cleaned
- httpOnly flag prevents JavaScript access
- Secure flag enabled in production
- sameSite attribute prevents cross-site usage

**Security** ✅
- SQL injection prevention via parameterized queries
- XSS protection via EJS auto-escaping
- Password hashing prevents plaintext storage
- Timing-attack resistant password comparison
- Protected routes block unauthorized access
- Session validation on each request
- CSRF framework in place (configurable)
- File type and size validation on uploads

---

## Deployment

The application is ready for deployment on **Render.com**:

1. **PostgreSQL Database**: Hosted on Render
2. **Web Service**: Node.js application on Render
3. **Environment Variables**: Configured in Render dashboard
4. **Auto-deployment**: Connected to GitHub repository

See `RENDER_DEPLOYMENT.md` for detailed deployment instructions.

---

## Development Guidelines

### Code Style
- 2-space indentation
- camelCase for variables/functions
- PascalCase for classes
- JSDoc comments for functions

### Database Queries
- Use parameterized queries: `$1, $2, etc.`
- Snake_case for column names
- Implement proper error handling

### Error Handling
- Use try/catch blocks
- Pass errors to next() middleware
- Centralized error handler processes all errors

### Validation
- Client-side: HTML5 + JavaScript validation
- Server-side: express-validator middleware
- Both layers required for security

---

## Testing

To run tests:
```bash
npm test
```

*Note: Test suite configuration is in development*

---

## Future Enhancements

1. **User Features**
   - Profile badges and achievements
   - User following/followers system
   - Notification preferences

2. **Content Features**
   - Advanced search and filtering
   - Content recommendations
   - User-generated content ratings

3. **Performance**
   - Caching implementation
   - Database query optimization
   - CDN integration for static assets

4. **Security**
   - Two-factor authentication
   - API key generation
   - Rate limiting

5. **Analytics**
   - User activity tracking
   - Content performance metrics
   - Usage statistics

---

## Support & Documentation

- **Setup Guide**: See `SETUP.md` for detailed installation instructions
- **Deployment Guide**: See `RENDER_DEPLOYMENT.md` for production deployment
- **Code Standards**: See `CLAUDE.md` for development guidelines
- **Main Documentation**: See `README.md` for project overview

---

## Team Responsibilities

Each team member should focus on:
1. **Frontend Developer**: UI/UX, HTML/CSS/JavaScript
2. **Backend Developer**: Express routes, database operations
3. **Full-Stack Developer**: Feature integration, testing
4. **DevOps/Deployment**: Server configuration, deployment

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm start` | Run production server |
| `npm run dev` | Run dev server with auto-reload |
| `npm run db:init` | Initialize database tables |
| `npm test` | Run test suite |

---

**Last Updated**: December 10, 2025  
**Application Status**: ✅ Ready for Development
