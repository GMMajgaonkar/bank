const Site = require('../models/Site');
const Expense = require('../models/Expense');
const BankAccount = require('../models/BankAccount');

// GET /api/dashboard/summary
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const sites = await Site.find().lean();
    const expenses = await Expense.find().lean();
    const bankAccounts = await BankAccount.find().lean();

    const totalSites = sites.length;
    const sitesInProgress = sites.filter((s) => s.status === 'In Progress').length;
    const completed = sites.filter((s) => s.status === 'Completed').length;
    const onHold = sites.filter((s) => s.status === 'On Hold').length;

    const totalBudget = sites.reduce((sum, s) => sum + (s.budget || 0), 0);
    const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const remainingBudget = Math.max(0, totalBudget - totalSpent);
    const totalPaid = expenses.reduce((sum, e) => sum + (e.paidAmount || 0), 0);

    // Compute site overview cards (top active sites)
    const expenseTotalsBySite = {};
    expenses.forEach((e) => {
      const sId = e.siteId.toString();
      expenseTotalsBySite[sId] = (expenseTotalsBySite[sId] || 0) + e.amount;
    });

    const siteCards = sites.slice(0, 4).map((site) => {
      const spent = expenseTotalsBySite[site._id.toString()] || 0;
      const remaining = Math.max(0, site.budget - spent);
      const budgetUtilizedPercent = site.budget > 0 ? Math.min(100, Math.round((spent / site.budget) * 100)) : 0;
      const remainingPercent = 100 - budgetUtilizedPercent;

      return {
        _id: site._id,
        name: site.name,
        location: site.location,
        clientName: site.clientName,
        budget: site.budget,
        totalSpent: spent,
        remainingBudget: remaining,
        status: site.status,
        budgetUtilizedPercent,
        remainingPercent,
        hasBudgetAlert: spent > site.budget * 0.85,
      };
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalSites,
          sitesInProgress,
          completed,
          onHold,
          totalBudget,
          totalSpent,
          remainingBudget,
          totalPaid,
          activeAccountsCount: bankAccounts.length,
        },
        siteCards,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/bank-accounts
exports.getBankAccounts = async (req, res, next) => {
  try {
    let accounts = await BankAccount.find().sort({ createdAt: 1 }).lean();

    // If no bank accounts, return default initial set
    if (!accounts || accounts.length === 0) {
      accounts = [
        { bankName: 'Bank One', accountIdentifier: 'ACCOUNT #01', code: 'B1', balance: 100000, credit: 50000, status: 'active' },
        { bankName: 'Bank Two', accountIdentifier: 'ACCOUNT #02', code: 'B2', balance: 100000, credit: 50000, status: 'active' },
        { bankName: 'Bank Three', accountIdentifier: 'ACCOUNT #03', code: 'B3', balance: 100000, credit: 50000, status: 'active' },
        { bankName: 'Bank Four', accountIdentifier: 'ACCOUNT #04', code: 'B4', balance: 100000, credit: 50000, status: 'active' },
      ];
      await BankAccount.insertMany(accounts);
      accounts = await BankAccount.find().sort({ createdAt: 1 }).lean();
    }

    res.json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/recent-expenses
exports.getRecentExpenses = async (req, res, next) => {
  try {
    const { siteId, limit = 10 } = req.query;

    const query = {};
    if (siteId && siteId !== 'All') {
      query.siteId = siteId;
    }

    const expenses = await Expense.find(query)
      .populate('siteId', 'name location clientName')
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit))
      .lean();

    const formatted = expenses.map((exp) => ({
      _id: exp._id,
      date: exp.date,
      description: exp.description,
      site: exp.siteId ? exp.siteId.name : 'Unknown Site',
      siteId: exp.siteId ? exp.siteId._id : null,
      category: exp.category,
      amount: exp.amount,
      paid: exp.paidAmount,
      pending: Math.max(0, exp.amount - exp.paidAmount),
      supplier: exp.supplier,
      material: exp.material,
      quantity: exp.quantity,
      unit: exp.unit,
      ratePerUnit: exp.ratePerUnit,
      paymentMethod: exp.paymentMethod,
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};
