import mongoose, { Schema } from 'mongoose';

const orderLineSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitAmountCents: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    customerId: { type: String, required: true, index: true },
    vendorId: { type: String, required: true, index: true },
    stripeSessionId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    currency: { type: String, default: 'cad' },
    subtotalCents: { type: Number, required: true },
    applicationFeeCents: { type: Number, required: true },
    lines: { type: [orderLineSchema], required: true },
    pantryNotified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type OrderDocument = mongoose.InferSchemaType<typeof orderSchema> & { _id: mongoose.Types.ObjectId };
export const OrderModel = mongoose.models.Order ?? mongoose.model('Order', orderSchema);
