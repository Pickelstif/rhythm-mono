# Rhythm Sync - Comprehensive Band & Event Management Platform

A modern, full-stack monorepo application designed to streamline band management and event organization. Built with TypeScript, React, and Supabase, Rhythm Sync provides two specialized applications serving different aspects of the music industry ecosystem.

## 🎵 Project Overview

**Rhythm Sync** is a comprehensive platform that bridges the gap between bands and event organizers, providing tools for efficient management, scheduling, and coordination of musical events.

### Architecture

This monorepo contains:
- **Main App** (`@rhythm-sync/main-app`) - Band management platform for musicians
- **Organizers App** (`@rhythm-sync/organizers-app`) - Event scheduling platform for organizers
- **Shared Packages** - Common database types and utilities

## 🚀 Applications

### 🎸 Main App - Band Management Platform

A comprehensive solution for bands to manage their musical activities:

#### Core Features
- **Band Management**: Create and manage bands, invite members, assign roles
- **Member Availability Tracking**: Individual and band-wide availability calendars
- **Event Management**: Track rehearsals, gigs, and performances
- **Song Library**: Organize songs with metadata, sheets, and notes
- **Setlist Creation**: Build and manage setlists for events with drag-and-drop functionality
- **PDF Generation**: Create professional setlist PDFs with embedded sheet music
- **Income & Expense Tracking**: Financial management for bands
- **Spotify Integration**: Import playlists and song data
- **Profile Management**: Customize band and member profiles

#### Advanced Features
- **Band Availability System**: Leaders can set official band availability for bookings
- **Multi-format PDF Export**: Setlists with embedded sheet music and note sections
- **Real-time Collaboration**: Live updates for band members
- **Mobile Responsive**: Optimized for all devices

### 📅 Organizers App - Event Management Platform

A specialized tool for event organizers and venue managers:

#### Core Features
- **Schedule Management**: Weekly view with drag-and-drop event scheduling
- **Band Booking**: Browse and book available bands
- **Event Coordination**: Manage multiple events and time slots
- **Availability Tracking**: See real-time band availability
- **Custom Band Management**: Add bands not in the main system
- **Mobile-Optimized**: Dedicated mobile views for on-the-go management

#### Scheduling Features
- **Drag & Drop Interface**: Intuitive event placement
- **Time Slot Management**: Flexible scheduling with conflict detection
- **Multi-day Planning**: Weekly view with easy navigation
- **Real-time Updates**: Live synchronization across users

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **React Router** for navigation
- **React Query** for data fetching and caching
- **React Hook Form** with Zod validation

### Backend & Database
- **Supabase** for backend services
- **PostgreSQL** for data storage
- **Real-time subscriptions** for live updates
- **Row Level Security** for data protection

### Development Tools
- **Turborepo** for monorepo management
- **TypeScript** for type safety
- **ESLint** for code linting
- **PostCSS** for CSS processing

### Specialized Libraries
- **PDF-lib** & **PDF.js** for PDF generation
- **React Beautiful DND** for drag-and-drop
- **Date-fns** for date manipulation
- **Lucide React** for icons

## 🏃‍♂️ Getting Started

### Prerequisites
- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** (comes with Node.js)
- **Git** for version control

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd rhythm-mono
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create `.env` files in both app directories based on the provided examples.

4. **Start development servers**
```bash
# Start both applications
npm run dev

# Or start individual apps
npm run dev:main-app     # Main app on port 8080
npm run dev:organizers   # Organizers app on port 8081
```

### Build Commands
```bash
# Build all applications
npm run build

# Build specific apps
npm run build:main-app
npm run build:organizers-app

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📁 Project Structure

```
rhythm-mono/
├── apps/
│   ├── main-app/           # Band management application
│   │   ├── src/
│   │   │   ├── components/ # React components
│   │   │   ├── pages/      # Route components
│   │   │   ├── context/    # React contexts
│   │   │   ├── hooks/      # Custom hooks
│   │   │   └── lib/        # Utilities and services
│   │   └── ...
│   └── organizers-app/     # Event organizers application
│       ├── src/
│       │   ├── features/   # Feature-based organization
│       │   ├── components/ # Shared components
│       │   └── pages/      # Route components
│       └── ...
├── packages/
│   ├── database/           # Shared database utilities
│   └── shared-types/       # Common TypeScript types
└── ...
```

## 🎯 Key Features Breakdown

### Band Management
- Multi-role band system (Leaders, Members)
- Invitation system with secure join codes
- Member availability tracking
- Band-wide availability management

### Event & Setlist Management
- Event creation and tracking
- Professional PDF setlist generation
- Sheet music embedding
- Drag-and-drop setlist organization
- Performance notes and annotations

### Financial Tracking
- Income and expense tracking
- Band financial overview
- Transaction categorization

### Integration Capabilities
- Spotify playlist import
- External calendar synchronization
- PDF export for offline use

## 🚀 Deployment

### Vercel Deployment (Recommended)
Both applications are optimized for Vercel deployment:

```bash
# Deploy main app
npm run build:main-app

# Deploy organizers app  
npm run build:organizers-app
```

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

### Custom Domain
Connect custom domains through your hosting provider's domain management interface.

## 📚 Documentation

- `BAND_AVAILABILITY_FEATURE.md` - Detailed band availability system documentation
- `README-SETLIST.md` - Comprehensive setlist management guide
- `USER_TYPE_MIGRATION_GUIDE.md` - Database migration information
- `VERCEL_DEPLOYMENT_GUIDE.md` - Deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 🆘 Support

For support, feature requests, or bug reports, please open an issue in the repository.

---

**Built with ❤️ for the music community**
