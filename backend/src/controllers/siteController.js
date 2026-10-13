const Site = require('../models/Site');
const Expense = require('../models/Expense');

// GET /api/sites
exports.getSites = async (req, res, next) => {
  try {
    const { search, status, sort = 'newest' } = req.query;

    const query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { clientName: regex }, { location: regex }];
    }

    if (status && status !== 'All Status' && status !== 'All') {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'budget-desc') {
      sortOption = { budget: -1 };
    } else if (sort === 'budget-asc') {
      sortOption = { budget: 1 };
    }

    const sites = await Site.find(query).sort(sortOption).lean();

    // Fetch expense totals aggregated by site
    const expenseTotals = await Expense.aggregate([
      {
        $group: {
          _id: '$siteId',
          totalSpent: { $sum: '$amount' },
          totalPaid: { $sum: '$paidAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const expenseMap = {};
    expenseTotals.forEach((item) => {
      expenseMap[item._id.toString()] = item;
    });

    const enrichedSites = sites.map((site) => {
      const expInfo = expenseMap[site._id.toString()] || { totalSpent: 0, totalPaid: 0, count: 0 };
      const totalSpent = expInfo.totalSpent;
      const remainingBudget = Math.max(0, site.budget - totalSpent);
      const balanceReceivable = Math.max(0, (site.contractValue || site.budget) - (site.clientReceived || 0));

      return {
        ...site,
        totalSpent,
        remainingBudget,
        balanceReceivable,
        expenseCount: expInfo.count,
      };
    });

    // Calculate global stats for all sites (not filtered by search/status for the cards)
    const allSites = await Site.find().lean();
    const stats = {
      totalSites: allSites.length,
      sitesInProgress: allSites.filter((s) => s.status === 'In Progress').length,
      completed: allSites.filter((s) => s.status === 'Completed').length,
      onHold: allSites.filter((s) => s.status === 'On Hold').length,
    };

    res.json({
      success: true,
      count: enrichedSites.length,
      stats,
      data: enrichedSites,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/sites/:id
exports.getSiteById = async (req, res, next) => {
  try {
    const site = await Site.findById(req.params.id).lean();

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Construction site not found',
      });
    }

    // Get all expenses for this site
    const expenses = await Expense.find({ siteId: site._id }).sort({ date: -1, createdAt: -1 }).lean();

    const totalSpent = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalPaid = expenses.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
    const remainingBudget = Math.max(0, site.budget - totalSpent);
    const clientReceived = site.clientReceived || 0;
    const balanceReceivable = Math.max(0, (site.contractValue || site.budget) - clientReceived);

    // Calculate category breakdown
    const categoryTotals = {};
    expenses.forEach((item) => {
      const cat = item.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + item.amount;
    });

    const categoryBreakdown = Object.keys(categoryTotals).map((cat) => {
      const amount = categoryTotals[cat];
      const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
      return {
        category: cat,
        amount,
        percentage,
      };
    });

    // Recent transactions (last 6 transactions)
    const recentTransactions = expenses.slice(0, 6);

    res.json({
      success: true,
      data: {
        ...site,
        totalSpent,
        totalPaid,
        remainingBudget,
        clientReceived,
        balanceReceivable,
        expenses,
        categoryBreakdown,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/sites
exports.createSite = async (req, res, next) => {
  try {
    const { name, location, clientName, budget, contractValue, clientReceived, status, startDate } = req.body;

    if (!name || !clientName || budget === undefined || budget === null) {
      return res.status(400).json({
        success: false,
        message: 'Name, client name, and budget are required fields',
      });
    }

    if (Number(budget) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget must be a positive number',
      });
    }

    const site = await Site.create({
      name: name.trim(),
      location: location ? location.trim() : 'Bengaluru',
      clientName: clientName.trim(),
      budget: Number(budget),
      contractValue: contractValue !== undefined ? Number(contractValue) : Number(budget),
      clientReceived: clientReceived !== undefined ? Number(clientReceived) : 0,
      status: status || 'In Progress',
      startDate: startDate || new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Construction site created successfully',
      data: site,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/sites/:id
exports.updateSite = async (req, res, next) => {
  try {
    const { name, location, clientName, budget, contractValue, clientReceived, status, startDate } = req.body;

    const site = await Site.findById(req.params.id);

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Construction site not found',
      });
    }

    if (name !== undefined) site.name = name.trim();
    if (location !== undefined) site.location = location.trim();
    if (clientName !== undefined) site.clientName = clientName.trim();
    if (budget !== undefined) {
      if (Number(budget) < 0) {
        return res.status(400).json({ success: false, message: 'Budget must be positive' });
      }
      site.budget = Number(budget);
    }
    if (contractValue !== undefined) site.contractValue = Number(contractValue);
    if (clientReceived !== undefined) site.clientReceived = Number(clientReceived);
    if (status !== undefined) site.status = status;
    if (startDate !== undefined) site.startDate = startDate;

    const updatedSite = await site.save();

    res.json({
      success: true,
      message: 'Construction site updated successfully',
      data: updatedSite,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/sites/:id
exports.deleteSite = async (req, res, next) => {
  try {
    const site = await Site.findById(req.params.id);

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Construction site not found',
      });
    }

    // Delete associated expenses
    await Expense.deleteMany({ siteId: site._id });
    await Site.findByIdAndDelete(site._id);

    res.json({
      success: true,
      message: 'Construction site and its associated expenses deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
