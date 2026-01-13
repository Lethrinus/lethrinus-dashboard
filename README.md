<div align="center">

<img src="./public/cat.gif" alt="Lethrinus Dashboard" width="200" height="200"> 

 #  Lethrinus Dashboard

**A personal productivity dashboard built with modern web technologies**

[![React](https://img.shields.io/badge/React-19.2.1-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.87.0-3ECF8E?logo=supabase)](https://supabase.com/)

*A comprehensive all-in-one solution for organizing your personal tasks, notes, journal entries, and files across all your devices*

</div>

---

## 📖 About This Project

**Lethrinus Dashboard** is a personal project I developed as a software engineering student. This application was created as a hobby project to help me organize my daily tasks, journal entries, notes, and files in one centralized location. The primary motivation behind building this dashboard was to have a unified system that I could access from any device whether I'm on my laptop, tablet, or phone ensuring all my data stays synchronized and accessible wherever I am.

The project leverages modern web technologies including React, TypeScript, and Supabase to provide a seamless, responsive experience. It features a beautiful dark-themed UI with smooth animations, comprehensive data management capabilities, and secure cloud-based storage.

---

## ✨ Key Features

### 📝 **Journal Management**
Keep track of your daily thoughts and experiences with a rich journaling system:
- **Daily Entries**: Create journal entries for each day with titles and detailed content
- **Mood Tracking**: Record your mood (happy, neutral, sad, productive, tired) for each entry
- **Tags & Categories**: Organize entries with custom tags for easy filtering and search
- **Media Support**: Attach images and embed Spotify tracks to enrich your journal entries
- **Calendar View**: Visualize your journal entries in a calendar format

### ✅ **Task Management**
Stay organized with a comprehensive task management system:
- **Task Creation**: Create tasks with titles, descriptions, and due dates
- **Subtasks**: Break down complex tasks into smaller, manageable subtasks
- **Priority Levels**: Categorize tasks by priority (low, medium, high)
- **Status Tracking**: Monitor task progress (todo, in-progress, done)
- **Categories & Tags**: Organize tasks by category and add custom tags
- **Progress Visualization**: Visual indicators for task completion rates

### 📄 **Notes System**
A flexible note-taking system for capturing and organizing information:
- **Rich Text Notes**: Create and edit notes with markdown support
- **Folder Organization**: Organize notes into folders and subfolders
- **Pin Important Notes**: Pin frequently accessed notes for quick access
- **Auto-save**: Automatic saving ensures you never lose your work
- **Quick Navigation**: Fast search and navigation through your notes

### 📁 **File Storage**
Centralized file management with cloud storage support:
- **File Upload**: Upload files of any type to your personal storage
- **Folder Structure**: Organize files in a hierarchical folder structure
- **Multiple Storage Backends**: 
  - **Supabase Storage** (default) - Integrated with your Supabase project
  - **Cloudflare R2** (optional) - Alternative storage solution
- **File Preview**: Preview files directly in the browser
- **Secure Access**: All files are protected with user authentication

### 🎬 **Media Tracker**
Track your entertainment consumption:
- **Movies & Series**: Keep track of movies and TV series you're watching
- **Status Management**: Mark items as watching, completed, or plan to watch
- **Rating System**: Rate your entertainment (0-5 stars)
- **Metadata**: Store year, poster images, and other details
- **Personal Library**: Build your own entertainment database

### 🤖 **AI Assistant**
Access multiple AI models directly from the dashboard using your API keys:
- **Google Gemini** - Fully integrated and ready to use
- **OpenAI GPT-4** - Available for integration
- **Anthropic Claude** - Available for integration

Simply add your API keys in the Settings page and start chatting with your preferred AI assistant. All keys are stored locally in your browser for privacy.

### 🎨 **User Interface**
A carefully designed interface focused on usability and aesthetics:
- **Dark Theme**: Beautiful dark theme with CRT scanline effects for a retro-modern feel
- **Smooth Animations**: Powered by Framer Motion for fluid transitions and interactions
- **Glass Morphism**: Modern glassmorphism effects throughout the interface
- **Responsive Design**: Fully responsive layout that works on all screen sizes
- **Command Palette**: Quick navigation with ⌘K / Ctrl+K keyboard shortcut
- **Page Transitions**: Smooth animated transitions between different sections

### 🔐 **Security & Privacy**
Built with security and privacy in mind:
- **Supabase Authentication**: Secure user authentication via Supabase
- **Row Level Security (RLS)**: Database-level security ensuring users can only access their own data
- **User Data Isolation**: Complete separation of user data
- **Secure File Storage**: Files are stored securely with proper access controls
- **Environment Variables**: All sensitive configuration is handled through environment variables
- **No Hardcoded Credentials**: Zero hardcoded API keys or secrets

---


## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18 or higher) and npm
- A **Supabase** account and project (free tier works perfectly)
- (Optional) A **Cloudflare R2** account if you want to use R2 for file storage

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/lethrinus/lethrinus-dashboard.git
cd lethrinus-dashboard
```

#### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including React, TypeScript, Vite, Supabase client, and other necessary packages.

#### 3. Configure Environment Variables

Create a `.env` file in the root directory of the project:

```env
# Supabase Configuration
# Get these from your Supabase project dashboard: Settings → API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Storage Mode: 'supabase' or 'r2'
VITE_STORAGE_MODE=supabase

# Cloudflare R2 Worker (optional - only if using R2 storage)
VITE_R2_WORKER_URL=https://your-worker.workers.dev
```

> **⚠️ Important:** Never commit your `.env` file to version control. It's already included in `.gitignore` for your safety.

#### 4. Set Up Supabase Database

You'll need to create the following tables in your Supabase project. All tables require Row Level Security (RLS) to be enabled with policies that ensure users can only access their own data.

**Required Tables:**
- `profiles` - User profile information
- `journal` - Daily journal entries with mood tracking, tags, and media support
- `tasks` - Task management with subtasks, priorities, and categories
- `notes` - Note-taking system with folder organization
- `files` - File metadata for uploaded files
- `media` - Media tracking for movies and series

**Storage Bucket:**
- Create a storage bucket named `files` in your Supabase Storage dashboard
- Set it to **Private** for security
- This bucket will store all uploaded files

For detailed SQL scripts and RLS policies, please refer to the Supabase documentation or check the migration files in the `supabase/migrations/` directory if available.

#### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`. Open it in your browser and you should see the login page.

#### 6. Build for Production

When you're ready to deploy:

```bash
npm run build
```

The production-ready files will be in the `dist` folder, which you can deploy to any static hosting service like Vercel, Netlify, or Cloudflare Pages.

---

## ⚙️ Configuration

### Storage Backend Selection

The application supports two storage backends for file uploads. You can choose based on your preferences and requirements.

#### **Supabase Storage** (Recommended for Most Users)

This is the default and recommended option:

- Set `VITE_STORAGE_MODE=supabase` in your `.env` file
- Files are stored directly in your Supabase Storage bucket
- Automatic signed URL generation for secure file access
- Integrated with your Supabase project (no additional setup needed)
- Works seamlessly with the authentication system

#### **Cloudflare R2** (Optional Alternative)

If you prefer using Cloudflare R2 for file storage:

1. Set `VITE_STORAGE_MODE=r2` in your `.env` file
2. Set `VITE_R2_WORKER_URL` to your Cloudflare Worker URL
3. Deploy the R2 worker from the `cloudflare-worker/` directory:
   ```bash
   cd cloudflare-worker
   npx wrangler deploy
   ```
4. Configure `wrangler.toml` with your R2 bucket name and settings

### AI Assistant Setup

To use the AI Assistant feature:

1. Navigate to **Settings** → **AI & Integrations** in the dashboard
2. Enter your API keys:
   - **Gemini API Key**: Get it from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **OpenAI API Key** (optional): For GPT-4 integration
   - **Anthropic API Key** (optional): For Claude integration
3. Select your preferred AI model from the dropdown
4. Your API keys are stored locally in your browser's localStorage (never sent to any server except the AI provider)

---

## 🛠️ Technology Stack

This project is built using modern web technologies and best practices:

### **Frontend Technologies**
- **React 19.2.1** - Modern UI library for building interactive user interfaces
- **TypeScript 5.8.2** - Type-safe JavaScript for better code quality and developer experience
- **Vite 6.2.0** - Fast build tool and development server
- **Framer Motion 12.23.26** - Production-ready motion library for React animations
- **React Router 7.10.1** - Declarative routing for React applications
- **Lucide React** - Beautiful, customizable icon library
- **Recharts 3.5.1** - Composable charting library for data visualization
- **date-fns 4.1.0** - Modern JavaScript date utility library

### **Backend & Services**
- **Supabase 2.87.0** - Open-source Firebase alternative providing:
  - PostgreSQL database with real-time capabilities
  - Authentication and user management
  - Storage for file uploads
  - Row Level Security for data protection
- **Cloudflare R2** (optional) - S3-compatible object storage
- **Google Gemini AI** - AI assistant integration

### **Development Tools**
- **TypeScript** - Static type checking
- **Vite** - Fast HMR (Hot Module Replacement) for development

---

## 📁 Project Structure

```
lethrinus-dashboard/
├── components/          # React component files
│   ├── AiAssistant.tsx      # AI chat interface
│   ├── Animations.tsx        # Reusable animation components
│   ├── Auth.tsx             # Login/authentication component
│   ├── CommandPalette.tsx   # Command palette (⌘K)
│   ├── Dashboard.tsx        # Main dashboard view
│   ├── Files.tsx           # File management interface
│   ├── Journal.tsx         # Journal entries interface
│   ├── Layout.tsx          # Main layout wrapper
│   ├── Media.tsx           # Media tracker interface
│   ├── Notes.tsx           # Notes interface
│   ├── Settings.tsx        # Settings page
│   └── Tasks.tsx           # Task management interface
├── services/           # Service layer and API integration
│   ├── api.ts              # Main API service (data operations)
│   ├── r2.ts              # Cloudflare R2 service
│   └── supabase.ts        # Supabase client initialization
├── cloudflare-worker/  # R2 storage worker (optional)
│   ├── r2-worker.js       # Worker implementation
│   └── wrangler.toml      # Worker configuration
├── public/            # Static assets (images, GIFs, etc.)
├── dist/              # Build output (gitignored)
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
├── types.ts           # TypeScript type definitions
├── vite.config.ts     # Vite build configuration
└── package.json       # Project dependencies and scripts
```

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## 📧 Contact & Support

This is a personal hobby project, but I'm open to feedback and suggestions! If you have questions, find bugs, or have ideas for improvements, feel free to:

- Open an issue on GitHub
- Start a discussion
- Submit a pull request (contributions are welcome!)

---
<div align="center">
  <img src="./public/cat_anim1.gif" width="150" height="150" style="display: block; margin: 0 auto;">
  <br>
  <strong style="font-size: 1.1em;">Time is a flat circle. Everything we have done or will do we will do over and over and over again- forever.</strong>
</div>
