// api-server is a separate process and reads the same system_config row independently.

const db = require('./db');

const CACHE_TTL_MS = 5000;
let cached = { value: false, expiresAt: 0 };

const isSecureMode = async () => {
  const now = Date.now();
  if (now < cached.expiresAt) return cached.value;
  try {
    const [rows] = await db.query(
      "SELECT config_value FROM system_config WHERE config_key = 'secure_mode'"
    );
    const value = rows[0]?.config_value === 'true';
    cached = { value, expiresAt: now + CACHE_TTL_MS };
    return value;
  } catch {
    return cached.value;
  }
};

module.exports = { isSecureMode };


