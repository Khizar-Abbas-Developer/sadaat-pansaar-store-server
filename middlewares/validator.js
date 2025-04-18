export const validateField = (field, value, validationSchema) => {
  const rule = validationSchema[field];
  if (!rule) return null;

  // Handle required check
  if (
    rule.required &&
    (value === undefined || value === null || value === "")
  ) {
    return rule.message;
  }

  // Type checking
  const expectedType = rule.type;

  // Handle array type
  if (expectedType === "array") {
    if (!Array.isArray(value)) {
      return `${field} must be an array`;
    }

    if (rule.minItems && value.length < rule.minItems) {
      return rule.message;
    }

    if (rule.of) {
      for (let i = 0; i < value.length; i++) {
        const obj = value[i];
        for (const key in rule.of) {
          const nestedError = validateField(`${field}[${i}].${key}`, obj[key], {
            [key]: rule.of[key],
          });
          if (nestedError) return nestedError;
        }
      }
    }

    return null; // array is valid
  }

  // String-specific checks
  if (expectedType === "string") {
    if (typeof value !== "string") {
      return `${field} must be a string`;
    }
    if (value.trim() === "") {
      return rule.message;
    }
  }

  // Number-specific checks
  if (expectedType === "number") {
    if (typeof value !== "number") {
      return `${field} must be a number`;
    }
    if (rule.min !== undefined && value < rule.min) {
      return `${field} must be at least ${rule.min}`;
    }
  }

  // Email check
  if (expectedType === "email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value !== "string" || !emailPattern.test(value)) {
      return rule.message;
    }
  }

  // Pattern match
  if (rule.pattern && !rule.pattern.test(value)) {
    return rule.message;
  }

  return null; // Passed all checks
};

// Validator middleware function
export const validator =
  (validationSchemas, property = "body", place = "body") =>
  (req, res, next) => {
    const errors = [];
    const body = req[place];
    if (!body || typeof body !== "object") {
      return res
        .status(400)
        .json({ message: "Invalid request payload", success: false });
    }

    // Loop through the validation schemas
    validationSchemas.forEach((validationSchema) => {
      Object.keys(validationSchema).forEach((field) => {
        const error = validateField(field, body[field], validationSchema);
        if (error) {
          errors.push({ field, message: error });
        }
      });
    });

    if (errors.length === 0) {
      next(); // No validation errors, proceed to next middleware
    } else {
      res.status(400).json({
        message: "Validation failed",
        success: false,
        errors,
      });
    }
  };
