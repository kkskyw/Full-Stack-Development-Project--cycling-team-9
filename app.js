const express = require("express");
const path = require("path");
require("dotenv").config();

const { admin, db } = require("./functions/firebaseAdmin");

const app = express();
const PORT = process.env.PORT || 3000;

// Controllers
const userController = require("./functions/controllers/userController");
const eventController = require("./functions/controllers/eventController");
const eventSignupController = require("./functions/controllers/eventSignupController");
const attendanceController = require("./functions/controllers/attendanceController");
const reminderController = require("./functions/controllers/reminderController");
const bookingController = require("./functions/controllers/bookingController");
const historyController = require("./functions/controllers/historyController");
const resetPwController = require("./functions/controllers/resetPwController");
const trainingController = require("./functions/controllers/trainingController");
const adminVolunteerController = require("./functions/controllers/adminVolunteerController");
const adminTrainingController = require("./functions/controllers/adminTrainingController");
const adminEventsController = require("./functions/controllers/adminEventsController");
const companyEventsController = require("./functions/controllers/companyEventsController");


// Validation & Auth Middleware
const userValidation = require("./functions/middlewares/userValidation");
const eventValidation = require("./functions/middlewares/eventValidation");
const attendanceValidation = require("./functions/middlewares/attendanceValidation");
const verifyJWT = require("./functions/middlewares/verifyJWT");
const verifyAdmin = require("./functions/middlewares/verifyAdmin");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
const feedbackController = require("./functions/controllers/feedbackController");

// User routes
app.post("/api/users/register", userValidation.validateUser, userController.createUser);
app.post("/api/login", userValidation.validateLogin, userController.loginUser);
app.get("/api/users/me", verifyJWT, userController.getMe);
app.get("/users/:id", userController.getUserById);
app.put("/users/:id", userController.updateUser);
//Admin view volunteer info
app.get("/admin/volunteers", verifyJWT, verifyAdmin, userController.listVolunteers);

// ========== PASSWORD RESET ROUTES ==========
app.post("/api/auth/request-otp", userValidation.validateResetRequest, resetPwController.requestPasswordReset);
app.post("/api/auth/verify-otp", userValidation.validateOtpVerification, resetPwController.verifyOtp);
app.post("/api/auth/reset-password", userValidation.validatePasswordReset, resetPwController.resetPassword);

// Event routes - Yiru (MUST be before parameterized routes**)
app.get("/api/mrt-stations", eventController.getMRTStations);
app.get("/api/events/eligible", verifyJWT, eventSignupController.getEligibleEvents);
app.get("/api/events", eventController.getAllEvents);
app.post("/api/events/:eventId/signup", verifyJWT, eventSignupController.joinEvent);
app.get("/api/events/booked", eventController.getAllBookedEvents);
app.get("/api/events/:id", eventController.getEventById);

//reminder
app.post("/api/sendReminder", verifyJWT, reminderController.sendReminder);
app.post("/api/training/apply",verifyJWT,trainingController.applyForTraining);

//admin training
app.get("/api/admin/training-applications", verifyJWT, adminTrainingController.getPendingApplications);
app.post("/api/admin/approve-training", verifyJWT, adminTrainingController.approveTraining);
app.post("/api/admin/reject-training", verifyJWT, adminTrainingController.rejectTraining);
app.get("/api/training/status", verifyJWT, trainingController.getMyTrainingStatus);

// ========== ADMIN EVENT MANAGEMENT ROUTES ==========
app.post("/admin/events", verifyJWT, verifyAdmin, adminEventsController.createEvent);
app.get("/admin/events", verifyJWT, verifyAdmin, adminEventsController.getAllEvents);
app.get("/admin/events/:id", verifyJWT, verifyAdmin, adminEventsController.getEventById);
app.put("/admin/events/:id", verifyJWT, verifyAdmin, adminEventsController.updateEvent);
app.delete("/admin/events/:id", verifyJWT, verifyAdmin, adminEventsController.deleteEvent);

// Company booking routes
app.get('/company/events', companyEventsController.getEventsForCompanies);
app.post('/company/bookings', companyEventsController.createCompanyBooking);
app.get('/company/bookings', companyEventsController.getCompanyBookings);
app.put('/company/bookings/:bookingId/status', verifyJWT, verifyAdmin, companyEventsController.updateBookingStatus);

//booking list
app.get("/api/users/:userId/bookings", verifyJWT, bookingController.getUserBookings);
app.get("/api/users/eligible-events", verifyJWT, eventSignupController.getEligibleEvents);

// History routes
app.get("/volunteers/:id/events", verifyJWT, historyController.getEventsByVolunteer);

// Attendance routes
app.post("/api/attendance/checkin", verifyJWT, attendanceController.checkIn);
app.post("/api/attendance/checkout", verifyJWT, attendanceController.checkOut);
app.get("/api/admin/volunteers/:id", verifyJWT, verifyAdmin, adminVolunteerController.getVolunteerDetails);

// Feedback routes
app.post("/feedback", feedbackController.submitFeedback);
app.get("/feedback", verifyJWT, feedbackController.getFeedback); 

// serve main.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "volunteer_main.html"));
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