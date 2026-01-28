# HacktivP3FinalProject# Seekers - Interview Question Management System

A modern, full-featured interview question management platform built with Next.js, MongoDB, and AI integration. Designed to help interviewers create, manage, and organize interview questions with AI-powered bulk generation and voice synthesis.

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0.0-13AA52?logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Features Guide](#features-guide)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **📝 Question Management** - Create, read, update, and delete interview questions
- **🎯 Category Organization** - Organize questions by industry/role categories with publication status
- **⚡ Bulk Generation** - AI-powered bulk question generation using Google Gemini
- **🔊 Voice Synthesis** - Automatic voice generation using ElevenLabs API
- **🎤 Audio Playback** - Built-in audio player for question voices
- **📊 Tier Management** - Organize interview rounds/levels with pricing tiers
- **🔒 Authentication** - Secure admin login with JWT tokens
- **🔍 Search & Filter** - Multi-field search across questions
- **📦 Question Packaging** - Bundle questions into pre-configured packages
- **✏️ Inline Editing** - Edit questions, categories, levels, and types directly in the table
- **☁️ Cloud Storage** - Audio files stored securely in Cloudinary

### Advanced Features
- **Real-time Search** - Filter questions by content, category, level, and type
- **Question Limits** - Maximum 20 questions per generation session
- **Category Validation** - Prevent deletion of categories with associated questions
- **Skill Level Tracking** - Track junior, middle, and senior level questions
- **Question Types** - Organize by intro, core, and closing question types
- **Follow-up Questions** - Mark and track follow-up question relationships
- **Responsive Design** - Mobile-friendly admin interface
- **Smooth Animations** - Professional UI transitions and animations

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.4** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript** - Type-safe development
- **TailwindCSS 4** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **SweetAlert2** - Beautiful alert dialogs

### Backend
- **Next.js API Routes** - Backend API endpoints
- **MongoDB 7.0.0** - NoSQL database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

### External Services
- **Google Gemini AI** - Question generation
- **ElevenLabs** - Text-to-speech voice synthesis
- **Cloudinary** - Image/audio asset storage
- **OpenAI** - (Optional) Additional AI features

## 📁 Project Structure

```
last-project/
├── app/
│   ├── api/                          # API route handlers
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── route.ts         # Login endpoint
│   │   ├── category/
│   │   │   ├── create/
│   │   │   ├── read/
│   │   │   ├── update/
│   │   │   └── delete/
│   │   ├── questions/
│   │   │   ├── create/
│   │   │   ├── createBulk/          # AI-powered bulk generation
│   │   │   ├── insertBulk/
│   │   │   ├── delete/
│   │   │   ├── read/
│   │   │   ├── update/
│   │   │   └── generateVoice/       # ElevenLabs integration
│   │   ├── tiers/
│   │   │   ├── create/
│   │   │   ├── read/
│   │   │   ├── update/
│   │   │   └── delete/
│   │   └── packages/
│   │       ├── read/
│   │       └── delete/
│   ├── login/
│   │   └── page.tsx                 # Login page
│   ├── categories/
│   │   └── page.tsx                 # Category management
│   ├── questions/
│   │   └── page.tsx                 # Question management (main page)
│   ├── createQuestions/
│   │   └── page.tsx                 # Bulk question creation
│   ├── tiers/
│   │   └── page.tsx                 # Tier management
│   ├── packages/
│   │   └── page.tsx                 # Package management
│   ├── layout.tsx
│   ├── page.tsx                     # Home page
│   └── globals.css
├── components/
│   ├── AdminProtection.tsx          # Admin authentication wrapper
│   └── admin/
│       ├── AdminSidebar.tsx         # Navigation sidebar
│       ├── AdminHeader.tsx          # Page header component
│       ├── CategoryCard.tsx         # Category display card
│       ├── TierCard.tsx             # Tier display card
│       ├── QuestionCard.tsx         # Question display card
│       ├── PackageCard.tsx          # Package display card
│       ├── EmptyState.tsx           # Empty state UI
│       └── LoadingSpinner.tsx       # Loading indicator
├── db/
│   ├── config/
│   │   └── mongodb.ts               # MongoDB connection
│   └── models/
│       ├── UserModels.ts            # User schema & methods
│       ├── QuestionModels.ts        # Question schema & methods
│       ├── CategoryModels.ts        # Category schema & methods
│       └── TierModels.ts            # Tier schema & methods
├── lib/
│   └── auth.ts                      # Authentication utilities
├── public/                          # Static assets
├── .env                             # Environment variables
├── .env.example                     # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🚀 Installation

### Prerequisites
- **Node.js 18+** - JavaScript runtime
- **npm or yarn** - Package manager
- **MongoDB** - Database (local or cloud)
- **API Keys** - Gemini, ElevenLabs, Cloudinary

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd last-project
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment Variables
```bash
cp .env.example .env
```

Then edit `.env` with your actual values (see [Environment Variables](#environment-variables)).

### Step 4: Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Study

# Authentication
JWT_SECRET=your-secret-key-here

# AI & Voice Generation
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Required Services Setup

#### MongoDB
1. Create a free MongoDB Atlas account at [mongodb.com/cloud](https://mongodb.com/cloud)
2. Create a cluster and database
3. Get your connection string and add it to `.env`

#### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create an API key
3. Add it as `GEMINI_API_KEY`

#### ElevenLabs
1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Get your API key from the dashboard
3. Add it as `ELEVENLABS_API_KEY`

#### Cloudinary
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret
3. Add them to `.env`

## 📖 Getting Started

### Login
1. Navigate to [http://localhost:3000/login](http://localhost:3000/login)
2. Enter your admin credentials
3. You'll be redirected to the dashboard

### Create Your First Category
1. Click "Categories" in the sidebar
2. Click "Add Category"
3. Fill in the category details (title, description, image URL)
4. Select applicable skill levels (junior, middle, senior)
5. Click "Save Category"

### Generate Questions
1. Click "Create Questions" in the sidebar
2. Choose **Bulk Generation** mode
3. Select a category, level, and type
4. Choose number of questions (max 20)
5. Click "Generate Questions"
6. Review and edit questions as needed
7. Click "Generate Voices & Submit" to create audio and save

### Manage Questions
1. Click "Questions" to see all questions
2. Search using the search bar to filter questions
3. Click "Play" to hear the audio
4. Click "Edit" to modify content, category, level, or type
5. Click "Delete" to remove a question

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Categories
- `POST /api/category/create` - Create category
- `GET /api/category/read` - Fetch all categories
- `PUT /api/category/update` - Update category
- `DELETE /api/category/delete` - Delete category

### Questions
- `POST /api/questions/create` - Create single question
- `POST /api/questions/createBulk` - AI-generate bulk questions
- `POST /api/questions/insertBulk` - Insert questions to database
- `POST /api/questions/generateVoice` - Generate voice audio
- `GET /api/questions/read` - Fetch all questions
- `PUT /api/questions/update` - Update question
- `DELETE /api/questions/delete` - Delete question

### Tiers
- `POST /api/tiers/create` - Create tier
- `GET /api/tiers/read` - Fetch all tiers
- `PUT /api/tiers/update` - Update tier
- `DELETE /api/tiers/delete` - Delete tier

### Packages
- `GET /api/packages/read` - Fetch all packages
- `DELETE /api/packages/delete` - Delete package

## 🎯 Features Guide

### Bulk Question Generation
1. Go to **Create Questions** page
2. Switch to **Bulk Generation** mode
3. Configure:
   - **Category** - Select interview category
   - **Level** - Choose junior/middle/senior
   - **Type** - Pick intro/core/closing
   - **Count** - Number of questions (1-20)
4. Click **Generate Questions** - AI generates questions using Gemini
5. Edit questions if needed
6. Click **Generate Voices & Submit** - Creates audio and saves all questions

**Limitations:**
- Maximum 20 questions per session
- Each question gets unique voice generated with ElevenLabs
- Questions are stored in MongoDB, audio in Cloudinary

### Question Search & Filter
- Use the search bar on the Questions page
- Searches across:
  - Question content
  - Category name
  - Skill level
  - Question type
- Results update in real-time
- Results counter shows found items

### Voice Generation
- Automatically generated when:
  - Creating questions with bulk generation
  - Editing a question
- Can be played with the **Play** button
- Audio stored securely in Cloudinary
- Uses ElevenLabs' multilingual voice synthesis

### Category Management
- **Create** - Add new interview categories
- **Edit** - Modify category details and levels
- **Publish** - Mark category as available
- **Delete** - Remove category (if no questions associated)
- **Safety Check** - System prevents deletion if questions exist

## 📦 Build & Start

### Development
```bash
npm run dev
```
Server runs on [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Select your repository
   - Click "Import"

3. **Set Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all variables from your `.env` file
   - **Important:** Update `NEXT_PUBLIC_BASE_URL` to your production URL

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy

### Deploy Using Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

### Update Environment for Production
```env
# In Vercel Project Settings
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 🤝 Contributing

### Report Issues
- Open an issue on GitHub with:
  - Bug description
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots (if applicable)

### Submit Changes
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Data Models

### User
```typescript
{
  email: string
  password: string (hashed)
  name: string
  role: string
  token: string
}
```

### Category
```typescript
{
  title: string
  description: string
  imgUrl: string
  level: {
    junior: boolean
    middle: boolean
    senior: boolean
  }
  published: boolean
}
```

### Question
```typescript
{
  categoryId: ObjectId
  content: string
  level: "junior" | "middle" | "senior"
  type: "intro" | "core" | "closing"
  audioUrl?: string
  followUp: boolean
}
```

### Tier
```typescript
{
  name: string
  description: string
  price: number
  questions: ObjectId[]
}
```

## 🔒 Security

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Admin-only routes protected
- ✅ Environment variables for secrets
- ✅ API request validation
- ✅ FormData for file uploads

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Styled with [TailwindCSS](https://tailwindcss.com)
- AI from [Google Gemini](https://ai.google.dev)
- Voice from [ElevenLabs](https://elevenlabs.io)
- Storage on [Cloudinary](https://cloudinary.com)
- Database by [MongoDB](https://mongodb.com)

## 📞 Support

For questions or support:
- Open an issue on GitHub
- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [MongoDB docs](https://docs.mongodb.com)

---

**Happy interviewing! 🎉**
