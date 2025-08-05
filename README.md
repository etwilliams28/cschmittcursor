# C. Schmitt Customs

A modern web application for C. Schmitt Customs, a custom sheds and construction business. Built with React, TypeScript, and Supabase.

## Features

- **Custom Sheds Showcase**: Display and manage custom shed projects
- **Blog System**: Content management for blog posts and articles
- **Contact Forms**: Customer inquiry and quote request forms
- **Admin Panel**: Complete admin interface for content management
- **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Storage)
- **Forms**: React Hook Form with Zod validation
- **Rich Text**: React Quill for content editing
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cschmittcustomscursor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── Admin/     # Admin panel components
│   ├── Forms/     # Form components
│   ├── Layout/    # Header, Footer, etc.
│   └── UI/        # Generic UI components
├── pages/         # Page components
│   └── Admin/     # Admin pages
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries
└── types/         # TypeScript type definitions
```

## Deployment

This project can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## License

Private - All rights reserved
