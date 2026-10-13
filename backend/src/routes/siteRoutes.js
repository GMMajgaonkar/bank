const express = require('express');
const router = express.Router();
const {
  getSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
} = require('../controllers/siteController');

router.route('/')
  .get(getSites)
  .post(createSite);

router.route('/:id')
  .get(getSiteById)
  .put(updateSite)
  .delete(deleteSite);

module.exports = router;
