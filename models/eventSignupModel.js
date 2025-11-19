const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function signupForEvent(userId, eventId) {
    const pool = await sql.connect(dbConfig);

    // 1️⃣ CHECK: Already booked this exact event?
    const existing = await pool.request()
        .input("userId", sql.Int, userId)
        .input("eventId", sql.Int, eventId)
        .query(`
            SELECT 1 
            FROM eventSignups 
            WHERE userId = @userId AND eventId = @eventId
        `);

    if (existing.recordset.length > 0) {
        throw new Error("You have already booked this event.");
    }

    // 2️⃣ GET the event date
    const eventData = await pool.request()
        .input("eventId", sql.Int, eventId)
        .query(`
            SELECT start_time
            FROM events 
            WHERE eventId = @eventId
        `);

    if (eventData.recordset.length === 0) {
        throw new Error("Event not found.");
    }

    const eventDate = eventData.recordset[0].start_time;

    // 3️⃣ CHECK: Already have an event on the same date?
    const dateCheck = await pool.request()
        .input("userId", sql.Int, userId)
        .input("eventDate", sql.Date, eventDate)
        .query(`
            SELECT 1
            FROM eventSignups es
            JOIN events e ON es.eventId = e.eventId
            WHERE es.userId = @userId
              AND CAST(e.start_time AS DATE) = CAST(@eventDate AS DATE)
        `);

    if (dateCheck.recordset.length > 0) {
        throw new Error("You already have an event booked on this date.");
    }

    // 4️⃣ INSERT into eventSignups (REAL signup)
    await pool.request()
        .input("eventId", sql.Int, eventId)
        .input("userId", sql.Int, userId)
        .query(`
            INSERT INTO eventSignups (eventId, userId)
            VALUES (@eventId, @userId)
        `);

    // 5️⃣ INSERT into bookedEvents (so booking page can show it)
    return pool.request()
        .input("eventId", sql.Int, eventId)
        .input("userId", sql.Int, userId)
        .query(`
            INSERT INTO bookedevents (eventId, userId, bookingDate)
            VALUES (@eventId, @userId, GETDATE())
        `);
}


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

module.exports = {
    signupForEvent,
    getUserBookings
};
