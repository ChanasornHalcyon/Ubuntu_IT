const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, res) => res(null, "uploads/"),
  filename: (req, file, res) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    res(null, uniqueName);
  },
});
const upload = multer({ storage });

let db;
const initMySQL = async () => {
  db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "khemnak1530",
    database: "halcyon_internal",
  });
};
initMySQL();

app.post("/verifyUser/", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT * FROM user WHERE username = ? AND password = ?",
      [username, password]
    );
    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Username หรือ Password ไม่ถูกต้อง" });
    }
  } catch (err) {
    console.error("❌ Database error:", err);
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
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [
      reason,
      description,
      customer_part,
      dwg_no,
      customer_name,
      image_url,
    ]);

    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("❌ Error:", err);
  }
});

app.get("/getNPTR", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM file_records WHERE customer_name = ?",
      ["NPTR"]
    );

    if (rows.length > 0) {
      res.json({ success: true, data: rows });
    } else {
      res.json({ success: false, message: "ไม่พบข้อมูลของลูกค้า NPTA" });
    }
  } catch (err) {
    console.error("❌ Database error:", err);
  }
});
app.get("/getNPTA", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM file_records WHERE customer_name = ?",
      ["NPTA"]
    );

    if (rows.length > 0) {
      res.json({ success: true, data: rows });
    } else {
      res.json({ success: false, message: "ไม่พบข้อมูลของลูกค้า NPTA" });
    }
  } catch (err) {
    console.error("❌ Database error:", err);
  }
});

app.get("/getNCOT", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM file_records WHERE customer_name = ?",
      ["NCOT"]
    );
    if (rows.length > 0) {
      res.json({ success: true, data: rows });
    } else {
      res.json({ success: false, message: "ไม่พบข้อมูลของลูกค้า NPTA" });
    }
  } catch (err) {
    console.error("❌ Database error:", err);
  }
});
app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM file_records WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
