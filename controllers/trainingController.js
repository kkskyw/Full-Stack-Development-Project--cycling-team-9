const sql = require("mssql");
const dbConfig = require("../dbConfig");

const NAME_MAP = {
    cyclist: "Cyclist Certification",
    trishaw: "Trishaw Pilot Certification"
};

exports.completeTraining = async (userId, type) => {
    const pool = await sql.connect(dbConfig);

    const certName = NAME_MAP[type];
    if (!certName) return { error: "Invalid training type" };

    const cert = await pool.request()
        .input("name", sql.VarChar, certName)
        .query("SELECT certificationId FROM certifications WHERE name = @name");

    if (cert.recordset.length === 0) {
        return { error: "Certification not found" };
    }

    const certificationId = cert.recordset[0].certificationId;

    await pool.request()
        .input("userId", sql.Int, userId)
        .input("certificationId", sql.Int, certificationId)
        .query(`
            IF NOT EXISTS (
                SELECT 1 FROM usercertifications
                WHERE userId = @userId AND certificationId = @certificationId
            )
            INSERT INTO usercertifications (userId, certificationId)
            VALUES (@userId, @certificationId)
        `);

    return { success: true };
};
