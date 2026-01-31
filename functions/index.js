/**
 * Firebase Cloud Functions - Express API
 */

require("dotenv").config();

const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const express = require("express");
const cors = require("cors");

const { admin, db } = require("./firebaseAdmin");

// Controllers
const userController = require("./controllers/userController");
const eventController = require("./controllers/eventController");
const eventSignupController = require("./controllers/eventSignupController");
const attendanceController = require("./controllers/attendanceController");
const reminderController = require("./controllers/reminderController");
const bookingController = require("./controllers/bookingController");
const historyController = require("./controllers/historyController");
const resetPwController = require("./controllers/resetPwController");
const telegramController = require("./controllers/telegramController");
const trainingController = require("./controllers/trainingController");
const adminVolunteerController = require("./controllers/adminVolunteerController");
const feedbackController = require("./controllers/feedbackController");

// Validation & Auth Middleware
const userValidation = require("./middlewares/userValidation");
const eventValidation = require("./middlewares/eventValidation");
const attendanceValidation = require("./middlewares/attendanceValidation");
const verifyJWT = require("./middlewares/verifyJWT");
const verifyAdmin = require("./middlewares/verifyAdmin");

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// User routes
app.post("/api/users/register", userValidation.validateUser, userController.createUser);
app.post("/api/login", userValidation.validateLogin, userController.loginUser);
app.get("/api/users/me", verifyJWT, userController.getMe);
app.get("/api/users/:id", userController.getUserById);
app.put("/api/users/:id", userController.updateUser);

// Password Reset Routes
app.post("/api/auth/request-otp", userValidation.validateResetRequest, resetPwController.requestPasswordReset);
app.post("/api/auth/verify-otp", userValidation.validateOtpVerification, resetPwController.verifyOtp);
app.post("/api/auth/reset-password", userValidation.validatePasswordReset, resetPwController.resetPassword);

// Event routes
app.get("/api/mrt-stations", eventController.getMRTStations);
app.get("/api/events/eligible", verifyJWT, eventSignupController.getEligibleEvents);
app.get("/api/events/booked", eventController.getAllBookedEvents);
app.get("/api/events", eventController.getAllEvents);
app.post("/api/events/:eventId/signup", verifyJWT, eventSignupController.joinEvent);
app.post("/api/events/:eventId/email-signup", verifyJWT, eventSignupController.emailSignup);
app.get("/api/events/:id", eventController.getEventById);

// Reminder
app.post("/api/sendReminder", verifyJWT, reminderController.sendReminder);
app.post("/api/training/apply", verifyJWT, trainingController.applyForTraining);

// Booking list
app.get("/api/users/:userId/bookings", verifyJWT, bookingController.getUserBookings);
app.get("/api/users/eligible-events", verifyJWT, eventSignupController.getEligibleEvents);

// History routes
app.get("/api/volunteers/:id/events", verifyJWT, historyController.getEventsByVolunteer);
app.get("/api/admin/events/history", verifyJWT, verifyAdmin, historyController.getAllPastEvents);
app.get("/api/admin/events", verifyJWT, verifyAdmin, eventController.getAllEvents);

// Attendance routes
app.post("/api/attendance/checkin", verifyJWT, attendanceController.checkIn);
app.post("/api/attendance/checkout", verifyJWT, attendanceController.checkOut);
app.get("/api/admin/volunteers/:id", verifyJWT, verifyAdmin, adminVolunteerController.getVolunteerDetails);

// Telegram routes
app.post("/api/telegram/set-webhook", telegramController.setWebhook);
app.post("/api/telegram/webhook", telegramController.webhook);

// Feedback routes
app.post("/api/feedback", feedbackController.submitFeedback);
app.get("/api/feedback", verifyJWT, feedbackController.getFeedback);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Export the Express app as a Cloud Function
exports.api = onRequest(app);

