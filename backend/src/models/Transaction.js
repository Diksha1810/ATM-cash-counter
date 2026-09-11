const mongoose = require('mongoose');

const dispensedNoteSchema = new mongoose.Schema(
  {
    denomination: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    dispensedNotes: [dispensedNoteSchema],
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },
    syncId: { type: String, default: null, index: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
