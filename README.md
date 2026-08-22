# MyEduConnect — Web Application Security Assessment

> **Security Notice:** This platform contains **intentional vulnerabilities**. Run it on
> localhost only. Never deploy it to a public host.

MyEduConnect is a mock Malaysian edtech platform used as the target environment for a full
penetration-testing lifecycle: **build → attack → harden → re-test**. The codebase ships with
**both** a deliberately vulnerable build and a hardened ("secure") build of every finding, so the
same attacks can be demonstrated succeeding and then failing.


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
| **Vulnerable** (default) | `docker-compose.yml` | `http://localhost:8080` | Assessment target — all findings live |
| **Secure** (hardened) | `docker-compose.secure.yml` | `https://localhost:8081` | Remediated — TLS + WAF + IDS + network segmentation |

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

## 3. Part A — Deploy the Vulnerable Stack

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
| SSH into web-app container (V5) | `ssh root@localhost -p 12222` — password `admin123` |

### Step 5 — Stop / reset

```bash
docker compose down            # stop containers
docker compose down -v         # stop AND wipe the mysql volume (full reset + reseed on next up)
```

> **First-time setup or after pulling schema changes:** the schema added a `system_config` table and
> widened `users.password_hash` to fit bcrypt. Run `docker compose down -v` once so the MySQL volume
> is recreated with the new schema.

---

## 4. Part B — Deploy the Secure Stack

The secure stack proves the documented attacks fail after hardening. It builds different Docker images
and adds network defence controls on top of the runtime fixes.

What it adds over the vulnerable stack:
- **V5 fix** — `web-app/Dockerfile.secure`: no `sshd`, runs as non-root `node` user.
- **V8 fix** — `nginx/Dockerfile.secure` + `nginx.secure.conf`: self-signed TLS on 443, HSTS, 80→443 redirect.
- **WAF** — ModSecurity 3 + OWASP CRS v4 (blocking mode) with 3 custom rules.
- **IDS** — Suricata 7 sidecar with 3 custom rules covering the documented attacks.
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

## 6. Vulnerability & Remediation Matrix

| Vuln | OWASP | Vulnerable behaviour (default) | Secure-mode fix | Toggle |
|---|---|---|---|---|
| **V1 — SQL Injection** | A03 | `course.model.js search()` does raw `${keyword}` interpolation; UNION attack works. | Parameterized `LIKE` with `% _ \` escaped + 100-char input cap. UNION payloads return zero rows. | Runtime |
| **V2 — Stored XSS** | A03 | `ProfilePage.jsx` renders `bio` via `dangerouslySetInnerHTML`; backend stores raw HTML. | Frontend renders bio as plain text; backend strips HTML tags on write. | Runtime |
| **V3 — IDOR** | A01 | Enrolments controller returns any record by id. | Returns 404 unless caller is the owner or an admin. | Runtime |
| **V4 — Weak JWT** | A02 | Secret `secret123`, no `exp`; jwt.io forgery succeeds. | Random `JWT_SECRET_SECURE` (≥32 chars) + `expiresIn: 1h` + `HS256` pinned. No fallback — forged `secret123` tokens rejected. | Runtime |
| **V5 — Weak SSH / root in container** | — | `Dockerfile` installs `sshd`, sets `root:admin123`, publishes SSH on host port 12222. | `Dockerfile.secure`: no `sshd`, runs as non-root `node`. | **Build-time** |
| **V6 — Exposed admin panel** | A01 | Only `authMiddleware + adminMiddleware`. | Adds `X-Secure-Mode` + `Cache-Control: no-store` headers; WAF blocks unauthenticated `/api/admin/*` probes at the edge. | Runtime |
| **V7 — MD5 password hashes** | A02 | `crypto.createHash('md5')`; seeds crack instantly on crackstation. | New passwords stored with `bcrypt` (cost 12); login auto-detects scheme; reset tokens use `randomBytes(32)`. | Runtime |
| **V8 — Cleartext HTTP** | A02 | `nginx.conf` serves everything over HTTP. | `nginx.secure.conf`: TLS 1.2/1.3 (Mozilla Intermediate), HSTS, 80→443 redirect. | **Build-time** |

---

## 8. Network Defence Controls (WAF / IDS / Firewall)

These ship **only in the secure stack** (`docker-compose.secure.yml`).

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
vulnerable stack, by contrast, is a single flat `internal` bridge with MySQL (3306) and SSH (12222)
published to the host.

---

## 9. Run Both Stacks Side-by-Side

The two stacks use different host ports and project names, so they coexist for a live before/after
comparison. Each gets its own containers, network, and `mysql_data` volume (independent state).

```bash
# Vulnerable stack — http://localhost:8080, SSH on 12222
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
| SSH (vulnerable build, V5) | `root` @ `localhost:12222` | `admin123` | container root |

Seeded instructor and student accounts also exist (`*.@myeduconnect.my`, `*.@student.my`) with
crackable MD5 hashes — see `web-app/database/seed.sql`.

---