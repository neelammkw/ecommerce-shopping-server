const mongoose = require("mongoose");

const myListSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, required: true },
  discountPrice: { type: Number, required: true },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

myListSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
myListSchema.set("toJSON", {
  virtuals: true,
});

exports.MyList = mongoose.model("MyList", myListSchema);

exports.myListSchema = myListSchema;
