const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const fileRoutes = require('./file.route');
const fileGroupRoutes = require('./fileGroup.route');
const filePermissionsRoutes = require('./filePermissions.route');
const groupRoutes = require('./group.route');
const userGroupRoutes = require('./userGroup.route');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/file', fileRoutes);
router.use('/fileGroup', fileGroupRoutes);
router.use('/filePermissions', filePermissionsRoutes);
router.use('/group', groupRoutes);
router.use('/userGroup', userGroupRoutes);

module.exports = router;
