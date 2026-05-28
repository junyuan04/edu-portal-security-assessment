const service = require('./course.service');

const listCourses = async (req, res, next) => {
  try {
    const { category } = req.query;
    const courses = await service.getAllCourses(category);
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

const searchCourses = async (req, res, next) => {
  try {
    const results = await service.searchCourses(req.query.q);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await service.getCourseById(Number(req.params.id));
    res.json(course);
  } catch (err) {
    next(err);
  }
};

const getCourseBySlug = async (req, res, next) => {
  try {
    const course = await service.getCourseBySlug(req.params.slug);
    res.json(course);
  } catch (err) {
    next(err);
  }
};

const getCourseMaterials = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const materials = await service.getCourseMaterials(Number(req.params.id), userId);
    res.json(materials);
  } catch (err) {
    next(err);
  }
};

const getCourseReviews = async (req, res, next) => {
  try {
    const reviews = await service.getCourseReviews(Number(req.params.id));
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const reviews = await service.addReview(Number(req.params.id), req.user.id, { rating, comment });
    res.status(201).json(reviews);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCourses,
  searchCourses,
  getCourseById,
  getCourseBySlug,
  getCourseMaterials,
  getCourseReviews,
  addReview,
};


