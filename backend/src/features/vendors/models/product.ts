import mongoose, { Schema } from 'mongoose';

export const PRODUCT_UNITS = ['lb', 'bunch', 'each'] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

const productSchema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    name: { type: String, required: true },
    unit: { type: String, enum: PRODUCT_UNITS, required: true },
    priceCents: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'cad' },
    stock: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type ProductDocument = mongoose.InferSchemaType<typeof productSchema> & { _id: mongoose.Types.ObjectId };
export const ProductModel = mongoose.models.Product ?? mongoose.model('Product', productSchema);
