const service = require('./user.service');

const getMyProfile = async (req, res, next) => {
  try {
    const profile = await service.getMyProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const { fullName, bio, phone, institution, avatarUrl } = req.body;

    const updated = await service.updateMyProfile(req.user.id, {
      fullName,
      bio,
      phone,
      institution,
      avatarUrl,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const profile = await service.getPublicProfile(Number(req.params.id));
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyProfile, updateMyProfile, getPublicProfile };


