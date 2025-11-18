const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllEvents(page, limit) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 1. Get paginated events
    const eventsResult = await connection
      .request()
      .input("OFFSET", offset)
      .input("LIMIT", parseInt(limit))
      .query(`
        SELECT * FROM events
        ORDER BY eventId
        OFFSET @OFFSET ROWS
        FETCH NEXT @LIMIT ROWS ONLY;
      `);

    // 2. Get total count
    const totalResult = await connection
      .request()
      .query(`SELECT COUNT(*) AS total FROM events`);

    const total = totalResult.recordset[0].total;
    const totalPages = Math.ceil(total / parseInt(limit));

    return [eventsResult.recordset, totalPages];

  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getAllEvents
};
