const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getUserBookings(userId) {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`
            SELECT es.signupDate, e.*
            FROM eventSignups es
            JOIN events e ON e.eventId = es.eventId
            WHERE es.userId = @userId
            ORDER BY es.signupDate DESC
        `);

    return result.recordset;
}

module.exports = { getUserBookings };
