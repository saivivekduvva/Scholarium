# Scholarium Technical Audit Report

## 1. Tech Stack & Tooling

### Frontend
- **React (v18.2.0)**: Core UI library for building the Single Page Application.
- **Vite (v5.2.0)**: Build tool and development server, chosen for fast HMR and optimized bundling.
- **react-router-dom (v6.22.3)**: Handles client-side routing and protected routes navigation.
- **axios (v1.6.8)**: Promise-based HTTP client used in `api.js` for intercepting and making requests to the Django backend.
- **bootstrap (v5.3.3)**: CSS framework used for utility classes and layout (grid system, flexbox helpers).
- **framer-motion (v11.0.24)**: Animation library used extensively for page transitions, micro-interactions, and component entrance animations.
- **@xyflow/react (v12.0.0)**: Node-based graph library used specifically in `SkillGraph.jsx` to render the AI-generated curriculum as an interactive Directed Acyclic Graph (DAG).
- **dagre (v0.8.5)**: Directed graph layout engine used to automatically position the nodes in `@xyflow/react`.
- **react-icons (v5.0.1)**: Iconography (specifically Ionicons `Io5` subset) used throughout the UI.
- **react-markdown (v10.1.0) & turndown (v7.2.4)**: Used to render AI-generated markdown explanations into HTML within the learning modules.
- **recharts (v2.12.3)**: Installed for potential chart rendering (usage may be limited).
- **eslint (v8.57.0)**: Development dependency for code linting.

### Backend
- **Django (v4.2.30)**: Core web framework handling routing, ORM, and request lifecycle.
- **djangorestframework (v3.17.1)**: Provides abstractions to build the JSON API endpoints (`@api_view`, `APIView`, Serializers).
- **djangorestframework-simplejwt (v5.5.1)**: Implements JSON Web Token authentication (access and refresh tokens).
- **django-cors-headers (v4.9.0)**: Middleware to handle Cross-Origin Resource Sharing, allowing the Vite frontend to communicate with Django.
- **psycopg[binary]**: PostgreSQL adapter used by Django ORM.
- **pymongo (v4.16.0)**: Python MongoDB driver. Used independently of Django ORM for high-volume unstructured logging (AI conversations, raw LLM responses, prompt caching).
- **dj-database-url (v3.1.2)**: Utility to parse `DATABASE_URL` environment variables into Django's `DATABASES` dictionary.
- **whitenoise (v6.12.0)**: Middleware to serve static files efficiently directly from Gunicorn in production.
- **gunicorn (v25.3.0)**: Production WSGI HTTP Server.

### AI / ML
- **google-generativeai (v0.8.6)**: Google Gemini SDK used as the primary LLM provider (`gemini-3-flash-preview`).
- **anthropic**: Claude SDK used as a fallback LLM provider (`claude-3-sonnet-20240229`).

### Database
- **PostgreSQL**: Primary relational database handling relational integrity for Users, Goals, Nodes, Sessions, and Checkpoints.
- **MongoDB**: Secondary NoSQL database serving as the "AI Brain" (`mongo_brain`) for caching prompts, logging evaluations, and tracking conversations without schema constraints.

### Infrastructure & Other
- **python-dotenv (v1.2.2)**: Loads environment variables from `.env` files into `os.environ`.
- **requests (v2.33.1)**: HTTP library (potential usage for external fetching, though AI uses SDKs).
- **cryptography / PyJWT**: Underlying libraries for JWT operations.

---

## 2. Project Structure & Architecture

### Directory Tree
```text
Scholarium/
├── backend/
│   ├── agent/                 # Core domain: AI, Goals, Learning Paths
│   │   ├── migrations/
│   │   ├── agent_engine.py    # AI logic execution (Prompt building, JSON parsing)
│   │   ├── llm_service.py     # AI Provider abstraction (Gemini, Claude, Retries)
│   │   ├── models.py          # PostgreSQL schemas (Goal, SkillNode, Session, etc.)
│   │   ├── mongo_client.py    # MongoDB connection and collection properties
│   │   ├── serializers.py     # DRF Serializers
│   │   ├── signals.py         # Django signals for cascading deletes in MongoDB
│   │   ├── urls.py            # Route definitions for /api/
│   │   ├── utils.py           # Helpers (JSON parsing, DB logging)
│   │   └── views.py           # HTTP handlers / API controllers
│   ├── scholarium_project/    # Django Project Configuration
│   │   ├── settings.py        # Settings, middleware, database config
│   │   ├── urls.py            # Root URL router
│   │   └── wsgi.py            # WSGI entrypoint
│   ├── users/                 # Authentication & User Management Domain
│   │   ├── migrations/
│   │   ├── models.py          # Custom User model
│   │   ├── serializers.py     # Register and Profile serializers
│   │   ├── urls.py            # Route definitions for /api/auth/
│   │   └── views.py           # Auth HTTP handlers (Register, Profile, Delete)
│   ├── manage.py              # Django CLI
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/        # Reusable UI (SkillGraph, NodeDetail, AssessmentComponent)
    │   ├── context/           # React Context (AuthContext.jsx)
    │   ├── pages/             # Route-level views (Dashboard, GraphView, SubtopicDetail)
    │   ├── services/          # API abstraction (api.js, resourceService.js)
    │   ├── styles/            # Optional modular CSS
    │   ├── App.jsx            # Routing and Layout shell
    │   ├── index.css          # Global CSS variables and utility overrides
    │   └── main.jsx           # React DOM render entry
    ├── package.json
    └── vite.config.js
```

### Architectural Pattern
- **Macro-Architecture**: Client-Server Monolith. A React Single Page Application (Client) communicating via REST JSON API to a Django Monolith (Server).
- **Backend Architecture**: Layered Architecture.
  - **Presentation Layer**: `views.py` (DRF APIViews and @api_view decorators).
  - **Service/Domain Layer**: `agent_engine.py` (business logic for curricula) and `llm_service.py` (abstracts external AI APIs).
  - **Data Access Layer**: Django ORM (`models.py`) + PyMongo (`mongo_client.py`).
- **Separation of Concerns**: Strict boundary between relational data (`PostgreSQL` for state, auth, progression) and telemetry/caching data (`MongoDB` for raw AI inputs/outputs). Strict separation between Auth domain (`users`) and Learning domain (`agent`).

---

## 3. All API Calls — Every Single One

### Internal REST API (Frontend → Backend)

**Auth Domain**
1. **Login**
   - Method/Path: `POST /api/auth/login/`
   - Initiator: `frontend/src/services/api.js` (`login`) -> `LoginPage.jsx` / `AuthContext.jsx`
   - Payload: `{ username: str, password: str }`
   - Response: `{ access: str, refresh: str }`
   - Auth: None
   - Error Handling: Standard DRF 401 response.
2. **Register**
   - Method/Path: `POST /api/auth/register/`
   - Initiator: `api.js` (`register`) -> `RegisterPage.jsx`
   - Payload: `{ username: str, email: str, password: str, name: str }`
   - Response: `{ id: int, username: str, email: str, name: str }`
   - Auth: None
3. **Delete Account**
   - Method/Path: `DELETE /api/auth/delete-account/`
   - Initiator: `api.js` (`deleteAccount`) -> `Settings.jsx`
   - Payload: None
   - Response: `204 No Content`
   - Auth: JWT Bearer
4. **Get Profile**
   - Method/Path: `GET /api/auth/profile/`
   - Initiator: `api.js` (`getProfile`) -> `AuthContext.jsx`
   - Payload: None
   - Response: User object
   - Auth: JWT Bearer

**Agent Domain**
5. **Create Goal**
   - Method/Path: `POST /api/goals/`
   - Initiator: `api.js` (`createGoal`) -> `GoalInput.jsx`
   - Payload: `{ title: str, description: str, user_id: int }` *(Note: `user_id` is passed but ignored by backend in favor of `request.user`)*
   - Response: `{ status: str, goal: { id, title... }, is_duplicate: bool }`
   - Auth: JWT Bearer
   - Error Handling: Catches AI_QUOTA_EXHAUSTED (429) and general 500s.
6. **Get Goals**
   - Method/Path: `GET /api/goals/`
   - Initiator: `api.js` (`getGoals`) -> `Dashboard.jsx`, `Roadmaps.jsx`, `GoalCompletionPage.jsx`
   - Payload: None
   - Response: Array of Goal objects.
   - Auth: JWT Bearer
7. **Delete Goal**
   - Method/Path: `DELETE /api/goals/<int:id>/`
   - Initiator: `api.js` (`deleteGoal`) -> `Roadmaps.jsx`, `Dashboard.jsx`
   - Payload: None
   - Response: `{ status: 'deleted' }`
   - Auth: JWT Bearer
8. **Get Graph**
   - Method/Path: `GET /api/goals/<int:id>/graph/`
   - Initiator: `api.js` (`getGraph`) -> `GraphView.jsx`
   - Payload: None
   - Response: `{ nodes: [...], edges: [...] }`
   - Auth: JWT Bearer
   - Flow: If no nodes exist in DB, triggers `generate_roadmap` AI call synchronously, populates DB, then returns.
9. **Expand Skill**
   - Method/Path: `POST /api/skills/<int:id>/expand/`
   - Initiator: `api.js` (`expandSkill`) -> `NodeDetail.jsx`
   - Payload: `{ skill_name: str, force_refresh: bool }`
   - Response: `{ subtopics: [...] }`
   - Auth: JWT Bearer
   - Flow: Synchronously triggers `expand_subtopics` AI call if subtopics don't exist in DB or if forced.
10. **Toggle Subtopic**
    - Method/Path: `POST /api/subtopics/<int:id>/toggle/`
    - Initiator: `api.js` (`toggleSubtopic`) -> `NodeDetail.jsx`
    - Payload: None
    - Response: `{ status: str, is_studied: bool, xp_earned: int }`
    - Auth: JWT Bearer
11. **Get Progress**
    - Method/Path: `GET /api/progress/<int:user_id>/`
    - Initiator: `api.js` (`getProgress`) -> `GraphView.jsx`
    - Payload: None
    - Response: `{ sessions: [...], checkpoints: [...] }`
    - Auth: JWT Bearer (Backend ignores `user_id` param and uses `request.user`).
12. **Start Session (Assessment)**
    - Method/Path: `POST /api/session/start/`
    - Initiator: `api.js` (`startSession`) -> `AssessmentComponent.jsx`
    - Payload: `{ skill_name: str, subtopic_title: str, difficulty: str, goal_id: int }`
    - Response: `{ session_id: int, practice: { questions: [...] } }`
    - Auth: JWT Bearer
    - Flow: Creates DB Session, triggers `generate_practice` AI call synchronously.
13. **Evaluate Session Answer**
    - Method/Path: `POST /api/session/evaluate/<int:id>/`
    - Initiator: `api.js` (`evaluateAnswer`) -> `AssessmentComponent.jsx`
    - Payload: `{ question: str, answer: str }`
    - Response: `{ score: int, verdict: str, strengths: [], gaps: [], next_step: str }`
    - Auth: JWT Bearer
    - Flow: Triggers `evaluate_answer` AI call, updates Checkpoint proficiency.
14. **Get Subtopic Explanation**
    - Method/Path: `POST /api/subtopics/explanation/`
    - Initiator: `api.js` (`getExplanation`) -> `SubtopicDetail.jsx`
    - Payload: `{ skill_name: str, subtopic_title: str, goal_id: int }`
    - Response: `{ content: str }`
    - Auth: JWT Bearer
    - Flow: Triggers `get_subtopic_explanation` AI call synchronously.
15. **Mark Subtopic Mastered**
    - Method/Path: `POST /api/subtopic/complete/`
    - Initiator: `api.js` (`markSubtopicMastered`) -> `AssessmentComponent.jsx`
    - Payload: `{ skill_name: str, subtopic_title: str, goal_id: int }`
    - Response: `{ status: str, xp_earned: int }`
    - Auth: JWT Bearer
    - Flow: Sets `is_studied=True`, checks if all subtopics in node are done, updates Checkpoint to 100 proficiency, updates Goal status if all nodes done.
16. **Get User Stats**
    - Method/Path: `GET /api/user-stats/`
    - Initiator: `api.js` (`getUserStats`) -> `Profile.jsx`
    - Payload: None
    - Response: `{ total_goals: int, completed_goals: int, total_quizzes: int, total_mastery_points: int }`
    - Auth: JWT Bearer

### External / AI API Calls (Backend → Third-Party)
All AI calls are routed through `backend/agent/llm_service.py` (`call_llm` function).
1. **Google Gemini API**
   - Function: `genai.GenerativeModel('gemini-3-flash-preview').generate_content()`
   - Configuration: Custom safety thresholds (`BLOCK_NONE`), optional `response_mime_type: "application/json"`.
   - Error Handling: Implements an exponential backoff retry loop (3 attempts) and catches `429/quota` strings to raise a custom `RateLimitError`.
2. **Anthropic Claude API** (Fallback / Configurable Provider)
   - Function: `anthropic_client.messages.create(model="claude-3-sonnet-20240229")`
   - Configuration: `max_tokens=2048`.

---

## 4. Frontend Architecture & Flow

### Entry & Routing
- **Entry**: `main.jsx` renders `<App />` inside strict mode.
- **Routing**: `react-router-dom` in `App.jsx`.
  - **Public**: `/login`, `/register`, `/about`, `/contact`, `/how-to-use`, `/error`.
  - **Protected (Wrapped in `<ProtectedRoute>`)**: `/`, `/roadmaps`, `/graph/:goalId`, `/subtopic/:goalId/:skillName/:subtopicTitle`, `/profile`, `/settings`, `/goal-completed/:goalId`.
  - `ProtectedRoute` component checks AuthContext `user` state and redirects to `/login` if null.

### State Management
- **Auth State**: Global via `AuthContext.jsx`. Maintains `user` object and handles token lifecycle in `localStorage`.
- **Local UI State**: `useState` heavily used in components for loading spinners, form inputs, and modal visibility.
- **Data Fetching/Caching**: No global data store (like Redux/React Query). Axios calls are made inside `useEffect` blocks. Simple manual caching exists in `NodeDetail.jsx` (`subtopicsCache` object outside component scope) to prevent redundant API calls when opening/closing node modals.

### Communication Flow
- `frontend/src/services/api.js` is the central Axios instance.
- **Interceptors**: 
  - Request: Injects `Authorization: Bearer <token>` from localStorage.
  - Response: Catches `401 Unauthorized` responses globally, wipes localStorage (`access_token`, `refresh_token`, `username`), and forces a `window.location.href = '/login'`.

### Component Hierarchy
- `App` (Router)
  - `Navigation` (Responsive Topbar / Drawer Sidebar)
  - `Routes`
    - `GraphView` (Page)
      - `SkillGraph` (Uses `@xyflow/react` to render DAG)
      - `NodeDetail` (Modal overlay for subtopics)
    - `SubtopicDetail` (Page)
      - `ResourceSidebar` (Contextual links)
      - `AssessmentComponent` (Interactive quiz state machine)

---

## 5. Backend Architecture & Internal Flow

### Request Lifecycle Setup
- **Entry**: `scholarium_project/wsgi.py` (Production) / `manage.py runserver` (Local).
- **Middleware Order**:
  1. `CorsMiddleware` (django-cors-headers)
  2. `SecurityMiddleware`
  3. `WhiteNoiseMiddleware` (Static file serving)
  4. `SessionMiddleware`
  5. `CommonMiddleware`
  6. `CsrfViewMiddleware`
  7. `AuthenticationMiddleware` (Django auth)
  8. `MessageMiddleware`
  9. `XFrameOptionsMiddleware`
- **Throttling**: DRF throttling configured globally in `settings.py` (Anon: 100/day, User: 1000/day).

### Service Layer & AI Integration
- `agent_engine.py` contains isolated domain logic functions. It constructs specific System/User prompt strings (often defining explicit JSON schemas) and calls `llm_service.py`.
- `utils.py` contains `parse_json_response`, a robust string parser that strips markdown blockticks (````json ... ````) and handles fragmented text to safely load JSON.

### Database Interaction
- **Primary Data**: Django ORM. Standard patterns like `Model.objects.create()`, `filter()`, `get_object_or_404()`.
- **Telemetry Data**: Direct PyMongo calls (`mongo_brain.evaluations.insert_one()`) execute synchronously alongside ORM calls.
- **Signals**: `backend/agent/signals.py` uses `pre_delete` signals on `Goal` and `Session` ORM models to automatically trigger PyMongo `delete_many()` operations, keeping PostgreSQL and MongoDB in sync when records are deleted.

---

## 6. Database & Data Layer

### PostgreSQL Schema (Django ORM)
1. **User** (`users_user`): Custom model inheriting from `AbstractUser`. Adds `name`, `avatar_url`, `created_at`.
2. **Goal** (`agent_goal`): 
   - Fields: `title`, `description`, `status` (draft/active/completed), `created_at`.
   - Relations: FK to `User`.
3. **SkillNode** (`agent_skillnode`):
   - Fields: `skill_name`, `description`, `x_pos`, `y_pos`, `status` (locked/active/done), `estimated_hours`.
   - Relations: FK to `Goal`. Represents a node in the DAG.
4. **Subtopic** (`agent_subtopic`):
   - Fields: `title`, `description`, `duration_mins`, `is_studied` (Boolean), `explanation`, `created_at`.
   - Relations: FK to `SkillNode`. Represents atomic learning modules.
5. **Session** (`agent_session`):
   - Fields: `score`, `status` (ongoing/completed), `created_at`, `completed_at`.
   - Relations: FK to `User`, FK to `SkillNode`. Represents a quiz attempt.
6. **Checkpoint** (`agent_checkpoint`):
   - Fields: `skill_name`, `proficiency` (int 0-100), `last_assessed`.
   - Relations: FK to `User`. Tracks global skill mastery bridging across goals.

### MongoDB Schema (PyMongo)
Database: `scholarium_logs`
Collections defined in `mongo_client.py`:
1. `ai_conversations`: Logs role/content message arrays (schema unstructured).
2. `skill_graphs`: Legacy/Backup storage for graph DAGs.
3. `raw_evaluations`: Stores raw LLM responses for answer evaluations. Fields: `session_id`, `skill`, `question`, `user_answer`, `llm_raw_response`.
4. `llm_cache`: Exact-match prompt caching. Fields: `prompt_hash` (MD5 of system+user), `system`, `user`, `response`, `created_at`.

---

## 7. AI / LLM Logic

### Centralized Execution
All LLM generation runs through `backend/agent/llm_service.py` -> `call_llm()`.
- **Caching**: The function MD5-hashes the `system + "\n" + user` prompt. If found in `mongo_brain.llm_cache`, it returns the cached string instantly, bypassing the API.
- **Failover**: If `provider == 'gemini'` fails (or hits 429), the code gracefully falls back to Anthropic Claude (if configured), and vice-versa.

### Prompt Scenarios
1. **Semantic Goal Matching** (`find_similar_goal`): Prevents duplicate graph generation by asking the LLM to compare a new title string against a JSON array of existing strings.
2. **Curriculum Generation** (`generate_roadmap`): Asks the LLM to output a DAG structure matching React Flow's exact node/edge schema.
3. **Module Breakdown** (`expand_subtopics`): Takes a node and breaks it into exactly 4-5 unique subtopics with `duration_mins`.
4. **Assessment Generation** (`generate_practice`): Uses `time.time()` as a `salt` parameter in the prompt to force completely fresh, non-cached questions every time a user hits "Start Assessment". Requests 5 multiple-choice questions in JSON.
5. **Answer Evaluation** (`evaluate_answer`): Grades textual user answers. Instructed strictly to use 100 (Correct), 50 (Partial), 0 (Wrong).
6. **Explanation Synthesis** (`get_subtopic_explanation`): Generates a concise (<350 words) Markdown lesson with reference links. Provided context of sibling subtopics to prevent overlap.

---

## 8. Authentication & Authorization

- **Strategy**: JSON Web Tokens (JWT).
- **Issuance**: `POST /api/auth/login/` utilizes DRF SimpleJWT's `TokenObtainPairView`. Returns `access` (15m expiry) and `refresh` (7d expiry) tokens.
- **Storage**: Frontend stores tokens in browser `localStorage`.
- **Transport**: Included in headers: `Authorization: Bearer <token>`.
- **Validation**: Backend middleware `JWTAuthentication` validates signature automatically via `SECRET_KEY`.
- **Protection**:
  - Backend: `@permission_classes([IsAuthenticated])` applied to almost all `agent` API views.
  - Frontend: `<ProtectedRoute>` wrapper components check local context state.

---

## 9. Full Request Lifecycle — End to End
**Scenario: Generating a New Learning Roadmap**

1. **User Interaction**: User types "Learn Kubernetes" in `GoalInput.jsx` and clicks submit.
2. **Frontend State**: Sets `loading = true`.
3. **API Call Construction**: `api.createGoal({ title: "Learn Kubernetes", description: "", user_id: 1 })` fires. Axios interceptor attaches JWT.
4. **Backend Route**: Request hits `agent/urls.py` -> `path('goals/', views.create_goal)`.
5. **Backend Handler (`create_goal`)**:
   - Parses `request.data`.
   - Queries DB for user's existing goals.
   - Calls `find_similar_goal_ai("Learn Kubernetes", [existing_titles])`.
   - If no semantic match, saves new `Goal` model to PostgreSQL.
   - Returns JSON with `goal.id`.
6. **Frontend State**: `createGoal` promise resolves. React navigates to `/graph/<goalId>`.
7. **Graph Initialization (`GraphView.jsx`)**:
   - Component mounts, `useEffect` triggers `api.getGraph(goalId)`.
8. **Backend Route**: Hits `views.get_graph`.
9. **Backend Processing (`get_graph`)**:
   - Looks for `SkillNode` objects tied to `goal_id`. Finds zero.
   - Triggers `agent_engine.generate_roadmap("Learn Kubernetes")`.
10. **AI Processing (`generate_roadmap`)**:
    - Constructs system/user prompt defining React Flow schema.
    - Calls `llm_service.call_llm()`.
    - `call_llm` hashes prompt, misses cache, calls `gemini_model.generate_content()`.
    - Gemini returns markdown-wrapped JSON string.
    - `utils.parse_json_response` strips blockticks and parses object.
11. **Database Saving**: `get_graph` loops over returned JSON, creates `SkillNode` objects in PostgreSQL, saving `x_pos`, `y_pos`, and edge prerequisites.
12. **Response**: Returns constructed `nodes` and `edges` arrays to frontend.
13. **Frontend Render**: `api.getGraph` resolves. `GraphView.jsx` sets `graphData` state. `@xyflow/react` renders the visual DAG pipeline on screen.

---

## 10. Environment & Configuration

**Backend (`.env`)**
- `SECRET_KEY`: Django cryptographic key.
- `DEBUG`: Controls Django verbose error pages and static file serving behavior.
- `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`: Security whitelists for domain headers.
- `DATABASE_URL`: Connection string for PostgreSQL (used by dj-database-url).
- `MONGO_URI`: Connection string for PyMongo.
- `GEMINI_API_KEY`: API key for Google Generative AI SDK.
- `ANTHROPIC_API_KEY`: API key for Claude SDK fallback.

**Frontend (`.env`)**
- `VITE_API_URL`: Points to the Django backend root (e.g., `http://localhost:8000/api/` or production domain). Evaluated at build time by Vite.

---

## 11. Error Handling & Logging

- **Frontend**: Primarily handled by generic `try/catch` blocks surrounding Axios calls, outputting `alert()` dialogues or rendering inline `error` state texts in JSX. Global 401 unauthenticated errors are trapped cleanly by an Axios interceptor to trigger a logout flow.
- **Backend**: Broad `try/catch` blocks in DRF Views catch `Exception as e`, logging via the `logging` module with `exc_info=True`, and returning HTTP 500s.
- **AI Fault Tolerance**: The `llm_service.py` is highly resilient. It implements exponential backoff retries, safety filter detection, quota detection (parsing specific substrings like "429"), and cross-provider fallbacks.
- **LLM Output Parsing**: The custom JSON parser in `utils.py` catches JSONDecodeError, cleans markdown formatting strings, and falls back gracefully.

---

## 12. Known Gaps, TODOs, or Incomplete Areas

1. **Ignored Frontend Arguments**: In `GoalInput.jsx`, the payload sends `user_id: 1` explicitly as a "// Mock user_id = 1 for MVP" comment. The backend securely ignores this and correctly uses `request.user` from the JWT token, but the frontend code is stale.
2. **Missing `json` import**: In `backend/agent/views.py`, the `json` module is occasionally required but may be missing from imports if certain AI debugging logic is activated (observed dynamically during refactoring).
3. **Hardcoded Assumptions**: `AssessmentComponent.jsx` expects exactly 5 questions from the AI, slicing `res.data.practice.questions.slice(0, 5)`. If the AI hallucinates and returns fewer than 5, the "5/5 required for mastery" logic mathematically breaks.
4. **Deprecation Warnings**: The `google.generativeai` SDK is throwing deprecation warnings indicating it should be replaced with the newer `google.genai` SDK.
5. **Dormant Logic**: The frontend references features like auto-sequencing which have been stripped. UI hints suggest features ("Share Achievement") with an `alert("Sharing feature coming soon!")` stub in `GoalCompletionPage.jsx`.
