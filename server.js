const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// ใช้พอร์ตจาก environment variable ของ Render (ถ้าไม่มีให้ default 3000)
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// serve static frontend จากโฟลเดอร์ public
app.use(express.static(path.join(__dirname, 'public')));

const configDir = path.join(__dirname, 'public', 'configs');

// สร้างโฟลเดอร์ configs ถ้ายังไม่มี
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
  console.log('Created configs directory');
}

// API: GET config ของ server
app.get('/api/config/:server', (req, res) => {
  const serverName = req.params.server;
  const filePath = path.join(configDir, `config_${serverName}.json`);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Config file for '${serverName}' not found or error reading:`, err);
      return res.status(404).json({ error: 'ไม่พบ config หรือโหลด config ล้มเหลว' });
    }
    try {
      const config = JSON.parse(data);
      res.json(config);
    } catch (e) {
      res.status(500).json({ error: 'ไฟล์ config เสียหาย' });
    }
  });
});

// API: POST บันทึก config ของ server
app.post('/api/save-config', (req, res) => {
  const { serverName, config } = req.body;
  if (!serverName || !config) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
  }
  const filePath = path.join(configDir, `config_${serverName}.json`);

  fs.writeFile(filePath, JSON.stringify(config, null, 2), err => {
    if (err) {
      console.error('Write file error:', err);
      return res.status(500).json({ error: 'บันทึก config ไม่สำเร็จ' });
    }
    res.json({ message: `บันทึก config_${serverName}.json เรียบร้อยแล้ว` });
  });
});

// สั่งให้ server รัน listen พอร์ตที่กำหนด
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
