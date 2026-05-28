const service = require('./enrolments.service');

const getMyEnrolments = async (req, res, next) => {
  try {
    const enrolments = await service.getMyEnrolments(req.user.id);
    res.json(enrolments);
  } catch (err) { next(err); }
};

const getEnrolment = async (req, res, next) => {
  try {
    const enrolment = await service.getEnrolmentById(Number(req.params.id));
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


