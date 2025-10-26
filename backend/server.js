const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: ["https://halcyon-one-internal.vercel.app"],
    credentials: true,
  })
);

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static(uploadDir));

const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

app.post("/verifyUser", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query(
      "SELECT id, username, password FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res
        .status(400)
        .json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
  }
});

app.post("/pushData", async (req, res) => {
  try {
    const {
      customerName,
      date,
      drawingNo,
      rev,
      customerPart,
      description,
      materialMain,
      materialSub,
      pcdGrade,
      fileBase64,
    } = req.body;

    const sql = `
      INSERT INTO drawing_records
      (customer_name, date, drawing_no, rev, customer_part_no, description,
       material_main, material_sub, pcd_grade, file_base64)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `;
    await db.query(sql, [
      customerName,
      date ? date.split("T")[0] : null,
      drawingNo,
      rev,
      customerPart,
      description,
      materialMain,
      materialSub,
      pcdGrade,
      fileBase64,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error("pushData Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/getAllData", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM drawing_records ORDER BY id ASC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
