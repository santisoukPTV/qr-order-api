// server.js

// 1. Import Dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// 2. Initialize Firebase
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const menuCollection = db.collection('menuItems');
const ordersCollection = db.collection('orders'); // <-- เพิ่ม Collection สำหรับเก็บออเดอร์

// --- ข้อมูลเมนูใหม่ทั้งหมดจากไฟล์ CSV เท่านั้น ---
const newMenuData = [
    // (รายการเมนูทั้งหมดของคุณจะอยู่ที่นี่ - โค้ดถูกย่อเพื่อความกระชับ)
    { name_th: 'ນ້ຳຫົວເສືອກາງ', name_en: 'Tigerhead Water (M)', price: 8000, category: 'drink', image: 'https://placehold.co/100x100/a16207/ffffff?text=Water' },
    // ... รายการเมนูอื่นๆ ทั้งหมด
];

// --- ฟังก์ชันสำหรับเพิ่มข้อมูลเริ่มต้น ---
async function seedDatabase() {
    const snapshot = await menuCollection.get();
    if (snapshot.empty) {
        console.log('No menu items found. Seeding database...');
        const promises = newMenuData.map(item => menuCollection.add(item));
        await Promise.all(promises);
        console.log('Database seeded successfully!');
    } else {
        console.log('Database already contains data. Skipping seeding.');
    }
}

// 3. Initialize Express App
const app = express();
const PORT = 3000;

// 4. Use Middlewares
app.use(cors());
app.use(bodyParser.json());

// --- API Routes ---

// GET /api/menu - ดึงข้อมูลเมนูทั้งหมด
app.get('/api/menu', async (req, res) => {
    try {
        const snapshot = await menuCollection.get();
        const menuItems = [];
        snapshot.forEach(doc => {
            menuItems.push({ id: doc.id, ...doc.data() });
        });
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

// POST /api/menu - เพิ่มเมนูใหม่
app.post('/api/menu', async (req, res) => {
    try {
        const newItemData = req.body;
        const docRef = await menuCollection.add(newItemData);
        res.status(201).json({ id: docRef.id, ...newItemData });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

// PUT /api/menu/:id - แก้ไขเมนูตาม ID
app.put('/api/menu/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        const updatedData = req.body;
        await menuCollection.doc(itemId).update(updatedData);
        res.json({ id: itemId, ...updatedData });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

// DELETE /api/menu/:id - ลบเมนูตาม ID
app.delete('/api/menu/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        await menuCollection.doc(itemId).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

// ** Endpoint ใหม่สำหรับรับออเดอร์ **
// POST /api/orders - รับออเดอร์ใหม่จากลูกค้า
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        // เพิ่มข้อมูลเวลาที่เซิร์ฟเวอร์ได้รับออเดอร์
        orderData.serverTimestamp = admin.firestore.FieldValue.serverTimestamp();
        
        const docRef = await ordersCollection.add(orderData);
        console.log('New order received and saved with ID:', docRef.id);
        
        // ส่งข้อมูลกลับไปยืนยันว่าได้รับออเดอร์แล้ว
        res.status(201).json({ success: true, orderId: docRef.id });
    } catch (error) {
        console.error("Error saving order: ", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});


// 5. Start the server
app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
    console.log('Connected to Firebase Firestore');
    seedDatabase().catch(console.error);
});
