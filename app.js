const path = require("path");
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

const userController = require("./controllers/userController");
const userValidation = require("./middlewares/userValidation");
const eventController = require("./controllers/eventController");
const eventSignupController = require("./controllers/eventSignupController");
const verifyJWT = require("./middlewares/verifyJWT");
const attendanceController = require("./controllers/attendanceController");
const reminderController = require("./controllers/reminderController");
const { getUserBookings } = require("./controllers/bookingController");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


// User routes
app.post("/users/register", userValidation.validateUser, userController.createUser);
app.post("/users/login", userValidation.validateLogin, userController.loginUser);
app.put("/users/:id", userController.updateUser);

//events signup
app.post("/events/:eventId/signup", verifyJWT, eventSignupController.joinEvent);
app.get("/events/eligible", verifyJWT, eventSignupController.getEligibleEvents);
app.get("/users/eligible-events", verifyJWT, eventSignupController.getEligibleEvents);
app.get("/users/:id", userController.getUserById);

//reminder
app.post("/api/sendReminder", verifyJWT, reminderController.sendReminder);

//booking list
app.get("/users/:userId/bookings", verifyJWT, getUserBookings);
app.post("/events/:eventId/email-signup", verifyJWT, eventSignupController.emailSignup);


// Attendance routes
app.post("/attendance/checkin", verifyJWT, attendanceController.checkIn);
app.post("/attendance/checkout", verifyJWT, attendanceController.checkOut);

// Event routes
app.get("/events", eventController.getAllEvents);
app.get("/mrt-stations", eventController.getMRTStations);
app.get("/events/:id", eventController.getEventById);

// serve main.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get(['/profile.html/:id', '/profile/:id'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Click http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});