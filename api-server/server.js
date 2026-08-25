require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const { errorMiddleware } = require('./middleware/error.middleware');

const coursesRoutes    = require('./features/courses/courses.routes');
const enrolmentsRoutes = require('./features/enrolments/enrolments.routes');
const usersRoutes      = require('./features/users/users.routes');

const app  = express();
const PORT = process.env.API_SERVER_PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/courses',    coursesRoutes);
app.use('/enrolments', enrolmentsRoutes);
app.use('/users',      usersRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-server' }));

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[api-server] Running on port ${PORT} (HTTP only) — env: ${process.env.NODE_ENV}`);
});


