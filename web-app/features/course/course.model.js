const db = require('../../config/db');

// List all published courses
const findAllPublished = async (categoryId) => {
  const base = `
    SELECT c.id, c.title, c.slug, c.description, c.price, c.level,
           c.duration_hrs, c.thumbnail_url, c.created_at,
           cat.name AS category,
           u.username AS instructor
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
  const query = `SELECT c.id, c.title, c.slug, c.price, c.level, c.thumbnail_url, cat.name AS category, u.username AS instructor FROM courses c JOIN categories cat ON cat.id = c.category_id JOIN users u ON u.id = c.instructor_id WHERE (c.title LIKE '%${keyword}%' OR c.description LIKE '%${keyword}%') AND c.is_published = 1`;
  const [rows] = await db.query(query);
  return rows;
};

// Find a single course by id
const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT c.*, cat.name AS category, u.username AS instructor
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
    `SELECT cr.id, cr.rating, cr.comment, cr.created_at,
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

module.exports = { findAllPublished, search, findById, findBySlug, getMaterials, getReviews, upsertReview };


