const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { updateUser, deleteUser } = require('../controllers/users');

router.put('/:userId', authMiddleware, updateUser);
router.delete('/:userId', authMiddleware, deleteUser);

module.exports = router;
