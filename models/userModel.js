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
      INSERT INTO users (name, email, phone, password, preferredLanguage, role)
      VALUES (@name, @email, @phone, @password, @preferredLanguage, @role);
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const request = connection.request()
      .input("name", userData.name)
      .input("email", userData.email)
      .input("phone", userData.phone)
      .input("password", userData.password)
      .input("preferredLanguage", userData.preferredLanguage || "English")
      .input("role", userData.role || "Volunteer");

    const result = await request.query(query);
    const newUserId = result.recordset[0].id;
    return await getUserById(newUserId);
  } catch (error) {
    // Check for SQL Server unique constraint violation (error number 2627)
    if (error.number === 2627) {
      if (error.message.includes("UQ__users__email")) {
        const err = new Error("This email is already registered. Try logging in.");
        err.statusCode = 400;
        throw err;
      } else if (error.message.includes("UQ_users_name")) {
        const err = new Error("This name is already taken. Please choose another.");
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
    const result = await request.query(`
      SELECT userId, name, email, password, role 
      FROM users 
      WHERE email = @email
    `);
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

// Find user by username
async function getUserByUsername(username) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request().input("name", username);
    const result = await request.query("SELECT * FROM users WHERE name = @name");
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getUserById,
  createUser,
  findUserByEmail,
  getUserByUsername
};