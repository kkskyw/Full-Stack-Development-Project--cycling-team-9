const express = require("express");
const path = require("path");
require("dotenv").config();

const { admin, db } = require("./firebaseAdmin");

const app = express();
const PORT = process.env.PORT || 3000;

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
const adminTrainingController = require("./controllers/adminTrainingController");

// Validation & Auth Middleware
const userValidation = require("./middlewares/userValidation");
const eventValidation = require("./middlewares/eventValidation");
const attendanceValidation = require("./middlewares/attendanceValidation");
const verifyJWT = require("./middlewares/verifyJWT");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
const feedbackController = require("./controllers/feedbackController");

// User routes
app.post("/users/register", userValidation.validateUser, userController.createUser);
app.post("/login", userValidation.validateLogin, userController.loginUser);
app.get("/users/:id", userController.getUserById);
app.put("/users/:id", userController.updateUser);

// ========== PASSWORD RESET ROUTES ==========
app.post("/auth/request-otp", userValidation.validateResetRequest, resetPwController.requestPasswordReset);
app.post("/auth/verify-otp", userValidation.validateOtpVerification, resetPwController.verifyOtp);
app.post("/auth/reset-password", userValidation.validatePasswordReset, resetPwController.resetPassword);

// Event routes - Yiru (MUST be before parameterized routes**)
app.get("/mrt-stations", eventController.getMRTStations);
app.get("/events/eligible", verifyJWT, eventSignupController.getEligibleEvents);
app.get("/events", eventController.getAllEvents);
app.post("/events/:eventId/signup", verifyJWT, eventSignupController.joinEvent);
app.post("/events/:eventId/email-signup", verifyJWT, eventSignupController.emailSignup);
app.get("/events/:id", eventController.getEventById);

//reminder
app.post("/api/sendReminder", verifyJWT, reminderController.sendReminder);
app.post("/api/training/apply",verifyJWT,trainingController.applyForTraining);

//admin training
app.get("/api/admin/training-applications", verifyJWT, adminTrainingController.getPendingApplications);
app.post("/api/admin/approve-training", verifyJWT, adminTrainingController.approveTraining);
app.post("/api/admin/reject-training", verifyJWT, adminTrainingController.rejectTraining);
app.get("/api/training/status", verifyJWT, trainingController.getMyTrainingStatus);


//booking list
app.get("/users/:userId/bookings", verifyJWT, bookingController.getUserBookings);
app.get("/users/eligible-events", verifyJWT, eventSignupController.getEligibleEvents);

// History routes
app.get("/volunteers/:id/events", verifyJWT, historyController.getEventsByVolunteer);

// Attendance routes
app.post("/attendance/checkin", verifyJWT, attendanceController.checkIn);
app.post("/attendance/checkout", verifyJWT, attendanceController.checkOut);

// Telegram routes
app.post("/api/telegram/set-webhook", telegramController.setWebhook);
app.post("/api/telegram/webhook", telegramController.webhook);


// Feedback routes
app.post("/feedback", feedbackController.submitFeedback);
app.get("/feedback", verifyJWT, feedbackController.getFeedback); 

// serve main.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

app.get(["/profile.html/:id", "/profile/:id"], (req, res) => {
  res.sendFile(path.join(__dirname, "public", "profile.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the app`);
});

process.on("SIGINT", () => {
  console.log("Server shutting down");
  process.exit(0);
});


