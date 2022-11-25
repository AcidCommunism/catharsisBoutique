import mongoose, { Schema } from 'mongoose';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
});
export const Product = mongoose.model('Product', productSchema);
