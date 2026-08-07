const express = require('express');
const spaceController = require('../controllers/space.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { createSpaceSchema, updateSpaceSchema } = require('../validators/space.validator');
const { ROLES } = require('../constants');

const router = express.Router();

// Public routes (Visitor-accessible)
router.get('/', spaceController.getSpaces);
router.get('/:id', spaceController.getSpaceById);
router.get('/:id/availability', spaceController.getSpaceAvailability);

// Admin-only routes
router.post('/', authenticate, authorize(ROLES.ADMIN), validate(createSpaceSchema), spaceController.createSpace);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), validate(updateSpaceSchema), spaceController.updateSpace);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), spaceController.deleteSpace);

module.exports = router;
