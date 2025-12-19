const { ValidationError } = require('../utils/errors');

/**
 * Middleware to validate request data against Joi schema
 * Can validate body, query, or params
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Get all errors, not just first one
      stripUnknown: true // Remove unknown keys
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return next(new ValidationError(errorMessage));
    }

    // Replace request data with validated and sanitized data
    req[source] = value;
    next();
  };
};

module.exports = validate;
