const db = require('../../config/db');
const { isSecureMode } = require('../../config/secureMode');

const RATING_AGG = `
  (SELECT COALESCE(AVG(rating), 0) FROM course_reviews WHERE course_id = c.id) AS avg_rating,
  (SELECT COUNT(*)                FROM course_reviews WHERE course_id = c.id) AS review_count`;

// List all published courses
const findAllPublished = async (categoryId) => {
  const base = `
    SELECT c.id, c.title, c.slug, c.description, c.price, c.level,
           c.duration_hrs, c.thumbnail_url, c.created_at,
           cat.name AS category,
           u.username AS instructor,
           ${RATING_AGG}
    FROM courses c
    JOIN categories cat ON cat.id = c.category_id
    JOIN users      u   ON u.id   = c.instructor_id
    WHERE c.is_published = 1`;

  if (categoryId) {
    const [rows] = await db.query(base + ' AND c.category_id = ?', [categoryId]);
    return rows;
  }

  const [rows] = await db.query(base);
  return rows;
};

const search = async (keyword) => {
  const SELECT_COLS = `SELECT c.id, c.title, c.slug, c.price, c.level, c.thumbnail_url, cat.name AS category, u.username AS instructor, ${RATING_AGG} FROM courses c JOIN categories cat ON cat.id = c.category_id JOIN users u ON u.id = c.instructor_id`;

  if (await isSecureMode()) {
    const safe = String(keyword || '').slice(0, 100).replace(/[\\%_]/g, '\\$&');
    const [rows] = await db.query(
      `${SELECT_COLS} WHERE (c.title LIKE ? OR c.description LIKE ?) AND c.is_published = 1`,
      [`%${safe}%`, `%${safe}%`]
    );
    return rows;
  }

  const query = `${SELECT_COLS} WHERE (c.title LIKE '%${keyword}%' OR c.description LIKE '%${keyword}%') AND c.is_published = 1`;
  const [rows] = await db.query(query);
  return rows;
};

// Find a single course by id
const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT c.*, cat.name AS category, u.username AS instructor,
            ${RATING_AGG}
     FROM courses c
     JOIN categories cat ON cat.id = c.category_id
     JOIN users      u   ON u.id   = c.instructor_id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Find a single course by slug
const findBySlug = async (slug) => {
  const [rows] = await db.query(
    `SELECT c.*, cat.name AS category, u.username AS instructor
     FROM courses c
     JOIN categories cat ON cat.id = c.category_id
     JOIN users      u   ON u.id   = c.instructor_id
     WHERE c.slug = ?`,
    [slug]
  );
  return rows[0] || null;
};

// Get materials
const getMaterials = async (courseId, isEnrolled) => {
  const condition = isEnrolled ? '' : 'AND m.is_free = 1';
  const [rows] = await db.query(
    `SELECT id, title, material_type, content_url, order_index, is_free
     FROM course_materials m
     WHERE m.course_id = ? ${condition}
     ORDER BY m.order_index ASC`,
    [courseId]
  );
  return rows;
};

// Get all reviews for a course
const getReviews = async (courseId) => {
  const [rows] = await db.query(
    `SELECT cr.id, cr.user_id, cr.rating, cr.comment, cr.created_at,
            u.username, p.full_name, p.avatar_url
     FROM course_reviews cr
     JOIN users u ON u.id = cr.user_id
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE cr.course_id = ?
     ORDER BY cr.created_at DESC`,
    [courseId]
  );
  return rows;
};

// Add or update a review
const upsertReview = async (courseId, userId, rating, comment) => {
  await db.query(
    `INSERT INTO course_reviews (course_id, user_id, rating, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
    [courseId, userId, rating, comment]
  );
};

// Find a single review by id
const findReviewById = async (reviewId) => {
  const [rows] = await db.query(
    `SELECT id, course_id, user_id, rating, comment, created_at
     FROM course_reviews
     WHERE id = ?`,
    [reviewId]
  );
  return rows[0] || null;
};

// Find the current user's review on a course
const findMyReviewForCourse = async (userId, courseId) => {
  const [rows] = await db.query(
    `SELECT id, course_id, user_id, rating, comment, created_at
     FROM course_reviews
     WHERE user_id = ? AND course_id = ?`,
    [userId, courseId]
  );
  return rows[0] || null;
};

// Partial update of a single review
const updateReview = async (reviewId, { rating, comment }) => {
  const [result] = await db.query(
    `UPDATE course_reviews SET
       rating  = COALESCE(?, rating),
       comment = COALESCE(?, comment)
     WHERE id = ?`,
    [rating ?? null, comment ?? null, reviewId]
  );
  return result.affectedRows;
};

const deleteReview = async (reviewId) => {
  const [result] = await db.query(
    `DELETE FROM course_reviews WHERE id = ?`,
    [reviewId]
  );
  return result.affectedRows;
};

// Course write operations (admin)

const createCourse = async (data) => {
  const [result] = await db.query(
    `INSERT INTO courses
       (category_id, instructor_id, title, slug, description, price,
        thumbnail_url, level, duration_hrs, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.categoryId,
      data.instructorId,
      data.title,
      data.slug,
      data.description || null,
      data.price ?? 0,
      data.thumbnailUrl || null,
      data.level || 'beginner',
      data.durationHrs ?? 0,
      data.isPublished ? 1 : 0,
    ]
  );
  return result.insertId;
};

const updateCourse = async (id, data) => {
  const [result] = await db.query(
    `UPDATE courses SET
       category_id   = COALESCE(?, category_id),
       title         = COALESCE(?, title),
       slug          = COALESCE(?, slug),
       description   = COALESCE(?, description),
       price         = COALESCE(?, price),
       thumbnail_url = COALESCE(?, thumbnail_url),
       level         = COALESCE(?, level),
       duration_hrs  = COALESCE(?, duration_hrs),
       is_published  = COALESCE(?, is_published)
     WHERE id = ?`,
    [
      data.categoryId    ?? null,
      data.title         ?? null,
      data.slug          ?? null,
      data.description   ?? null,
      data.price         ?? null,
      data.thumbnailUrl  ?? null,
      data.level         ?? null,
      data.durationHrs   ?? null,
      data.isPublished === undefined ? null : (data.isPublished ? 1 : 0),
      id,
    ]
  );
  return result.affectedRows;
};

const deleteCourse = async (id) => {
  const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
  return result.affectedRows;
};

// Course material write operations (admin)

const findMaterialById = async (matId) => {
  const [rows] = await db.query(
    'SELECT * FROM course_materials WHERE id = ?',
    [matId]
  );
  return rows[0] || null;
};

const createMaterial = async (courseId, data) => {
  const [result] = await db.query(
    `INSERT INTO course_materials
       (course_id, title, material_type, content_url, order_index, is_free)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      courseId,
      data.title,
      data.materialType || 'document',
      data.contentUrl || null,
      data.orderIndex ?? 0,
      data.isFree ? 1 : 0,
    ]
  );
  return result.insertId;
};

const updateMaterial = async (matId, data) => {
  const [result] = await db.query(
    `UPDATE course_materials SET
       title         = COALESCE(?, title),
       material_type = COALESCE(?, material_type),
       content_url   = COALESCE(?, content_url),
       order_index   = COALESCE(?, order_index),
       is_free       = COALESCE(?, is_free)
     WHERE id = ?`,
    [
      data.title         ?? null,
      data.materialType  ?? null,
      data.contentUrl    ?? null,
      data.orderIndex    ?? null,
      data.isFree === undefined ? null : (data.isFree ? 1 : 0),
      matId,
    ]
  );
  return result.affectedRows;
};

const deleteMaterial = async (matId) => {
  const [result] = await db.query(
    'DELETE FROM course_materials WHERE id = ?',
    [matId]
  );
  return result.affectedRows;
};

module.exports = {
  findAllPublished, search, findById, findBySlug,
  getMaterials, getReviews, upsertReview,
  findReviewById, findMyReviewForCourse, updateReview, deleteReview,
  createCourse, updateCourse, deleteCourse,
  findMaterialById, createMaterial, updateMaterial, deleteMaterial,
};


