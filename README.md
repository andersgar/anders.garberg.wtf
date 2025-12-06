<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://capsule-render.vercel.app/api?type=waving&color=0:00F5D4,25:00BBF9,65:8338EC,100:FF006E&height=180&section=header&text=anders.garberg.wtf&fontSize=45&fontColor=ffffff&animation=fadeIn&fontAlignY=35 />
  <source media="(prefers-color-scheme: light)" srcset="https://capsule-render.vercel.app/api?type=waving&color=0:00F5D4,25:00BBF9,65:8338EC,100:FF006E&height=180&section=header&text=anders.garberg.wtf&fontSize=45&fontColor=ffffff&animation=fadeIn&fontAlignY=35" />
  <img alt="Header" src="https://capsule-render.vercel.app/api?type=waving&color=0:00F5D4,25:00BBF9,65:8338EC,100:FF006E&height=180&section=header&text=anders.garberg.wtf&fontSize=45&fontColor=ffffff&animation=fadeIn&fontAlignY=35" width="100%" />
</picture>

<div align="center">

[![Live Site](https://img.shields.io/badge/🌐_Live-garberg.wtf-00F5D4?style=for-the-badge)](https://garberg.wtf)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---

## 📋 Overview

A modern, responsive portfolio website built with React and TypeScript. Features a dynamic theming system inspired by Philips Hue Sync, animated background blobs, bilingual support (Norwegian/English), and an admin dashboard with analytics.

<div align="center">

| Feature                | Description                               |
| ---------------------- | ----------------------------------------- |
| 🎨 **8 Color Themes**  | Philips Hue Sync-inspired gradient themes |
| 🌙 **Dark/Light Mode** | System-aware with manual toggle           |
| 🌐 **i18n**            | Full Norwegian and English support        |
| 📊 **Analytics**       | Visit tracking and admin dashboard        |
| ✨ **Animated Blobs**  | Dynamic, customizable background effects  |
| 📱 **Responsive**      | Mobile-first design                       |

</div>

---

## 🏗️ Tech Stack

### Frontend

| Technology                                                                                                           | Purpose                 |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)                     | UI Framework            |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)      | Type Safety             |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)                        | Build Tool & Dev Server |
| ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white) | Client-side Routing     |

### Backend & Services

| Technology                                                                                                | Purpose                    |
| --------------------------------------------------------------------------------------------------------- | -------------------------- |
| ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white) | Auth, Database & Analytics |
| ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)    | Hosting & Deployment       |

---

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Navigation.tsx   # Navbar with theme controls
│   ├── Hero.tsx         # Landing section
│   ├── Experience.tsx   # Work experience timeline
│   ├── About.tsx        # About me section
│   ├── Contact.tsx      # Contact form
│   ├── BackgroundBlobs.tsx  # Animated background
│   ├── Footer.tsx       # Site footer
│   └── DevBanner.tsx    # Development mode banner
│
├── context/             # React Context providers
│   ├── ThemeContext.tsx     # Theme & color management
│   ├── LanguageContext.tsx  # i18n language switching
│   └── AuthContext.tsx      # Supabase authentication
│
├── pages/               # Route pages
│   ├── HomePage.tsx     # Main portfolio page
│   ├── LoginPage.tsx    # Admin login
│   ├── AdminPage.tsx    # Analytics dashboard
│   └── ResetPasswordPage.tsx
│
├── i18n/
│   └── translations.ts  # Norwegian & English strings
│
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── analytics.ts     # Visit & event tracking
│
└── styles/
    ├── common.css       # Shared styles & CSS variables
    ├── desktop.css      # Desktop-specific styles
    ├── mobile.css       # Mobile breakpoints
    └── auth.css         # Login/admin page styles
```

---

## 🎨 Theming System

The site features a Philips Hue Sync-inspired color theme system with **8 unique themes**:

| Theme              | Colors                           |
| ------------------ | -------------------------------- |
| **Aurora Pulse**   | Cyan → Blue → Purple → Pink      |
| **Neon Cinema**    | Electric Blue → Purple → Red     |
| **Sunset Drive**   | Orange → Pink → Purple → Violet  |
| **Cyber Mint**     | Mint → Cyan → Blue → Purple      |
| **Deep Space**     | Navy → Indigo → Purple → Violet  |
| **Volcanic Night** | Black → Red → Orange → Gold      |
| **Ice Fire**       | Cyan → Blue → Red → Orange       |
| **Cotton Candy**   | Light Cyan → Sky → Purple → Pink |

Each theme defines 4 brand colors (`--brand`, `--brand-2`, `--brand-3`, `--brand-4`) that cascade throughout the UI.

### Background Blobs

Animated, dynamically-positioned gradient blobs create depth. Users can control the number of blobs (0-10) via the navbar dropdown.

---

## 🌐 Internationalization

Full bilingual support with language stored in `localStorage`:

- 🇳🇴 **Norwegian** (default)
- 🇬🇧 **English**

All UI text, including meta descriptions and CV download paths, are translated.

---

## 📊 Analytics & Admin

Built-in analytics powered by Supabase:

- **Visit Tracking** - Page views, referrers, user agents
- **CV Downloads** - Track resume download events
- **Contact Requests** - Form submission logging
- **Admin Dashboard** - Protected route with statistics overview

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/andersgar/anders.garberg.wtf.git
cd anders.garberg.wtf

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials to .env.local
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📦 Dependencies

### Production

| Package                 | Version | Purpose            |
| ----------------------- | ------- | ------------------ |
| `react`                 | ^18.3.1 | UI Framework       |
| `react-dom`             | ^18.3.1 | React DOM renderer |
| `react-router-dom`      | ^7.10.1 | Routing            |
| `@supabase/supabase-js` | ^2.86.2 | Backend services   |
| `qrcode.react`          | ^4.2.0  | QR code generation |

### Development

| Package      | Purpose       |
| ------------ | ------------- |
| `vite`       | Build tool    |
| `typescript` | Type checking |
| `eslint`     | Linting       |

---

## 🌍 Deployment

The site is deployed on **Netlify** with automatic deployments from the `main` branch.

### Netlify Configuration

- `_redirects` file handles SPA routing
- Build command: `npm run build`
- Publish directory: `dist`

---

## 📄 License

© 2025 Anders Garberg. All rights reserved.

---

<div align="center">

[![Portfolio](https://img.shields.io/badge/Visit_Site-garberg.wtf-00F5D4?style=flat-square)](https://garberg.wtf)

</div>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://capsule-render.vercel.app/api?type=waving&color=0:FF006E,35:8338EC,75:00BBF9,100:00F5D4&height=100&section=footer" />
  <source media="(prefers-color-scheme: light)" srcset="https://capsule-render.vercel.app/api?type=waving&color=0:FF006E,35:8338EC,75:00BBF9,100:00F5D4&height=100&section=footer" />
  <img alt="Footer" src="https://capsule-render.vercel.app/api?type=waving&color=0:FF006E,35:8338EC,75:00BBF9,100:00F5D4&height=100&section=footer" width="100%" />
</picture>
