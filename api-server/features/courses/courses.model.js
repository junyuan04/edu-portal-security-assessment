const db = require('../../config/db');

const findAll = async (categoryId) => {
  const base = `
    SELECT c.id, c.title, c.slug, c.description, c.price, c.level,
           c.duration_hrs, c.thumbnail_url, c.created_at,
           cat.name AS category, u.username AS instructor
    FROM courses c
    JOIN categories cat ON cat.id = c.category_id
    JOIN users      u   ON u.id   = c.instructor_id
    WHERE c.is_published = 1`;

  if (categoryId) {
    const [rows] = await db.query(base + ' AND c.category_id = ? ORDER BY c.created_at DESC', [categoryId]);
    return rows;
  }
  const [rows] = await db.query(base + ' ORDER BY c.created_at DESC');
  return rows;
};

// Parameterised search
const search = async (keyword) => {
  const [rows] = await db.query(
    `SELECT c.id, c.title, c.slug, c.price, c.level, c.thumbnail_url,
            cat.name AS category, u.username AS instructor
     FROM courses c
     JOIN categories cat ON cat.id = c.category_id
     JOIN users      u   ON u.id   = c.instructor_id
     WHERE (c.title LIKE ? OR c.description LIKE ?)
       AND c.is_published = 1
     ORDER BY c.created_at DESC`,
    [`%${keyword}%`, `%${keyword}%`]
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT c.*, cat.name AS category, u.username AS instructor
     FROM courses c
     JOIN categories cat ON cat.id = c.category_id
     JOIN users      u   ON u.id   = c.instructor_id
     WHERE c.id = ? AND c.is_published = 1`,
    [id]
  );
  return rows[0] || null;
};

// Course materials: returns all for enrolled users
const findMaterials = async (courseId) => {
  const [rows] = await db.query(
    `SELECT id, title, material_type, order_index, is_free
     FROM course_materials
     WHERE course_id = ?
     ORDER BY order_index ASC`,
    [courseId]
  );
  return rows;
};

module.exports = { findAll, search, findById, findMaterials };


