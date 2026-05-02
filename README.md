# What The Food (WTF)

> **AI-Powered Biological Simulation Platform** — See exactly what happens inside your body after every meal.

---

## Overview

What The Food is a cutting-edge biological simulation platform that uses AI image recognition and computational physiology to predict how food affects your body in real-time. Upload a photo of your meal or describe what you ate, and instantly receive a comprehensive 8-hour biological simulation covering glucose dynamics, insulin response, organ stress, and cognitive performance.

---

## Core Features

### 1. AI Food Analysis
- Upload food photos for instant AI recognition (powered by Kimi API / Moonshot)
- Manual food entry with nutritional breakdown
- Macronutrient estimation (calories, carbs, protein, fat)
- Automatic glycemic index classification

### 2. 3D Body Simulation
- Real-time 3D body visualization using Three.js
- Animated organ stress indicators with color-coded intensity
- Pulsing energy pathways showing glucose/insulin dynamics
- Interactive orbit controls for exploring the body map

### 3. Biological Prediction Engine
- **Glucose Curve**: 8-hour blood glucose projection based on food composition
- **Insulin Demand**: Pancreatic workload estimation
- **Organ Stress**: Per-organ stress scoring (Pancreas, Liver, Heart, Kidneys, Brain, Stomach, Intestines, Immune System)
- **Cognitive Tracking**: Focus level and brain fog prediction over time
- **Personalized Modifiers**: Adjusts for age, BMI, activity level, sleep, diabetic status

### 4. What-If Lab
- Compare same meal across different physiological states:
  - Normal (well-rested)
  - Sleep-Deprived
  - Post-Workout
  - Diabetic Profile
- Side-by-side result comparison with peak value summaries

### 5. Genetic Integration
- Upload raw genetic data (23andMe/AncestryDNA format)
- Parses known variants:
  - **FTO** (rs9939609) — Obesity risk, appetite regulation
  - **APOE** (ε4 variant) — Lipid metabolism, cognitive sensitivity
  - **TCF7L2** — Insulin secretion, type 2 diabetes risk
  - **PPARG** (Pro12Ala) — Insulin sensitivity modulation
  - **MTHFR** (C677T) — Methylation, detoxification
- Genetic modifiers automatically scale glucose/insulin predictions

### 6. PDF Export
- Export complete simulation reports as PDF
- Includes: food analysis, peak values, organ stress chart, full prediction text
- Clean, print-optimized formatting

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 8 |
| **Routing** | React Router 7 |
| **Animation** | Framer Motion 12 |
| **3D Rendering** | Three.js + React Three Fiber + Drei |
| **Styling** | Tailwind CSS 4 |
| **State** | Zustand |
| **PDF** | html2canvas + jsPDF |
| **AI Vision** | Kimi API (Moonshot) |

---

## Project Structure

```
src/
├── main.tsx                  # Entry point
├── App.tsx                   # Router configuration
├── style.css                 # Tailwind imports + global styles
│
├── components/
│   ├── Header.tsx            # Glass-morphism navigation header
│   ├── PageTransition.tsx    # Framer motion page transitions
│   └── BodyCanvas.tsx        # Three.js 3D body simulation canvas
│
├── pages/
│   ├── Home.tsx              # Landing page with feature showcase
│   ├── Analyze.tsx           # Food photo upload + AI analysis
│   ├── Simulation.tsx        # 3D body sim + charts + predictions
│   ├── WhatIfLab.tsx         # Scenario comparison lab
│   ├── Genetics.tsx          # Genetic data upload + variant browser
│   └── Profile.tsx           # User parameters + PDF report export
│
├── services/
│   ├── kimiApi.ts            # Kimi/Moonshot API integration
│   └── simulationEngine.ts   # Biological simulation algorithms
│
└── store/
    └── simulationStore.ts    # Zustand global state
```

---

## Design System

### Colors
- **Background**: `#000000` to `#0a0a0a` (deep black)
- **Surface**: `#141414`, `#1a1a1a` (dark panels)
- **Accent**: `#a855f7` (purple), `#6366f1` (indigo)
- **Text**: `#e5e5e5` (primary), `#888` (muted)
- **Stress Colors**: Red (glucose/organ), Amber (insulin), Cyan (brain), Pink (immune)

### Header
- Fixed position with 16px top gap
- `border-radius: 2rem` — fully curved left/right edges
- Glass-morphism: `backdrop-filter: blur(24px)` + semi-transparent background
- Purple border glow at 12% opacity
- Radial gradient overlay for depth
- Active nav link with animated sliding indicator

### Typography
- **Headings**: Inter, 800 weight, tight tracking
- **Body**: Inter, 300-500 weight
- **Mono**: JetBrains Mono for data displays

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

### Kimi API (Optional)
For AI food analysis, provide your Moonshot API key:

```
# In the Analyze page, enter your key in the API field
sk-...
```

Without an API key, the app uses a local mock analyzer with realistic defaults.

### Genetic Data Format
Accepts standard 23andMe / AncestryDNA text exports:
```
# Format:
rsid    chromosome    position    genotype
rs9939609    16    53820527    AA
```

---

## Architecture

### Simulation Engine
The `simulationEngine.ts` uses a multi-factor physiological model:

1. **Glycemic Classification**: Food → glycemic index + carb/fat/fiber load
2. **Insulin Sensitivity**: Profile (age, BMI, activity, sleep, diabetes) → sensitivity factor
3. **Genetic Modulation**: FTO, APOE, TCF7L2, PPARG variants → modifier multiplier
4. **Glucose Curve**: Gaussian-based meal response with personalized scaling
5. **Insulin Response**: Pancreatic output proportional to glucose excursion
6. **Organ Stress**: Rule-based scoring across 8 organ systems
7. **Cognitive Model**: Focus/fog derived from glucose variability
8. **Narrative Prediction**: Natural language summary of all metrics

### Data Flow
```
User Photo → Kimi API → Food Analysis
                           ↓
User Profile + Genetic Data → Simulation Engine → Glucose/Insulin/Organ/Cognitive
                           ↓
                    3D Body Canvas + Charts + Prediction Text
                           ↓
                    PDF Export (Profile page)
```

---

## License

MIT
