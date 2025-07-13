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

// 3. Initialize Express App
const app = express();
const PORT = 3000;

// 4. Use Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for batch uploads

// --- API Routes ---

// Menu Endpoints (CRUD)
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

app.post('/api/menu/batch-upload', async (req, res) => {
    const newItems = req.body;
    if (!Array.isArray(newItems) || newItems.length === 0) {
        return res.status(400).json({ message: 'Invalid menu data provided.' });
    }
    try {
        const existingSnapshot = await menuCollection.get();
        const deleteBatch = db.batch();
        existingSnapshot.docs.forEach(doc => { deleteBatch.delete(doc.ref); });
        await deleteBatch.commit();
        
        const addBatch = db.batch();
        newItems.forEach(item => {
            const docRef = menuCollection.doc();
            addBatch.set(docRef, item);
        });
        await addBatch.commit();
        res.status(201).json({ success: true, message: `Successfully imported ${newItems.length} menu items.` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to import menu items." });
    }
});

// ** New Endpoint for Batch Menu Delete **
app.post('/api/menu/batch-delete', async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Array of IDs is required.' });
    }
    try {
        const batch = db.batch();
        ids.forEach(id => {
            const docRef = menuCollection.doc(id);
            batch.delete(docRef);
        });
        await batch.commit();
        console.log(`Deleted ${ids.length} menu items.`);
        res.status(200).json({ success: true, message: `Deleted ${ids.length} items.` });
    } catch (error) {
        console.error("Error during batch menu delete:", error);
        res.status(500).json({ success: false, message: "Failed to delete menu items." });
    }
});


// Order Endpoints
app.post('/api/orders', async (req, res) => { /* ... same as before ... */ });
app.put('/api/orders/:id/status', async (req, res) => { /* ... same as before ... */ });
app.post('/api/orders/clear-completed', async (req, res) => { /* ... same as before ... */ });
app.get('/api/reports', async (req, res) => { /* ... same as before ... */ });


// 5. Start the server
app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
    console.log('Connected to Firebase Firestore');
});
