const Joi = require("joi");

// General schema for location validation
const gpsSchema = Joi.object({
  lat: Joi.number().required().messages({
    "number.base": "Latitude must be a number",
    "any.required": "Latitude is required",
  }),
  lon: Joi.number().required().messages({
    "number.base": "Longitude must be a number",
    "any.required": "Longitude is required",
  }),
  eventId: Joi.number().required().messages({
    "number.base": "eventId must be a number",
  }),
});

// Validate check-in
function validateCheckIn(req, res, next) {
  const { error } = gpsSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: error.details.map(d => d.message).join(", "),
    });
  }
  next();
}

// Validate check-out
function validateCheckOut(req, res, next) {
  const { error } = gpsSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: error.details.map(d => d.message).join(", "),
    });
  }
  next();
}

module.exports = {
  validateCheckIn,
  validateCheckOut
};