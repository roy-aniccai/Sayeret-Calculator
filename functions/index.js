const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// API: Submit Form Data
app.post('/submit', async (req, res) => {
    try {
        const { leadName, leadPhone, leadEmail, sessionId, ...otherData } = req.body;

        // Add timestamp
        const submission = {
            leadName,
            leadPhone,
            leadEmail,
            sessionId,
            fullDataJson: req.body, // Store full object as Map/JSON
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('submissions').add(submission);

        res.json({
            message: 'success',
            data: req.body,
            id: docRef.id
        });
    } catch (error) {
        console.error('Error submitting data:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Track Event
app.post('/event', async (req, res) => {
    try {
        const { sessionId, eventType, eventData } = req.body;

        const event = {
            sessionId,
            eventType,
            eventData: eventData || {},
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('events').add(event);

        res.json({
            message: 'success',
            id: docRef.id
        });
    } catch (error) {
        console.error('Error tracking event:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin API: Get Submissions
app.get('/admin/submissions', async (req, res) => {
    try {
        const snapshot = await db.collection('submissions').orderBy('createdAt', 'desc').get();
        const submissions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Map fullDataJson back to full_data_json if frontend expects that casing
            // But better to return clean object. 
            // The frontend in utils/api.ts expects "full_data_json" property if we wanna match SQLite format exactly
            // OR we can update frontend to use clean fields.
            // For now, let's match the response structure of the SQLite version a bit roughly, 
            // BUT the current frontend code parses `full_data_json` string. 
            // In Firestore, it's already an object.
            // Wait, existing frontend: `full_data_json: JSON.parse(row.full_data_json)`
            // SQLite stored it as TEXT string. Firestore stores it as MAP.
            // So existing frontend `JSON.parse` might BREAK if we send an object.
            // Let's check api.ts logic? No, `server/index.js` did the parsing before sending to frontend.
            // `server/index.js`: `full_data_json: JSON.parse(row.full_data_json)`
            // So frontend expects an OBJECT. Good.
            full_data_json: doc.data().fullDataJson
        }));

        res.json({
            message: 'success',
            data: submissions
        });
    } catch (error) {
        console.error('Error getting submissions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin API: Get Events
app.get('/admin/events', async (req, res) => {
    try {
        const snapshot = await db.collection('events').orderBy('createdAt', 'desc').limit(100).get();
        const events = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Match backend logic: `event_data_json: JSON.parse(row.event_data_json)`
            event_data_json: doc.data().eventData
        }));

        res.json({
            message: 'success',
            data: events
        });
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({ error: error.message });
    }
});

exports.api = functions.https.onRequest(app);
