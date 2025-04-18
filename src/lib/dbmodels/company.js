import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  address: String,
  website: String,
  industry: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Company = mongoose.model('Company', companySchema);
export default Company;
