# AI Tax Insights

A proof-of-concept application for AI-powered tax insights and document analysis.

## Project Overview

This application provides:
- Personalized tax news summaries
- Document upload and analysis
- Question-answering based on uploaded documents
- Note-taking functionality

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.12+
- Node.js 20.x LTS
- pnpm 9+

### Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the required values
3. Run the application with Docker Compose:

```bash
docker-compose up
```

### Development Setup

#### Backend

```bash
cd apps/backend
poetry install
poetry run uvicorn app.main:app --reload
```

#### Frontend

```bash
cd apps/frontend
pnpm install
pnpm dev
```

## Project Structure

```
/aitax-poc
 ├ apps/
 │   ├ backend/
 │   │   ├ app/
 │   │   │   ├ api/
 │   │   │   ├ core/
 │   │   │   └ models/
 │   │   ├ Dockerfile
 │   │   └ pyproject.toml
 │   └ frontend/
 │       ├ src/
 │       │   ├ pages/
 │       │   ├ components/
 │       │   └ routes.tsx
 │       ├ Dockerfile
 │       └ package.json
 ├ db/
 │   └ migrations/
 ├ scripts/
 │   └ seed_news.py
 ├ docker-compose.yml
 ├ .env.example
 └ README.md
```

## API Endpoints

The API documentation is available at `/docs` when the backend is running.

## License

Proprietary - All rights reserved.
