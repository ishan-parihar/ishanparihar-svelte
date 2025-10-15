# Ishan Parihar Portfolio Clone

A sophisticated portfolio website built with Next.js, featuring advanced animations and interactive components.

## Tech Stack

- **Framework**: Next.js 15.3.2
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, GSAP
- **Database**: Supabase
- **Authentication**: NextAuth.js
- **Payment**: Razorpay
- **3D Graphics**: Three.js, React Three Fiber

## Features

- Modern, responsive design
- Advanced animations and interactions
- Blog system with premium content
- User authentication and profiles
- Payment integration for premium services
- Admin dashboard for content management
- Real-time support system

## Getting Started

### Prerequisites

Before setting up the project, ensure you have the following system dependencies installed:

#### System Requirements

- Node.js (v18.19.1 or higher)
- npm (v9.2.0 or higher)
- bun (v1.2.19 or higher) - Preferred package manager
- curl and unzip (for bun installation)
- build-essential (for native module compilation)

#### Installation Commands (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Node.js, npm, and build tools
sudo apt install -y nodejs npm curl unzip build-essential

# Install bun (preferred package manager)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### Project Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ishanparihar-clone
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   # Copy the example environment file
   cp .env.example .env.local

   # Edit .env.local with your actual values
   # See .env.example for all required variables
   ```

4. **Verify environment setup**

   ```bash
   node scripts/check-env-vars.js
   ```

5. **Run the development server**

   ```bash
   bun dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

The project requires several environment variables to function properly:

### Required Variables

- `NEXTAUTH_SECRET` - Secret key for NextAuth.js session encryption
- `NEXTAUTH_URL` - Full URL of your deployed site (http://localhost:3000 for development)
- `SUPABASE_URL` - URL of your Supabase project
- `NEXT_PUBLIC_SUPABASE_URL` - Public URL of your Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key for Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for Supabase

### Optional Variables

- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_WEBHOOK_SECRET` - For payment processing

See `.env.example` for complete documentation and setup instructions.

## Build Commands

- **Development**: `bun dev`
- **Production build**: `bun run build`
- **Start production**: `bun start`
- **Lint code**: `bun run lint`
- **Bundle analysis**: `bun run analyze`

## Additional Setup Files

- `requirements.txt` - Complete system requirements and installation guide
- `.env.example` - Environment variables template with documentation
- `scripts/check-env-vars.js` - Environment validation script
- `scripts/generate-nextauth-secret.js` - Generate NextAuth secret key

---

## **Operation Portfolio Ascendance: Phase 1 Log**

**Date:** July 15, 2025
**Status:** Hero Section Transformation **COMPLETE**.

### Summary:

Successfully transformed the portfolio's hero section from a standard web layout into a sophisticated, interactive "Consciousness Evolution Protocol" interface. This achieves the core brand identity goals of Priority 1 (P1.5, P1.6, P1.7).

### Key Features Implemented:

- **Unified Headline:** A single, cohesive `ShinyText` animation for the main title.
- **Dynamic Data:** `CountUp` animations for live data readouts.
- **Interactive Controls:** `Magnet` and `ClickSpark` effects on CTA buttons for a premium feel.
- **Atmospheric Background:** An encapsulated, animated `Beams` background provides depth without distraction.
- **Responsive Design:** The layout is fully responsive and maintains its aesthetic integrity on all devices.

### Next Objective:

Proceed with Priority 1 performance optimizations (P1.1 - P1.4).
