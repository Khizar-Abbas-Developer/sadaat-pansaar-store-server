// doctorValidationRules.js
export const registerUserValidation = {
  email: {
    required: true,
    type: "email",
    message: "Valid email is required",
  },
  phone: {
    required: true,
    minLength: 10,
    message: "Phone number is required",
  },
  method: {
    required: true,
    type: String,
    enum: ["custom", "gmail"],
    message: "Method must be either 'custom' or 'gmail'",
    default: "custom",
  },
  password: {
    required: true,
    type: String,
  },
};

export const registerUserGmailValidation = {
  name: {
    required: true,
    type: String,
    message: "Name is required",
  },
  email: {
    required: true,
    type: "email",
    message: "Valid email is required",
  },
  image: {
    required: true,
    type: String,
    message: "Image URL is required",
  },
  method: {
    required: true,
    type: String,
    enum: ["gmail"],
    message: "Method must be 'gmail'",
  },
};

export const loginAdminValidation = {
  email: {
    required: true,
    type: "email",
    message: "Email address is required",
  },
  password: {
    required: true,
    message: "Password is required",
  },
};
export const forgotPasswordValidation = {
  email: {
    required: true,
    type: "email",
    message: "Email address is required and must be a valid email",
  },
};

export const productValidation = {
  image: {
    required: true,
    type: "string",
    message: "Image URL is required",
  },
  category: {
    required: true,
    type: "string",
    message: "Category is required",
  },
  productName: {
    required: true,
    type: "string",
    message: "Product name is required",
  },
  productPrice: {
    required: true,
    type: "number",
    message: "Product price is required",
  },
  variants: {
    required: true,
    type: "array",
    minItems: 1,
    message: "At least one variant is required",
    of: {
      variantName: {
        required: true,
        type: "string",
        message: "Variant name is required",
      },
      variantPrice: {
        required: true,
        type: "number",
        message: "Variant price is required",
      },
    },
  },
  productsInStock: {
    required: true,
    type: "number",
    min: 1,
    message: "Stock quantity is required and must be at least 0",
  },
  description: {
    required: true,
    type: "array",
    minItems: 1,
    message: "At least one description is required",
    of: {
      heading: {
        required: true,
        type: "string",
        message: "Description heading is required",
      },
      detail: {
        required: true,
        type: "string",
        message: "Description detail is required",
      },
    },
  },
};
