const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false },
});

app.post("/verifyUser/", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Username หรือ Password ไม่ถูกต้อง" });
    }
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/pushData", upload.single("image"), async (req, res) => {
  try {
    const { reason, description, customer_part, dwg_no, customer_name } =
      req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = `
      INSERT INTO file_records 
      (reason, description, customer_part, dwg_no, customer_name, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await db.query(sql, [
      reason,
      description,
      customer_part,
      dwg_no,
      customer_name,
      image_url,
    ]);

    res.json({ success: true, message: "✅ Data inserted successfully" });
  } catch (err) {
    console.error("❌ Insert error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const getByCustomer = (customer) => async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM file_records WHERE customer_name = $1",
      [customer]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, data: result.rows });
    } else {
      res.json({ success: false, message: `ไม่พบข้อมูลของลูกค้า ${customer}` });
    }
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

app.get("/getNPTR", getByCustomer("NPTR"));
app.get("/getNPTA", getByCustomer("NPTA"));
app.get("/getNCOT", getByCustomer("NCOT"));

app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM file_records WHERE id = $1", [id]);
    res.json({ success: true, message: "✅ Deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
