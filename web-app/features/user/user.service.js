const model = require('./user.model');

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
  // bio is stored as-is (no strip_tags, no DOMPurify, no escaping)
  await model.updateProfile(userId, data);
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


