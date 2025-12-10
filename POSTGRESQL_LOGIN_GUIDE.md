# PostgreSQL Setup & Login Flow - Educational Guide

## Table of Contents
1. [PostgreSQL Installation & Configuration](#postgresql-installation--configuration)
2. [Database Setup for Authentication](#database-setup-for-authentication)
3. [Complete Login Flow Explanation](#complete-login-flow-explanation)
4. [Frontend & Backend Integration](#frontend--backend-integration)
5. [Code Breakdown by Component](#code-breakdown-by-component)
6. [How Each Part Works Together](#how-each-part-works-together)

---

## PostgreSQL Installation & Configuration

### What is PostgreSQL?

PostgreSQL is a powerful, open-source relational database management system. It:
- Stores data in organized tables with rows and columns
- Uses SQL (Structured Query Language) for data operations
- Provides ACID compliance (Atomicity, Consistency, Isolation, Durability)
- Supports complex queries, transactions, and data integrity

### Installation on Ubuntu

**Step 1: Update Package Manager**
```bash
sudo apt update
```
This updates the list of available packages from the Ubuntu repositories.

**Step 2: Install PostgreSQL Server and Client**
```bash
sudo apt install postgresql postgresql-contrib
```
- `postgresql`: The database server itself
- `postgresql-contrib`: Additional utilities and extensions

**Step 3: Start PostgreSQL Service**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```
- `start`: Runs the PostgreSQL service immediately
- `enable`: Starts PostgreSQL automatically on system boot

**Step 4: Verify Installation**
```bash
psql --version
# Output: psql (PostgreSQL) 12.22
```

### Setting Up PostgreSQL for Our Application

**Step 1: Access PostgreSQL Superuser Account**
```bash
sudo -u postgres psql
```
- `sudo -u postgres`: Runs command as the `postgres` user (PostgreSQL's default superuser)
- `psql`: The PostgreSQL interactive terminal

**Step 2: Set Password for postgres User**
```sql
ALTER USER postgres WITH PASSWORD 'postgres';
```
This sets the password to `'postgres'` (used in our `.env` file).

**Step 3: Create Application Database**
```sql
CREATE DATABASE csc317_project;
```
This creates a new database specifically for our project.

**Step 4: List Databases**
```sql
\l
```
Output shows all databases:
```
                                  List of databases
       Name       |  Owner   | Encoding |   Collate   |    Ctype    |   Access privileges
------------------+----------+----------+-------------+-------------+-----------------------
 csc317_project   | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | 
 postgres         | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | 
 template0        | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres
 template1        | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres
```

**Step 5: Connect to Application Database**
```sql
\c csc317_project
# Output: You are now connected to database "csc317_project" as user "postgres".
```

**Step 6: Exit PostgreSQL Terminal**
```sql
\q
```

### Understanding Connection Strings

Our application uses this connection string in `.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/csc317_project
```

Breaking it down:
```
postgresql://  ← Protocol (PostgreSQL)
postgres:      ← Username
postgres@      ← Password
localhost      ← Host (computer running database)
5432           ← Port (default PostgreSQL port)
csc317_project ← Database name
```

---

## Database Setup for Authentication

### Creating Tables for User Authentication

Our application requires three main tables. Here's how they're created:

**Table 1: Users Table**
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  has_profile_image BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Explanation of each column:**
| Column | Type | Purpose |
|--------|------|---------|
| `id` | SERIAL PRIMARY KEY | Unique identifier (auto-incrementing) |
| `username` | VARCHAR(255) UNIQUE | User's display name, must be unique |
| `email` | VARCHAR(255) UNIQUE | User's email, must be unique |
| `password_hash` | VARCHAR(255) | Encrypted password (never plaintext!) |
| `has_profile_image` | BOOLEAN | Flag: does user have a profile picture? |
| `created_at` | TIMESTAMP | When user account was created |
| `updated_at` | TIMESTAMP | When user data was last modified |

**Why UNIQUE constraints?**
- `UNIQUE` on username: Prevents two users from having the same username
- `UNIQUE` on email: Prevents two users from signing up with the same email
- These are enforced at the database level for extra security

**Table 2: Profile Images Table**
```sql
CREATE TABLE IF NOT EXISTS profile_images (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  data BYTEA NOT NULL,
  content_type VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Explanation:**
| Column | Type | Purpose |
|--------|------|---------|
| `id` | SERIAL PRIMARY KEY | Unique identifier for image |
| `user_id` | INTEGER UNIQUE | Links to users table, UNIQUE means one image per user |
| `data` | BYTEA | Binary data (actual image file content) |
| `content_type` | VARCHAR(255) | MIME type (e.g., 'image/jpeg', 'image/png') |
| `created_at` | TIMESTAMP | When image was uploaded |
| `FOREIGN KEY` | - | Ensures user_id must exist in users table |
| `ON DELETE CASCADE` | - | Auto-delete image if user is deleted |

**What is BYTEA?**
- BYTEA = Binary Data
- Stores the actual image file as binary data in the database
- This allows profile images to be stored directly in PostgreSQL

**Table 3: Session Table**
```sql
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
  sess jsonb NOT NULL,
  expire timestamp(6) NOT NULL
);
```

**Explanation:**
| Column | Type | Purpose |
|--------|------|---------|
| `sid` | VARCHAR PRIMARY KEY | Unique session ID (sent as cookie to browser) |
| `sess` | JSONB | Session data stored as JSON (user info, etc.) |
| `expire` | TIMESTAMP | When session expires (24 hours from creation) |

**Why is this table needed?**
- When a user logs in, a session is created
- The session ID is sent to the browser as a cookie
- When browser makes requests, the cookie is sent back
- PostgreSQL looks up the session using the session ID
- This verifies the user is authenticated

### Database Initialization Script

Location: `/home/ubuntu/quynh/scripts/init-db.js`

This script creates all tables automatically:

```javascript
const { pool } = require('../config/database');

const initDatabase = async () => {
  try {
    // 1. Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        has_profile_image BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // 2. Create profile_images table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profile_images (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL,
        data BYTEA NOT NULL,
        content_type VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ Profile images table created');

    // 3. Create session table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
        sess jsonb NOT NULL,
        expire timestamp(6) NOT NULL
      );
    `);
    console.log('✓ Session table created');

    // 4. Create indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);
    console.log('✓ Indexes created');

    console.log('\n✅ Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
```

**How to run:**
```bash
npm run db:init
```

This command executes: `node scripts/init-db.js`

---

## Complete Login Flow Explanation

### The Complete Journey of a Login Request

Here's what happens step-by-step when a user enters their email and password and clicks "Login":

### Step 1: User Fills Out Login Form (Frontend)

**File:** `/views/auth/login.ejs`

```html
<form action="/auth/login" method="POST">
  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
  
  <div class="form-group">
    <label for="email">Email Address</label>
    <input type="email" id="email" name="email" 
      placeholder="Enter your email address" 
      required>
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <input type="password" id="password" name="password" 
      minlength="8" required>
  </div>

  <button type="submit">Login</button>
</form>
```

**What happens here:**
- User types email: `john@example.com`
- User types password: `SecurePass123`
- HTML5 validation checks:
  - Email is valid format
  - Password is at least 8 characters
- User clicks "Login" button

### Step 2: Browser Sends POST Request

**HTTP Request:**
```http
POST /auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/x-www-form-urlencoded
Cookie: connect.sid=abc123...  (existing session if any)

email=john@example.com&password=SecurePass123
```

**Browser's role:**
- Converts form data to URL-encoded format
- Sends to `/auth/login` endpoint
- Includes existing session cookie (if user already has one)

### Step 3: Express.js Routes to Handler (Backend)

**File:** `/routes/auth.js` (lines 70-71)

```javascript
// POST /auth/login - Process login form
router.post('/login', isNotAuthenticated, loginValidation, authController.postLogin);
```

**What each part does:**

1. `router.post('/login', ...)` 
   - Matches the `POST /auth/login` request
   - Routes it to the handler function

2. `isNotAuthenticated`
   - Middleware that checks if user is already logged in
   - If already logged in, redirects to `/user/profile`
   - If not logged in, continues to next middleware

3. `loginValidation`
   - Array of validation rules (defined lines 52-60)
   - Checks email format: `body('email').isEmail()`
   - Checks password length: `body('password').isLength({ min: 8 })`

4. `authController.postLogin`
   - The actual handler function that processes login

### Step 4: Input Validation (Server-Side)

**File:** `/routes/auth.js` (lines 52-60)

```javascript
const loginValidation = [
  body('email')
    .trim()                    // Remove whitespace
    .isEmail()                 // Check valid email format
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),         // Convert to lowercase
  
  body('password')
    .trim()                    // Remove whitespace
    .isLength({ min: 8 })      // Check at least 8 chars
    .withMessage('Password must be at least 8 characters long')
    .notEmpty()                // Check not empty
    .withMessage('Password is required')
];
```

**Validation flow:**
```
User Input
    ↓
Express-validator checks
    ├─ Email valid format? → No → Send error
    ├─ Email has value? → No → Send error
    ├─ Password 8+ chars? → No → Send error
    └─ Password has value? → No → Send error
    ↓
All valid? → Continue to handler
All invalid? → Re-render login form with errors
```

### Step 5: Handler Function Processes Login

**File:** `/controllers/authController.js` (lines 119-145)

```javascript
const postLogin = async (req, res, next) => {
  try {
    // 1. Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        errors: errors.array()
      });
    }

    // 2. Get email and password from form
    const { email, password } = req.body;

    // 3. Find user in database
    const user = await User.findByEmail(email);
    
    // 4. Check if user exists
    if (!user) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        message: 'Invalid email or password',
        errors: []
      });
    }

    // 5. Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    // 6. Check if password matches
    if (!passwordMatch) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        message: 'Invalid email or password',
        errors: []
      });
    }

    // 7. Password correct! Create session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    // 8. Redirect to profile
    res.redirect('/user/profile');

  } catch (error) {
    next(error);
  }
};
```

### Step 5a: Database Query - Find User by Email

**File:** `/models/User.js` (lines 33-45)

```javascript
/**
 * Find user by email
 * @param {string} email - User's email
 * @returns {object} User object or null
 */
const findByEmail = async (email) => {
  try {
    const query = `
      SELECT id, username, email, password_hash, has_profile_image, created_at
      FROM users
      WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};
```

**How the database query works:**

```
SQL Query:
SELECT id, username, email, password_hash, has_profile_image, created_at
FROM users
WHERE email = $1

$1 = 'john@example.com' (the email passed in)

PostgreSQL executes:
1. Opens users table
2. Scans rows looking for: email = 'john@example.com'
3. When found, retrieves: id, username, email, password_hash, etc.
4. Returns the row as an object
5. JavaScript receives: { id: 1, username: 'johndoe', email: 'john@example.com', ... }
```

**Why use `$1` instead of string concatenation?**

❌ DANGEROUS (SQL Injection):
```javascript
const query = `SELECT * FROM users WHERE email = '${email}'`;
// If user enters: ' OR '1'='1
// Query becomes: SELECT * FROM users WHERE email = '' OR '1'='1'
// This returns ALL users (security breach!)
```

✅ SAFE (Parameterized Query):
```javascript
const query = `SELECT * FROM users WHERE email = $1`;
pool.query(query, [email]);
// The database engine treats $1 as a literal value
// User input cannot break the SQL structure
```

### Step 5b: Password Comparison

**File:** `/models/User.js` (lines 69-81)

```javascript
/**
 * Compare plaintext password with stored hash
 * @param {string} plainPassword - Password user typed
 * @param {string} storedHash - Hash from database
 * @returns {boolean} True if match, false otherwise
 */
const comparePassword = async (plainPassword, storedHash) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, storedHash);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};
```

**How bcrypt comparison works:**

```
Step 1: User types password
        plainPassword = "SecurePass123"

Step 2: Database has hashed version
        storedHash = "$2b$10$abcdefghijk... (60 chars)"

Step 3: bcrypt.compare() does:
        ├─ Extract salt from storedHash
        ├─ Hash the plainPassword using that salt
        ├─ Compare the newly hashed password with storedHash
        └─ Return true if they match, false if not

Step 4: Result
        If match → Password is correct
        If no match → Password is wrong
```

**Why not just compare hashes?**

❌ WRONG:
```javascript
if (password === storedHash) // This will ALWAYS be false!
// Because storedHash is a hash, not the original password
```

✅ CORRECT:
```javascript
if (await bcrypt.compare(password, storedHash)) // This works!
// bcrypt hashes the entered password and compares the hashes
```

### Step 6: Create Session

**File:** `/controllers/authController.js` (lines 133-139)

```javascript
req.session.user = {
  id: user.id,
  username: user.username,
  email: user.email
};
```

**What happens here:**

1. **Create session object:**
   ```javascript
   req.session.user = {
     id: 1,
     username: 'johndoe',
     email: 'john@example.com'
   }
   ```

2. **Express-session framework:**
   - Generates unique Session ID: `abc123def456...`
   - Creates session record in PostgreSQL:
     ```sql
     INSERT INTO session (sid, sess, expire)
     VALUES ('abc123def456...', '{"user": {...}}', '2025-12-11 23:18:00');
     ```

3. **Send cookie to browser:**
   ```http
   Set-Cookie: connect.sid=abc123def456...; HttpOnly; Path=/; Max-Age=86400
   ```
   - `connect.sid`: The session cookie name
   - `abc123def456...`: The session ID
   - `HttpOnly`: JavaScript cannot access this cookie
   - `Max-Age=86400`: Cookie expires in 24 hours

### Step 7: Redirect to Profile

**File:** `/controllers/authController.js` (line 141)

```javascript
res.redirect('/user/profile');
```

**HTTP Response:**
```http
HTTP/1.1 302 Found
Location: /user/profile
Set-Cookie: connect.sid=abc123def456...; HttpOnly; Path=/; Max-Age=86400
```

**Browser actions:**
1. Receives 302 redirect response
2. Stores session cookie: `connect.sid=abc123def456...`
3. Automatically navigates to `/user/profile`

### Step 8: Access Protected Route

**File:** `/routes/user.js` (line 6)

```javascript
router.get('/profile', isAuthenticated, userController.getProfile);
```

**`isAuthenticated` middleware:**

**File:** `/middlewares/auth.js` (lines 1-12)

```javascript
const isAuthenticated = (req, res, next) => {
  // Check if req.session.user exists
  if (!req.session.user) {
    // No user in session → redirect to login
    return res.redirect('/auth/login?returnTo=' + req.path);
  }
  // User in session → continue to next middleware/handler
  next();
};
```

**How session is restored:**

1. **Browser sends request with cookie:**
   ```http
   GET /user/profile HTTP/1.1
   Cookie: connect.sid=abc123def456...
   ```

2. **Express-session middleware retrieves session:**
   ```javascript
   // Look up abc123def456... in PostgreSQL session table
   SELECT sess FROM session WHERE sid = 'abc123def456...';
   // Returns: {"user": {"id": 1, "username": "johndoe", ...}}
   
   // Express sets: req.session = {"user": {...}}
   ```

3. **isAuthenticated checks:**
   ```javascript
   if (!req.session.user) // This is false because user exists
     return res.redirect('/auth/login');
   
   next(); // Continue to getProfile handler
   ```

### Step 9: Display Profile

**File:** `/controllers/userController.js` (lines 11-18)

```javascript
const getProfile = async (req, res) => {
  try {
    // User already authenticated (middleware checked)
    // req.session.user already has: id, username, email
    
    res.render('profile', {
      title: 'Profile',
      user: req.session.user
    });
  } catch (error) {
    next(error);
  }
};
```

**Template displays user data:**

**File:** `/views/user/profile.ejs`

```ejs
<div class="profile-container">
  <h1>User Profile</h1>
  
  <div class="profile-info">
    <p>Username: <%= user.username %></p>
    <p>Email: <%= user.email %></p>
  </div>
</div>
```

---

## Frontend & Backend Integration

### The Request-Response Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User enters email & password                                   │
│            ↓                                                     │
│  HTML5 Validation (minlength, required, type="email")          │
│            ↓                                                     │
│  Form submits: POST /auth/login                                 │
│            ↓                                                     │
│  Browser sends HTTP request with form data                      │
│                                                                  │
│  ─ ─ ─ ─ ─ ─ ─ NETWORK ─ ─ ─ ─ ─ ─ ─                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Express routes request to /auth/login POST handler             │
│            ↓                                                     │
│  isNotAuthenticated middleware checks session                   │
│            ↓                                                     │
│  loginValidation middleware validates input                     │
│            ↓                                                     │
│  authController.postLogin() executes:                          │
│    1. Check validation errors                                   │
│    2. Get email & password from req.body                        │
│    3. Query PostgreSQL: SELECT * FROM users WHERE email = $1   │
│    4. Compare passwords with bcrypt                             │
│    5. Create session: req.session.user = {...}                 │
│    6. Response: 302 redirect to /user/profile                   │
│                                                                  │
│  ─ ─ ─ ─ ─ ─ ─ NETWORK ─ ─ ─ ─ ─ ─ ─                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Receive 302 redirect response                                  │
│            ↓                                                     │
│  Browser stores session cookie (Set-Cookie header)              │
│            ↓                                                     │
│  Browser navigates to /user/profile                             │
│            ↓                                                     │
│  Next request includes Cookie header with session ID            │
│                                                                  │
│  ─ ─ ─ ─ ─ ─ ─ NETWORK ─ ─ ─ ─ ─ ─ ─                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Express receives GET /user/profile request                     │
│            ↓                                                     │
│  Express-session middleware:                                    │
│    1. Extract session ID from Cookie header                     │
│    2. Query PostgreSQL: SELECT * FROM session WHERE sid = $1   │
│    3. Deserialize sess column (JSONB)                           │
│    4. Populate req.session = deserialized data                  │
│            ↓                                                     │
│  isAuthenticated middleware checks req.session.user             │
│            ↓                                                     │
│  userController.getProfile() executes                           │
│            ↓                                                     │
│  Render profile.ejs with user data                              │
│                                                                  │
│  ─ ─ ─ ─ ─ ─ ─ NETWORK ─ ─ ─ ─ ─ ─ ─                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Display rendered HTML with user's profile                      │
│            ↓                                                     │
│  User now logged in (session valid for 24 hours)                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
Frontend Form Submission
├─ Email: john@example.com
├─ Password: SecurePass123
└─ Method: POST to /auth/login
        ↓
Server Validation
├─ Express-validator checks
├─ Database uniqueness checks
└─ Returns errors if invalid
        ↓
Database Lookup
├─ Query: SELECT * FROM users WHERE email = $1
├─ Parameter: ['john@example.com']
└─ Returns: User object with id, username, password_hash
        ↓
Password Verification
├─ Received: SecurePass123
├─ Stored: $2b$10$abcdefghijk... (bcrypt hash)
├─ Compare: bcrypt.compare(received, stored)
└─ Result: true or false
        ↓
Session Creation
├─ Generate Session ID: abc123def456...
├─ Insert into PostgreSQL session table
├─ req.session.user = {id, username, email}
└─ Send Set-Cookie header
        ↓
Browser Response
├─ Receive 302 redirect
├─ Store session cookie
├─ Navigate to /user/profile
└─ Include Cookie in next request
        ↓
Session Restoration
├─ Extract session ID from Cookie
├─ Query PostgreSQL: SELECT sess FROM session WHERE sid = $1
├─ Deserialize JSON data
└─ Populate req.session with user data
```

---

## Code Breakdown by Component

### Component 1: Database Configuration

**File:** `/config/database.js`

```javascript
const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

// Handle errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = { pool };
```

**What this does:**
- `Pool`: Creates a connection pool (reusable database connections)
- `environment variable`: `DATABASE_URL` points to PostgreSQL
- When application needs to query database, it uses this pool
- Pool manages opening/closing connections automatically

**How it's used:**
```javascript
const { pool } = require('../config/database');

const result = await pool.query('SELECT * FROM users WHERE id = $1', [1]);
// pool.query() sends SQL to PostgreSQL and waits for response
```

### Component 2: User Model (Database Operations)

**File:** `/models/User.js` (Relevant excerpts)

```javascript
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

/**
 * Create a new user
 * This is called during registration
 */
const create = async (userData) => {
  try {
    const { username, email, plainPassword } = userData;
    
    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    // Output: $2b$10$abcdefghijk... (60 characters)
    
    // 2. Insert into database
    const query = `
      INSERT INTO users (username, email, password_hash, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, username, email
    `;
    const result = await pool.query(query, [username, email, hashedPassword]);
    return result.rows[0];
    
  } catch (error) {
    throw error;
  }
};

/**
 * Find user by email
 * This is called during login
 */
const findByEmail = async (email) => {
  try {
    const query = `
      SELECT id, username, email, password_hash, has_profile_image, created_at
      FROM users
      WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null; // Return first row or null if not found
  } catch (error) {
    throw error;
  }
};

/**
 * Check if email already exists
 * Called during registration validation
 */
const emailExists = async (email) => {
  try {
    const query = `SELECT COUNT(*) as count FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0].count > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Check if username already exists
 * Called during registration validation
 */
const usernameExists = async (username) => {
  try {
    const query = `SELECT COUNT(*) as count FROM users WHERE username = $1`;
    const result = await pool.query(query, [username]);
    return result.rows[0].count > 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  findByEmail,
  emailExists,
  usernameExists
};
```

**How these work together in registration:**

```
User submits registration form
    ↓
authController.postRegister() calls:
    ├─ User.usernameExists(username)
    │  └─ Query: SELECT COUNT(*) FROM users WHERE username = ?
    │     If count > 0 → Error: "Username taken"
    │
    ├─ User.emailExists(email)
    │  └─ Query: SELECT COUNT(*) FROM users WHERE email = ?
    │     If count > 0 → Error: "Email registered"
    │
    └─ User.create({username, email, password})
       ├─ Hash password with bcrypt
       ├─ Insert into users table with hashed password
       └─ Return created user data
```

**How these work together in login:**

```
User submits login form
    ↓
authController.postLogin() calls:
    ├─ User.findByEmail(email)
    │  └─ Query: SELECT * FROM users WHERE email = ?
    │     If no result → Error: "Invalid credentials"
    │     If found → Proceed to password check
    │
    └─ bcrypt.compare(plainPassword, storedHash)
       └─ If true → Create session
          If false → Error: "Invalid credentials"
```

### Component 3: Authentication Routes

**File:** `/routes/auth.js` (Relevant excerpts)

```javascript
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authController = require('../controllers/authController');
const { isNotAuthenticated } = require('../middlewares/auth');

// Validation rules for login
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .notEmpty()
    .withMessage('Password is required')
];

// GET /auth/login - Display login form
router.get('/login', isNotAuthenticated, authController.getLogin);

// POST /auth/login - Process login
router.post('/login', isNotAuthenticated, loginValidation, authController.postLogin);

// GET /auth/logout - Logout
router.get('/logout', authController.logout);

module.exports = router;
```

**How middleware chain works:**

```
Request to POST /auth/login
    ↓
1. isNotAuthenticated middleware
   ├─ Is user already logged in?
   ├─ If yes → Redirect to /user/profile
   └─ If no → Continue to next middleware
    ↓
2. loginValidation middleware
   ├─ Check email is valid format
   ├─ Check password is 8+ characters
   ├─ If invalid → Pass errors to handler
   └─ If valid → Continue to next middleware
    ↓
3. authController.postLogin handler
   ├─ Access validation results
   ├─ Check database
   ├─ Compare passwords
   └─ Create session
```

### Component 4: Authentication Controller

**File:** `/controllers/authController.js` (Login excerpts)

```javascript
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

/**
 * GET /auth/login
 * Display the login form
 */
const getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    errors: [],
    message: null
  });
};

/**
 * POST /auth/login
 * Process login form submission
 */
const postLogin = async (req, res, next) => {
  try {
    // 1. Check if validation failed
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        errors: errors.array(),
        message: 'Please fix the validation errors'
      });
    }

    // 2. Get email and password from form
    const { email, password } = req.body;

    // 3. Find user with this email
    const user = await User.findByEmail(email);
    
    // 4. Check if user exists
    if (!user) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        errors: [],
        message: 'Invalid email or password'
      });
    }

    // 5. Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    // 6. Check if password matches
    if (!passwordMatch) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        errors: [],
        message: 'Invalid email or password'
      });
    }

    // 7. Success! Create session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      hasProfileImage: user.has_profile_image
    };

    // 8. Redirect to profile
    res.redirect('/user/profile');

  } catch (error) {
    // Pass error to error-handling middleware
    next(error);
  }
};

/**
 * GET /auth/logout
 * Logout user and destroy session
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
};

module.exports = {
  getLogin,
  postLogin,
  logout
};
```

### Component 5: Authentication Middleware

**File:** `/middlewares/auth.js`

```javascript
/**
 * Middleware to check if user is authenticated
 * Used on protected routes like /user/profile
 */
const isAuthenticated = (req, res, next) => {
  // Check if req.session.user exists
  if (!req.session.user) {
    // User not logged in, redirect to login
    return res.redirect('/auth/login?returnTo=' + req.path);
    // returnTo preserves the original URL they tried to access
  }
  // User is logged in, proceed to next middleware/handler
  next();
};

/**
 * Middleware to check if user is NOT authenticated
 * Used on auth routes like /auth/login and /auth/register
 * Prevents already-logged-in users from logging in again
 */
const isNotAuthenticated = (req, res, next) => {
  // Check if req.session.user exists
  if (req.session.user) {
    // User already logged in, redirect to profile
    return res.redirect('/user/profile');
  }
  // User not logged in, proceed to next middleware/handler
  next();
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated
};
```

### Component 6: Session Middleware (Auto-handled by Express)

**File:** `/app.js` (Session configuration)

```javascript
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./config/database');

// Configure session
let sessionConfig = {
  secret: process.env.SESSION_SECRET,
  // ↑ Secret used to sign session ID (prevents tampering)
  
  resave: false,
  // ↑ Don't re-save unchanged sessions (saves database writes)
  
  saveUninitialized: false,
  // ↑ Don't save empty sessions (saves database space)
  
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,  // 24 hours
    httpOnly: true,                 // JavaScript can't access
    secure: process.env.NODE_ENV === 'production',  // HTTPS only
    sameSite: 'lax'                 // CSRF protection
  },
  
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  })
  // ↑ Store sessions in PostgreSQL, not in memory
};

app.use(session(sessionConfig));
```

**How session lifecycle works:**

```
1. User logs in
   └─ req.session.user = {id, username, email}
      └─ Express-session creates Session ID: "abc123..."
         └─ INSERT INTO session (sid, sess, expire) VALUES (...)
            └─ Sends Set-Cookie: connect.sid=abc123...

2. Browser stores cookie
   └─ Cookie exists for 24 hours

3. Browser sends next request
   └─ Cookie header: connect.sid=abc123...
      └─ Express-session extracts sid from cookie
         └─ SELECT sess FROM session WHERE sid = 'abc123...'
            └─ Deserializes JSON into req.session
               └─ req.session.user is now available

4. 24 hours pass
   └─ Cookie expires
   └─ Database index automatically cleans up expired session
      └─ User must log in again
```

### Component 7: Login Form Template

**File:** `/views/auth/login.ejs`

```ejs
<%- include('../partials/header') %>

<div class="container">
  <div class="auth-form">
    <h1>Login to Your Account</h1>

    <%- include('../partials/flash-message') %>
    <%- include('../partials/form-errors') %>

    <!-- The actual login form -->
    <form action="/auth/login" method="POST">
      <!-- CSRF token (security) -->
      <input type="hidden" name="_csrf" value="<%= csrfToken %>">

      <!-- Email input -->
      <div class="form-group">
        <label for="email">Email Address</label>
        <input 
          type="email"           <!-- HTML5 validation -->
          id="email" 
          name="email"           <!-- Sent as request.body.email -->
          placeholder="Enter your email address" 
          required>              <!-- Browser prevents empty submit -->
        <small>Please enter a valid email address</small>
      </div>

      <!-- Password input -->
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password"        <!-- Hides characters -->
          id="password" 
          name="password"        <!-- Sent as request.body.password -->
          placeholder="Enter your password" 
          minlength="8"          <!-- HTML5 validation -->
          required>
        <small>Password must be at least 8 characters long</small>
      </div>

      <!-- Submit button -->
      <div class="form-actions">
        <button type="submit" class="btn primary-btn">Login</button>
      </div>
    </form>

    <!-- Link to register if user doesn't have account -->
    <div class="form-footer">
      <p>Don't have an account? <a href="/auth/register">Register</a></p>
    </div>
  </div>
</div>

<%- include('../partials/footer') %>
```

---

## How Each Part Works Together

### Complete Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. LOGIN FORM (/views/auth/login.ejs)                          │
│     ├─ HTML input fields (email, password)                      │
│     ├─ HTML5 validation (type="email", minlength="8")           │
│     └─ Form submission: POST /auth/login                        │
│                                                                  │
│  2. HTML5 CLIENT-SIDE VALIDATION                                │
│     ├─ Email must be valid format                               │
│     ├─ Password must be 8+ characters                           │
│     └─ Browser prevents submission if invalid                   │
│                                                                  │
│  3. FORM DATA TRANSMISSION                                      │
│     └─ HTTP POST to /auth/login with form fields                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓ HTTP Request
┌──────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS LAYER                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ROUTING (/routes/auth.js)                                   │
│     └─ Matches POST /auth/login                                 │
│                                                                  │
│  2. MIDDLEWARE CHAIN                                            │
│     ├─ isNotAuthenticated                                       │
│     │  └─ Check: Is user already logged in?                     │
│     │                                                           │
│     └─ loginValidation                                          │
│        ├─ Check: Email valid format?                            │
│        ├─ Check: Password 8+ characters?                        │
│        └─ Pass errors or continue                               │
│                                                                  │
│  3. CONTROLLER (/controllers/authController.js)                 │
│     ├─ authController.postLogin()                               │
│     ├─ Check validation results                                 │
│     ├─ Extract email & password from req.body                   │
│     └─ Call User model methods                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓ Database Queries
┌──────────────────────────────────────────────────────────────────┐
│                      USER MODEL LAYER                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. FIND USER (/models/User.js)                                 │
│     ├─ User.findByEmail(email)                                  │
│     ├─ SQL: SELECT * FROM users WHERE email = $1               │
│     └─ Return: User object with password_hash                   │
│                                                                  │
│  2. PASSWORD COMPARISON (/node_modules/bcrypt)                  │
│     ├─ bcrypt.compare(plainPassword, storedHash)               │
│     ├─ Returns: true if match, false if no match                │
│     └─ Never exposes plaintext password                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓ Database Results
┌──────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USERS TABLE                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ id │ username │ email │ password_hash │ has_profile_... │  │
│  ├────┼──────────┼────────────────────────────────────────┤  │
│  │ 1  │ johndoe  │ john@ex...│ $2b$10$abc... │ false     │  │
│  │ 2  │ janedoe  │ jane@ex...│ $2b$10$def... │ true      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  SESSION TABLE                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ sid │ sess │ expire │                                  │   │
│  ├─────┼──────┼─────────────────────────────────────────┤   │
│  │abc..│{...} │ 2025-12-11 23:18:00                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓ Database Response
┌──────────────────────────────────────────────────────────────────┐
│                 EXPRESS SESSION MIDDLEWARE                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CREATE SESSION                                              │
│     ├─ Generate Session ID                                      │
│     └─ req.session.user = {id, username, email}                │
│                                                                  │
│  2. STORE IN DATABASE                                           │
│     ├─ INSERT INTO session (sid, sess, expire) VALUES ...       │
│     └─ Persist to PostgreSQL                                    │
│                                                                  │
│  3. SEND TO BROWSER                                             │
│     ├─ HTTP 302 Redirect                                        │
│     ├─ Set-Cookie: connect.sid=abc...; HttpOnly; Max-Age=...  │
│     └─ Location: /user/profile                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓ HTTP Response
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. BROWSER RECEIVES RESPONSE                                   │
│     ├─ Status: 302 Found                                        │
│     ├─ Set-Cookie header with session ID                        │
│     └─ Location: /user/profile                                  │
│                                                                  │
│  2. BROWSER STORES COOKIE                                       │
│     └─ Cookie: connect.sid=abc... (HttpOnly, 24-hour max-age)  │
│                                                                  │
│  3. BROWSER NAVIGATES                                           │
│     └─ Auto-redirect to /user/profile                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓ Next Request
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. REQUEST TO PROFILE                                          │
│     ├─ GET /user/profile                                        │
│     └─ Automatically includes Cookie header                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓ HTTP Request
┌──────────────────────────────────────────────────────────────────┐
│                   EXPRESS SESSION MIDDLEWARE                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. EXTRACT SESSION ID FROM COOKIE                              │
│     └─ sid = 'abc...'                                           │
│                                                                  │
│  2. QUERY POSTGRESQL SESSION TABLE                              │
│     ├─ SELECT sess FROM session WHERE sid = $1                 │
│     └─ Retrieve: {"user": {id, username, email}}               │
│                                                                  │
│  3. DESERIALIZE & POPULATE REQUEST                              │
│     └─ req.session.user = {id, username, email}                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓ Continues to Handler
┌──────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION MIDDLEWARE                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  isAuthenticated check                                          │
│  ├─ if (req.session.user) → User is authenticated              │
│  └─ User can access protected route                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓ Proceeds to Handler
┌──────────────────────────────────────────────────────────────────┐
│                      USER CONTROLLER LAYER                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  userController.getProfile()                                    │
│  ├─ Use data from req.session.user                              │
│  └─ Render profile template with user data                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓ Render Template
┌──────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER (DISPLAY)                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  /views/user/profile.ejs rendered with user data                │
│  ├─ <%= user.username %>                                        │
│  ├─ <%= user.email %>                                           │
│  └─ User logged in & viewing their profile                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Summary Table: Which File Does What

| Task | File | Function |
|------|------|----------|
| **Display Login Form** | `/views/auth/login.ejs` | EJS template with HTML form |
| **Route POST Request** | `/routes/auth.js` | Matches URL and calls controller |
| **Validate Input** | `/routes/auth.js` | Express-validator checks format |
| **Find User** | `/models/User.js` | Queries PostgreSQL users table |
| **Hash Password** | `/node_modules/bcrypt` | Compares plaintext with hash |
| **Create Session** | `/app.js` | Express-session configuration |
| **Store Session** | `/config/database.js` | PostgreSQL connection pool |
| **Check Authentication** | `/middlewares/auth.js` | Verifies req.session.user exists |
| **Handle Errors** | `/middlewares/error-handler.js` | Catches and displays errors |

---

## Key Learning Points for Education

### 1. Password Security Principles
- **Never store plaintext passwords** in the database
- **Always hash passwords** with bcrypt (one-way encryption)
- **Compare passwords** using bcrypt, never with `===`
- **Use salt rounds** (10 is standard) to slow down hashing

### 2. Session Management
- **Session ID** is stored in browser cookie
- **Session data** is stored in database (not in cookie)
- **Only Session ID travels** between browser and server
- **Sessions expire** after set time (24 hours in this app)

### 3. Validation Layers
- **Client-side**: HTML5 validation (UX improvement)
- **Server-side**: Express-validator (security requirement)
- **Database**: Constraints like UNIQUE (data integrity)
- **Both required**: Client-side can be bypassed

### 4. SQL Injection Prevention
- **Always use parameterized queries**: `$1, $2, $3` placeholders
- **Never concatenate user input** into SQL strings
- **Example**: `WHERE email = $1` with `[email]` parameter

### 5. Request-Response Cycle
1. Browser sends request with form data
2. Server validates input
3. Server queries database
4. Server makes decision (accept/reject)
5. Server sends response (redirect or re-render)
6. Browser handles response (store cookie or show error)

### 6. Middleware Chain
- Express processes middleware in order
- Each middleware can accept or reject request
- `next()` passes to next middleware
- Response ends the chain

### 7. Data Flow
```
Frontend Form → HTTP Request → Backend Validation → Database Query
                                     ↓
Database Result → Session Creation → HTTP Response → Browser Storage
                                     ↓
Next Request with Cookie → Session Retrieval → Authentication Check
```

---

## Testing the Login Flow Manually

### Using curl to Test Backend

**1. Register a user:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&email=test@example.com&password=TestPass123&confirmPassword=TestPass123"
```

**2. Check database (from terminal):**
```bash
sudo -u postgres psql csc317_project
psql> SELECT id, username, email FROM users;
```

**3. Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -c cookies.txt \
  -d "email=test@example.com&password=TestPass123"
# -c cookies.txt saves cookies to file
```

**4. Access protected route:**
```bash
curl http://localhost:3000/user/profile \
  -b cookies.txt
# -b cookies.txt sends saved cookies
```

**5. Check session in database:**
```bash
sudo -u postgres psql csc317_project
psql> SELECT sid, sess, expire FROM session;
```

### Using Browser DevTools

**1. Open Login Page:**
- `http://localhost:3000/auth/login`

**2. Open DevTools (F12):**
- Go to "Network" tab
- Go to "Application" tab (see cookies)

**3. Login:**
- Fill form and click Login
- In Network tab, see POST request
  - Request headers: form data
  - Response headers: `Set-Cookie: connect.sid=...`
- Browser redirects to `/user/profile`

**4. Check Cookie:**
- In Application tab → Cookies
- See `connect.sid` cookie
- Value is the session ID

**5. Make Protected Request:**
- Refresh `/user/profile`
- In Network tab, see GET request
  - Request headers: `Cookie: connect.sid=...`
- Server uses this to restore session

---

## Conclusion

The login flow demonstrates:

✅ **HTML/CSS/JavaScript**: Creating user interface
✅ **Express.js**: Routing and handling HTTP requests
✅ **PostgreSQL**: Storing data persistently
✅ **Security**: Hashing passwords and creating sessions
✅ **Validation**: Checking data from multiple layers
✅ **Middleware**: Processing requests before handlers
✅ **Sessions**: Maintaining user state across requests
✅ **HTTP Cookies**: Storing session IDs in browser
✅ **Error Handling**: Gracefully handling failures

This is a complete full-stack authentication system!

