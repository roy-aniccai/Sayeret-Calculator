const { onRequest } = require('firebase-functions/v2/https');
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
        const { leadName, leadPhone, leadEmail, sessionId } = req.body;

        const submission = {
            leadName: leadName || '',
            leadPhone: leadPhone || '',
            leadEmail: leadEmail || '',
            sessionId: sessionId || '',
            fullDataJson: req.body,
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
            sessionId: sessionId || '',
            eventType: eventType || '',
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

// Export naming it "api" using v2 syntax
exports.api = onRequest({ region: 'us-central1', cors: true }, app);
