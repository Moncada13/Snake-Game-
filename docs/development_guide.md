# Snake Game - Development Guide

This guide provides step-by-step instructions for running, testing, and developing the Snake Game application (React + TypeScript frontend and PostgreSQL backend).

---

## 🚀 Prerequisites

Ensure the following tools are installed:
- **Node.js** (v18 or higher; v20+ recommended)
- **npm** (v9 or higher)
- **Docker** and **Docker Compose** (for PostgreSQL database)
- **Git**

---

## 📦 Frontend Setup & Commands

The web frontend is located in the `frontend/` directory.

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Type Checking

Validate TypeScript types across the entire project:

```bash
npm --prefix frontend run typecheck
```

### 3. Running Unit & Integration Tests

Run all Jest test suites:

```bash
npm --prefix frontend test
```

### 4. Running Tests with Code Coverage

Verify coverage thresholds (≥ 90% required across all metrics):

```bash
npm --prefix frontend run test:coverage
```

### 5. Running the Development Server

Start the local development server:

```bash
npm --prefix frontend start
```

The application will be accessible at `http://localhost:3000`.

---

## 🗄️ Backend Setup (PostgreSQL Database)

The backend and database configurations will be connected in `US-05` and `US-06`.

### PostgreSQL Database (Docker)

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify container status
docker-compose ps
```

---

## 🧪 Testing Verification Checklist

Before archiving any OpenSpec change:
1. `npm --prefix frontend run typecheck` passes with zero errors.
2. `npm --prefix frontend run test:coverage` achieves ≥ 90% coverage.
3. Verification reports are generated in `openspec/changes/<change-name>/reports/`.
