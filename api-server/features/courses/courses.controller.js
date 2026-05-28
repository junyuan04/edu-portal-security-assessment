const service = require('./courses.service');

const listCourses = async (req, res, next) => {
  try {
    const courses = await service.getAllCourses(req.query.category);
    res.json(courses);
  } catch (err) { next(err); }
};

const searchCourses = async (req, res, next) => {
  try {
    const results = await service.searchCourses(req.query.q);
    res.json(results);
  } catch (err) { next(err); }
};

const getCourse = async (req, res, next) => {
  try {
    const course = await service.getCourseById(Number(req.params.id));
    res.json(course);
  } catch (err) { next(err); }
};

const getCourseMaterials = async (req, res, next) => {
  try {
    const materials = await service.getCourseMaterials(Number(req.params.id));
    res.json(materials);
  } catch (err) { next(err); }
};

module.exports = { listCourses, searchCourses, getCourse, getCourseMaterials };


