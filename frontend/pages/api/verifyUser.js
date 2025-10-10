import mysql from "mysql2/promise";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { username, password } = req.body;

  try {
    const db = await mysql.createConnection({
      host: "localhost",          // ถ้าใช้ MySQL local
      user: "root",
      password: "khemnak1530",
      database: "halcyon_internal",
    });

    const [rows] = await db.query(
      "SELECT * FROM user WHERE username = ? AND password = ?",
      [username, password]
    );

    await db.end(); // ปิด connection ทุกครั้ง

    if (rows.length > 0) {
      const { password: _, ...safeUser } = rows[0];
      return res.json({ success: true, user: safeUser });
    } else {
      return res.status(401).json({
        success: false,
        message: "❌ Username หรือ Password ไม่ถูกต้อง",
      });
    }
  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({
      success: false,
      message: "Database connection error",
    });
  }
}
