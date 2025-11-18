const sql = require("mssql");
const dbConfig = require("../dbConfig");

// SIGN UP FOR EVENT
async function signupForEvent(userId, eventId) {
    const pool = await sql.connect(dbConfig);

    return pool.request()
        .input("userId", sql.Int, userId)
        .input("eventId", sql.Int, eventId)
        .query(`
            IF NOT EXISTS (
                SELECT 1 FROM eventsignup
                WHERE userId = @userId AND eventId = @eventId
            )
            INSERT INTO eventsignup (eventId, userId)
            VALUES (@eventId, @userId)
        `);
}

// GET ELIGIBLE EVENTS
async function getEligibleEvents(userId) {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`
            SELECT e.*
            FROM events e
            LEFT JOIN usercertifications uc
                ON uc.certificationId = e.requiredCertificationId
               AND uc.userId = @userId
            WHERE e.requiredCertificationId IS NULL
               OR uc.userId IS NOT NULL
        `);

    return result.recordset;
}

module.exports = {
    signupForEvent,
    getEligibleEvents
};
