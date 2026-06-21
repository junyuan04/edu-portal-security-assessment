#  CCS6324 — Ethical Hacking & Penetration Testing - MyEduConnect

> **Security Notice:** This platform contains **intentional vulnerabilities** for academic
> research and penetration-testing practice.

MyEduConnect is a mock Malaysian edtech platform used as the target environment for a full
penetration-testing lifecycle: **build → attack → harden → re-test**. The codebase ships with
**both** a deliberately vulnerable build and a hardened ("secure") build of every finding, so the
same attacks can be demonstrated succeeding and then failing.

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [Prerequisites](#2-prerequisites)
3. [Part A — Deploy the Vulnerable Stack (Phase 1)](#3-part-a--deploy-the-vulnerable-stack-phase-1)
4. [Part B — Deploy the Secure Stack (Phase 5)](#4-part-b--deploy-the-secure-stack-phase-5)
5. [The `SECURE_MODE` Runtime Toggle (V1–V4, V6, V7)](#5-the-secure_mode-runtime-toggle-v1v4-v6-v7)
6. [Vulnerability & Remediation Matrix](#6-vulnerability--remediation-matrix)
7. [Re-test / Smoke Tests (before vs after)](#7-re-test--smoke-tests-before-vs-after)
8. [Network Defence Controls (WAF / IDS / Firewall)](#8-network-defence-controls-waf--ids--firewall)
9. [Run Both Stacks Side-by-Side](#9-run-both-stacks-side-by-side)
10. [Default Credentials](#10-default-credentials)
11. [Known Caveats & Residual Risks](#11-known-caveats--residual-risks)

---

## 1. Architecture

**Tech stack**

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
| **Vulnerable** (default) | `docker-compose.yml` | `http://localhost:8080` | Phase 1 target — all vulnerabilities live |
| **Secure** (hardened) | `docker-compose.secure.yml` | `https://localhost:8081` | Phase 5 — TLS + WAF + IDS + network segmentation |

---

## 2. Prerequisites

Install before running:

| Tool | Version | Check |
|---|---|---|
| Docker | 24.x | `docker --version` |
| Docker Compose | 2.x | `docker compose version` |
| Git | 2.x | `git --version` |
| Node.js (optional) | 20.x | `node --version` |

---

## 3. Part A — Deploy the Vulnerable Stack (Phase 1)

### Step 1 — Clone the repository

```bash
git clone <YOUR_PRIVATE_REPO_URL> myeduconnect
cd myeduconnect
```

### Step 2 — Create the environment file

```bash
cp .env.example .env
```

Open `.env` and adjust values if you wish. The defaults work out of the box for local development.
`.env.example` already ships a 64-char placeholder for `JWT_SECRET_SECURE` (required, ≥32 chars).

### Step 3 — Build and start

```bash
docker compose up --build
```

This will:
- Build all images (`web-app`, `api-server`, `frontend`, `api-client`, `nginx`, `mysql`).
- Run `web-app/database/schema.sql` then `seed.sql` to initialise + seed the database automatically.
- Start Nginx as the single entry point.

### Step 4 — Access the platform

| Service | URL |
|---|---|
| Main portal | http://localhost:8080 |
| REST API | http://localhost:8080/rest |
| API client | http://localhost:8080/api-client |
| Admin panel | http://localhost:8080/admin |
| MySQL (intentionally exposed) | `localhost:3306` |
| SSH into web-app container (V5) | `ssh root@localhost -p 2222` — password `admin123` |

### Step 5 — Stop / reset

```bash
docker compose down            # stop containers
docker compose down -v         # stop AND wipe the mysql volume (full reset + reseed on next up)
```

> **First-time setup or after pulling schema changes:** the schema added a `system_config` table and
> widened `users.password_hash` to fit bcrypt. Run `docker compose down -v` once so the MySQL volume
> is recreated with the new schema.

---

## 4. Part B — Deploy the Secure Stack (Phase 5)

The secure stack proves the Phase 4 attacks fail after hardening. It builds different Docker images
and adds network defence controls on top of the runtime fixes.

What it adds over the vulnerable stack:
- **V5 fix** — `web-app/Dockerfile.secure`: no `sshd`, runs as non-root `node` user.
- **V8 fix** — `nginx/Dockerfile.secure` + `nginx.secure.conf`: self-signed TLS on 443, HSTS, 80→443 redirect.
- **WAF** — ModSecurity 3 + OWASP CRS v4 (blocking mode) with 3 custom rules.
- **IDS** — Suricata 7 sidecar with 3 custom rules covering the Phase 4 attacks.
- **Network segmentation** — `edge-net` / `app-net` / `data-net` (MySQL isolated, no SSH/DB exposed to host).

### Step 1 — Ensure `.env` exists with `JWT_SECRET_SECURE`

Both `web-app` and `api-server` **refuse to start** if `JWT_SECRET_SECURE` is missing or shorter than
32 chars. `cp .env.example .env` already satisfies this; rotate per environment with:

```bash
openssl rand -hex 32
```

### Step 2 — Build and start the secure stack

```bash
docker compose -f docker-compose.secure.yml up --build
```

### Step 3 — Access the secure platform

| Service | URL / command |
|---|---|
| Main portal | **https://localhost:8081** (self-signed cert — accept the browser warning) |
| HTTP | not published (the in-container `:80` block only 301-redirects to HTTPS) |
| SSH (V5) | no longer exposed |
| WAF audit log | `docker exec myeduconnect-secure-nginx-1 tail -f /var/log/modsec_audit.log` |
| IDS alerts | `docker exec myeduconnect-secure-suricata-1 tail -f /var/log/suricata/fast.log` |

### Step 4 — Stop the secure stack

```bash
docker compose -f docker-compose.secure.yml down        # add -v to wipe its DB volume
```

---

## 5. The `SECURE_MODE` Runtime Toggle (V1–V4, V6, V7)

Six of the eight findings can be flipped **at runtime — no rebuild** — via a DB-backed flag
(`system_config.secure_mode`). V5 and V8 are **build-time** (choose the compose file in Part A vs B).

> The flag is cached in-process for **5 seconds** — wait that long after flipping before re-testing.

### Option A — Admin Dashboard (recommended)

1. Log in as admin (`admin@myeduconnect.my` / `admin123`).
2. Open the admin panel → **Overview** tab.
3. The first card shows the current mode. Click the switch to flip it.

### Option B — curl

```bash
# Read current mode (public)
curl http://localhost:8080/api/system/secure-mode

# Flip to secure (admin token required)
curl -X PUT \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"secure": true}' \
  http://localhost:8080/api/system/secure-mode

# Flip back to vulnerable
curl -X PUT \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"secure": false}' \
  http://localhost:8080/api/system/secure-mode
```

> On the secure stack, target `https://localhost:8081/...` instead (add `-k` for the self-signed cert).

---

## 6. Vulnerability & Remediation Matrix

| Vuln | OWASP | Vulnerable behaviour (default) | Secure-mode fix | Toggle |
|---|---|---|---|---|
| **V1 — SQL Injection** | A03 | `course.model.js search()` does raw `${keyword}` interpolation; UNION attack works. | Parameterized `LIKE` with `% _ \` escaped + 100-char input cap. UNION payloads return zero rows. | Runtime |
| **V2 — Stored XSS** | A03 | `ProfilePage.jsx` renders `bio` via `dangerouslySetInnerHTML`; backend stores raw HTML. | Frontend renders bio as plain text; backend strips HTML tags on write. | Runtime |
| **V3 — IDOR** | A01 | Enrolments controller returns any record by id. | Returns 404 unless caller is the owner or an admin. | Runtime |
| **V4 — Weak JWT** | A02 | Secret `secret123`, no `exp`; jwt.io forgery succeeds. | Random `JWT_SECRET_SECURE` (≥32 chars) + `expiresIn: 1h` + `HS256` pinned. No fallback — forged `secret123` tokens rejected. | Runtime |
| **V5 — Weak SSH / root in container** | — | `Dockerfile` installs `sshd`, sets `root:admin123`, exposes port 2222. | `Dockerfile.secure`: no `sshd`, runs as non-root `node`. | **Build-time** |
| **V6 — Exposed admin panel** | A01 | Only `authMiddleware + adminMiddleware`. | Adds `X-Secure-Mode` + `Cache-Control: no-store` headers; WAF blocks unauthenticated `/api/admin/*` probes at the edge. | Runtime |
| **V7 — MD5 password hashes** | A02 | `crypto.createHash('md5')`; seeds crack instantly on crackstation. | New passwords stored with `bcrypt` (cost 12); login auto-detects scheme; reset tokens use `randomBytes(32)`. | Runtime |
| **V8 — Cleartext HTTP** | A02 | `nginx.conf` serves everything over HTTP. | `nginx.secure.conf`: TLS 1.2/1.3 (Mozilla Intermediate), HSTS, 80→443 redirect. | **Build-time** |

---

## 8. Network Defence Controls (WAF / IDS / Firewall)

These ship **only in the secure stack** (`docker-compose.secure.yml`) and satisfy Phase 5.2.

### Web Application Firewall — ModSecurity 3 + OWASP CRS v4 (blocking)
Engaged at the nginx edge via the `owasp/modsecurity-crs:nginx-alpine` base image. Custom rules in
`nginx/modsec/custom-rules.conf`:

| Rule ID | Target | Action |
|---|---|---|
| `10001` | `alg:none` JWT in Authorization header (V4) | `deny 403` |
| `10002` | Unauthenticated hit to `/api/admin/*` or `/rest/admin/*` (V6) | `deny 403` |
| `10003` | 32-char MD5 hash leaked in a JSON response (V7) | log-only (audit) |

### Intrusion Detection System — Suricata 7 (alert-only)
Runs as a sidecar in nginx's network namespace. Rules in `suricata/rules/myeduconnect.rules`:

| SID | Detects | Maps to |
|---|---|---|
| `1000001` | `UNION SELECT` against `/api/courses/search` | V1 |
| `1000002` | >10 POSTs to `/api/auth/login` in 60s (brute-force) | V4 / V7 |
| `1000003` | >15 hits to `/(api\|rest)/admin/` in 30s (enumeration) | V6 |

> Suricata is an **IDS** — it detects and logs, it does **not** block. Active blocking is the WAF's job.

### Firewall / network segmentation
Docker bridge networks enforce zone isolation: `app-net` and `data-net` are `internal: true`
(no internet route), and **MySQL sits only on `data-net`** — unreachable from the edge. The
vulnerable stack, by contrast, is a single flat `internal` bridge with MySQL (3306) and SSH (2222)
published to the host.

---

## 9. Run Both Stacks Side-by-Side

The two stacks use different host ports and project names, so they coexist for a live before/after
comparison. Each gets its own containers, network, and `mysql_data` volume (independent state).

```bash
# Vulnerable stack — http://localhost:8080, SSH on 2222
docker compose -f docker-compose.yml        up -d --build

# Secure stack — https://localhost:8081
docker compose -f docker-compose.secure.yml up -d --build
```

| Stack | URL | Project name |
|---|---|---|
| Vulnerable | http://localhost:8080 | `myeduconnect-vuln` |
| Secure | https://localhost:8081 | `myeduconnect-secure` |

Tear down individually (add `-v` to wipe that stack's DB):

```bash
docker compose -f docker-compose.yml        down
docker compose -f docker-compose.secure.yml down
```

> The secure stack's nginx does not publish port 80. Its in-container HTTP→HTTPS redirect uses
> `$host` (no port), so reach the secure stack directly at **https://localhost:8081**.

---

## 10. Default Credentials

> All seeded passwords are stored as **unsalted MD5** (the V7 vulnerability) and crack instantly.

| Account | Email | Password | Role |
|---|---|---|---|
| Admin | `admin@myeduconnect.my` | `admin123` | admin |
| SSH (vulnerable build, V5) | `root` @ `localhost:2222` | `admin123` | container root |

Seeded instructor and student accounts also exist (`*.@myeduconnect.my`, `*.@student.my`) with
crackable MD5 hashes — see `web-app/database/seed.sql`.

---

## 11. Known Caveats & Residual Risks

- **Flag staleness.** The 5-second per-process cache means a runtime flip takes up to ~5s to fully
  propagate across `web-app` + `api-server`. Wait before re-testing.
- **Vulnerable-mode tokens are invalidated on flip.** With V4 hard-fixed, `verifyToken` branches on
  `SECURE_MODE`: secure mode accepts only `JWT_SECRET_SECURE`-signed tokens. Flipping vulnerable→secure
  forces a one-time re-login (in practice, the admin account). This is the trade for an actually fixed V4.
- **`JWT_SECRET_SECURE` is mandatory.** Both backends fail to start if it is missing or < 32 chars.
- **V6 is intentionally lightweight at the app layer.** A real IP allowlist would lock the operator out
  of the toggle endpoint; the primary defence is V4 (forged tokens fail) plus the edge WAF rule.
- **Self-signed TLS.** The secure stack uses a self-signed cert — browsers warn at
  `https://localhost:8081`. Replace with a real cert (Let's Encrypt / vault) for any non-localhost use.
- **Suricata detects, it does not block.** Treat its alerts as monitoring, not enforcement.
