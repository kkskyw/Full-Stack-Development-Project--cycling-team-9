const Joi = require("joi");

// Schema for user registration
const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "string.empty": "Email cannot be empty",
    "any.required": "Email is required",
  }),
  phone: Joi.string().pattern(/^[0-9]{8}$/).required().messages({
    "string.pattern.base": "Phone number must be 8 digits",
    "string.empty": "Phone number cannot be empty",
    "any.required": "Phone number is required",
  }),
  dob: Joi.date().less("now").required().messages({
    "date.base": "Date of birth must be a valid date",
    "date.less": "Date of birth must be in the past",
    "any.required": "Date of birth is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),
  role: Joi.string().valid("Volunteer", "Staff").required().messages({
    "any.only": "Role must be either 'Volunteer' or 'Staff'",
    "any.required": "Role is required",
  }),
});

// Validate request body for user creation
function validateUser(req, res, next) {
  const { error } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ error: messages });
  }
  next();
}

// Login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "string.empty": "Email cannot be empty",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(1).required().messages({
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
  }),
});

function validateLogin(req, res, next) {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details.map(d => d.message).join(", ") });
  }
  next();
}

module.exports = {
  validateUser,
  validateLogin
};