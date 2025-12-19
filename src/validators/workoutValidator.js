const Joi = require('joi');

const createWorkoutSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Workout name must be at least 3 characters long',
      'string.max': 'Workout name cannot exceed 100 characters',
      'any.required': 'Workout name is required'
    }),
  description: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

const assignWorkoutSchema = Joi.object({
  clientId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid client ID format',
      'any.required': 'Client ID is required'
    })
});

const workoutQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string()
    .allow('')
    .max(100)
    .messages({
      'string.max': 'Search query cannot exceed 100 characters'
    })
});

module.exports = {
  createWorkoutSchema,
  assignWorkoutSchema,
  workoutQuerySchema
};
