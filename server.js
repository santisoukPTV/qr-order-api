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
const ordersCollection = db.collection('orders');

// (ส่วนของ newMenuData และ seedDatabase เหมือนเดิม ไม่ได้แสดงเพื่อความกระชับ)

// 3. Initialize Express App
const app = express();
const PORT = 3000;

// 4. Use Middlewares
app.use(cors());
app.use(bodyParser.json());

// --- API Routes ---

// (Endpoints สำหรับ /api/menu ทั้งหมดเหมือนเดิม)
app.get('/api/menu', async (req, res) => {
    try {
        const snapshot = await menuCollection.get();
        const menuItems = [];
        snapshot.forEach(doc => { menuItems.push({ id: doc.id, ...doc.data() }); });
        res.json(menuItems);
    } catch (error) { res.status(500).json({ message: "Something went wrong" }); }
});
app.post('/api/menu', async (req, res) => {
    try {
        const docRef = await menuCollection.add(req.body);
        res.status(201).json({ id: docRef.id, ...req.body });
    } catch (error) { res.status(500).json({ message: "Something went wrong" }); }
});
app.put('/api/menu/:id', async (req, res) => {
    try {
        await menuCollection.doc(req.params.id).update(req.body);
        res.json({ id: req.params.id, ...req.body });
    } catch (error) { res.status(500).json({ message: "Something went wrong" }); }
});
app.delete('/api/menu/:id', async (req, res) => {
    try {
        await menuCollection.doc(req.params.id).delete();
        res.status(204).send();
    } catch (error) { res.status(500).json({ message: "Something went wrong" }); }
});


// POST /api/orders - รับออเดอร์ใหม่จากลูกค้า
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        orderData.serverTimestamp = admin.firestore.FieldValue.serverTimestamp();
        
        const docRef = await ordersCollection.add(orderData);
        console.log('New order received and saved with ID:', docRef.id);
        
        res.status(201).json({ success: true, orderId: docRef.id });
    } catch (error) {
        console.error("Error saving order: ", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

// ** Endpoint ใหม่สำหรับอัปเดตสถานะออเดอร์ **
// PUT /api/orders/:id/status
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body; // รับ status ใหม่จาก body

        if (!status) {
            return res.status(400).json({ message: 'New status is required' });
        }

        const orderDoc = ordersCollection.doc(orderId);
        await orderDoc.update({ status: status });

        console.log(`Order ${orderId} status updated to ${status}`);
        res.json({ success: true, message: `Order status updated to ${status}` });
    } catch (error) {
        console.error("Error updating order status: ", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});


// 5. Start the server
app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
    console.log('Connected to Firebase Firestore');
    // seedDatabase().catch(console.error); // ปิดการ seed หลังจากใช้งานครั้งแรกแล้ว
});
