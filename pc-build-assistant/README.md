<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Groq_AI-LLaMA_3.3-FF6B35?style=for-the-badge&logo=meta&logoColor=white" alt="Groq AI" />
  <img src="https://img.shields.io/badge/Built_with-Kiro-00D4AA?style=for-the-badge" alt="Built with Kiro" />
</p>

<h1 align="center">🖥️ PC Build Assistant</h1>

<p align="center">
  <strong>An AI-powered intelligent PC building companion that guides users through component selection with real-time compatibility checking, personalized recommendations, and natural language explanations.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-api-setup">API Setup</a> •
  <a href="#-project-structure">Project Structure</a>
</p>

---

## 🎯 The Problem

Building a custom PC is **overwhelming**. Users face:

- 🔄 **Thousands of component combinations** to evaluate
- ⚠️ **Complex compatibility constraints** (socket types, RAM compatibility, power requirements)
- 📊 **Technical specifications** that are hard to understand
- 🤔 **Decision paralysis** when choosing between similar options
- ⏰ **Hours of research** across multiple websites

## 💡 Our Solution

PC Build Assistant transforms the PC building experience into a **guided, educational journey**:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   👤 User Preferences    →    🤖 AI Analysis    →    🖥️ Build  │
│                                                                 │
│   Budget, Use Case,          Compatibility,         Complete    │
│   Brand Preferences          Trade-offs,            PC Config   │
│                              Explanations                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🎮 Dual Mode Experience

| Beginner Mode | Advanced Mode |
|---------------|---------------|
| Simplified options | Full control |
| Plain language explanations | Technical specifications |
| Guided recommendations | Custom filters (cores, VRAM, form factor) |
| Reduced decision fatigue | Complete flexibility |

### 🔧 Smart Compatibility Engine

```typescript
// Automatic filtering ensures only compatible components are shown
✓ CPU ↔ Motherboard socket matching
✓ Motherboard ↔ RAM type compatibility  
✓ GPU ↔ PSU power requirements
✓ Case ↔ Motherboard form factor
✓ Brand preference filtering (Intel/AMD/NVIDIA)
```

### 🤖 AI-Powered Explanations (Groq LLaMA 3.3)

- **"Why Not This?"** - Understand why a component might not be ideal for your build
- **Trade-off Analysis** - Visual comparison of cost, performance, and power
- **Conversational Chat** - Ask questions about your build in natural language
- **Build Summary** - AI-generated overview of your complete build

### 📊 Visual Trade-Off Comparison

Components are compared with contextual metrics:

| Component | Metrics Shown |
|-----------|---------------|
| CPU/GPU | Performance Score, Power Draw |
| RAM | Capacity & Speed |
| Storage | Read/Write Speed |
| PSU | Wattage |

### 🏗️ Interactive Architecture Visualization

Real-time visual diagram showing:
- Selected components with manufacturer logos
- Connection paths between components
- Build progress indicator

### 📥 Downloadable Build Specifications

Export your complete build as a formatted text file with:
- All component specifications
- Total cost breakdown
- AI-generated strengths & considerations
- Upgrade recommendations

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pc-build-assistant.git
cd pc-build-assistant

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your VITE_GROQ_API_KEY

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PC BUILD ASSISTANT                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐ │
│  │   React     │    │   Zustand   │    │     Groq AI (LLaMA)     │ │
│  │   Frontend  │◄──►│   Store     │◄──►│   Explanations API      │ │
│  │   + Vite    │    │   State     │    │                         │ │
│  └─────────────┘    └─────────────┘    └─────────────────────────┘ │
│         │                  │                       │               │
│         ▼                  ▼                       ▼               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  CORE SERVICES LAYER                         │   │
│  ├─────────────────┬─────────────────┬─────────────────────────┤   │
│  │  Compatibility  │   AI Explainer  │    Component Store      │   │
│  │     Engine      │    Service      │      (Mock Data)        │   │
│  └─────────────────┴─────────────────┴─────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### User Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Welcome    │────►│  Preferences │────►│   CPU        │
│   Screen     │     │   Form       │     │   Selection  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
┌──────────────┐     ┌──────────────┐     ┌──────▼───────┐
│   Build      │◄────│   PSU        │◄────│   GPU        │
│   Summary    │     │   Selection  │     │   Selection  │
└──────┬───────┘     └──────────────┘     └──────────────┘
       │                    ▲                    │
       │             ┌──────┴───────┐     ┌──────▼───────┐
       │             │   Storage    │◄────│  Motherboard │
       │             │   Selection  │     │   Selection  │
       │             └──────────────┘     └──────┬───────┘
       │                    ▲                    │
       │             ┌──────┴───────┐            │
       │             │   RAM        │◄───────────┘
       │             │   Selection  │
       │             └──────────────┘
       ▼
┌──────────────┐
│   Download   │
│   Build Spec │
└──────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + TypeScript | Type-safe UI components |
| Build Tool | Vite | Fast development & HMR |
| State Management | Zustand | Lightweight, persistent state |
| AI Integration | Groq API (LLaMA 3.3 70B) | Natural language explanations |
| Styling | CSS3 with Glass Morphism | Modern, accessible UI |
| Testing | Jest + React Testing Library | Unit & integration tests |

---

## 📁 Project Structure

```
pc-build-assistant/
├── src/
│   ├── components/           # React UI Components
│   │   ├── BuildWizard.tsx      # Main wizard orchestrator
│   │   ├── ComponentCard.tsx    # Individual component display
│   │   ├── TradeOffDisplay.tsx  # Visual comparison bars
│   │   ├── ConversationalChat.tsx # AI chat interface
│   │   ├── PreferenceForm.tsx   # User preferences input
│   │   ├── PCArchitectureVisual.tsx # Build visualization
│   │   └── BuildSummary.tsx     # Final build review + download
│   │
│   ├── services/             # Business Logic
│   │   ├── compatibilityEngine.ts  # Component filtering
│   │   ├── groqService.ts          # AI API integration
│   │   └── aiExplainer.ts          # Explanation generation
│   │
│   ├── store/                # State Management
│   │   └── buildStore.ts        # Zustand store with persistence
│   │
│   ├── types/                # TypeScript Definitions
│   │   ├── build.ts            # Build & preferences types
│   │   └── components.ts       # Component specifications
│   │
│   └── data/                 # Component Database
│       ├── mockCPUs.ts
│       ├── mockGPUs.ts
│       ├── mockMotherboards.ts
│       ├── mockRAM.ts
│       ├── mockStorage.ts
│       └── mockPSUs.ts
│
├── public/assets/
│   ├── logos/               # Manufacturer logos (PNG)
│   └── components/          # Component data (CSV)
│
└── .kiro/specs/             # Kiro Specifications
    └── pc-build-assistant/
        ├── requirements.md
        ├── design.md
        └── tasks.md
```

---

## 🔑 API Setup

### Groq API (Required for AI Features)

1. Sign up at [console.groq.com](https://console.groq.com)
2. Create an API key
3. Add to your `.env` file:

```env
VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
```

The app uses the `llama-3.3-70b-versatile` model for generating explanations.

---

## 🖼️ Adding Manufacturer Logos

Place logo images in `public/assets/logos/` with these filenames:

### CPU & GPU Brands
- `intel.png`, `amd.png`, `nvidia.png`

### Motherboard Brands
- `asus.png`, `msi.png`, `gigabyte.png`, `asrock.png`

### RAM Brands
- `corsair.png`, `g.skill.png`, `kingston.png`, `crucial.png`

### Storage Brands
- `samsung.png`, `western-digital.png`, `seagate.png`, `crucial.png`, `kingston.png`

### PSU Brands
- `corsair.png`, `evga.png`, `seasonic.png`, `be-quiet.png`

**Specifications:** 200x200px PNG with transparent background

---

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR

# Build
npm run build        # TypeScript compile + Vite build

# Testing
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode

# Linting
npm run lint         # ESLint check
```

---

## 🎯 Key Features Explained

### Compatibility Engine

```typescript
// Ensures only compatible components are shown
export function filterCompatibleComponents(
    componentType: ComponentType,
    components: Component[],
    build: Partial<CompleteBuild>,
    preferences: UserPreferences | null
): Component[] {
    // Socket matching for CPU/Motherboard
    // RAM type matching for Motherboard/RAM
    // Power requirements validation
    // Brand preference filtering
}
```

### AI Integration

```typescript
// Direct fetch to Groq API (browser-compatible)
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        model: 'llama-3.3-70b-versatile',
        max_completion_tokens: 1024,
    }),
});
```

### State Persistence

```typescript
// Zustand store with localStorage persistence
export const useBuildStore = create<BuildStore>()(
    persist(
        (set, get) => ({
            build: {},
            preferences: null,
            mode: 'beginner',
            // ... actions
        }),
        { name: 'build-store' }
    )
);
```

---

## 🤝 Built with Kiro

This project was developed using **Kiro**, an AI-powered IDE that accelerated development through:

- **Spec-driven development** - Requirements defined upfront in `.kiro/specs/`
- **Rapid feature implementation** - Complex features built in minutes
- **Real-time problem solving** - Quick debugging and optimization
- **Code generation** - Type-safe components and services

---

## 📄 License

MIT License - feel free to use this project for learning and building!

---

<p align="center">
  <strong>Built with ❤️ using Kiro</strong>
</p>
