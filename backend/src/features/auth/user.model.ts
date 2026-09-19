import { Schema, model } from 'mongoose';

const freshnessSchema = new Schema({
  source: { type: String, enum: ['label', 'estimated', 'user_confirmed'], required: true },
  bestByDate: Date,
  estimatedStartDate: Date,
  estimatedEndDate: Date,
  confidence: { type: Number, required: true, min: 0, max: 1 },
  confidenceLabel: { type: String, enum: ['high', 'medium', 'low'], required: true },
  evidence: { type: [String], default: [] },
}, { _id: false });

const pantryItemSchema = new Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, default: 'unknown' },
  storageMethod: { type: String, enum: ['refrigerated', 'frozen', 'pantry'], default: 'refrigerated' },
  purchasedAt: { type: Date, default: Date.now },
  extractedText: { type: String, default: '' },
  freshness: { type: freshnessSchema, required: true },
}, { timestamps: true });

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'vendor'], default: 'customer' },
  neighbourhood: { type: String, default: 'Toronto, ON' },
  pantryItems: { type: [pantryItemSchema], default: [] },
}, { timestamps: true });

export const User = model('User', userSchema);
