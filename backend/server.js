const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["https://halcyon-one-internal.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, res) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (allowed.includes(file.mimetype)) res(null, true);
    else res(new Error("Only images or PDFs are allowed!"));
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

    let file_url = null;

    if (req.file) {
      const fileName = `${req.file.originalname}`;
      const { data, error } = await supabase.storage
        .from("drawings")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        upsert: true,
        });

      if (error) throw error;

      const { data: publicURL } = supabase.storage
        .from("drawings")
        .getPublicUrl(fileName);

      file_url = publicURL.publicUrl;
    }
    const sql = `
      INSERT INTO drawing_records 
      ( customer_name, date, drawing_no, rev, customer_part_no, description,
       material_main, material_sub, pcd_grade, file_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `;

    await db.query(sql, [
      customerName,
      date,
      drawingNo,
      rev,
      customerPart,
      description,
      materialMain,
      materialSub,
      pcdGrade,
      file_url,
    ]);

    res.json({ success: true, message: "Drawing added successfully!" });
  } catch (err) {
    console.error("pushData Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
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
app.post("/searchDrawing", async (req, res) => {
  try {
    const {
      customerName,
      date,
      drawingNo,
      customerPart,
      description,
      materialMain,
      pcdGrade,
    } = req.body;

    let sql = "SELECT * FROM drawing_records WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (customerName) {
      sql += ` AND customer_name ILIKE $${paramIndex++}`;
      params.push(`%${customerName}%`);
    }

    if (date) {
      sql += ` AND DATE(date) = $${paramIndex++}`;
      params.push(date);
    }

    if (drawingNo) {
      sql += ` AND drawing_no ILIKE $${paramIndex++}`;
      params.push(`%${drawingNo}%`);
    }

    if (customerPart) {
      sql += ` AND customer_part_no ILIKE $${paramIndex++}`;
      params.push(`%${customerPart}%`);
    }

    if (description) {
      sql += ` AND description ILIKE $${paramIndex++}`;
      params.push(`%${description}%`);
    }

    if (materialMain) {
      sql += ` AND material_main ILIKE $${paramIndex++}`;
      params.push(`%${materialMain}%`);
    }

    if (pcdGrade) {
      sql += ` AND pcd_grade ILIKE $${paramIndex++}`;
      params.push(`%${pcdGrade}%`);
    }

    sql += " ORDER BY id ASC";

    const result = await db.query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("searchDrawing Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
