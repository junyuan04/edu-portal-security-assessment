const model = require('./user.model');
const { isSecureMode } = require('../../config/secureMode');

// Cheap HTML strip
const stripHtml = (s) => (s == null ? s : String(s).replace(/<[^>]*>/g, ''));

const getMyProfile = async (userId) => {
  const profile = await model.findProfileByUserId(userId);

  if (!profile) {
    const err = new Error('Profile not found');
    err.status = 404;
    throw err;
  }

  return profile;
};

const updateMyProfile = async (userId, data) => {
  // Vulnerable path: bio stored as raw HTML.
  // Secure path: strip tags before persisting so a stale XSS payload doesn't survive
  const payload = (await isSecureMode())
    ? { ...data, bio: stripHtml(data.bio) }
    : data;
  await model.updateProfile(userId, payload);
  return model.findProfileByUserId(userId);
};

const getPublicProfile = async (userId) => {
  const profile = await model.findPublicProfileByUserId(userId);

  if (!profile) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return profile;
};

module.exports = { getMyProfile, updateMyProfile, getPublicProfile };


