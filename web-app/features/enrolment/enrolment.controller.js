const service = require('./enrolment.service');

const getMyEnrolments = async (req, res, next) => {
  try {
    const enrolments = await service.getMyEnrolments(req.user.id);
    res.json(enrolments);
  } catch (err) {
    next(err);
  }
};

const getEnrolment = async (req, res, next) => {
  try {
    const enrolment = await service.getEnrolmentById(
      Number(req.params.id),
      req.user.id
    );
    res.json(enrolment);
  } catch (err) {
    next(err);
  }
};

const enrol = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const enrolment = await service.enrolInCourse(req.user.id, Number(courseId));
    res.status(201).json(enrolment);
  } catch (err) {
    next(err);
  }
};

const updateProgress = async (req, res, next) => {
  try {
    const { progressPct } = req.body;

    if (progressPct === undefined) {
      return res.status(400).json({ error: 'progressPct is required' });
    }

    const enrolment = await service.updateProgress(
      Number(req.params.id),
      req.user.id,
      Number(progressPct)
    );
    res.json(enrolment);
  } catch (err) {
    next(err);
  }
};

const cancelEnrolment = async (req, res, next) => {
  try {
    const result = await service.cancelEnrolment(
      Number(req.params.id),
      req.user.id
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyEnrolments,
  getEnrolment,
  enrol,
  updateProgress,
  cancelEnrolment,
};


