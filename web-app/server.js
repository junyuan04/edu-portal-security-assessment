require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const { errorMiddleware  } = require('./middleware/error.middleware');
const { loggerMiddleware } = require('./middleware/logger.middleware');

const authRoutes       = require('./features/auth/auth.routes');
const userRoutes       = require('./features/user/user.routes');
const courseRoutes     = require('./features/course/course.routes');
const enrolmentRoutes  = require('./features/enrolment/enrolment.routes');
const paymentRoutes    = require('./features/payment/payment.routes');
const adminRoutes      = require('./features/admin/admin.routes');
const systemRoutes     = require('./features/system/system.routes');

const app  = express();
const PORT = process.env.WEB_APP_PORT || 3000;

// Global middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(loggerMiddleware);

// Routes
app.use('/api/auth',       authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/courses',    courseRoutes);
app.use('/api/enrolments', enrolmentRoutes);
app.use('/api/payments',   paymentRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/system',     systemRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'web-app' }));

// Global error handler
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[web-app] Running on port ${PORT} — env: ${process.env.NODE_ENV}`);
});


