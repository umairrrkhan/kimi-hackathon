# Check Health AI

> **AI-Powered Biological Simulation Platform** — Know exactly what your food does to your body.

---

## Overview

Check Health AI is a cutting-edge biological simulation platform powered by **Kimi K2.6** (Moonshot AI). Upload a photo of your meal or describe what you ate, and instantly receive a comprehensive 8-hour biological simulation covering glucose dynamics, insulin response, organ stress, and cognitive performance — personalized to your DNA.

---

## Core Features

### 1. AI Food Analysis (Kimi K2.6)
- Upload food photos for instant AI recognition via **Kimi K2.6 multimodal model**
- Manual food entry with structured JSON nutritional breakdown
- Macronutrient estimation (calories, carbs, protein, fat) + nutrient tags
- Automatic glycemic index classification

### 2. 3D Body Simulation
- Real-time 3D body visualization using Three.js + React Three Fiber
- Animated organ stress indicators with color-coded intensity
- Pulsing energy pathways showing glucose/insulin dynamics
- Interactive orbit controls for exploring the body map

### 3. Biological Prediction Engine
- **Glucose Curve**: 8-hour blood glucose projection based on food composition + Kimi data
- **Insulin Demand**: Pancreatic workload estimation with genetic modulation
- **Organ Stress**: Per-organ scoring (Pancreas, Liver, Heart, Kidneys, Brain, Stomach, Intestines, Immune System)
- **Cognitive Tracking**: Focus level and brain fog prediction over time
- **Personalized Modifiers**: Adjusts for age, BMI, activity, sleep, diabetic status, genetic markers
- **Predictive Timeline**: Combined multi-line chart with 4-phase breakdown (Digestion → Peak → Recovery → Baseline)

### 4. What-If Lab
- Compare same meal across different physiological states:
  - Normal (well-rested)
  - Sleep-Deprived
  - Post-Workout
  - Diabetic Profile
- Kimi-powered nutritional analysis for each comparison
- Side-by-side result comparison with peak value summaries + mini sparkline charts

### 5. Genetic Integration (Kimi-Powered)
- Upload raw genetic data (23andMe/AncestryDNA format)
- **Kimi K2.6 analyzes your DNA** and identifies food/metabolism-related variants
- Detected markers include:
  - **FTO** (rs9939609) — Obesity risk, appetite regulation
  - **APOE** (ε4 variant) — Lipid metabolism, cognitive sensitivity
  - **TCF7L2** — Insulin secretion, type 2 diabetes risk
  - **PPARG** (Pro12Ala) — Insulin sensitivity modulation
  - **MTHFR** (C677T) — Methylation, detoxification
- Risk-level badges (low / moderate / high) per variant
- Risk distribution bar chart + donut proportion chart
- Impact breakdown with animated progress bars
- Genetic modifiers automatically scale glucose/insulin predictions
- **PDF export** of full genetic analysis report

### 6. Advanced Analytics
- SVG line charts with gradient fill for glucose, insulin, focus, brain fog
- Animated organ stress progress bars
- Risk distribution bar chart + donut chart for genetic variants
- Combined predictive timeline overlay chart
- Simple/Advanced toggle for organ stress display

### 7. PDF Export
- Export simulation reports as PDF (Profile page)
- Export genetic analysis reports as PDF (Genetics page)
- Includes: food analysis, peak values, organ stress chart, full prediction text
- Multi-page support for long content

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 8 |
| **Routing** | React Router 7 |
| **Animation** | Framer Motion 12 (scroll, parallax, layout animations) |
| **3D Rendering** | Three.js + React Three Fiber + Drei |
| **Styling** | Tailwind CSS 4 + CSS custom properties |
| **State** | Zustand 5 |
| **PDF** | html2canvas + jsPDF |
| **AI Vision** | Kimi K2.6 (Moonshot API) |
| **File Upload** | react-dropzone |
| **Forms** | react-hook-form |

---

## Project Structure

```
src/
├── main.tsx                       # Entry point
├── App.tsx                        # Router configuration (7 routes)
├── style.css                      # Tailwind + black/yellow theme CSS variables
│
├── components/
│   ├── Header.tsx                 # Fixed dark header with amber accents
│   ├── PageTransition.tsx         # Framer motion page transitions
│   ├── AgentsLoader.tsx           # Customizable agent loading animation
│   └── BodyCanvas.tsx             # Three.js 3D body simulation canvas
│
├── pages/
│   ├── Home.tsx                   # Landing page with ASCII art, stats, features
│   ├── Analyze.tsx                # Food photo upload + Kimi AI analysis
│   ├── Simulation.tsx             # 3D body + charts + predictive timeline
│   ├── HowItWorks.tsx             # Compact expandable architecture guide
│   ├── WhatIfLab.tsx              # Scenario comparison with Kimi analysis
│   ├── Genetics.tsx               # DNA upload + Kimi analysis + charts + PDF
│   └── Profile.tsx                # User parameters + PDF report export
│
├── services/
│   ├── kimiApi.ts                 # Kimi K2.6 API (image, text, genetic analysis)
│   └── simulationEngine.ts        # Multi-factor biological simulation algorithms
│
└── store/
    └── simulationStore.ts         # Zustand global state management
```

---

## Design System

### Colors
- **Background**: `#000000` to `#0a0a0a` (deep black)
- **Surface**: `#111111`, `#1a1a1a` (dark panels)
- **Accent**: `#f59e0b` (amber), `#d97706` (dark amber), `#fbbf24` (light amber)
- **Text**: `#f5f5f5` (primary), `#a1a1aa` (secondary), `#71717a` (muted)
- **Status**: Red (glucose/stress), Amber (insulin), Emerald (stable), Pink (cognitive)

### Header
- Fixed full-width dark bar with blur on scroll
- Amber gradient logo badge
- Active nav link with animated `layoutId` underline pill
- Mobile responsive with animated expandable menu

### Typography
- **Headings**: Inter, 800 weight, tight letter-spacing
- **Body**: Inter, 300-500 weight
- **Mono**: JetBrains Mono for code/data displays

### ASCII Design
- Home page hero: ASCII "Check Health" logo
- Home page CTA: ASCII "AI" art
- Section dividers with ASCII line characters

---

## Setup

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Configuration

### Kimi API Key
For AI food analysis and genetic analysis, provide your Moonshot API key:

```env
# In .env file
VITE_KIMI_API_KEY=sk-your-key-here
```

Get your key at [platform.moonshot.ai](https://platform.moonshot.ai/).

The app proxies `/v1` to `https://api.moonshot.ai` via Vite config.

### Genetic Data Format
Accepts standard 23andMe / AncestryDNA text exports:
```
rsid       chromosome    position    genotype
rs9939609  16            53820527    AA
rs7903146  10            114758349   CT
```

---

## Architecture

### Simulation Engine
The `simulationEngine.ts` uses a multi-factor physiological model:

1. **Glycemic Classification**: Food → glycemic index + carb/fat/fiber load
2. **Insulin Sensitivity**: Profile (age, BMI, activity, sleep, diabetes) → sensitivity factor
3. **Genetic Modulation**: FTO, APOE, TCF7L2, PPARG, MTHFR → modifier multiplier
4. **Glucose Curve**: Gaussian-based meal response with Kimi-informed scaling
5. **Insulin Response**: Pancreatic output proportional to glucose excursion
6. **Organ Stress**: Rule-based scoring across 8 organ systems
7. **Cognitive Model**: Focus/fog derived from glucose variability with sigmoid recovery
8. **Narrative Prediction**: Natural language summary of all metrics

### Data Flow
```
User Photo/Text → Kimi K2.6 API → Structured JSON (food name, macros, nutrients)
                                       ↓
User Profile + Genetic Data → Simulation Engine → Glucose/Insulin/Organ/Cognitive
                                       ↓
                         3D Body Canvas + SVG Charts + Prediction Text
                                       ↓
                     PDF Export (Profile) + Genetic PDF Export (Genetics)
```

### AI Analysis Types
| Type | Function | Input | Output |
|------|----------|-------|--------|
| Food (Image) | `analyzeFoodImage()` | base64 photo | foodName, macros, nutrients |
| Food (Text) | `analyzeFoodText()` | food description | foodName, macros, nutrients |
| Genetic | `analyzeGeneticData()` | raw DNA text | markers[], summary, overallRisk |

---

## License

MIT
