# MENTOR

MENTOR is a full-stack mentorship platform where coders can request academic support and mentors can manage those requests.

## Features

- User registration and login for coders and mentors
- Profile management and clan selection for coders
- Creation, editing, and deletion of mentorship requests
- Mentor workflow to accept, reject, and complete requests
- Personal goals tracking for each user

## Tech Stack

- Frontend: Vite, HTML, CSS, and vanilla JavaScript
- Backend: Express.js and Node.js
- Database: PostgreSQL
- Environment: Docker Compose

## Run locally

1. Copy the environment file:

```bash
cp .env.example .env
```

2. Start the services:

```bash
docker compose up --build
```

3. Open the application:

- Frontend: http://localhost:5173
- API health check: http://localhost:3000/api/health

## Demo accounts

- Coder: coder@mentor.test / 123456
- Mentor: mentor@mentor.test / 123456

## Project structure

- client/: frontend application
- server/: backend API
- database/: SQL schema and seed data
