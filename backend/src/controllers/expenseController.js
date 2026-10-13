const Expense = require('../models/Expense');
const Site = require('../models/Site');
const mongoose = require('mongoose');

// GET /api/expenses
exports.getExpenses = async (req, res, next) => {
  try {
    const { siteId, category, limit } = req.query;

    const query = {};
    if (siteId && siteId !== 'All' && mongoose.Types.ObjectId.isValid(siteId)) {
      query.siteId = siteId;
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    let expenseQuery = Expense.find(query)
      .populate('siteId', 'name location clientName status')
      .sort({ date: -1, createdAt: -1 });

    if (limit && !isNaN(limit)) {
      expenseQuery = expenseQuery.limit(Number(limit));
    }

    const expenses = await expenseQuery.lean();

    const formattedExpenses = expenses.map((exp) => ({
      ...exp,
      siteName: exp.siteId ? exp.siteId.name : 'Unknown Site',
      pendingAmount: Math.max(0, (exp.amount || 0) - (exp.paidAmount || 0)),
    }));

    res.json({
      success: true,
      count: formattedExpenses.length,
      data: formattedExpenses,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses/:id
exports.getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('siteId', 'name location clientName budget')
      .lean();

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    res.json({
      success: true,
      data: {
        ...expense,
        siteName: expense.siteId ? expense.siteId.name : 'Unknown Site',
        pendingAmount: Math.max(0, (expense.amount || 0) - (expense.paidAmount || 0)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/expenses
exports.createExpense = async (req, res, next) => {
  try {
    const {
      siteId,
      date,
      description,
      category = 'Material',
      supplier = '',
      material = '',
      quantity,
      unit = 'Bags',
      ratePerUnit,
      paidAmount = 0,
      paymentMethod = 'Bank Transfer',
      remark = '',
    } = req.body;

    // Required fields validation
    if (!siteId) {
      return res.status(400).json({ success: false, message: 'Construction Site is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({ success: false, message: 'Invalid site ID provided' });
    }

    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Selected Construction Site does not exist' });
    }

    const numQty = Number(quantity);
    const numRate = Number(ratePerUnit);

    if (isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    if (isNaN(numRate) || numRate <= 0) {
      return res.status(400).json({ success: false, message: 'Rate per unit must be a positive number' });
    }

    const calculatedAmount = Math.round(numQty * numRate * 100) / 100;
    const finalDescription = description && description.trim()
      ? description.trim()
      : `${material || category || 'Expense'} – ${numQty} ${unit}`;

    const numPaid = paidAmount !== undefined && paidAmount !== null && paidAmount !== '' ? Number(paidAmount) : 0;
    if (isNaN(numPaid) || numPaid < 0) {
      return res.status(400).json({ success: false, message: 'Paid amount cannot be negative' });
    }

    const expense = await Expense.create({
      siteId,
      date: date || new Date(),
      description: finalDescription,
      category,
      supplier: supplier.trim(),
      material: material.trim(),
      quantity: numQty,
      unit: unit.trim(),
      ratePerUnit: numRate,
      amount: calculatedAmount,
      paidAmount: numPaid,
      paymentMethod,
      remark: remark ? remark.trim() : '',
    });

    const populated = await Expense.findById(expense._id)
      .populate('siteId', 'name location clientName')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Expense entry recorded successfully',
      data: {
        ...populated,
        siteName: populated.siteId ? populated.siteId.name : site.name,
        pendingAmount: Math.max(0, calculatedAmount - numPaid),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/expenses/:id
exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    const {
      siteId,
      date,
      description,
      category,
      supplier,
      material,
      quantity,
      unit,
      ratePerUnit,
      paidAmount,
      paymentMethod,
      remark,
    } = req.body;

    if (siteId) {
      if (!mongoose.Types.ObjectId.isValid(siteId)) {
        return res.status(400).json({ success: false, message: 'Invalid site ID' });
      }
      const site = await Site.findById(siteId);
      if (!site) {
        return res.status(404).json({ success: false, message: 'Site not found' });
      }
      expense.siteId = siteId;
    }

    if (date) expense.date = date;
    if (description !== undefined) expense.description = description;
    if (category) expense.category = category;
    if (supplier !== undefined) expense.supplier = supplier;
    if (material !== undefined) expense.material = material;
    if (unit !== undefined) expense.unit = unit;
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (remark !== undefined) expense.remark = remark;

    if (quantity !== undefined) {
      const q = Number(quantity);
      if (isNaN(q) || q <= 0) return res.status(400).json({ success: false, message: 'Quantity must be > 0' });
      expense.quantity = q;
    }

    if (ratePerUnit !== undefined) {
      const r = Number(ratePerUnit);
      if (isNaN(r) || r <= 0) return res.status(400).json({ success: false, message: 'Rate must be > 0' });
      expense.ratePerUnit = r;
    }

    expense.amount = Math.round(expense.quantity * expense.ratePerUnit * 100) / 100;

    if (paidAmount !== undefined) {
      const p = Number(paidAmount);
      if (isNaN(p) || p < 0) return res.status(400).json({ success: false, message: 'Paid amount cannot be negative' });
      expense.paidAmount = p;
    }

    await expense.save();

    const populated = await Expense.findById(expense._id)
      .populate('siteId', 'name location clientName')
      .lean();

    res.json({
      success: true,
      message: 'Expense record updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/expenses/:id
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    res.json({
      success: true,
      message: 'Expense record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
