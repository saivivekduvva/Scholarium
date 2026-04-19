# Scholarium MVP Implementation Plan

This document outlines the step-by-step technical plan to build "Scholarium", an Autonomous Skill Acquisition Agent MVP. The application consists of a Django-based backend utilizing MySQL for relational data, MongoDB for unstructured AI logs, and an LLM orchestration layer (Claude/Gemini). The frontend is a highly interactive, animated React application built with Vite, utilizing React Flow for the core skill node graph experience.

## User Review Required
> [!IMPORTANT]
> The setup process requires you (the user) to have MySQL and MongoDB running locally. You will need to manually execute the provided MySQL setup commands to create the database (`scholarium_db`) and user (`scholarium_user`) before we can run the Django migrations.

> [!NOTE]
> The plan strictly adheres to the provided constraints:
> - Naming and branding: "Scholarium"
> - AI Providers: Claude (`claude-sonnet-4-20250514`) and Gemini (`gemini-1.5-pro`) only.
> - Styling: Framer Motion for animations, custom light theme CSS variables, React Flow for the visual graph.

## Open Questions
- Since the backend relies heavily on `claude-sonnet-4-20250514` and `gemini-1.5-pro`, I will set up the API abstraction to handle robust JSON parsing. Are there any specific fallback behaviors you'd like if both APIs fail or timeout, other than raising a standard HTTP 500 error?

## Proposed Changes

### 1. Root Project Setup
Creating the fundamental scripts and requirements.
#### [NEW] `scholarium/setup.sh`
#### [NEW] `scholarium/requirements.txt`
#### [NEW] `scholarium/README.md`

---

### 2. Backend Environment & Configuration
Setting up the Django project, apps, and environment variables.
#### [NEW] `scholarium/backend/manage.py` (Generated via django-admin)
#### [NEW] `scholarium/backend/.env` & `scholarium/backend/.env.example`
#### [NEW] `scholarium/backend/scholarium_project/settings.py` (MySQL, CORS, installed apps)
#### [NEW] `scholarium/backend/scholarium_project/urls.py`

---

### 3. Backend Apps & Database (MySQL + MongoDB)
Implementing the database schema and AI orchestration logic.
#### [NEW] `scholarium/backend/users/models.py` (User model)
#### [NEW] `scholarium/backend/agent/models.py` (Goal, SkillNode, LearningPath, Session, Checkpoint)
#### [NEW] `scholarium/backend/agent/mongo_client.py` (MongoDB connection setup)
#### [NEW] `scholarium/backend/agent/agent_engine.py` (LLM integration with Claude/Gemini)

---

### 4. Backend Endpoints (DRF)
Implementing the REST APIs for the frontend to consume.
#### [NEW] `scholarium/backend/agent/serializers.py`
#### [NEW] `scholarium/backend/agent/views.py` (Endpoints for goals, graph, sessions, evaluations, etc.)
#### [NEW] `scholarium/backend/agent/urls.py`

---

### 5. Frontend Initialization & Core Config
Scaffolding the Vite-React application.
#### [NEW] `scholarium/frontend/package.json` (Dependencies: framer-motion, @xyflow/react, etc.)
#### [NEW] `scholarium/frontend/src/index.css` (Design system, CSS variables)
#### [NEW] `scholarium/frontend/src/App.jsx` & `main.jsx` (Routing setup)
#### [NEW] `scholarium/frontend/src/services/api.js` (Axios configuration)

---

### 6. Frontend Pages & Components
Building the interactive, animated UI.
#### [NEW] `scholarium/frontend/src/pages/Dashboard.jsx`
#### [NEW] `scholarium/frontend/src/pages/GraphView.jsx`
#### [NEW] `scholarium/frontend/src/pages/Session.jsx`
#### [NEW] `scholarium/frontend/src/pages/Profile.jsx`
#### [NEW] `scholarium/frontend/src/components/GoalInput.jsx`
#### [NEW] `scholarium/frontend/src/components/SkillGraph.jsx`
#### [NEW] `scholarium/frontend/src/components/NodeDetail.jsx`
#### [NEW] `scholarium/frontend/src/components/PracticeCard.jsx`
#### [NEW] `scholarium/frontend/src/components/FeedbackPanel.jsx`
#### [NEW] `scholarium/frontend/src/components/ProgressRing.jsx`

## Verification Plan

### Automated/Code Verification
1. **Lint/Build**: Ensure the React frontend builds successfully without syntax errors (`npm run build`).
2. **Backend Migrations**: Validate that Django models compile and `makemigrations` creates the expected files successfully (I'll run a dry-run or actual migration if the DB is running).

### Manual Verification
1. Review the `setup.sh` to ensure it follows the structure exactly.
2. Confirm the presence of Framer Motion and React Flow components in the generated code.
3. Once running, the user can execute `setup.sh`, set up MySQL/MongoDB, start the backend server, and test the `/` route to enter a goal, interacting with the AI agent and the dynamic skill graph.
