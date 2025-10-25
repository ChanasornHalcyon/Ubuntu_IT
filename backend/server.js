const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["https://halcyon-one-internal.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({
  storage,
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
  } catch (err) {
    console.error(" verifyUser Error:", err);
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
  }
});
app.post("/pushData", upload.single("file"), async (req, res) => {
  try {
    const {
      customer_name,
      date,
      drawing_no,
      rev,
      customer_part_no,
      description,
      material_main,
      material_sub,
      pcd_grade,
    } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : null;
    const sql = `
     INSERT INTO drawing_records 
     (customer_name, date, drawing_no, rev, customer_part_no, description,
     material_main, material_sub, pcd_grade, file_url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `;
    await db.query(sql, [
      customer_name,
      date,
      drawing_no,
      rev,
      customer_part_no,
      description,
      material_main,
      material_sub,
      pcd_grade,
      file_url,
    ]);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error(" pushData Error:", err);
    res.status(500).json({ success: false });
  }
});

app.get("/getAllData", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM drawing_records ORDER BY id ASC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(" getAllData Error:", err);
    res.status(500).json({ success: false });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM file_records WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(" Delete error:", err);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
