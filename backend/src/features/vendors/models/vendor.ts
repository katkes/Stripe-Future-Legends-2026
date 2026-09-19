import mongoose, { Schema } from 'mongoose';

const vendorSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    bio: { type: String, default: '' },
    neighbourhood: { type: String, default: 'Toronto, ON' },
    stripeAccountId: { type: String, default: '' },
    payoutReady: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type VendorDocument = mongoose.InferSchemaType<typeof vendorSchema> & { _id: mongoose.Types.ObjectId };
export const VendorModel = mongoose.models.Vendor ?? mongoose.model('Vendor', vendorSchema);
