const service = require('./users.service');

const getMyProfile = async (req, res, next) => {
  try {
    const user = await service.getMyProfile(req.user.id);
    res.json(user);
  } catch (err) { next(err); }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const user = await service.getPublicProfile(Number(req.params.id));
    res.json(user);
  } catch (err) { next(err); }
};

module.exports = { getMyProfile, getPublicProfile };


