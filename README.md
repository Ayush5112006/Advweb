# Advanced Web Development - Student Portfolio & Practical Assignments

A state-of-the-art Student Portfolio built with **React**, **Vite**, and **Vanilla CSS**. This repository contains practical implementations demonstrating advanced frontend engineering concepts, design systems, and API integrations.

## 🚀 Features

- **Dynamic Navigation & Routes**: Includes pages for Home, About, Projects, Skills, and Contact built with `react-router-dom`.
- **Accent Theme Customizer**: Floating accent color switcher supporting dynamic theme propagation.
- **Dark/Light Mode**: Full responsive system toggle for accessibility and visual preference.
- **REST API Integration (Practical 3)**: Serves live repository data directly from the GitHub API.
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
