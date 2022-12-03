import mongoose, { Schema } from 'mongoose';
import { Product } from '../../types/Iproduct';
import { CartItem } from '../../types/Icart';
import { User as IUser } from '../../types/Iuser';

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: { type: Number, required: true },
            },
        ],
    },
});

userSchema.methods.addToCart = function (product: Product) {
    const cartProductIndex = this.cart.items.findIndex((cp: CartItem) => {
        return cp.productId!.toString() === product._id.toString();
    });
    if (cartProductIndex >= 0) {
        this.cart.items[cartProductIndex].quantity += 1;
    } else {
        this.cart.items.push({
            productId: product._id,
            quantity: 1,
        });
    }
    return this.save();
};

userSchema.methods.removeFromCart = function (
    productId: Schema.Types.ObjectId
) {
    const updatedCartItems = this.cart.items.filter((item: CartItem) => {
        return item.productId!.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    this.save();
};

export const User = mongoose.model<IUser>('User', userSchema);
