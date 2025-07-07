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
app.use(bodyParser.json());

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

// Order Endpoints
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

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
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

// New Endpoint to clear all completed orders
app.post('/api/orders/clear-completed', async (req, res) => {
    try {
        const snapshot = await ordersCollection.where('status', '==', 'completed').get();
        if (snapshot.empty) {
            return res.status(200).json({ success: true, message: 'No completed orders to clear.' });
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Cleared ${snapshot.size} completed orders.`);
        res.status(200).json({ success: true, message: `Cleared ${snapshot.size} orders.` });
    } catch (error) {
        console.error("Error clearing completed orders:", error);
        res.status(500).json({ success: false, message: "Failed to clear completed orders." });
    }
});

// ** Modified Endpoint for Reports **
app.get('/api/reports', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required.' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Simpler query: Get ALL completed orders
        const ordersSnapshot = await ordersCollection
            .where('status', '==', 'completed')
            .get();

        let totalSales = 0;
        let orderCount = 0;
        const dailySales = {};

        // Filter by date IN THE CODE, not in the query
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            if (order.serverTimestamp) {
                const orderDate = order.serverTimestamp.toDate();
                if (orderDate >= start && orderDate <= end) {
                    totalSales += order.total;
                    orderCount++;
                    
                    const orderDateString = orderDate.toISOString().split('T')[0]; // Get yyyy-MM-dd
                    if (dailySales[orderDateString]) {
                        dailySales[orderDateString] += order.total;
                    } else {
                        dailySales[orderDateString] = order.total;
                    }
                }
            }
        });

        const chartLabels = Object.keys(dailySales).sort();
        const chartData = chartLabels.map(label => dailySales[label]);

        res.json({
            summary: {
                totalSales,
                orderCount,
                avgOrderValue: orderCount > 0 ? totalSales / orderCount : 0,
            },
            chart: {
                labels: chartLabels,
                data: chartData,
            }
        });

    } catch (error) {
        console.error("Error fetching report data:", error);
        res.status(500).json({ message: "Failed to fetch report data." });
    }
});


// 5. Start the server
app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
    console.log('Connected to Firebase Firestore');
});
