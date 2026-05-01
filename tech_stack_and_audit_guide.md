# Scholarium: Tech Stack & Data Audit Guide

This document provides a comprehensive overview of the technologies powering the Scholarium platform and instructions for auditing user data in the production environment.

---

## 🚀 1. Deployed Tech Stack

Scholarium uses a modern **Client-Server Monolith** architecture with a dual-database strategy for relational state and AI telemetry.

### Frontend (SPA)
*   **Framework**: **React (v18.2.0)**
*   **Build Tool**: **Vite** (Optimized for fast HMR and production builds)
*   **Routing**: **react-router-dom** (Protected routes and navigation)
*   **Styling**: **Bootstrap 5** + **Vanilla CSS**
*   **Animations**: **Framer Motion** (Used for page transitions and micro-interactions)
*   **Graph Engine**: **@xyflow/react** (React Flow) – Renders the curriculum Directed Acyclic Graph (DAG)
*   **API Client**: **Axios** (With interceptors for JWT injection and auto-logout)

### Backend (REST API)
*   **Framework**: **Django (v4.2.30)**
*   **API Engine**: **Django REST Framework (DRF)**
*   **Authentication**: **SimpleJWT** (Access and Refresh token lifecycle)
*   **Middleware**: **WhiteNoise** (Static file serving) + **CORS Headers**
*   **WSGI Server**: **Gunicorn**

### AI & Intelligence
*   **Primary LLM**: **Google Gemini 1.5 Flash** (`gemini-3-flash-preview`)
*   **Fallback LLM**: **Anthropic Claude 3 Sonnet**
*   **Logic Layer**: `backend/agent/agent_engine.py` (Prompt engineering and JSON schema enforcement)

### Data Layer
*   **Primary Database**: **PostgreSQL** (Relational state: Users, Goals, Nodes, Sessions)
*   **Telemetry Database**: **MongoDB** (NoSQL logs: AI conversations, evaluations, prompt caching)

### Deployment & Infrastructure
*   **Frontend Hosting**: **Vercel**
*   **Backend Hosting**: **Render**
*   **Asset Management**: **Cloudinary** (Proposed for user avatars)

---

## 🔍 2. Data Audit & User Monitoring

To monitor system health and audit user activity, you can access the data through the following channels:

### A. Django Admin Interface (Primary Audit Tool)
This is the most direct way to manage users and inspect learning progress.
*   **Access**: `[your-backend-url]/admin/`
*   **Login**: Use a Superuser account.
*   **Key Audit Areas**:
    *   `Users`: Check registration dates, emails, and names.
    *   `Goals`: View every learning path generated. You can see which goals are "Active" vs "Completed".
    *   `Sessions`: Inspect quiz attempts. You can see the raw scores and when users are taking assessments.
    *   `Checkpoints`: Audit the global "Mastery" levels of users across different skills.

### B. MongoDB Logs (AI Telemetry)
For auditing the "Brain" of the application and understanding AI quality.
*   **Tool**: MongoDB Compass or Atlas Web Console.
*   **Database**: `scholarium_logs`
*   **Key Collections**:
    *   `raw_evaluations`: View the exact user answers and the AI's grading reasoning (strengths/gaps).
    *   `ai_conversations`: Full history of system/user message exchanges.
    *   `llm_cache`: Audit how many requests are being saved by the caching layer.

### C. PostgreSQL Direct Access
For high-level data analysis or bulk exports.
*   **Tool**: pgAdmin or `psql` CLI.
*   **Connection**: Use the "External Connection String" from your Render Dashboard.
*   **Tables to Watch**:
    *   `users_user`: Core identity data.
    *   `agent_goal`: The roadmap repository.
    *   `agent_skillnode`: Progress at the individual skill level.

---

## 🛠️ 3. Maintenance Commands

If you are working locally and need to perform audits or resets:

| Action | Command |
| :--- | :--- |
| **Create Admin User** | `python manage.py createsuperuser` |
| **Reset Graph Data** | `python manage.py flush` (Warning: Deletes all data) |
| **Check AI Quota** | Review logs in `backend/agent/llm_service.py` |
| **Manual DB Shell** | `python manage.py dbshell` |

---
*Last Updated: 2026-05-02*
