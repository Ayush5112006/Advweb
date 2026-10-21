# Advanced Web Development - Student Portfolio & Practical Assignments

A state-of-the-art Student Portfolio built with **React**, **Vite**, and **Vanilla CSS**. This repository contains practical implementations demonstrating advanced frontend engineering concepts, design systems, and API integrations.

## 🚀 Features

- **Dynamic Navigation & Routes**: Includes pages for Home, About, Projects, Skills, and Contact built with `react-router-dom`.
- **Accent Theme Customizer**: Floating accent color switcher supporting dynamic theme propagation.
- **Dark/Light Mode**: Full responsive system toggle for accessibility and visual preference.
- **REST API Integration (Practical 3)**: Serves live repository data directly from the GitHub API.
- **AI Description Generation (Practical 13)**: OpenAI-powered "Generate Description" button; the API key is used exclusively by the Express backend.
- **Docker Setup**: Fully configured container setup for easy local deployment using multi-stage builds and Nginx.

---

## 📡 Practical 3: REST API Integration & Data Rendering

The **Projects** page consumes the public **GitHub API** dynamically to showcase repository details on load.

### 🔌 API Details
- **Endpoint Used**: `https://api.github.com/users/Ayush5112006/repos?sort=updated&per_page=10`
- **Method**: `GET`
- **Authentication**: None required (public API).

### 🛠️ State Management & UI Flows
The application handles asynchronous states gracefully to ensure a robust user experience:
1. **Loading State**: Displays a custom `<Spinner />` animation during the request lifecycle.
2. **Error Handling State**: If the network connection fails or the API threshold is reached, it displays an error feedback card with a **🔄 Retry Connection** button to safely refresh the query.
3. **Success / Render State**: Maps the array of fetched repositories, showcasing:
   - Repository Name
   - Project Description
   - Main Coding Language
   - ⭐ Star Count
   - Direct link (`html_url`) via a custom styled action button.
4. **Interactive Filters**: Features a real-time name filter input that dynamically narrows down the repository list without re-fetching.

---

## 🤖 Practical 13: AI API Integration (Generate Description)

An external **OpenAI** service is integrated into the Task Management application to generate task
descriptions. The AI call happens **on the Express backend only** - the browser never sees an API key.

### 🔁 User Flow

```
React Task Form → user enters Title → clicks "Generate Description"
   → POST /api/ai/generate-description (Express)
      → backend securely calls OpenAI API (key read from server .env)
      → response parsed into a clean description
   → React receives { success, description }
   → description is placed in the task description field
```

### 🔌 API Details
- **Endpoint**: `POST /api/ai/generate-description`
- **Request body**: `{ "title": "Complete React project" }`
- **Success (200)**: `{ "success": true, "description": "Develop and finalize the React project..." }`
- **Validation failure (400)**: `{ "error": "Validation Error", "details": ["Task title is required."], "success": false, "description": "" }`
- **AI unavailable (503)**: `{ "success": false, "description": "", "message": "AI description generation is currently unavailable. Please enter the description manually." }`
- **Authentication**: not required for this endpoint; `/tasks` routes still require a Bearer token.

### 🔐 Security (API key stays backend-only)
- `OPENAI_API_KEY` lives only in the root `.env`, which is **git-ignored** (`.gitignore` → `.env`, `.env.*`).
- `.env.example` ships only the placeholder `OPENAI_API_KEY=your_openai_api_key_here`.
- React code, `src/**`, the built `dist/` bundle and the browser network tab contain **no** OpenAI key.
- The raw AI API response is never forwarded to the client - only `{ success, description }`.
- Server logs print error names/messages only, never credentials.

### ⚙️ Backend `.env` configuration
```bash
OPENAI_API_KEY=your_openai_api_key_here   # required for live generation
OPENAI_MODEL=gpt-4o-mini                  # optional (default)
OPENAI_TIMEOUT_MS=15000                   # optional (default 15000 ms)
# OPENAI_BASE_URL=https://api.openai.com/v1   optional proxy/self-hosted endpoint
```

### 🛡️ Error Handling & Graceful Degradation
Missing key, invalid key, rate limits, timeouts, network failures and malformed model responses are all
caught inside `task-manager-api/services/aiService.js`. The endpoint returns the friendly 503 fallback
above and the server **never crashes** - task CRUD, auth and the rest of the app keep working with the
AI feature simply being unavailable (the user can always type the description manually).

### 🧑‍⚖️ Responsible AI
- AI-generated descriptions are **suggestions** and are shown with a reminder in the form to review them.
- Model output may be inaccurate or incomplete - users must read and edit it before saving.
- Users remain responsible for the final task information stored in the application.
- The core application works even when AI generation is unavailable.

### ▶️ Run & Test
```bash
npm install            # installs express, mongoose, openai, react, ...
npm run server         # Express API on http://localhost:5050 (needs MongoDB)
npm run dev            # React app on http://localhost:5173
npm test               # unit + endpoint tests (validation, fallback, key-exposure checks)
npm run lint && npm run build
```
**Manual test:** open the **Tasks** page → sign in → type a title → click **Generate Description**
(button shows `Generating...` and is disabled) → the description appears in the description field →
**+ Add Task** stores it normally. Remove `OPENAI_API_KEY` to see the fallback toast instead.

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd practical
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.

### Linting
To check and lint the code using Oxlint:
```bash
npm run lint
```

---

## 🐳 Docker Deployment

The application is containerized using a multi-stage Docker build config for performance and minimal image sizing.

1. **Build Image**:
   ```bash
   docker build -t portfolio-app .
   ```
2. **Run Container**:
   ```bash
   docker run -d -p 8080:80 --name portfolio-container portfolio-app
   ```
3. View the containerized app at `http://localhost:8080`.
