# MyEduConnect — Secure Mode Toggle

The codebase now ships with **both** versions of every vulnerability. A single `SECURE_MODE` flag selects which code path runs.

- **Runtime-toggleable** (V1, V2, V3, V4, V6, V7) — flip on the admin dashboard, no rebuild.
- **Build-time** (V5, V8) — choose a compose file: `docker-compose.yml` (vulnerable) vs `docker-compose.secure.yml`.

---

## First-time setup (or after pulling these changes)

The schema added a `system_config` table and widened `users.password_hash` to fit bcrypt. The mysql volume must be recreated for the new schema to take effect.

```powershell
docker compose down -v          # wipes mysql_data
docker compose up --build       # rebuilds web-app (pulls in bcryptjs) + reseeds DB
```

System boots in **vulnerable mode** by default so the existing handbook walkthrough works unchanged.

---

## Flipping the runtime toggle

### Option A — Admin Dashboard (recommended)

1. Log in as admin (`admin@myeduconnect.my` / `admin123`).
2. Open `http://localhost/admin` → **Overview** tab.
3. The first card shows the current mode. Click the switch.

### Option B — curl

```powershell
# Read current mode (public)
curl http://localhost/api/system/secure-mode

# Flip to secure (admin token required)
# Vulnerable stack: http://localhost
# Secure stack:     https://localhost:8443  (add -k for self-signed cert)
curl.exe -X PUT `
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"secure\": true}' `
  http://localhost/api/system/secure-mode

# Flip back to vulnerable
curl.exe -X PUT `
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"secure\": false}' `
  http://localhost/api/system/secure-mode
```

The flag is cached in-process for **5 seconds** — give it that long after flipping before re-running an exploit.

---

## Per-vulnerability behaviour

| Vuln | Vulnerable mode (default) | Secure mode | Toggle |
|------|--------------------------|-------------|--------|
| **V1 — SQLi** | `course.model.js search()` does raw `${keyword}` string interpolation. Handbook UNION attack works. | Parameterized `LIKE` with `% _ \\` escaped, 100-char input cap. UNION payloads return zero rows. | Runtime |
| **V2 — Stored XSS** | `ProfilePage.jsx` renders `bio` via `dangerouslySetInnerHTML`. Backend stores raw HTML. | Frontend renders bio as plain text (`whitespace-pre-wrap`). Backend strips HTML tags on write. | Runtime |
| **V3 — IDOR** | `enrolments` controller returns any record by id. | Returns 404 unless caller is the owner or an admin. | Runtime |
| **V4 — Weak JWT** | `secret123`, no `exp`. jwt.io forgery succeeds. | Random secret (`JWT_SECRET_SECURE`, ≥32 chars, required in `.env`) + `expiresIn: 1h` + `algorithm: HS256` pinned on verify. **No fallback to the weak secret** — vulnerable-mode tokens are rejected once the toggle flips, so forged `secret123` tokens fail immediately. Users logged in under vulnerable mode re-login once after the flip. | Runtime |
| **V6 — Exposed admin** | Only `authMiddleware + adminMiddleware`. | Adds `X-Secure-Mode: true` + `Cache-Control: no-store` response headers. *Primary defence is V4 — once forged tokens fail to verify, the panel is effectively locked.* No IP allowlist (would lock you out of the toggle itself). | Runtime |
| **V7 — MD5 hashes** | `crypto.createHash('md5')`. `crackstation.net` cracks all seeds instantly. | New passwords stored with `bcrypt` (cost 12). Login auto-detects which scheme a stored hash uses, so MD5-seeded accounts still log in until reset. Reset tokens use `randomBytes(32)`. | Runtime |
| **V5 — Weak SSH / root in container** | `web-app/Dockerfile` installs sshd + sets `root:admin123`, port 2222 exposed. | Use `docker-compose.secure.yml` → builds `web-app/Dockerfile.secure` (no sshd, runs as non-root `node` user). | **Build-time** |
| **V8 — Cleartext HTTP** | `nginx/nginx.conf` serves everything over HTTP. | Use `docker-compose.secure.yml` → builds `nginx/Dockerfile.secure` + `nginx/nginx.secure.conf` (self-signed TLS on 443, HSTS, 80→443 redirect). | **Build-time** |

---

## Switching V5 / V8 (build-time)

```powershell
# Run the vulnerable build (default — handbook walkthrough as-is)
docker compose -f docker-compose.yml up --build

# Run the secure build (no SSH, TLS on 443)
docker compose down
docker compose -f docker-compose.secure.yml up --build
```

The secure build serves `https://localhost:8443`. Your browser will warn about the self-signed cert — accept it for the demo.

---

## Running both stacks side-by-side (live comparison)

The secure stack pins HTTPS to host port `8443` (not `443`), so it coexists with the vulnerable stack — no env vars, no override files. Each stack gets its own MySQL volume, so the runtime `SECURE_MODE` toggle (V1/V2/V3/V4/V6/V7) is independent per stack.

```powershell
# Vulnerable stack — http://localhost, ssh on 2222
docker compose -p myeduconnect        -f docker-compose.yml        up -d --build

# Secure stack — https://localhost:8443
docker compose -p myeduconnect-secure -f docker-compose.secure.yml up -d --build
```

| Stack | URL | Project name |
|---|---|---|
| Vulnerable | http://localhost | `myeduconnect` |
| Secure | https://localhost:8443 | `myeduconnect-secure` |

Each `-p` project gets its own containers, network, and `mysql_data` volume — they don't share state. Tear down individually:

```powershell
docker compose -p myeduconnect        -f docker-compose.yml        down
docker compose -p myeduconnect-secure -f docker-compose.secure.yml down       # add -v to wipe the secure stack's DB
```

> The secure stack's nginx doesn't publish port 80 to the host. Its in-container HTTP→HTTPS redirect uses `$host` (no port), so a hit on `http://localhost:<anything>` would 301 to `https://localhost` — into the vulnerable stack. Reach the secure stack at `https://localhost:8443` directly.

---

## Smoke-test the toggle

Run these in order. Each pair should give opposite results.

### V1 SQLi

```powershell
# Vulnerable mode → all 8 courses (filter bypassed)
curl "http://localhost/api/courses/search?q=%25%27)%20OR%201=1%23"

# Flip to secure, then re-run → returns courses matching the literal string %') OR 1=1#
```

### V3 IDOR

```powershell
# Vulnerable mode (logged in as siti.rahimah, accessing ali.hassan's enrolment)
curl -H "Authorization: Bearer SITI_TOKEN" http://localhost/rest/enrolments/1
# → returns ali.hassan's enrolment

# Secure mode → 404 Enrolment not found
```

### V4 forged JWT

```powershell
# Vulnerable mode → forged token (signed with secret123) succeeds
curl -H "Authorization: Bearer FORGED_TOKEN" http://localhost/api/admin/dashboard
# → 200 with dashboard JSON

# Secure mode → verify uses JWT_SECRET_SECURE only, HS256 pinned. The same
# forged token signed with secret123 is rejected outright (no fallback).
curl -k -H "Authorization: Bearer FORGED_TOKEN" https://localhost:8443/api/admin/dashboard
# → 401 {"error":"Invalid or expired token"}
```

### V7 MD5

```powershell
# Vulnerable mode → admin password hashes to 0192023a7bbd73250516f069df18b500 (cracks instantly)
# Secure mode → register a new user; the password_hash row starts with $2a$ or $2b$ (bcrypt)
docker exec -it myeduconnect-mysql-1 mysql -u myeduconnect_user -pmyeduconnect123 myeduconnect `
  -e "SELECT username, LEFT(password_hash, 4), LENGTH(password_hash) FROM users;"
```

### V2 XSS

1. Plant the payload as the handbook says (`UPDATE user_profiles SET bio = '<img src=x onerror=alert(1)>' WHERE user_id = 4`).
2. View `/profile` in **vulnerable mode** → alert fires.
3. Flip toggle → hard refresh `/profile` → markup is shown literally; no alert.

---

## Files added / changed

```
web-app/database/schema.sql                  # widened password_hash, added system_config
web-app/database/seed.sql                    # seed secure_mode=false
web-app/config/secureMode.js                 # NEW: DB-backed flag w/ 5s cache
web-app/features/system/system.routes.js     # NEW: GET/PUT /api/system/secure-mode
web-app/features/auth/auth.service.js        # V4 + V7 branching
web-app/features/course/course.model.js      # V1 branching
web-app/features/user/user.service.js        # V2 backend strip
web-app/features/admin/admin.routes.js       # V6 header + Cache-Control
web-app/middleware/auth.middleware.js        # dual-secret verify (HS256 pinned on strong path)
web-app/config/env.js                        # JWT_SECRET_SECURE added
web-app/server.js                            # mount /api/system
web-app/package.json                         # bcryptjs added
web-app/Dockerfile.secure                    # NEW: V5 fix (no sshd, non-root)

api-server/config/secureMode.js              # NEW: mirror of web-app helper
api-server/config/env.js                     # JWT_SECRET_SECURE added
api-server/middleware/auth.middleware.js     # dual-secret verify
api-server/features/enrolments/enrolments.controller.js  # V3 branching

frontend/src/hooks/useSecureMode.js          # NEW: fetches /api/system/secure-mode
frontend/src/services/admin.service.js       # getSecureMode / setSecureMode
frontend/src/features/profile/ProfilePage.jsx  # V2 frontend branch
frontend/src/features/admin/AdminDashboard.jsx # SecureModeToggle card

nginx/Dockerfile.secure                      # NEW: V8 fix (TLS at build)
nginx/nginx.secure.conf                      # NEW: 443 ssl + HSTS + 80→443 redirect

docker-compose.secure.yml                    # NEW: secure compose profile
SECURE_MODE_README.md                        # NEW: this file
```

---

## Known caveats

- **Flag staleness.** The 5-second per-process cache means a flip takes up to ~5s to fully propagate across web-app + api-server. Wait before re-testing.
- **Vulnerable-mode tokens are invalidated on flip.** With the V4 hard fix in place, `verifyToken` branches on `SECURE_MODE`: secure mode accepts only `JWT_SECRET_SECURE`-signed tokens, vulnerable mode accepts only `JWT_SECRET`-signed tokens. Flipping vulnerable→secure forces users (in practice, the admin account) to log back in once. This is the trade for an actually fixed V4 — forged `secret123` tokens are rejected outright in secure mode.
- **`JWT_SECRET_SECURE` is required in `.env`.** Both web-app and api-server fail to start if it's missing or shorter than 32 chars. `.env.example` ships a 64-char hex placeholder; rotate per environment with `openssl rand -hex 32`.
- **V6 is intentionally lightweight.** A real IP allowlist would block the operator from reaching the toggle endpoint they're trying to flip. The X-Secure-Mode header demonstrates the hook without that footgun.
- **Secure compose uses a self-signed cert.** Browsers will warn. Run `docker compose -f docker-compose.secure.yml up --build` and accept the warning at `https://localhost:8443`.
