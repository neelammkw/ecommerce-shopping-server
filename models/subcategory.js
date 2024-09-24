const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subcat: {
    type: String,
    required: true,
  },
});
subcategorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});
subcategorySchema.set("toJSON", {
  virtuals: true,
});

exports.SubCategory = mongoose.model("SubCategory", subcategorySchema);

exports.subcategorySchema = subcategorySchema;
