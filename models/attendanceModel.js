const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Helper function to convert Date to Singapore time string for SQL Server
function toSGTimeString(date) {
  // Convert to Singapore time string in format: YYYY-MM-DD HH:mm:ss
  const sgTime = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Singapore" }));
  
  const year = sgTime.getFullYear();
  const month = String(sgTime.getMonth() + 1).padStart(2, '0');
  const day = String(sgTime.getDate()).padStart(2, '0');
  const hours = String(sgTime.getHours()).padStart(2, '0');
  const minutes = String(sgTime.getMinutes()).padStart(2, '0');
  const seconds = String(sgTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Create attendance record (only once per volunteer per event)
async function createAttendance(userId, eventId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    // Check if attendance already exists
    const existsQuery = `
      SELECT a.*, e.start_time as event_start_time 
      FROM attendance a 
      JOIN events e ON a.eventId = e.eventId 
      WHERE a.userId = @userId AND a.eventId = @eventId
    `;

    let request = connection.request()
      .input("userId", userId)
      .input("eventId", eventId);

    const exists = await request.query(existsQuery);
    if (exists.recordset.length > 0) {
      return exists.recordset[0];
    }

    const insertQuery = `
      INSERT INTO attendance (userId, eventId, status)
      VALUES (@userId, @eventId, 'Absent');
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const insertResult = await request.query(insertQuery);
    const attendanceId = insertResult.recordset[0].id;

    return await getAttendanceById(attendanceId);

  } catch (err) {
    console.error("Database insert error:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

// Get attendance by ID
async function getAttendanceById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const result = await connection.request()
      .input("id", id)
      .query(`
        SELECT a.*, e.start_time as event_start_time 
        FROM attendance a 
        JOIN events e ON a.eventId = e.eventId 
        WHERE a.id = @id
      `);

    return result.recordset[0] || null;
  } catch (err) {
    console.error("Database error:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

// Get attendance for user + event
async function getAttendance(userId, eventId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const result = await connection.request()
      .input("userId", userId)
      .input("eventId", eventId)
      .query(`
        SELECT 
          a.*, 
          -- Convert the datetime to string without timezone conversion
          CONVERT(varchar, e.start_time, 120) as event_start_time_string,
          e.start_time as event_start_time_raw
        FROM attendance a 
        JOIN events e ON a.eventId = e.eventId 
        WHERE a.userId = @userId AND a.eventId = @eventId
      `);

    return result.recordset[0] || null;
  } catch (err) {
    console.error("Database error:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

// CHECK IN
async function updateCheckIn(data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    // Convert to Singapore time string
    const sgTimeString = toSGTimeString(data.time);

    const request = connection.request()
      .input("userId", data.userId)
      .input("eventId", data.eventId)
      .input("time", sgTimeString)
      .input("lat", data.lat)
      .input("lon", data.lon)
      .input("status", data.status);

    await request.query(`
      UPDATE attendance
      SET check_in_time = @time,
          check_in_lat = @lat,
          check_in_lon = @lon,
          status = @status
      WHERE userId = @userId AND eventId = @eventId
    `);

    return await getAttendance(data.userId, data.eventId);
  } catch (err) {
    console.error("Database check-in error:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

// CHECK OUT
async function updateCheckOut(data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const sgTimeString = toSGTimeString(data.time);

    const request = connection.request()
      .input("userId", data.userId)
      .input("eventId", data.eventId)
      .input("time", sgTimeString) 
      .input("lat", data.lat)
      .input("lon", data.lon);

    await request.query(`
      UPDATE attendance
      SET check_out_time = @time,
          check_out_lat = @lat,
          check_out_lon = @lon
      WHERE userId = @userId AND eventId = @eventId
    `);

    return await getAttendance(data.userId, data.eventId);
  } catch (err) {
    console.error("Database check-out error:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  createAttendance,
  getAttendance,
  updateCheckIn,
  updateCheckOut
};