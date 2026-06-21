const service = require('./enrolments.service');
const { isSecureMode } = require('../../config/secureMode');

const getMyEnrolments = async (req, res, next) => {
  try {
    const enrolments = await service.getMyEnrolments(req.user.id);
    res.json(enrolments);
  } catch (err) { next(err); }
};

const getEnrolment = async (req, res, next) => {
  try {
    const enrolment = await service.getEnrolmentById(Number(req.params.id));

    if (await isSecureMode()) {
      // Secure Mode: only the owner (or admin) can read an enrolment record.
      if (!enrolment) return res.status(404).json({ error: 'Enrolment not found' });
      const isOwner = enrolment.user_id === req.user.id;
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ error: 'Enrolment not found' });
      }
    }
    // Vulnerable path: no ownership check
    res.json(enrolment);
  } catch (err) { next(err); }
};

const createEnrolment = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }
    const enrolment = await service.createEnrolment(req.user.id, Number(courseId));
    res.status(201).json(enrolment);
  } catch (err) { next(err); }
};

module.exports = { getMyEnrolments, getEnrolment, createEnrolment };


