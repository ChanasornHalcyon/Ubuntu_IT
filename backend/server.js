const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["https://halcyon-one-internal.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

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
      res.status(400).json({
        success: false,
        message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      });
    }
  } catch (err) {
    console.error("verifyUser Error:", err);
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
  }
});

app.post("/pushData", upload.single("file"), async (req, res) => {
  try {
    const {
      employee_drawing,
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
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "drawings" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      const result = await streamUpload(req.file.buffer);
      file_url = result.secure_url;
    }

    const sql = `
      INSERT INTO drawing_records 
      (employee_drawing, customer_name, date, drawing_no, rev, customer_part_no, description,
       material_main, material_sub, pcd_grade, file_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `;
    await db.query(sql, [
      employee_drawing,
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

    res.json({
      success: true,
      message: "Data inserted successfully",
      file_url,
    });
  } catch (err) {
    console.error("🔥 pushData Error:", err.message);
    console.error(err.stack);
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
    console.error("getAllData Error:", err);
    res.status(500).json({ success: false });
  }
});

app.get("/preview/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT file_url FROM drawings WHERE id = $1",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send("File not found");

    const fileUrl = rows[0].file_url;
    const fileRes = await axios.get(fileUrl, { responseType: "stream" });

    res.setHeader("Content-Type", "application/pdf");
    fileRes.data.pipe(res);
  } catch (error) {
    console.error("Proxy preview error:", error);
    res.status(500).send("Internal Server Error");
  }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
