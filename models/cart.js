const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, required: true },
  price: { type: Number, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  weight: { type: String, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number,  },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

cartSchema.virtual('id').get(function () {
  return this._id.toHexString();

});
 cartSchema.set('toJSON', {
   virtuals: true,
 });


exports.Cart = mongoose.model('Cart', cartSchema);

exports.cartSchema = cartSchema;
