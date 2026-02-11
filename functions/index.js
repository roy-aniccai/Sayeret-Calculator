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

// ============================================================================
// CSV EXPORT ENDPOINTS
// ============================================================================

const CSV_COLUMNS = [
    'leadName', 'leadPhone', 'createdAt', 'didRequestCallback', 'didClickCalendly',
    'canSave', 'didRequestSavings', 'monthlySavings', 'newMortgageDurationYears',
    'age', 'mortgageBalance', 'otherLoansBalance', 'mortgagePayment',
    'otherLoansPayment', 'propertyValue', 'sessionId'
];

function extractRow(doc) {
    const d = doc.data();
    const json = d.fullDataJson || {};
    const sim = d.simulationResult || {};

    // Convert Firestore timestamp to ISO string
    let createdAtStr = '';
    if (d.createdAt && typeof d.createdAt.toDate === 'function') {
        createdAtStr = d.createdAt.toDate().toISOString();
    } else if (d.createdAt) {
        createdAtStr = String(d.createdAt);
    }

    return {
        leadName: d.leadName || json.leadName || json.lead_name || '',
        leadPhone: d.leadPhone || json.leadPhone || json.lead_phone || '',
        createdAt: createdAtStr,
        didRequestCallback: d.didRequestCallback || false,
        didClickCalendly: d.didClickCalendly || false,
        canSave: sim.canSave != null ? sim.canSave : '',
        didRequestSavings: d.didRequestSavings || false,
        monthlySavings: sim.monthlySavings != null ? sim.monthlySavings : '',
        newMortgageDurationYears: sim.newMortgageDurationYears != null ? sim.newMortgageDurationYears : '',
        age: json.age != null ? json.age : '',
        mortgageBalance: json.mortgageBalance != null ? json.mortgageBalance : '',
        otherLoansBalance: json.otherLoansBalance != null ? json.otherLoansBalance : '',
        mortgagePayment: json.mortgagePayment != null ? json.mortgagePayment : '',
        otherLoansPayment: json.otherLoansPayment != null ? json.otherLoansPayment : '',
        propertyValue: json.propertyValue != null ? json.propertyValue : '',
        sessionId: d.sessionId || json.sessionId || ''
    };
}

function escapeCsvValue(val) {
    const str = String(val == null ? '' : val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function buildCsv(rows) {
    const header = CSV_COLUMNS.map(escapeCsvValue).join(',');
    const lines = rows.map(row =>
        CSV_COLUMNS.map(col => escapeCsvValue(row[col])).join(',')
    );
    return header + '\n' + lines.join('\n');
}

adminRouter.post('/export-csv', async (req, res) => {
    try {
        const { mode } = req.body;
        if (!mode || !['full', 'delta'].includes(mode)) {
            return res.status(400).json({ error: 'mode must be "full" or "delta"' });
        }

        // For delta mode, find the last export timestamp
        let sinceDate = null;
        if (mode === 'delta') {
            const lastExport = await db.collection('csv_exports')
                .orderBy('runTimestamp', 'desc')
                .limit(1)
                .get();
            if (!lastExport.empty) {
                const lastRun = lastExport.docs[0].data().runTimestamp;
                if (lastRun && typeof lastRun.toDate === 'function') {
                    sinceDate = lastRun.toDate();
                } else if (lastRun) {
                    sinceDate = new Date(lastRun);
                }
            }
        }

        // Query submissions
        let query = db.collection('submissions').orderBy('createdAt', 'desc');
        if (mode === 'delta' && sinceDate) {
            query = query.where('createdAt', '>', sinceDate);
        }
        // Limit to 2 for testing
        query = query.limit(2);

        const snapshot = await query.get();
        const rows = snapshot.docs.map(extractRow);

        // Build CSV string
        const csvContent = buildCsv(rows);

        // Upload to Firebase Storage
        const now = new Date();
        const ts = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
        const fileName = `csv_exports/submissions_${mode}_${ts}.csv`;

        const bucket = admin.storage().bucket('mortgage-85413.firebasestorage.app');
        const file = bucket.file(fileName);

        await file.save(csvContent, {
            contentType: 'text/csv',
            metadata: { cacheControl: 'public, max-age=31536000' }
        });

        // Generate signed URL (valid 7 days)
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000
        });

        // Save export metadata to Firestore
        const exportDoc = {
            runTimestamp: admin.firestore.FieldValue.serverTimestamp(),
            runTimestampISO: now.toISOString(),
            mode,
            submissionCount: rows.length,
            csvStoragePath: fileName,
            csvDownloadUrl: signedUrl,
            rows
        };
        const docRef = await db.collection('csv_exports').add(exportDoc);

        console.log(`CSV export (${mode}): ${rows.length} rows → ${fileName}`);
        res.json({
            success: true,
            exportId: docRef.id,
            csvDownloadUrl: signedUrl,
            submissionCount: rows.length,
            csvStoragePath: fileName
        });
    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({ error: error.message });
    }
});

adminRouter.get('/export-history', async (req, res) => {
    try {
        const snapshot = await db.collection('csv_exports')
            .orderBy('runTimestamp', 'desc')
            .limit(20)
            .get();

        const data = snapshot.docs.map(doc => {
            const d = doc.data();
            let runTimestampStr = d.runTimestampISO || '';
            if (!runTimestampStr && d.runTimestamp && typeof d.runTimestamp.toDate === 'function') {
                runTimestampStr = d.runTimestamp.toDate().toISOString();
            }
            return {
                id: doc.id,
                runTimestamp: runTimestampStr,
                mode: d.mode,
                submissionCount: d.submissionCount,
                csvDownloadUrl: d.csvDownloadUrl,
                csvStoragePath: d.csvStoragePath
            };
        });

        res.json({ message: 'success', data });
    } catch (error) {
        console.error('Export history error:', error);
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
