const sql = require("mssql");
const dotenv = require("dotenv");
dotenv.config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  trustServerCertificate: true,
  options: {
    port: parseInt(process.env.DB_PORT),
    connectionTimeout: 60000,
    encrypt: false,
    enableArithAbort: true
  }
};

async function test() {
  try {
    console.log("Testing connection to:", dbConfig.server, dbConfig.database);
    const pool = await sql.connect(dbConfig);
    console.log("✅ Connected to database!");
    
    // Test if users table exists
    const result = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'users'
    `);
    
    if (result.recordset.length > 0) {
      console.log("✅ Users table exists");
    } else {
      console.log("❌ Users table does not exist");
    }
    
    await pool.close();
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  }
}

test();