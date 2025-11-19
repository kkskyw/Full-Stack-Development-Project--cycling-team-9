const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getEventsByVolunteer(volunteerId, status) {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const req = pool.request();
    req.input("volunteerId", sql.Int, volunteerId);

    let timeClause = "";
    if (status === "past") timeClause = "AND eventTime < GETDATE()";
    else if (status === "upcoming") timeClause = "AND eventTime >= GETDATE()";

    // preferred: read from a view vwVolunteerEvents (create this in DB)
    const query = `
      SELECT eventId, title, intro, location, eventTime, volunteerStatus, attendees
      FROM vwVolunteerEvents
      WHERE volunteerId = @volunteerId
      ${timeClause}
      ORDER BY eventTime DESC;
    `;

    const result = await req.query(query);
    return result.recordset || [];
  } catch (err) {
    console.error("historyModel.getEventsByVolunteer error:", err);
    // If the view doesn't exist, you can replace above query with a JOIN:
    // (uncomment and adapt this fallback if needed)
    /*
    if (pool) {
      const fallbackReq = pool.request();
      fallbackReq.input("volunteerId", sql.Int, volunteerId);
      const fallbackQuery = `
        SELECT E.eventId, E.header AS title, E.intro, E.location, E.time AS eventTime,
               A.status AS volunteerStatus,
               (SELECT COUNT(*) FROM Attendance A2 WHERE A2.EventId = E.eventId) AS attendees
        FROM events E
        INNER JOIN Attendance A ON A.EventId = E.eventId AND A.UserId = @volunteerId
        WHERE 1=1
        ${timeClause.replace(/eventTime/g, "E.time")}
        ORDER BY E.time DESC;
      `;
      const fb = await fallbackReq.query(fallbackQuery);
      return fb.recordset || [];
    }
    */
    throw err;
  } finally {
    if (pool) await pool.close();
  }
}

module.exports = { getEventsByVolunteer };

