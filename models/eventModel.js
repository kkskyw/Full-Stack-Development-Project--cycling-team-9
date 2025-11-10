const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllEvents(page, limit) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("OFFSET", (parseInt(page) - 1) * parseInt(limit));
    request.input("LIMIT", parseInt(limit));
    const result = await request.query("SELECT * FROM events ORDER BY eventId OFFSET @OFFSET ROWS FETCH NEXT @LIMIT ROWS ONLY;");
    const totalPagesResult = await request.query("SELECT CEILING(COUNT(*)/CAST(@LIMIT AS FLOAT)) AS count FROM events;");
    return [result.recordset || null, totalPagesResult.recordset[0].count];
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