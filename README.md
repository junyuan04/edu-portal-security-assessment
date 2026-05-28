# MyEduConnect

Security Notice: This platform contains intentional vulnerabilities for academic research and penetration testing practice. Do not deploy this in a production environment or expose it to the public internet.

## Project Overview

MyEduConnect is a mock Malaysian edtech platform serving as a target environment for a full penetration testing lifecycle.

## Tech Stack

Backend: Node.js + Express |
Database: MySQL
Main Frontend: React (Vite) + Tailwind CSS |
API Client Frontend: React (Vite) + Tailwind CSS 
Reverse Proxy: Nginx
Deployment: Docker Compose


## Prerequisites

Make sure you have the following installed before running the project:

Docker (24.x) `docker --version`
Docker Compose (2.x) `docker compose version`
Git (2.x)`git --version`
Node.js (optional) (20.x) `node --version`


## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_ORG/myeduconnect.git
cd myeduconnect
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in any values you wish to change. The defaults work out of the box for local development.

### 3. Start the platform

```bash
docker compose up --build
```

This command will:
- Build all container images (web-app, api-server, frontend, api-client, nginx, mysql)
- Run `schema.sql` then `seed.sql` to initialise the database automatically
- Start Nginx on port 80 as the single entry point

### 4. Access the platform

Main portal: http://localhost
REST API: http://localhost/rest
API client: http://localhost/api-client
Admin panel: http://localhost/admin 

### 5. Stop the platform

```bash
docker compose down
```

To also delete the database volume (full reset):

```bash
docker compose down -v
```

---

## Default Credentials

> These are intentionally weak for security demonstration purposes.

| Admin | admin@myeduconnect.my | admin123 |
| Instructor | ahmad.razif@myeduconnect.my | teacher123 |
| Instructor | nurul.aina@myeduconnect.my | instructor1 |
| Student | ali.hassan@student.my | student123 |
| Student | siti.rahimah@student.my | password123 |
| Student | raj.kumar@student.my | password123 |
| Student | wei.liang@student.my | password123 |
| Student | farah.nadia@student.my | password123 |
| Student | danial.hakimi@student.my | password123 |

SSH access (container):
```bash
ssh root@localhost -p 2222
# password: admin123
```
### Workflow for each member

```bash
# 1. Always start from the latest dev
git checkout dev
git pull origin dev

# 2. Create your feature branch
git checkout -b feat/your-feature

# 3. Commit often with clear messages
git commit -m "feat(auth): add login route with MD5 hashing [V7]"

# 4. Push your branch
git push origin feat/your-feature


