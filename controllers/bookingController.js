const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getUserBookings(req, res) {
    try {
        const userId = req.user.userId;

        if (!userId) {
            return res.status(400).json({ error: "Invalid user id" });
        }

        const pool = await sql.connect(dbConfig);

        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`
                SELECT e.header, e.location, e.intro, b.bookingDate, b.eventId
                FROM bookedEvents b
                JOIN events e ON b.eventId = e.eventId
                WHERE b.userId = @userId
                ORDER BY b.bookingDate DESC
            `);

        res.json({ bookings: result.recordset });

    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Server error fetching bookings" });
    }
}

module.exports = { getUserBookings };
