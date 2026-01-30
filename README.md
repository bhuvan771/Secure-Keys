# 🔐 Secer Keys - Secure Team Key Management System

A secure, team-based key management system built with Next.js, React, and PlanetScale. Store and manage API keys, credentials, and secrets with role-based access control.

## ✨ Features

- 🔒 **Secure Authentication** - Password-based login with bcrypt hashing
- 🗂️ **Project-Based Organization** - Organize keys into project folders
- 👥 **Access Control** - Admin controls who can access which projects
- 🔐 **Encryption** - All keys encrypted at rest with AES-256-GCM
- 📝 **Syntax Highlighting** - View keys as code with syntax highlighting
- 📱 **Responsive Design** - Works on mobile and desktop
- 📊 **Audit Logs** - Track who accessed what and when
- 🚀 **Fast & Reliable** - Built on Next.js 14 with PlanetScale database

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Database:** PlanetScale (MySQL)
- **ORM:** Prisma
- **Encryption:** AES-256-GCM with crypto
- **Password Hashing:** bcrypt
- **Hosting:** Vercel

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- PlanetScale account (free tier is fine)

## 🚀 Setup Instructions

### Step 1: PlanetScale Database Setup

1. **Create a PlanetScale account** at [planetscale.com](https://planetscale.com)

2. **Create a new database:**
   - Click "Create a new database"
   - Name: `secer-keys` (or your choice)
   - Region: Choose closest to you
   - Click "Create database"

3. **Get the connection string:**
   - Click on your database
   - Go to "Connect" tab
   - Select "Prisma" from the framework dropdown
   - Copy the `DATABASE_URL`
   - It will look like: `mysql://xxxxx:xxxxx@aws.connect.psdb.cloud/secer-keys?sslaccept=strict`

### Step 2: Environment Variables Setup

1. **Open `.env` file** in the project root

2. **Generate encryption keys:**
   ```bash
   # Generate ENCRYPTION_KEY (32 bytes)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Generate SESSION_SECRET (64 bytes)
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Update `.env` file:**
   ```bash
   DATABASE_URL="paste-your-planetscale-connection-string-here"
   ENCRYPTION_KEY="paste-generated-32-byte-key-here"
   SESSION_SECRET="paste-generated-64-byte-key-here"
   ```

### Step 3: Database Migration

Run the following commands to set up your database:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to PlanetScale
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Step 4: Create Admin User

You'll need to create the first admin user manually through Prisma Studio or create a seed script.

**Option A: Using Prisma Studio**
```bash
npx prisma studio
```
- Go to `User` model
- Click "Add record"
- Fill in:
  - username: `admin`
  - email: `admin@example.com`
  - password: Use bcrypt hash (see below)
  - role: `ADMIN`

**Generate bcrypt hash for password:**
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password-here', 12))"
```

**Option B: We'll create a setup script later**

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
secer-keys/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   └── login/         # Login page
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── projects/      # Projects management
│   │   ├── keys/          # Keys viewing
│   │   └── admin/         # Admin panel
│   └── api/               # API routes
│       ├── auth/          # Authentication APIs
│       ├── projects/      # Project management APIs
│       └── keys/          # Key management APIs
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client
│   ├── encryption.ts     # Encryption utilities
│   ├── auth.ts           # Authentication utilities
│   ├── session.ts        # Session management
│   └── permissions.ts    # Permission checking
├── components/           # Reusable React components
├── prisma/              # Prisma schema
│   └── schema.prisma    # Database schema
└── .env                 # Environment variables (DO NOT COMMIT!)
```

## 🔑 Usage

### For Admins:

1. **Login** with admin credentials
2. **Create Projects** - Organize keys by project/client
3. **Add Keys** - Store encrypted credentials
4. **Manage Users** - Create users and assign project access
5. **View Audit Logs** - See who accessed what

### For Users:

1. **Login** with credentials (provided by admin)
2. **View Projects** - See projects you have access to
3. **View Keys** - View keys with syntax highlighting
4. **Copy Keys** - Copy to clipboard easily

## 🔒 Security Features

✅ **Password Hashing** - bcrypt with 12 salt rounds  
✅ **Key Encryption** - AES-256-GCM with salt and auth tag  
✅ **Session Management** - HTTP-only cookies  
✅ **Access Control** - Role-based permissions  
✅ **Audit Logging** - All access tracked  
✅ **SQL Injection Protection** - Prisma ORM  
✅ **Environment Variables** - Secrets in .env (not committed)

## 🚀 Deployment to Vercel

1. **Push code to GitHub** (make sure .env is in .gitignore!)

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo

3. **Add Environment Variables**
   - In Vercel dashboard, go to "Settings" → "Environment Variables"
   - Add:
     - `DATABASE_URL`
     - `ENCRYPTION_KEY`
     - `SESSION_SECRET`

4. **Deploy!**

## 📝 Next Steps (TODO)

After basic setup, we'll add these files:
- [ ] Login page UI
- [ ] Dashboard layout
- [ ] Projects list page
- [ ] Project detail page with keys
- [ ] Admin panel for user management
- [ ] Key creation/edit forms
- [ ] Syntax-highlighted key viewer
- [ ] Mobile-responsive design
- [ ] Admin seed script

## ⚠️ Important Security Notes

1. **NEVER commit `.env` to Git**
2. **Use strong passwords** for admin account
3. **Keep ENCRYPTION_KEY safe** - if lost, all keys are unrecoverable
4. **Enable 2FA on Vercel** and PlanetScale accounts
5. **Regularly review audit logs**
6. **Rotate keys periodically**

## 🆘 Support

If you encounter issues:
1. Check PlanetScale connection is active
2. Verify all environment variables are set
3. Check Prisma schema is pushed: `npx prisma db push`
4. Review audit logs for access issues

## 📜 License

Private - Internal Use Only

---

**Built with ❤️ for secure team collaboration**
