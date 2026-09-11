const mongoose = require('mongoose');

const denominationSchema = new mongoose.Schema(
  {
    denomination: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const atmSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    denominations: [denominationSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ATM', atmSchema);
