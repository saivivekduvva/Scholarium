# Scholarium Technical Audit Report

## 1. Tech Stack & Tooling

### Backend
*   **Django (4.2.30)**: The core web framework used for API routing, ORM, and application logic.
*   **Django REST Framework (3.17.1)**: Used for building the RESTful API endpoints.
*   **SimpleJWT (5.5.1)**: Handles JWT-based authentication, including token rotation and blacklisting.
*   **Psycopg (Binary)**: PostgreSQL adapter for database connectivity.
*   **dj-database-url (3.1.2)**: Used to parse the `DATABASE_URL` environment variable for flexible database configuration.
*   **WhiteNoise (6.12.0)**: Manages static file serving in production environments.
*   **PyMongo (4.16.0)**: Client for interacting with MongoDB, used for logging and telemetry.
*   **Google Generative AI (0.8.6)**: The primary LLM provider for roadmap generation and assessment.
*   **Anthropic**: Secondary LLM provider used as a fallback for high-reliability AI tasks.
*   **Gunicorn (25.3.0)**: Production-grade WSGI HTTP server.

### Frontend
*   **React (18.2.0)**: Core UI library.
*   **Vite (5.2.0)**: Modern build tool and development server.
*   **React Router DOM (6.22.3)**: Handles client-side routing.
*   **Axios (1.6.8)**: HTTP client for API communication.
*   **@xyflow/react (12.0.0)**: Used for rendering the interactive skill nodes and DAG (Directed Acyclic Graph) visualizations.
*   **Framer Motion (11.0.24)**: Handles complex UI animations and transitions.
*   **Bootstrap (5.3.3)**: Used for basic layout utilities and responsive grids.
*   **React Icons (5.0.1)**: Consistent iconography system.
*   **Recharts (2.12.3)**: Used for visualizing learning progress and quiz analytics.

---

## 2. Project Structure & Architecture

### Directory Tree
```text
Scholarium/
├── backend/                # Django Application
│   ├── agent/             # Core logic for AI roadmap & assessment
│   ├── scholarium_project/# Project configuration (settings, root urls)
│   ├── users/             # Authentication & user profile logic
│   ├── manage.py          # Django management script
│   └── requirements.txt   # Backend dependencies
└── frontend/               # Vite/React Application
    ├── public/            # Static assets
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── context/       # State management (Auth, Theme)
    │   ├── pages/         # Page-level components
    │   ├── services/      # API abstraction layer
    │   └── App.jsx        # Root component & routing
    └── package.json       # Frontend dependencies
```

### Architectural Pattern
*   **Pattern**: Monolithic Backend with a Decoupled Frontend (SPA).
*   **Backend Strategy**: Layered architecture within Django apps:
    *   **Models**: PostgreSQL for relational data (users, goals, subtopics).
    *   **Views**: API views handling request/response logic.
    *   **Agent Engine**: Service layer for complex AI interactions.
    *   **Mongo Client**: Logging/Telemetry layer for NoSQL storage of AI interactions.
*   **Frontend Strategy**: Component-based architecture with Centralized Context for Auth and Theme management.

---

## 3. All API Calls

### Internal API (Frontend → Backend)
All calls use `Bearer <JWT>` authentication in the `Authorization` header.

| Method | Endpoint | Triggering Component | Payload/Response |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login/` | `LoginPage.jsx` | `{username, password}` → `{access, refresh}` |
| **POST** | `/api/auth/register/` | `RegisterPage.jsx` | `{username, password, email, name}` → `{access, refresh}` |
| **GET** | `/api/auth/profile/` | `AuthContext.jsx` | `null` → `{id, username, email, name}` |
| **POST** | `/api/goals/` | `GoalInput.jsx` | `{title, description}` → `{goal, graph, is_duplicate}` |
| **GET** | `/api/goals/` | `Roadmaps.jsx` | `null` → `[Goal objects]` |
| **DELETE** | `/api/goals/<id>/` | `Roadmaps.jsx` | `null` → `204 No Content` |
| **GET** | `/api/goals/<id>/graph/` | `GraphView.jsx` | `null` → `{nodes, edges}` |
| **POST** | `/api/skills/<id>/expand/` | `NodeDetail.jsx` | `{skill_name, force_refresh}` → `{subtopics: []}` |
| **POST** | `/api/subtopic/complete/` | `SubtopicDetail.jsx` | `{skill_name, subtopic_title, goal_id}` → `{status: "success"}` |
| **POST** | `/api/quiz/start/` | `RoadmapQuiz.jsx` | `{goal_id}` → `{session_id, questions: []}` |
| **POST** | `/api/quiz/submit/<id>/` | `RoadmapQuiz.jsx` | `{answers: [indices]}` → `{result, analytics}` |

### External AI calls (Backend → Provider)
*   **Provider**: Google (Gemini 1.5 Flash) / Anthropic (Claude 3 Sonnet).
*   **Payload**: System instructions + user prompt + optional JSON Schema.
*   **Response**: Structured JSON or raw Markdown explanation.

---

## 4. Frontend Architecture & Flow
*   **Entry Point**: `main.jsx` → `App.jsx`.
*   **Routing**: Defined in `App.jsx` using `react-router-dom`. Protected routes are wrapped in a `ProtectedRoute` component.
*   **State Management**:
    *   **AuthContext**: Manages user session, login/logout, and token storage in `localStorage`.
    *   **ThemeContext**: Manages UI themes (`light`, `midnight`, `forest`, `ocean`).
*   **Communication**: Centralized in `services/api.js` using an Axios instance with request/response interceptors for JWT injection and 401 handling.
*   **UI System**: Custom "Akademia" design system defined in `index.css` using CSS variables and utility classes.

---

## 5. Backend Architecture & Internal Flow
*   **Entry Point**: `manage.py` (Dev) / `scholarium_project/wsgi.py` (Prod).
*   **Middleware Stack**:
    1.  `CorsMiddleware`
    2.  `SecurityMiddleware`
    3.  `WhiteNoiseMiddleware` (Static files)
    4.  `SessionMiddleware`
    5.  `AuthenticationMiddleware` (JWT check)
*   **Service Layer**: The `agent/agent_engine.py` acts as the domain layer, abstracting LLM prompt construction, JSON parsing, and graph layout logic from the views.
*   **Database Interaction**: Standard Django ORM for PostgreSQL. MongoDB is accessed via a custom `MongoBrain` class for high-volume logging.

---

## 6. Database & Data Layer
### PostgreSQL (Relational)
*   **User**: `AbstractUser` extension with `avatar_url` and `is_email_verified`.
*   **Goal**: Stores high-level learning objectives and their status.
*   **SkillNode**: Individual nodes in the learning graph.
*   **Subtopic**: Detailed learning units within a node (contains AI-generated explanations).
*   **QuizSession/Analytics**: Stores performance data and gap analysis results.

### MongoDB (NoSQL)
*   **Collections**:
    *   `ai_conversations`: Logs raw message exchanges.
    *   `skill_graphs`: Versioned snapshots of generated graphs.
    *   `llm_cache`: MD5-hashed prompt-response pairs for cost/latency optimization.
    *   `llm_telemetry`: Token usage tracking for Gemini/Claude.

---

## 7. AI / LLM Logic
*   **Prompt Assembly**:
    *   **Roadmap**: Uses a "Curriculum Architect" persona. Injects the user's goal and requests a React Flow compatible JSON.
    *   **Explanation**: Uses a "Technical Educator" persona. strictly limits output to <350 words with Markdown formatting.
    *   **Assessment**: Employs "Binary Scoring" (100/0) for MCQs to ensure objective mastery tracking.
*   **Parsing**: The `parse_json_response` utility in `agent/utils.py` uses robust regex/index finding to extract JSON from potentially conversational AI outputs.
*   **Streaming**: Currently, the system uses blocking requests (not streaming) to ensure JSON integrity before processing.

---

## 8. Authentication & Authorization
*   **Flow**:
    1.  User posts credentials to `/api/auth/login/`.
    2.  Backend validates and returns `access` (15m) and `refresh` (7d) tokens.
    3.  Frontend stores tokens in `localStorage`.
    4.  Subsequent requests include `Bearer <access>` in headers.
    5.  Intercepted 401s trigger automatic redirection to `/login`.
*   **Access Control**: Django's `IsAuthenticated` permission class protects all non-public API endpoints.

---

## 9. Request Lifecycle: Goal Creation
1.  **User Action**: User types "Learn Rust" in `GoalInput.jsx` and clicks "Map My Skills".
2.  **Frontend**: `api.createGoal` sends a POST request.
3.  **Backend (View)**: `create_goal` receives request.
    *   Calls `find_similar_goal_ai` to check for duplicates in the title.
    *   If new, calls `generate_roadmap(title)`.
4.  **AI Engine**: `call_llm` sends prompt to Gemini. Gemini returns a JSON list of skills and a graph layout.
5.  **Persistence**: 
    *   Goal and SkillNodes are saved to PostgreSQL.
    *   The full `graph_json` is saved to MongoDB (`skill_graphs`).
6.  **Response**: JSON containing the new `goal.id` and `graph` data is sent back.
7.  **Frontend Update**: Router navigates to `/graph/:id`. `GraphView.jsx` renders the nodes using `@xyflow/react`.

---

## 10. Environment & Configuration
*   **VITE_API_URL**: Frontend base URL for API requests.
*   **SECRET_KEY**: Django session/token signing.
*   **DATABASE_URL**: PostgreSQL connection string.
*   **MONGO_URI**: MongoDB connection string.
*   **GEMINI_API_KEY / ANTHROPIC_API_KEY**: Provider credentials.
*   **LLM_PROVIDER**: Toggles between `gemini` and `claude`.

---

## 11. Error Handling & Logging
*   **Frontend**: Global `ErrorPage.jsx` and Axios interceptors for 401/404 handling.
*   **Backend**: 
    *   `RateLimitError` custom exception for AI quota exhaustion (429 status).
    *   `logging.error` used in all views to capture tracebacks in the server console.
    *   `mongo_brain.telemetry` logs every AI call for auditing.

---

## 12. Known Gaps & TODOs
*   **Security**: `SECURE_SSL_REDIRECT` and other production headers are conditionally enabled based on `DEBUG`.
*   **Logic Stubs**: "XP Awarding" logic was noted as a placeholder (line 408 in `agent/views.py`).
*   **Incomplete Areas**: The "How To Use" page is currently static.
*   **Optimization**: Roadmaps are generated synchronously; for very large goals, this might timeout on some platforms (handled currently via 120s Gunicorn timeout).

---
**Audit Complete.** The system is structurally sound, leveraging a robust hybrid database strategy and a clear separation between generative logic and application state.
