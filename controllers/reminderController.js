const sql = require("mssql");
const dbConfig = require("../dbConfig");
const nodemailer = require("nodemailer");
const telegramController = require("./telegramController");

// Email sender
const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
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

        const pool = await sql.connect(dbConfig);

        // Fetch user details
        const userResult = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`
                SELECT email, phone, telegramChatId
                FROM users
                WHERE userId = @userId
            `);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const { email, telegramChatId } = userResult.recordset[0];

        // delay in milliseconds (10 seconds)
        const delay = 10000;

        // Respond immediately so frontend doesn't hang
        res.json({
            message: `${method.toUpperCase()} reminder will be sent in ${delay / 1000} seconds`
        });

        // Send reminder after delay
        setTimeout(async () => {
            try {
                // 📧 EMAIL
                if (method === "email") {
                    if (!email) {
                        console.error("User has no email on record");
                        return;
                    }

                    await emailTransporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: "Event Reminder",
                        text: `⏰ Reminder!\n\nYou have an upcoming event.\nEvent ID: ${eventId}`
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
