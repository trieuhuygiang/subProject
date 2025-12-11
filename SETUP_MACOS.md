# macOS Setup Guide - Using Homebrew

This guide provides step-by-step instructions to set up the project on macOS using Homebrew package manager.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Install Homebrew](#install-homebrew)
3. [Install Required Software](#install-required-software)
4. [Database Setup](#database-setup)
5. [Project Configuration](#project-configuration)
6. [Running the Project](#running-the-project)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- A macOS computer (Intel or Apple Silicon)
- Administrator access
- Terminal app (or iTerm2)
- Internet connection

---

## Install Homebrew

Homebrew is a package manager for macOS that makes installing software easy.

### Step 1: Install Homebrew

Open Terminal and run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Verify Installation

```bash
brew --version
# Output: Homebrew 4.x.x
```

### Step 3: Update Homebrew (Important!)

```bash
brew update
```

This ensures you have the latest package information.

---

## Install Required Software

### 1. Install Node.js and npm

```bash
brew install node
```

**Verify installation:**
```bash
node --version
# Output: v20.x.x or higher
npm --version
# Output: 10.x.x or higher
```

### 2. Install PostgreSQL

```bash
brew install postgresql@15
```

**Start PostgreSQL service:**
```bash
brew services start postgresql@15
```

**Verify installation:**
```bash
psql --version
# Output: psql (PostgreSQL) 15.x
```

### 3. Install Git (Usually pre-installed on macOS)

```bash
brew install git
```

**Verify installation:**
```bash
git --version
# Output: git version 2.x.x
```

### 4. Optional: Install Visual Studio Code

```bash
brew install --cask visual-studio-code
```

### 5. Optional: Install iTerm2 (Better Terminal)

```bash
brew install --cask iterm2
```

---

## Database Setup

### Step 1: Start PostgreSQL Service

```bash
brew services start postgresql@15
```

**To verify PostgreSQL is running:**
```bash
brew services list | grep postgresql
# Should show: postgresql@15 started
```

### Step 2: Access PostgreSQL

```bash
psql postgres
```

You should see the PostgreSQL prompt: `postgres=#`

### Step 3: Create Database User

```sql
-- Create a superuser for the project
CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres';

-- Verify user was created
\du
```

You should see `postgres` in the list.

### Step 4: Exit PostgreSQL

```sql
\q
```

### Step 5: Initialize Database Tables

```bash
cd /path/to/your/project
npm run db:init
```

This creates the necessary tables (`users`, `session`, `profile_images`).

**Expected output:**
```
✓ Users table created
✓ Profile images table created
✓ Session table created
✓ Indexes created

✅ Database initialization complete!
```

### Step 6: Verify Database Creation

```bash
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname = 'csc317_project';"
```

Should output:
```
     datname      
──────────────────
 csc317_project
(1 row)
```

---

## Project Configuration

### Step 1: Clone or Navigate to Project

```bash
# If cloning from GitHub
git clone https://github.com/yourusername/subProject.git
cd subProject

# Or navigate if already downloaded
cd /path/to/subProject
```

### Step 2: Install Project Dependencies

```bash
npm install
```

This reads `package.json` and installs all required packages.

### Step 3: Create Environment File

Create a `.env` file in the project root:

```bash
touch .env
```

Add the following content:

```env
# PostgreSQL Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/csc317_project

# Session Secret (use a random string)
SESSION_SECRET=your-super-secret-key-change-this-in-production

# Environment
NODE_ENV=development

# Server Port
PORT=3000
```

**Important:** Replace `your-super-secret-key-change-this-in-production` with a random string:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as your SESSION_SECRET.

### Step 4: Verify `.env` File

```bash
cat .env
```

Should show your environment variables (make sure DATABASE_URL is correct).

---

## Running the Project

### Step 1: Start PostgreSQL (if not already running)

```bash
brew services start postgresql@15
```

### Step 2: Initialize Database (First time only)

```bash
npm run db:init
```

### Step 3: Start the Application

```bash
npm start
```

**Expected output:**
```
Server is running on http://localhost:3000
Connected to PostgreSQL
✓ Users table exists
✓ Session table exists
✓ Profile images table exists
```

### Step 4: Open in Browser

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the home page.

### Step 5: Test Login

1. Click **"Register"** link
2. Create an account:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123` (8+ characters)
3. Click **"Login"** link
4. Enter your credentials
5. You should see your profile page

---

## Useful Commands

### PostgreSQL Commands

**Start PostgreSQL:**
```bash
brew services start postgresql@15
```

**Stop PostgreSQL:**
```bash
brew services stop postgresql@15
```

**Check PostgreSQL Status:**
```bash
brew services list | grep postgresql
```

**Connect to Database:**
```bash
psql -U postgres -d csc317_project
```

**View Tables:**
```bash
psql -U postgres -d csc317_project -c "\dt"
```

**Backup Database:**
```bash
pg_dump -U postgres csc317_project > backup.sql
```

**Restore Database:**
```bash
psql -U postgres -d csc317_project < backup.sql
```

### Node.js Commands

**Install dependencies:**
```bash
npm install
```

**Start development server:**
```bash
npm start
```

**Run with nodemon (auto-restart on file changes):**
```bash
npm run dev
```

**Initialize database:**
```bash
npm run db:init
```

### Git Commands

**Clone repository:**
```bash
git clone <repository-url>
```

**Pull latest changes:**
```bash
git pull
```

**Push changes:**
```bash
git push
```

---

## Troubleshooting

### Issue 1: PostgreSQL Service Won't Start

**Error:** `Error: PostgreSQL service failed to start`

**Solution:**
```bash
# Uninstall and reinstall
brew uninstall postgresql@15
brew install postgresql@15

# Initialize database cluster
initdb -D /usr/local/var/postgres

# Start service
brew services start postgresql@15
```

### Issue 2: "Connection refused" Error

**Error:** `ECONNREFUSED 127.0.0.1:5432`

**Solution:**
Make sure PostgreSQL is running:
```bash
brew services start postgresql@15

# Verify it's running
brew services list | grep postgresql
```

### Issue 3: "Password authentication failed"

**Error:** `FATAL: password authentication failed for user "postgres"`

**Solution:**
Reset PostgreSQL user password:
```bash
# Connect as default user
psql postgres

# Reset password
ALTER USER postgres WITH PASSWORD 'postgres';

# Exit
\q
```

### Issue 4: Database Already Exists

**Error:** `database "csc317_project" already exists`

**Solution:**
Drop and recreate:
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS csc317_project;"
npm run db:init
```

### Issue 5: Port 3000 Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
Find and kill the process:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace 12345 with PID)
kill -9 12345

# Or use a different port
PORT=3001 npm start
```

### Issue 6: Node Modules Issues

**Error:** `Cannot find module 'express'` or similar

**Solution:**
Reinstall node modules:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 7: M1/M2 Mac Compatibility

**Issue:** Some packages don't work on Apple Silicon

**Solution:**
Most packages now support Apple Silicon. If you encounter issues:
```bash
# Use Rosetta emulation (if necessary)
arch -x86_64 zsh

# Or reinstall Node with native support
brew uninstall node
brew install node
```

---

## Environment Variables Reference

Your `.env` file should contain:

```env
# Required
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/csc317_project
SESSION_SECRET=your-random-secret-key-here

# Optional (has defaults)
NODE_ENV=development
PORT=3000
```

**To generate a secure SESSION_SECRET:**
```bash
# Method 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 2: OpenSSL
openssl rand -hex 32
```

---

## Database Connection String Explained

```
postgresql://postgres:postgres@localhost:5432/csc317_project
 │           │        │        │         │    │
 │           │        │        │         │    └─ Database name
 │           │        │        │         └─────── Port number
 │           │        │        └───────────────── Host (your computer)
 │           │        └──────────────────────── Password
 │           └──────────────────────────────── Username
 └────────────────────────────────────────────── Protocol
```

**Components:**
- **Protocol:** `postgresql://` - PostgreSQL database protocol
- **Username:** `postgres` - Database user
- **Password:** `postgres` - User's password
- **Host:** `localhost` - Local machine (127.0.0.1)
- **Port:** `5432` - PostgreSQL default port
- **Database:** `csc317_project` - Your project database

---

## Next Steps

After successful setup:

1. **Explore the Project:**
   - Check `/routes/` for endpoints
   - Check `/controllers/` for business logic
   - Check `/models/` for database operations
   - Check `/views/` for HTML templates

2. **Review Documentation:**
   - Read `README.md` for project overview
   - Read `POSTGRESQL_LOGIN_GUIDE.md` for authentication details
   - Read `PRESENTATION.md` for project features

3. **Make Changes:**
   - Edit files in your IDE
   - Server auto-restarts on save (if using `npm run dev`)
   - Changes take effect immediately

4. **Version Control:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

---

## Need Help?

### Common Resources

1. **Node.js Documentation:** https://nodejs.org/en/docs/
2. **Express.js Documentation:** https://expressjs.com/
3. **PostgreSQL Documentation:** https://www.postgresql.org/docs/
4. **Homebrew Documentation:** https://brew.sh/

### Quick Help Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check PostgreSQL version
psql --version

# Check Homebrew version
brew --version

# Update all Homebrew packages
brew upgrade

# See all installed packages
brew list
```

---

## Uninstalling (If Needed)

### Remove Node.js

```bash
brew uninstall node
```

### Remove PostgreSQL

```bash
brew services stop postgresql@15
brew uninstall postgresql@15
rm -rf ~/Library/Application\ Support/Postgres
```

### Remove Project

```bash
rm -rf /path/to/subProject
```

---

## Tips for macOS Development

### 1. Use Homebrew Cask for GUI Applications

```bash
brew install --cask visual-studio-code
brew install --cask iterm2
brew install --cask postman
brew install --cask sequel-pro
```

### 2. Keep Homebrew Updated

```bash
# Update Homebrew itself
brew update

# Upgrade all packages
brew upgrade

# Clean up old versions
brew cleanup
```

### 3. Use Shell Profile Correctly

If you're on macOS 10.15+, default shell is `zsh`. Update your `~/.zshrc`:

```bash
# Add to ~/.zshrc if needed
export PATH="/usr/local/bin:$PATH"
```

### 4. SSH for GitHub

Set up SSH keys for better GitHub integration:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to SSH agent
ssh-add ~/.ssh/id_ed25519

# Display public key (add to GitHub settings)
cat ~/.ssh/id_ed25519.pub
```

### 5. Create Bash/Zsh Alias

Add to `~/.zshrc` or `~/.bash_profile`:

```bash
alias start-db="brew services start postgresql@15"
alias stop-db="brew services stop postgresql@15"
alias check-db="brew services list | grep postgresql"
alias devstart="npm start"
```

Then reload:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

Now you can use:
```bash
start-db      # Start PostgreSQL
stop-db       # Stop PostgreSQL
check-db      # Check PostgreSQL status
devstart      # Start development server
```

---

## Success Checklist

- [ ] Homebrew installed
- [ ] Node.js installed and working
- [ ] PostgreSQL installed and running
- [ ] Project cloned/downloaded
- [ ] `.env` file created with correct values
- [ ] `npm install` completed successfully
- [ ] `npm run db:init` executed
- [ ] Application running at `http://localhost:3000`
- [ ] Can register a new account
- [ ] Can login with credentials
- [ ] Can view profile page

Once all items are checked, your setup is complete! 🎉

---

## Quick Start Command

If you have everything installed and just need to restart:

```bash
# Start database
brew services start postgresql@15

# Navigate to project
cd /path/to/subProject

# Start application
npm start
```

Then open `http://localhost:3000` in your browser.

