const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const { getFirestore } = require('firebase-admin/firestore');

admin.initializeApp();
const db = getFirestore(admin.app(), 'mortgage');

// --- PUBLIC API (Submissions & Tracking) ---
const publicApp = express();
publicApp.use(cors({ origin: true }));
publicApp.use(express.json());

const publicRouter = express.Router();

publicRouter.get('/health', (req, res) => {
    res.json({ status: 'ok', type: 'public', timestamp: new Date().toISOString() });
});

publicRouter.post('/submit', async (req, res) => {
    console.log('Received submission', req.body);
    try {
        const { leadName, leadPhone, sessionId, simulationResult, interestedInInsurance } = req.body;
        const submission = {
            leadName: leadName || '',
            leadPhone: leadPhone || '',
            sessionId: sessionId || '',
            simulationResult: simulationResult || null,
            interestedInInsurance: interestedInInsurance ?? null,
            postSubmissionLog: [],
            didClickCalendly: false,
            didRequestCallback: false,
            didRequestSavings: false,
            contactDetailsUpdated: false,
            fullDataJson: req.body,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('submissions').add(submission);
        res.json({ message: 'success', id: docRef.id });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: error.message });
    }
});

publicRouter.post('/update-submission', async (req, res) => {
    try {
        const { submissionId, action, contactUpdate } = req.body;

        if (!submissionId) {
            return res.status(400).json({ error: 'Missing submissionId' });
        }

        const updates = {};

        // Handle Post-Submission Action (Log it)
        if (action) {
            updates.postSubmissionLog = admin.firestore.FieldValue.arrayUnion({
                ...action,
                timestamp: new Date().toISOString()
            });

            // Update convenience flags based on action type
            if (action.type === 'CLICK_CALENDLY') updates.didClickCalendly = true;
            if (action.type === 'CLICK_CALLBACK') updates.didRequestCallback = true;
            if (action.type === 'CLICK_SAVE_FOR_ME') updates.didRequestSavings = true;
        }

        // Handle Contact Details Update
        if (contactUpdate) {
            if (contactUpdate.leadName) updates.leadName = contactUpdate.leadName;
            if (contactUpdate.leadPhone) updates.leadPhone = contactUpdate.leadPhone;
            if (contactUpdate.interestedInInsurance !== undefined) {
                updates.interestedInInsurance = contactUpdate.interestedInInsurance;
            }
            updates.contactDetailsUpdated = true;

            // Log the update action as well
            updates.postSubmissionLog = admin.firestore.FieldValue.arrayUnion({
                type: 'UPDATE_CONTACT_DETAILS',
                timestamp: new Date().toISOString(),
                details: contactUpdate
            });
        }

        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await db.collection('submissions').doc(submissionId).update(updates);
        res.json({ message: 'success', updated: true });
    } catch (error) {
        console.error('Update submission error:', error);
        res.status(500).json({ error: error.message });
    }
});

publicRouter.post('/event', async (req, res) => {
    try {
        const { sessionId, eventType, eventData } = req.body;
        const event = {
            sessionId: sessionId || '',
            eventType: eventType || '',
            eventData: eventData || {},
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('events').add(event);
        res.json({ message: 'success' });
    } catch (error) {
        console.error('Event error:', error);
        res.status(500).json({ error: error.message });
    }
});

publicApp.use('/', publicRouter);
publicApp.use('/api', publicRouter);


// --- ADMIN API (Protected) ---
const adminApp = express();
adminApp.use(cors({ origin: true }));
adminApp.use(express.json());

// Security Middleware (Firebase Auth)
const authMiddleware = async (req, res, next) => {
    try {
        if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))) {
            console.error('No ID token found');
            return res.status(403).send('Unauthorized');
        }
        const idToken = req.headers.authorization.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying auth token', error);
        res.status(403).send('Unauthorized');
    }
};

adminApp.use(authMiddleware);

const adminRouter = express.Router();

adminRouter.get('/health', (req, res) => {
    res.json({ status: 'ok', type: 'admin' });
});

// Note: Paths are simple because we will rewrite /admin-api/submissions -> /submissions
adminRouter.get('/submissions', async (req, res) => {
    try {
        const snapshot = await db.collection('submissions').orderBy('createdAt', 'desc').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), full_data_json: doc.data().fullDataJson }));
        res.json({ message: 'success', data });
    } catch (error) {
        console.error('Admin error:', error);
        res.status(500).json({ error: error.message });
    }
});

adminRouter.get('/events', async (req, res) => {
    try {
        const snapshot = await db.collection('events').orderBy('createdAt', 'desc').limit(100).get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), event_data_json: doc.data().eventData }));
        res.json({ message: 'success', data });
    } catch (error) {
        console.error('Admin error:', error);
        res.status(500).json({ error: error.message });
    }
});

adminApp.use('/', adminRouter);
adminApp.use('/admin-api', adminRouter); // Support direct path if needed

// EXPORTS
// 1. Public API (Open to internet)
exports.api = onRequest({ region: 'us-central1', cors: true, invoker: 'public' }, publicApp);

// 2. Admin API (Open to internet but protected by Header Key)
exports.adminApi = onRequest({ region: 'us-central1', cors: true, invoker: 'public' }, adminApp);
