let express = require('express');
const { contactController, getContacts, deleteContact } = require('../controllers/contact.controller');
const { propertyController, getPropertiesController, editPropertyController, getFeaturedPropertiesController, getHotPropertiesController, getPropertyDetails, getPropertiesAdminController, deletePropertyController } = require('../controllers/property.controller');
const multer = require('multer');
const Property = require('../models/property');
const { userController, updateUser, loginUser, verifyToken, logoutUser } = require('../controllers/user.controller');

let router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });


router.post('/api/contact', contactController);
router.post('/api/get/contacts', getContacts);
router.post('/api/delete/contact', deleteContact);
router.post('/api/add/property', upload.array('images'), propertyController);
router.post("/api/edit/property", upload.array("images"), editPropertyController);
router.post('/api/get/all/properties', getPropertiesController);
router.post('/api/get/all/properties/admin', getPropertiesAdminController);
router.post('/api/delete/property/admin', deletePropertyController);
router.post('/api/get/featured/properties', getFeaturedPropertiesController);
router.post('/api/get/hot/properties', getHotPropertiesController);
router.post('/api/get/property/details', getPropertyDetails);
router.post('/api/update/user', updateUser);
router.post('/api/login/user', loginUser);
router.post('/api/verify/token', verifyToken);
router.post('/api/logout/user', logoutUser);




module.exports = router;