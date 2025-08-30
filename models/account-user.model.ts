import mongoose from "mongoose";

const schema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  avatar: String,
  phone: String,

  // theo dõi hành vi
  recentClicks: {
    type: [String], // hoặc lưu object { itemId, timestamp }
    default: []
  },
  recentSearches: {
    type: [String],
    default: []
  },
  preferredLocations: {
    type: [String],
    default: []
  }

}, { timestamps: true });

const AccountUser = mongoose.model('AccountUser', schema, "accounts-user");

export default AccountUser;
