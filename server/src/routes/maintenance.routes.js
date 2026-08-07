const express = require('express');
const maintenanceController = require('../controllers/maintenance.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { createMaintenanceSchema, updateMaintenanceSchema } = require('../validators/maintenance.validator');
const { ROLES } = require('../constants');

const router = express.Router();

// All maintenance routes require admin authentication
router.use(authenticate, authorize(ROLES.ADMIN));

router.post('/', validate(createMaintenanceSchema), maintenanceController.createMaintenance);
router.get('/', maintenanceController.getMaintenanceWindows);
router.put('/:id', validate(updateMaintenanceSchema), maintenanceController.updateMaintenance);
router.delete('/:id', maintenanceController.deleteMaintenance);

module.exports = router;
