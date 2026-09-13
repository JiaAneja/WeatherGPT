# 🌦️ WeatherGPT

### Conversational AI for Weather Forecasting, Alerts & Climate Information

WeatherGPT is an intelligent, conversational weather platform designed to make **weather information easier to understand, verify, and act upon**.

Instead of presenting users with complicated weather data, WeatherGPT combines **official meteorological sources, weather intelligence, conversational AI, risk analysis, maps, alerts, travel guidance, and agricultural advisories** into a single platform.

> **ASK → VERIFY → UNDERSTAND → ACT**

---

## 🚀 Key Features

### 🌤️ Real-Time Weather Dashboard

* Current weather conditions
* Temperature, humidity, wind and visibility
* Weather forecast information
* Location-based weather experience
* Clean responsive dashboard for desktop and mobile

### 🤖 WeatherGPT Conversational Assistant

Users can ask natural-language weather questions such as:

* "Will it rain tomorrow?"
* "Is it safe to travel today?"
* "What should I carry for my trip?"
* "Will there be heavy rainfall in my district?"
* "What precautions should farmers take?"

The assistant is designed to convert complex weather information into simple, actionable responses.

### 🇮🇳 India Weather Intelligence

* India-focused weather experience
* Location and district-based information
* Weather visualization across India
* Support for weather-related risk interpretation

### 🚨 Emergency Weather Alerts

Provides a dedicated interface for viewing severe-weather information and emergency alerts.

The platform is designed around the idea of:

**Detect → Verify → Explain → Alert → Act**

### 🗺️ India Weather Map

Interactive map-based visualization for exploring weather conditions across India.

### ✈️ Travel Risk Planner

Helps users understand weather-related travel risks by considering weather conditions and potential hazards.

### 🌾 Farmer Advisory Studio

Weather information can be translated into agriculture-focused guidance to help users understand weather impacts on crops and farming activities.

### 📈 Climate Trends

Dedicated interface for viewing climate and weather trend information.

### 👤 User Profile & Authentication

The application includes authentication and user-specific application functionality through Supabase.

---

# 🧠 Solution Approach

WeatherGPT follows a simple intelligence pipeline:

```text
User Query
    ↓
ASK
    ↓
Understand User Intent
    ↓
VERIFY
    ↓
Retrieve / Validate Weather Information
    ↓
UNDERSTAND
    ↓
Convert Meteorological Data into Simple Language
    ↓
ACT
    ↓
Provide Forecast / Alert / Risk / Recommendation
```

The goal is not just to show weather data, but to help users **make better decisions using weather information**.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │  TypeScript + Vite  │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
      Weather Services    AI Assistant      Risk Analysis
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   Backend APIs      │
                    │ Express + Node.js   │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
     Weather Data          AI Services          Supabase
          │                    │                    │
          ▼                    ▼                    ▼
       IMD / APIs          LLM Integration     Auth + Database
```

---

# 🛠️ Technology Stack

## Frontend

* **React 19**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **React Leaflet**
* **Recharts**
* **Lucide React**

## Backend

* **Node.js**
* **Express.js**
* **TypeScript**
* REST APIs
* Weather services
* Risk analysis
* AI decision layer
* Location resolution

## Database & Authentication

* **Supabase**
* Supabase Authentication
* Supabase Database
* Supabase Edge Functions

## AI

* Conversational weather intelligence
* Query understanding
* Context processing
* Weather-related recommendations
* Risk interpretation

## Data & Meteorological Sources

The project is designed to prioritize authoritative meteorological information, including:

* **India Meteorological Department (IMD)**
* **WIS 2.0**
* **ECMWF**
* **Bhashini** for multilingual accessibility

---

# 📁 Project Structure

```text
WeatherGPT/
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── server/
│   ├── decision/
│   │   ├── aiRoutes.ts
│   │   ├── contextEngine.ts
│   │   └── queryAnalyzer.ts
│   │
│   ├── locations/
│   │   └── locationRoutes.ts
│   │
│   ├── risk/
│   │   ├── riskEngine.ts
│   │   └── riskRoutes.ts
│   │
│   ├── user/
│   │   └── userRoutes.ts
│   │
│   ├── utils/
│   │   └── locationResolver.ts
│   │
│   ├── weather/
│   │   ├── weatherRoutes.ts
│   │   └── weatherService.ts
│   │
│   └── index.ts
│
├── src/
│   ├── components/
│   │   ├── alerts/
│   │   ├── assistant/
│   │   ├── auth/
│   │   ├── climate/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── farmer/
│   │   ├── landing/
│   │   ├── map/
│   │   ├── profile/
│   │   └── travel/
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── WeatherContext.tsx
│   │
│   ├── data/
│   │   ├── activeAlertsData.ts
│   │   ├── cropsAgrometData.ts
│   │   └── indianDistricts.ts
│   │
│   ├── hooks/
│   │   └── useVoiceRecognition.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── utils.ts
│   │
│   ├── services/
│   │   ├── agrometService.ts
│   │   ├── aiService.ts
│   │   ├── imdService.ts
│   │   ├── travelRiskService.ts
│   │   └── weatherService.ts
│   │
│   ├── types/
│   │   ├── ai.types.ts
│   │   ├── database.types.ts
│   │   └── weather.types.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── supabase/
│   ├── functions/
│   │   ├── imd-proxy/
│   │   └── weather-ai-chat/
│   │
│   └── schema.sql
│
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

# ⚙️ Local Setup

## 1. Clone the repository

```bash
git clone https://github.com/JiaAneja/WeatherGPT.git
cd WeatherGPT
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Additional server-side variables may be required depending on the enabled backend and AI services.

> ⚠️ Never commit `.env` or secret API keys to GitHub.

The repository includes `.env.example` as a reference.

## 4. Start the frontend

```bash
npm run dev
```

The Vite development server will normally be available at:

```text
http://localhost:5173
```

---

# 🔧 Available Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the development server         |
| `npm run build`   | Create the production build          |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run Oxlint                           |

---

# 🏭 Production Build

Before deployment, verify that the application builds successfully:

```bash
npm run build
```

The production files are generated inside:

```text
dist/
```

---

# 🔐 Environment Variables

The project uses environment variables for configuration and secrets.

### Frontend

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Server / Supabase Functions

Depending on deployment configuration:

```env
SUPABASE_SERVICE_ROLE_KEY=
LLM_API_KEY=
GEMINI_API_KEY=
IMD_API_KEY=
```

Server-side secrets must **never** be exposed through frontend code.

---

# 🌐 API Architecture

The Express backend exposes modular API routes:

```text
/api/health
/api/weather
/api/risk
/api/ai
/api/locations
/api/user
```

### Health Check

```text
GET /api/health
```

### Weather

```text
/api/weather
```

Handles weather-related backend operations.

### Risk

```text
/api/risk
```

Handles weather and travel/risk-related processing.

### AI

```text
/api/ai
```

Handles conversational AI and decision-related operations.

### Locations

```text
/api/locations
```

Handles location resolution and location-related operations.

### User

```text
/api/user
```

Handles user-related backend functionality.

---

# ☁️ Supabase Edge Functions

The project contains Supabase Edge Functions for server-side functionality:

```text
supabase/functions/
├── imd-proxy/
└── weather-ai-chat/
```

### IMD Proxy

Designed to provide a secure server-side layer for meteorological data access.

### Weather AI Chat

Designed to process weather-related conversational AI requests without exposing sensitive API credentials to the frontend.

---

# 🎯 Core Design Philosophy

WeatherGPT is built around four stages:

### 1. ASK

Users ask questions naturally instead of navigating complicated weather dashboards.

### 2. VERIFY

Weather information should be grounded in reliable meteorological data.

### 3. UNDERSTAND

Complex weather information is converted into clear, human-readable explanations.

### 4. ACT

The user receives actionable information such as:

* Weather precautions
* Travel risk
* Emergency alerts
* Agricultural guidance
* Weather-based recommendations

---

# 📱 Responsive Experience

WeatherGPT is designed for:

* Desktop
* Laptop
* Tablet
* Mobile devices

The interface uses responsive React components and Tailwind CSS to adapt to different screen sizes.

---

# 🇮🇳 India-First Focus

WeatherGPT is designed with the Indian weather ecosystem in mind.

The platform can support use cases involving:

* District-level weather information
* Severe weather alerts
* Travel planning
* Agricultural advisories
* Emergency preparedness
* Climate information
* Multilingual weather communication

---

# 🔮 Future Scope

Potential future enhancements include:

* Full multilingual conversational weather support
* Voice-based weather assistant
* Integration with additional official meteorological APIs
* More advanced weather forecasting models
* Personalized weather notifications
* Hyperlocal alerts
* Offline-first functionality for low-connectivity regions
* Advanced climate analytics
* More agriculture-specific recommendations
* Integration with additional government datasets

---

# Smart India Hackathon

**Problem Statement:**

> WeatherGPT: Conversational AI for Weather Forecasting, Alerts, and Climate Information

The project focuses on making weather information more **accessible, understandable, conversational, and actionable** for citizens, travelers, farmers, and other weather-dependent users.

---

#  Development

Built as a Smart India Hackathon prototype using:

**React + TypeScript + Vite + Tailwind CSS + Node.js + Express + Supabase + AI**

---

# 📄 License

This project is currently developed as a Smart India Hackathon prototype.

---
