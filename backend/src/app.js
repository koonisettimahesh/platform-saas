const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');


const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => res.send('Backend is running'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));


// Routes
app.use('/api', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);   // tenant + tenant users
app.use('/api/users', userRoutes);       // user update/delete
app.use('/api/projects', projectRoutes); // projects

// Error Handler (LAST)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

module.exports = app;
