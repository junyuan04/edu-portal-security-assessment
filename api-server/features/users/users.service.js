const model = require('./users.model');

const getMyProfile = async (userId) => {
  const user = await model.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

const getPublicProfile = async (id) => {
  const user = await model.findPublicById(id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

module.exports = { getMyProfile, getPublicProfile };


