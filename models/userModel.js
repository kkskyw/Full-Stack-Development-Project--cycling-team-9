const sql = require("mssql");
const dbConfig = require("../dbConfig");
const bcrypt = require("bcryptjs");

// Get user by ID
async function getUserById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request().input("id", id);
    const result = await request.query("SELECT * FROM users WHERE userId = @id");
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

// Create user
async function createUser(userData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO users (name, email, phone, dob, password, preferredLanguage, role)
      VALUES (@name, @email, @phone, @dob, @password, @preferredLanguage, @role);
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const request = connection.request()
      .input("name", userData.name)
      .input("email", userData.email)
      .input("phone", userData.phone)
      .input("dob", userData.dob)
      .input("password", userData.password)
      .input("preferredLanguage", userData.preferredLanguage || "English")
      .input("role", userData.role || "Volunteer");

    const result = await request.query(query);
    const newUserId = result.recordset[0].id;
    return await getUserById(newUserId);
  } catch (error) {
    if (error.number === 2627) {
      if (error.message.includes("email")) {
        const err = new Error("This email is already registered. Try logging in.");
        err.statusCode = 400;
        throw err;
      } else if (error.message.includes("name")) {
        const err = new Error("This name is already taken. Please choose another.");
        err.statusCode = 400;
        throw err;
      } else if (error.message.includes("phone")) {
        const err = new Error("This phone number is already registered.");
        err.statusCode = 400;
        throw err;
      }
    }
    throw error;
  }
}

// Find user by email
async function findUserByEmail(email) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request().input("email", email);
    const result = await request.query("SELECT * FROM users WHERE email = @email");
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

// Find user by phone
async function findUserByPhone(phone) {
  const connection = await sql.connect(dbConfig);
  const request = connection.request();

  request.input("phone", sql.NVarChar, phone);
  const result = await request.query(`
    SELECT * FROM Users WHERE Phone = @phone
  `);

  connection.close();
  return result.recordset[0];
}

module.exports = {
  getUserById,
  createUser,
  findUserByEmail,
  findUserByPhone
};