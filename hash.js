//To create hashed passwords for admin
//Run hash.js
const bcrypt = require("bcryptjs");

(async () => {
  const hash = await bcrypt.hash("admin123", 10); //Replace password here
  console.log("Hashed password:");
  console.log(hash);
})();