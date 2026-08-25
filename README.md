# EduPortal: Web Application Security Assessment

> **Security notice:** this platform contains **intentional vulnerabilities**. Run it on
> localhost only. Never deploy it to a public host.

EduPortal is a mock Malaysian edtech platform built as the target for a full
penetration-testing lifecycle: **build, attack, harden, re-test**. What makes it unusual is
that one codebase ships **two deployable stacks**. The default stack carries every finding
live; the hardened stack fixes all eight and adds a WAF, an IDS and network segmentation on
top. The same attack can be demonstrated succeeding against one and failing against the other,
side by side on one machine.

This started as a team project for a university group assignment.

---

## 1. Findings

**8 findings: 3 critical, 3 high, 2 medium.** Every one has a working exploit against the
default stack and a fix in the hardened stack.

| # | Finding | Severity | OWASP 2021 | Vulnerable code | Remediation |
|---|---|---|---|---|---|
| V1 | SQL injection in course search | **Critical** | A03 Injection | `web-app/features/course/course.model.js:29` | Parameterised `LIKE` with `% _ \` escaped, plus a 100-char input cap. UNION payloads return zero rows. |
| V2 | Stored XSS in profile bio | **High** | A03 Injection | `frontend/src/features/profile/ProfilePage.jsx:59` | Bio renders as plain text; the backend strips HTML tags on write. |
| V3 | IDOR on enrolment records | Medium | A01 Broken Access Control | `api-server/features/enrolments/enrolments.controller.js:11` | Returns 404 unless the caller owns the record or is an admin. |
| V4 | Forgeable JWT | **Critical** | A02 Cryptographic Failures | `web-app/config/env.js:27` | Random 32-byte secret, `expiresIn: 1h`, `HS256` pinned, no fallback. Tokens signed with `secret123` are rejected. |
| V5 | Root SSH inside the container | **Critical** | A05 Security Misconfiguration | `web-app/Dockerfile:5` | Build-time fix. `Dockerfile.secure` installs no `sshd` and runs as the non-root `node` user. |
| V6 | Admin panel reachable at the edge | Medium | A01 Broken Access Control | `web-app/features/admin/admin.routes.js:8` | Adds `X-Secure-Mode` and `Cache-Control: no-store`; the WAF blocks unauthenticated `/api/admin/*` probes before they reach the app. |
| V7 | Unsalted MD5 password hashes | **High** | A02 Cryptographic Failures | `web-app/features/auth/auth.service.js:11` | `bcrypt` at cost 12; login auto-detects the stored scheme; reset tokens use `randomBytes(32)`. |
| V8 | Everything served over cleartext HTTP | **High** | A02 Cryptographic Failures | `nginx/nginx.conf:19` | Build-time fix. TLS 1.2/1.3 on the Mozilla Intermediate profile, HSTS, 80 to 443 redirect. |

V5 and V8 are fixed at build time, in a different Docker image. The other six flip at runtime
through the `SECURE_MODE` toggle, so one running stack can demonstrate both behaviours without
a rebuild.

---

## 2. Architecture

| Layer | Technology |
|---|---|
| Backend | Node.js + Express (`web-app` main portal, `api-server` REST API) |
| Database | MySQL 8.0 |
| Main frontend | React (Vite) + Tailwind CSS (`frontend`) |
| API-client frontend | React (Vite) + Tailwind CSS (`api-client`) |
| Reverse proxy / edge | Nginx |
| Orchestration | Docker Compose |

**Two builds, one codebase**

| Build | Compose file | Entry point | Purpose |
|---|---|---|---|
| **Vulnerable** (default) | `docker-compose.yml` | `http://localhost:8080` | Assessment target, all findings live |
| **Secure** (hardened) | `docker-compose.secure.yml` | `https://localhost:8081` | Remediated, plus TLS, WAF, IDS and network segmentation |

---

## 3. Prerequisites

| Tool | Version | Check |
|---|---|---|
| Docker | 24.x | `docker --version` |
| Docker Compose | 2.x | `docker compose version` |
| Git | 2.x | `git --version` |
| Node.js (optional) | 20.x | `node --version` |

---

## 4. Part A: deploy the vulnerable stack

### Step 1: clone the repository

```bash
git clone https://github.com/junyuan04/edu-portal-security-assessment.git eduportal
cd eduportal
```

### Step 2: create the environment file

```bash
cp .env.example .env
```

The defaults work out of the box for local development. `.env.example` already ships a 64-char
placeholder for `JWT_SECRET_SECURE` (required, at least 32 chars).

### Step 3: build and start

```bash
docker compose up --build
```

This builds all six images, runs `web-app/database/schema.sql` then `seed.sql` to initialise and
seed the database, and starts Nginx as the single entry point.

### Step 4: access the platform

| Service | URL |
|---|---|
| Main portal | http://localhost:8080 |
| REST API | http://localhost:8080/rest |
| API client | http://localhost:8080/api-client |
| Admin panel | http://localhost:8080/admin |
| MySQL (intentionally exposed) | `localhost:3306` |
| SSH into web-app container (V5) | `ssh root@localhost -p 12222`, password `admin123` |

### Step 5: stop and reset

```bash
docker compose down            # stop containers
docker compose down -v         # stop AND wipe the mysql volume (full reset + reseed on next up)
```

> **After pulling schema changes:** run `docker compose down -v` once so the MySQL volume is
> recreated. The schema added a `system_config` table and widened `users.password_hash` to fit
> bcrypt.

---

## 5. Part B: deploy the secure stack

The secure stack proves the documented attacks fail after hardening. It builds different Docker
images and adds network defence controls on top of the runtime fixes:

- **V5 fix**: `web-app/Dockerfile.secure`, no `sshd`, runs as non-root `node`.
- **V8 fix**: `nginx/Dockerfile.secure` + `nginx.secure.conf`, self-signed TLS on 443, HSTS,
  80 to 443 redirect.
- **WAF**: ModSecurity 3 + OWASP CRS v4 in blocking mode, with 3 custom rules.
- **IDS**: Suricata 7 sidecar with 3 custom rules covering the documented attacks.
- **Network segmentation**: `edge-net` / `app-net` / `data-net`, MySQL isolated, no SSH or DB
  exposed to the host.

### Step 1: ensure `.env` carries `JWT_SECRET_SECURE`

Both `web-app` and `api-server` **refuse to start** if it is missing or shorter than 32 chars.
`cp .env.example .env` already satisfies this. Rotate per environment with:

```bash
openssl rand -hex 32
```

### Step 2: build and start

```bash
docker compose -f docker-compose.secure.yml up --build
```

### Step 3: access the secure platform

| Service | URL / command |
|---|---|
| Main portal | **https://localhost:8081** (self-signed cert, accept the browser warning) |
| HTTP | not published; the in-container `:80` block only 301-redirects to HTTPS |
| SSH (V5) | no longer exposed |
| WAF audit log | `docker exec eduportal-secure-nginx-1 tail -f /var/log/modsec_audit.log` |
| IDS alerts | `docker exec eduportal-secure-suricata-1 tail -f /var/log/suricata/fast.log` |

### Step 4: stop

```bash
docker compose -f docker-compose.secure.yml down        # add -v to wipe its DB volume
```

---

## 6. Network defence controls

These ship **only in the secure stack**.

### Web application firewall: ModSecurity 3 + OWASP CRS v4 (blocking)

Engaged at the nginx edge via the `owasp/modsecurity-crs:nginx-alpine` base image. Custom rules
in `nginx/modsec/custom-rules.conf`:

| Rule ID | Target | Action |
|---|---|---|
| `WAF-EP-10001` | `alg:none` JWT in the Authorization header (V4) | `deny 403` |
| `WAF-EP-10002` | Unauthenticated hit to `/api/admin/*` or `/rest/admin/*` (V6) | `deny 403` |
| `WAF-EP-10003` | 32-char MD5 hash leaked in a JSON response (V7) | log only (audit) |

### Intrusion detection: Suricata 7 (alert only)

Runs as a sidecar in nginx's network namespace. Rules in `suricata/rules/eduportal.rules`:

| SID | Detects | Maps to |
|---|---|---|
| `1000001` | `UNION SELECT` against `/api/courses/search` | V1 |
| `1000002` | More than 10 POSTs to `/api/auth/login` in 60s (brute force) | V4, V7 |
| `1000003` | More than 15 hits to `/(api\|rest)/admin/` in 30s (enumeration) | V6 |

> Suricata detects and logs, it does not block. Active blocking is the WAF's job.

### Firewall and network segmentation

Docker bridge networks enforce zone isolation. `app-net` and `data-net` are `internal: true`
with no internet route, and **MySQL sits only on `data-net`**, unreachable from the edge. The
vulnerable stack, by contrast, is a single flat bridge with MySQL (3306) and SSH (12222)
published to the host.

---

## 7. Run both stacks side by side

Different host ports and project names, so they coexist for a live before/after comparison.
Each gets its own containers, network and `mysql_data` volume.

```bash
docker compose -f docker-compose.yml        up -d --build   # http://localhost:8080
docker compose -f docker-compose.secure.yml up -d --build   # https://localhost:8081
```

| Stack | URL | Project name |
|---|---|---|
| Vulnerable | http://localhost:8080 | `eduportal-vuln` |
| Secure | https://localhost:8081 | `eduportal-secure` |

Tear down individually, adding `-v` to wipe that stack's database:

```bash
docker compose -f docker-compose.yml        down
docker compose -f docker-compose.secure.yml down
```

> The secure stack's nginx does not publish port 80. Its in-container HTTP to HTTPS redirect
> uses `$host` with no port, so reach it directly at **https://localhost:8081**.

---

## 8. Default credentials

> All seeded passwords are stored as **unsalted MD5** (finding V7) and crack instantly. That is
> the point.

| Account | Email | Password | Role |
|---|---|---|---|
| Admin | `admin@eduportal.my` | `admin123` | admin |
| SSH (vulnerable build, V5) | `root` @ `localhost:12222` | `admin123` | container root |

Seeded instructor and student accounts also exist (`*@eduportal.my`, `*@student.my`) with
crackable MD5 hashes. See `web-app/database/seed.sql`.

---

## 9. License

[MIT](LICENSE). The intentional vulnerabilities are part of the design; the licence disclaims
all warranty and liability accordingly.
