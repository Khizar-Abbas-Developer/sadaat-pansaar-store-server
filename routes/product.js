import express from "express";
import { validator } from "../middlewares/validator.js";
import {
  addProduct,
  getProductById,
  getTenProducts,
} from "../controllers/product.js";
import { productValidation } from "../config/validation.js";

const productRouter = express.Router();

productRouter.post("/add-product", validator([productValidation]), addProduct);
productRouter.get("/get-ten-product", getTenProducts);
productRouter.get("/get-product/:id", getProductById);

export default productRouter;
