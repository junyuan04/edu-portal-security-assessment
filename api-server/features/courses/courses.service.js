const model = require('./courses.model');

const getAllCourses = async (categoryId) => {
  return model.findAll(categoryId || null);
};

const searchCourses = async (keyword) => {
  if (!keyword?.trim()) return model.findAll(null);
  return model.search(keyword.trim());
};

const getCourseById = async (id) => {
  const course = await model.findById(id);
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return course;
};

const getCourseMaterials = async (courseId) => {
  await getCourseById(courseId);
  return model.findMaterials(courseId);
};

module.exports = { getAllCourses, searchCourses, getCourseById, getCourseMaterials };


