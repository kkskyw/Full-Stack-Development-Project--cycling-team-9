const express = require("express");
const path = require("path");
require("dotenv").config();

const { admin, db } = require("./firebaseAdmin");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Validation & Auth Middleware
const userValidation = require("./middlewares/userValidation");
const eventValidation = require("./middlewares/eventValidation");
const attendanceValidation = require("./middlewares/attendanceValidation");
const verifyFirebase = require("./middlewares/verifyFirebase");

// Controllers
const userController = require("./controllers/userController");
const eventController = require("./controllers/eventController");
const historyController = require("./controllers/historyController");
const eventSignupController = require("./controllers/eventSignupController");
const reminderController = require("./controllers/reminderController");
const bookingController = require("./controllers/bookingController");
const attendanceController = require("./controllers/attendanceController");

// User routes
app.post("/users/register", userValidation.validateUser, userController.createUser);
app.post("/login", userValidation.validateLogin, userController.loginUser);
app.put("/users/:id", userController.updateUser);

// Event routes - Yiru (MUST be before parameterized routes**)
app.get("/mrt-stations", eventController.getMRTStations);
app.get("/events/eligible", verifyFirebase, eventSignupController.getEligibleEvents);
app.get("/events", eventController.getAllEvents);
app.post("/events/:eventId/signup", verifyFirebase, eventSignupController.joinEvent);
app.post("/events/:eventId/email-signup", verifyFirebase, eventSignupController.emailSignup);
app.get("/events/:id", eventController.getEventById);

//reminder
app.post("/api/sendReminder", verifyFirebase, reminderController.sendReminder);

//booking list
app.get("/users/:userId/bookings", verifyFirebase, bookingController.getUserBookings);
app.get("/users/eligible-events", verifyFirebase, eventSignupController.getEligibleEvents);

// History routes
app.get("/volunteers/:id/events", verifyFirebase, historyController.getEventsByVolunteer);

// Attendance routes
app.post("/attendance/checkin", verifyFirebase, attendanceController.checkIn);
app.post("/attendance/checkout", verifyFirebase, attendanceController.checkOut);

// User by ID (MUST be last to avoid catching other routes)
app.get("/:id", userController.getUserById);

// serve main.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get(['/profile.html/:id', '/profile/:id'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the app`);
});

process.on("SIGINT", () => {
  console.log("Server shutting down");
  process.exit(0);
}); 