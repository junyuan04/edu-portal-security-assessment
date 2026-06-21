// Runtime SECURE_MODE flag, backed by the system_config table.
// Both web-app and api-server read the same row.
// keeps the hot paths (auth, search, IDOR) from hitting the DB on every call.

const db = require('./db');

const CACHE_TTL_MS = 5000;
let cached = { value: false, expiresAt: 0 };

const readFromDb = async () => {
  const [rows] = await db.query(
    "SELECT config_value FROM system_config WHERE config_key = 'secure_mode'"
  );
  return rows[0]?.config_value === 'true';
};

const isSecureMode = async () => {
  const now = Date.now();
  if (now < cached.expiresAt) return cached.value;
  try {
    const value = await readFromDb();
    cached = { value, expiresAt: now + CACHE_TTL_MS };
    return value;
  } catch {
    // Fail closed-to-vulnerable so a DB blip doesn't lock out the demo.
    return cached.value;
  }
};

const setSecureMode = async (next) => {
  const value = next ? 'true' : 'false';
  await db.query(
    `INSERT INTO system_config (config_key, config_value)
     VALUES ('secure_mode', ?)
     ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)`,
    [value]
  );
  cached = { value: next === true, expiresAt: Date.now() + CACHE_TTL_MS };
  return cached.value;
};

const invalidateCache = () => { cached.expiresAt = 0; };

module.exports = { isSecureMode, setSecureMode, invalidateCache };


