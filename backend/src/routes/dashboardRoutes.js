const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getBankAccounts,
  getRecentExpenses,
} = require('../controllers/dashboardController');

router.get('/summary', getDashboardSummary);
router.get('/bank-accounts', getBankAccounts);
router.get('/recent-expenses', getRecentExpenses);

module.exports = router;
