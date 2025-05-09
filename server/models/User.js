const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'boss', 'admin'], default: 'employee' },
  name: { type: String, required: true },
});
module.exports = mongoose.model('User', userSchema);