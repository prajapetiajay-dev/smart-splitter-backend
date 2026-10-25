const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true }, // जैसे: "Dinner at Resto"
  amount: { type: Number, required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // किसने पैसे दिए
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  splitBetween: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amountOwed: { type: Number, required: true } // उस दोस्त के हिस्से का अमाउंट
  }],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);
