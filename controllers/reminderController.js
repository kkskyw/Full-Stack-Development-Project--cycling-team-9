const sql = require("mssql");
const dbConfig = require("../dbConfig");
const nodemailer = require("nodemailer");

// Email sender (your verified Gmail)
const { addBooking } = require("../models/bookingModel");
const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // SENDER
        pass: process.env.EMAIL_PASS
    }
});


exports.sendReminder = async (req, res) => {
    try {
        const { eventId, method } = req.body;

        if (!eventId || !method) {
            return res.status(400).json({ error: "Missing eventId or method" });
        }

        const userId = req.user.userId;

        // Fetch user email + phone directly from DB
        const pool = await sql.connect(dbConfig);
        const userResult = await pool.request()
            .input("userId", sql.Int, userId)
            .query("SELECT email, phone FROM users WHERE userId = @userId");

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const userEmail = userResult.recordset[0].email;
        const userPhone = userResult.recordset[0].phone;

        if (method === "email" && !userEmail) {
            return res.status(400).json({ error: "User has no email on record" });
        }

        // delay in milliseconds (10 seconds)
        const delay = 10000;

        res.json({
            message: `Email reminder will be sent in ${delay / 1000} seconds`
        });

        // Send email after delay
        setTimeout(async () => {
    try {
        // 1️⃣ Fetch user info
        const userResult = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`
                SELECT name, email
                FROM users
                WHERE userId = @userId
            `);

        const userName = userResult.recordset[0].name;

        // 2️⃣ Fetch event info
        const eventResult = await pool.request()
            .input("eventId", sql.Int, eventId)
            .query(`
                SELECT header, location, start_time
                FROM events
                WHERE eventId = @eventId
            `);

        const event = eventResult.recordset[0];

        const formattedDate = new Date(event.start_time).toLocaleDateString();
        const formattedTime = new Date(event.start_time).toLocaleTimeString();

        // 3️⃣ Send professional email
        await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Reminder: ${event.header}`,
            text: `
                Hi ${userName},

                This is a friendly reminder about your upcoming event with Cycling Without Age Singapore.

                Event: ${event.header}
                Location: ${event.location}
                Date: ${formattedDate}
                Time: ${formattedTime}

                Thank you for supporting our mission to bring joy and mobility to seniors in our community.

                We look forward to seeing you at the event!

                Warm regards,
                Cycling Without Age Singapore
                            `
        });

        console.log(`EMAIL REMINDER SENT TO ${userEmail}`);

    } catch (err) {
        console.error("Failed to send email reminder:", err);
    }
}, delay);


    } catch (err) {
        console.error("Error in sendReminder:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

