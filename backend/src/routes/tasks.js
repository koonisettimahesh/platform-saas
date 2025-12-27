const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  createTask,
  listProjectTasks,
  updateTaskStatus,
  updateTask
} = require('../controllers/tasks');

// API 16: Create Task
router.post(
  '/projects/:projectId/tasks',
  auth,
  createTask
);

// API 17: List Project Tasks
router.get(
  '/projects/:projectId/tasks',
  auth,
  listProjectTasks
);

// API 18: Update Task Status
router.patch(
  '/tasks/:taskId/status',
  auth,
  updateTaskStatus
);

// API 19: Update Task
router.put(
  '/tasks/:taskId',
  auth,
  updateTask
);

module.exports = router;
