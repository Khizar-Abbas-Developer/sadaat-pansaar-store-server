import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

// Define VariantSchema
const VariantSchema = new Schema({
  variantName: {
    type: String,
    required: [true, "Variant name is required"],
    trim: true,
  },
  variantPrice: {
    type: Number,
    required: [true, "Variant price is required"],
    min: [0, "Price cannot be negative"],
  },
});

// Define DescriptionSchema
const DescriptionSchema = new Schema({
  heading: {
    type: String,
    required: [true, "Heading is required"],
    trim: true,
  },
  detail: {
    type: String,
    required: [true, "Detail is required"],
    trim: true,
  },
});

// Define main Product Schema
const productSchema = new Schema(
  {
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    productPrice: {
      type: Number,
      required: [true, "Product price is required"],
    },
    variants: {
      type: [VariantSchema],
      validate: [(val) => val.length >= 1, "At least one variant is required"],
    },
    productsInStock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [1, "Stock must be at least 1"],
    },
    description: {
      type: [DescriptionSchema],
      validate: [
        (val) => val.length >= 1,
        "At least one description entry is required",
      ],
    },
  },
  { timestamps: true }
);

const ProductModel = models.product || model("product", productSchema);

export default ProductModel;
