const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const profileRoutes = require('./routes/profileRoutes');

const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger'); // <-- NEW CLEAN SWAGGER FILE

const app = express();

app.use(express.json());
app.use(cors());

// --------------------------
// Root Home Page
// --------------------------
app.get('/', (req, res) => {
	res.send(`
		<html>
			<head><title>MockMate Backend API</title></head>
			<body>
				<h1>MockMate Backend API</h1>
				<p>Welcome! Visit <a href="/api-docs">/api-docs</a> for full API documentation.</p>
				<p>Use Postman, Insomnia, or Swagger UI for testing.</p>
			</body>
		</html>
	`);
});

// --------------------------
//      ROUTES MOUNTING
// --------------------------

// Auth Routes (Register, Login)
app.use('/api/auth', authRoutes);

// Profile Routes (Me, Update Profile, Update Password)
app.use('/api/profile', profileRoutes);

// Pre-Interview + Interview Session + AI Features
app.use('/api/interview', interviewRoutes);

// Performance Routes (Results, History)
app.use('/api/performance', performanceRoutes);

// --------------------------
// Swagger Documentation
// --------------------------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --------------------------
// Error Handlers
// --------------------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
