const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["https://halcyon-one-internal.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only images or PDFs are allowed!"));
  },
});

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
  } catch {
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
  }
});

app.post("/pushData", upload.single("file"), async (req, res) => {
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
    } = req.body;

    const file_base64 = req.file ? req.file.buffer.toString("base64") : null;

    const dateValue = date ? date.split("T")[0] : null;

    const sql = `
      INSERT INTO drawing_records 
      (customer_name, date, drawing_no, rev, customer_part_no, description,
       material_main, material_sub, pcd_grade, file_base64)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `;

    await db.query(sql, [
      customerName,
      dateValue,
      drawingNo,
      rev,
      customerPart,
      description,
      materialMain,
      materialSub,
      pcdGrade,
      file_base64,
    ]);

    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/getAllData", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, customer_name, date, drawing_no, rev, customer_part_no, description, material_main, material_sub, pcd_grade FROM drawing_records ORDER BY id ASC"
    );
    res.json({ success: true, data: result.rows });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get("/getFile/:id", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT file_base64 FROM drawing_records WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).send("File not found");

    const fileBase64 = result.rows[0].file_base64;
    res.json({ success: true, base64: fileBase64 });
  } catch {
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
