# Scholarium — AI-Driven Mastery Roadmap

Scholarium is a premium, high-rigor skill acquisition platform that transforms any learning goal into a personalized, interactive, and gamified educational journey. Built on the **Akademia** design system, it leverages Google's Gemini AI and Anthropic's Claude to architect dynamic, data-driven curriculums that adapt to the learner's pace.

![Scholarium UI Concept](https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2000&auto=format&fit=crop)

## 🚀 The Scholarium Experience

### 🗺️ Dynamic Skill Roadmapping
Enter any goal—from "Mastering Quantum Computing" to "Becoming a Backend Engineer"—and Scholarium's AI Engine architecturally maps out a **Directed Acyclic Graph (DAG)** of foundational and advanced skills. Powered by **@xyflow/react**, the roadmap is logically sequenced and fully interactive.

### 📚 Adaptive Curriculum Flow
Each skill node expands into a tailored curriculum of unique subtopics. 
- **Lazy Loading Content**: Detailed explanations and learning materials are generated on-demand, ensuring a lightweight and responsive interface.
- **Pro Source Integration**: Instant access to top-tier technical resources like GeeksforGeeks and Programiz for deep-dive reading.

### ✍️ High-Rigor Mastery Assessments
Scholarium ensures true understanding through a high-stakes assessment engine.
- **Binary Mastery Scoring**: To progress, you must achieve a **100% (4/4)** score. Anything less is a retry.
- **Anti-Memorization Engine**: Every retry attempt triggers the AI to generate a **completely fresh set of questions**, preventing rote memorization.
- **Visual Feedback**: High-energy "glow" effects and interactive progress tracking using **Recharts**.

### 🎨 Akademia Design System
- **Premium Aesthetic**: A sleek UI utilizing **3D Glassmorphism**, backdrop blurs, and floating surfaces.
- **Dynamic Themes**: Choose from four curated environments: `Light`, `Midnight`, `Forest`, and `Ocean`.
- **Lively Interactions**: 3D tilt effects and smooth **Framer Motion** transitions make the platform feel "alive".

## 🛠️ Technical Stack

### Backend
- **Django 4.2.30**: Core web framework and ORM.
- **Django REST Framework**: RESTful API endpoints.
- **SimpleJWT**: Secure authentication and token rotation.
- **AI Engine**: Google Gemini (1.5 Flash) & Anthropic (Claude 3 Sonnet).
- **Database**: PostgreSQL (Relational) + MongoDB (Telemetry & LLM Logs).
- **Gunicorn & WhiteNoise**: Production-grade serving.

### Frontend
- **React 18 (Vite)**: High-performance SPA foundation.
- **@xyflow/react**: Interactive Directed Acyclic Graph (DAG) orchestration.
- **Framer Motion**: Complex UI animations and 3D effects.
- **Recharts**: Data-driven learning analytics.
- **Bootstrap 5 + Custom CSS**: "Akademia" design system with glassmorphism.

## 🏗️ Architecture & Flow

### Directory Structure
```text
Scholarium/
├── backend/                # Django Application (API & AI Agent)
│   ├── agent/             # Core logic for AI roadmap & assessment
│   ├── scholarium_project/# Project configuration
│   └── users/             # Authentication & user profiles
└── frontend/               # Vite/React Application
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── context/       # State management (Auth, Theme)
    │   ├── pages/         # Page-level components
    │   └── services/      # API abstraction layer
```

### Core Strategy
- **Pattern**: Monolithic Backend with a Decoupled Frontend (SPA).
- **Service Layer**: The `AgentEngine` abstracts LLM prompt construction and graph layout logic.
- **Hybrid Storage**: PostgreSQL for relational data; MongoDB for high-volume AI telemetry and response caching.

## 🚦 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL & MongoDB
- Gemini/Anthropic API Keys

### Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
DEBUG=True
SECRET_KEY=your_django_secret
DATABASE_URL=postgres://user:password@localhost:5432/scholarium
MONGO_URI=mongodb://localhost:27017/scholarium
GEMINI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
LLM_PROVIDER=gemini # or anthropic
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://127.0.0.1:8000
```

### Installation

1. **Clone & Setup Backend:**
   ```bash
   git clone https://github.com/saivivekduvva/Scholarium.git
   cd Scholarium/backend
   python -m venv venv
   source venv/bin/activate # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

2. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by the Scholarium Team.
