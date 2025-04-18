import Product from "../models/product.js";

export const addProduct = async (req, res) => {
  try {
    const {
      image,
      category,
      productName,
      productPrice,
      variants,
      productsInStock,
      description,
    } = req.body;

    // Create new product
    const newProduct = new Product({
      image,
      category,
      productName,
      productPrice,
      variants,
      productsInStock,
      description,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getTenProducts = async (req, res) => {
  try {
    const products = await Product.find().limit(10);
    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};
