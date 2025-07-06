// server.js

// 1. Import Dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// Import Firebase Admin SDK
const admin = require('firebase-admin');

// 2. Initialize Firebase
// --- สำคัญ: ให้แน่ใจว่าคุณมีไฟล์ serviceAccountKey.json อยู่ในโฟลเดอร์เดียวกัน ---
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// สร้าง reference ไปยัง Firestore
const db = admin.firestore();
const menuCollection = db.collection('menuItems'); // ตั้งชื่อ collection ที่จะเก็บเมนู

// 3. Initialize Express App
const app = express();
const PORT = 3000;

// 4. Use Middlewares
app.use(cors());
app.use(bodyParser.json());

// --- API Routes (Endpoints) ที่เชื่อมต่อกับ Firestore ---

// GET /api/menu - ดึงข้อมูลเมนูทั้งหมดจาก Firestore
app.get('/api/menu', async (req, res) => {
    try {
        const snapshot = await menuCollection.get();
        const menuItems = [];
        snapshot.forEach(doc => {
            // ดึงข้อมูลจากแต่ละ document และเพิ่ม field 'id' เข้าไปด้วย
            menuItems.push({ id: doc.id, ...doc.data() });
        });
        res.json(menuItems);
    } catch (error) {
        console.error("Error fetching menu items: ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

// POST /api/menu - เพิ่มเมนูใหม่ลงใน Firestore
app.post('/api/menu', async (req, res) => {
    try {
        const newItemData = req.body;
        // ใช้ .add() เพื่อให้ Firestore สร้าง ID ให้โดยอัตโนมัติ
        const docRef = await menuCollection.add(newItemData);
        res.status(201).json({ id: docRef.id, ...newItemData });
    } catch (error) {
        console.error("Error adding menu item: ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

// PUT /api/menu/:id - แก้ไขเมนูตาม ID ใน Firestore
app.put('/api/menu/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        const updatedData = req.body;
        const itemDoc = menuCollection.doc(itemId);

        // ใช้ .update() เพื่ออัปเดตข้อมูล
        await itemDoc.update(updatedData);
        res.json({ id: itemId, ...updatedData });
    } catch (error) {
        console.error("Error updating menu item: ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

// DELETE /api/menu/:id - ลบเมนูตาม ID ใน Firestore
app.delete('/api/menu/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        await menuCollection.doc(itemId).delete();
        res.status(204).send(); // 204 No Content
    } catch (error) {
        console.error("Error deleting menu item: ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});


// 5. Start the server
app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
    console.log('Connected to Firebase Firestore');
});
