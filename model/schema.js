const mongoose = require('mongoose');

const SmartMeterSchema = new mongoose.Schema({
  smartMeterAddress: { type: String, required: true },
  energyUsage: { type: Number, required: true },
  energyBalance: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const SmartMeter = mongoose.model('SmartMeter', SmartMeterSchema);

module.exports = SmartMeter;
