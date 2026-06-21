const { Router } = require('express');
const { isSecureMode, setSecureMode } = require('../../config/secureMode');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth.middleware');
const { generateToken } = require('../auth/auth.service');

const router = Router();

// Public
router.get('/secure-mode', async (_req, res, next) => {
  try {
    res.json({ secure: await isSecureMode() });
  } catch (err) { next(err); }
});

// Any logged-in user can flip
router.put('/secure-mode', authMiddleware, async (req, res, next) => {
  try {
    const { secure } = req.body;
    if (typeof secure !== 'boolean') {
      return res.status(400).json({ error: 'secure (boolean) is required' });
    }
    const value = await setSecureMode(secure);
    const token = generateToken(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      value
    );
    res.json({ secure: value, token });
  } catch (err) { next(err); }
});

module.exports = router;


