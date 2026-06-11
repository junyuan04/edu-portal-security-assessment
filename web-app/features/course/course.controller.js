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

const getMyReview = async (req, res, next) => {
  try {
    const review = await service.getMyReviewForCourse(Number(req.params.id), req.user.id);
    res.json(review || null);
  } catch (err) { next(err); }
};

const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await service.updateReview(Number(req.params.reviewId), req.user.id, { rating, comment });
    res.json(review);
  } catch (err) { next(err); }
};

const deleteReview = async (req, res, next) => {
  try {
    const result = await service.deleteReview(Number(req.params.reviewId), req.user);
    res.json(result);
  } catch (err) { next(err); }
};

const createCourse = async (req, res, next) => {
  try {
    const course = await service.createCourse(req.user.id, req.body);
    res.status(201).json(course);
  } catch (err) { next(err); }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await service.updateCourse(Number(req.params.id), req.body);
    res.json(course);
  } catch (err) { next(err); }
};

const deleteCourse = async (req, res, next) => {
  try {
    const result = await service.deleteCourse(Number(req.params.id));
    res.json(result);
  } catch (err) { next(err); }
};

const createMaterial = async (req, res, next) => {
  try {
    const material = await service.createMaterial(Number(req.params.id), req.body);
    res.status(201).json(material);
  } catch (err) { next(err); }
};

const updateMaterial = async (req, res, next) => {
  try {
    const material = await service.updateMaterial(Number(req.params.matId), req.body);
    res.json(material);
  } catch (err) { next(err); }
};

const deleteMaterial = async (req, res, next) => {
  try {
    const result = await service.deleteMaterial(Number(req.params.matId));
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = {
  listCourses,
  searchCourses,
  getCourseById,
  getCourseBySlug,
  getCourseMaterials,
  getCourseReviews,
  addReview, getMyReview, updateReview, deleteReview,
  createCourse, updateCourse, deleteCourse,
  createMaterial, updateMaterial, deleteMaterial,
};


