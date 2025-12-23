const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Create a router to define routes once
const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: Submit Form Data
router.post('/submit', async (req, res) => {
    console.log('Received submission request', req.body);
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
        console.log('Submission saved with ID:', docRef.id);

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
router.post('/event', async (req, res) => {
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
router.get('/admin/submissions', async (req, res) => {
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
router.get('/admin/events', async (req, res) => {
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

// Mount the router on both '/' and '/api' paths
// This handles:
// 1. Direct calls: https://.../api/submit -> matches /submit in router (path relative to function)
// 2. Hosting rewrite: domain.com/api/submit -> matches /api/submit (if prefix preserved)
// 3. Hosting rewrite stripping?: mounts on / just in case.
app.use('/', router);
// Note: If request comes in as /api/submit, app.use('/', router) usually matches /api/submit against router routes if router is on /.
// But express router matching depends on `req.path`.
// If app is mounted on '/', `req.path` is the full path.
// So if req.path is `/api/submit`, `router.post('/submit')` will NOT match.
// So we explicitly mount on /api as well.
app.use('/api', router);

// Export naming it "api" using v2 syntax
exports.api = onRequest({ region: 'us-central1', cors: true }, app);
