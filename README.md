# Scholarium — AI-Driven Mastery Roadmap

Scholarium is a premium, high-rigor skill acquisition platform that transforms any learning goal into a personalized, interactive, and gamified educational journey. Powered by Google's Gemini AI, it moves beyond static tutorials to build dynamic, data-driven curriculums that adapt to the learner's pace.

![Scholarium UI Concept](https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2000&auto=format&fit=crop)

## 🚀 The Scholarium Experience

### 🗺️ Dynamic Skill Roadmapping
Enter any goal—from "Mastering Quantum Computing" to "Becoming a Backend Engineer"—and Scholarium's AI Engine architecturally maps out a **Directed Acyclic Graph (DAG)** of foundational and advanced skills. The roadmap is logically sequenced, ensuring you always know your next step.

### 📚 Adaptive Curriculum Flow
Each skill node expands into a tailored curriculum of **UNIQUE subtopics**. 
- **On-Demand Content**: Detailed explanations are generated lazily only when you need them, keeping the interface lightning-fast.
- **Pro Source Integration**: Instant access to top-tier technical resources like GeeksforGeeks and Programiz for deep-dive reading.

### ✍️ High-Rigor Mastery Assessments
Scholarium doesn't just show you content; it ensures you've mastered it.
- **Perfect Score Requirement**: To master a module, you must achieve a **4/4 (100%) score** on a randomized MCQ quiz.
- **Anti-Memorization Engine**: Every "Retry" attempt triggers the AI to generate a **completely fresh set of questions**, preventing rote memorization and ensuring true understanding.
- **Visual Feedback**: Interactive green and red "glow" effects provide immediate, high-energy feedback on your performance.

### 🎨 Premium "Pro" Aesthetic
- **3D Glassmorphism**: A sleek, modern UI utilizing backdrop blurs and floating surfaces.
- **Lively Animations**: 3D tilt effects and smooth Framer Motion transitions that make the platform feel "alive" and interactive.
- **Responsive Design**: Optimized for a seamless experience across all devices.

## 🛠️ Technical Architecture

### Frontend
- **React 18 (Vite)**: For a blazing-fast SPA experience.
- **Framer Motion**: Powering the 3D animations and fluid UI transitions.
- **React Flow**: Orchestrating the interactive skill graphs.
- **Bootstrap 5 + Custom CSS**: Curated premium styling with glassmorphism tokens.

### Backend
- **Django REST Framework**: A robust API foundation handling logic and user state.
- **Gemini AI Engine**: Specialized prompt engineering for curriculum architecture and randomized assessment generation.
- **PostgreSQL**: Relational storage for user roadmaps, subtopics, and progress tracking.
- **MongoDB**: Handling LLM conversational logs and request caching for performance optimization.

## 🚦 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API Key (Google AI Studio)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saivivekduvva/Scholarium.git
   cd Scholarium
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   # Setup your .env file with DATABASE_URL, MONGO_URI, and GEMINI_API_KEY
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   # Setup .env with VITE_API_URL
   npm run dev
   ```

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by the Scholarium Team.
