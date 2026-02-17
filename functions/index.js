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
        const { submissionId, action, contactUpdate, ...financialData } = req.body;

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
            if (action.type === 'CLICK_CALLBACK' || action.type === 'REQUEST_CALLBACK') updates.didRequestCallback = true;
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


        // Handle Financial Data Update (Re-submission)
        // If financial fields are present in the top-level body (excluding reserved keys), update them
        const reservedKeys = ['submissionId', 'action', 'contactUpdate'];
        const financialUpdates = {};
        Object.keys(financialData).forEach(key => {
            if (!reservedKeys.includes(key)) {
                financialUpdates[key] = financialData[key];
            }
        });

        if (Object.keys(financialUpdates).length > 0) {
            // Merge financial updates into the root document
            Object.assign(updates, financialUpdates);

            // Also update fullDataJson if it exists in the payload, or merge into it
            if (financialData.fullDataJson) {
                updates.fullDataJson = financialData.fullDataJson;
            } else {
                // If fullDataJson isn't explicitly passed but we have other fields, 
                // we might want to update it. However, Firestore doesn't support deep merge easily.
                // Best practice: Frontend should send the full `fullDataJson` object if it wants to update it.
            }
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
        const data = snapshot.docs.map(doc => {
            const d = doc.data();
            let createdAt = d.createdAt;
            // Convert Firestore Timestamp to ISO string
            if (createdAt) {
                if (typeof createdAt.toDate === 'function') {
                    createdAt = createdAt.toDate().toISOString();
                } else if (createdAt._seconds) {
                    createdAt = new Date(createdAt._seconds * 1000).toISOString();
                }
            }
            return {
                id: doc.id,
                ...d,
                createdAt,
                full_data_json: d.fullDataJson
            };
        });
        res.json({ message: 'success', data });
    } catch (error) {
        console.error('Admin error:', error);
        res.status(500).json({ error: error.message });
    }
});

adminRouter.get('/events', async (req, res) => {
    try {
        const snapshot = await db.collection('events').orderBy('createdAt', 'desc').get();
        const data = snapshot.docs.map(doc => {
            const d = doc.data();
            let createdAt = d.createdAt;
            if (createdAt) {
                if (typeof createdAt.toDate === 'function') {
                    createdAt = createdAt.toDate().toISOString();
                } else if (createdAt._seconds) {
                    createdAt = new Date(createdAt._seconds * 1000).toISOString();
                }
            }
            return {
                id: doc.id,
                ...d,
                createdAt,
                event_data_json: d.eventData
            };
        });
        res.json({ message: 'success', data });
    } catch (error) {
        console.error('Admin error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// FUNNEL DATA ENDPOINT
// ============================================================================
adminRouter.get('/funnel-data', async (req, res) => {
    try {
        // 1. Fetch all step_view events
        const eventsSnapshot = await db.collection('events')
            .where('eventType', '==', 'single_track_step_view')
            .get();

        // Build sets of unique sessionIds per step
        const stepSessions = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set(), 6: new Set() };
        eventsSnapshot.docs.forEach(doc => {
            const d = doc.data();
            const sid = d.sessionId || (d.eventData && d.eventData.sessionId);
            const step = d.eventData && d.eventData.step;
            if (sid && step && stepSessions[step]) {
                stepSessions[step].add(sid);
            }
        });

        // 2. Fetch all submissions for bottom-of-funnel metrics
        const subsSnapshot = await db.collection('submissions').get();
        const requestSavingSessions = new Set();
        const calendlySessions = new Set();
        const callbackSessions = new Set();
        const insuranceSessions = new Set();

        // Also build a per-session submission map for lead filtering
        const sessionSubmissionMap = {}; // sessionId -> submission data

        subsSnapshot.docs.forEach(doc => {
            const d = doc.data();
            const sid = d.sessionId || '';
            if (!sid) return;

            sessionSubmissionMap[sid] = {
                id: doc.id,
                leadName: d.leadName || '',
                leadPhone: d.leadPhone || '',
                createdAt: d.createdAt && typeof d.createdAt.toDate === 'function'
                    ? d.createdAt.toDate().toISOString() : (d.createdAt || ''),
            };

            if (d.didRequestSavings) requestSavingSessions.add(sid);
            if (d.didClickCalendly) calendlySessions.add(sid);
            if (d.didRequestCallback) callbackSessions.add(sid);
            if (d.interestedInInsurance === true) insuranceSessions.add(sid);
        });

        // 3. Build funnel stages
        const stages = [
            { key: 'landing', label: 'כניסה לדף', step: 1, sessions: [...stepSessions[1]] },
            { key: 'debts', label: 'חובות', step: 2, sessions: [...stepSessions[2]] },
            { key: 'payments', label: 'החזרים חודשיים', step: 3, sessions: [...stepSessions[3]] },
            { key: 'assets', label: 'נכסים', step: 4, sessions: [...stepSessions[4]] },
            { key: 'contact', label: 'פרטי קשר', step: 5, sessions: [...stepSessions[5]] },
            { key: 'simulator', label: 'סימולטור', step: 6, sessions: [...stepSessions[6]] },
            { key: 'request_saving', label: 'בקשת חיסכון', step: 6.1, sessions: [...requestSavingSessions] },
            { key: 'schedule_meeting', label: 'תיאום פגישה', step: 7, sessions: [...calendlySessions] },
            { key: 'request_callback', label: 'בקשת שיחה חוזרת', step: 8, sessions: [...callbackSessions] },
        ];

        const totalSessions = stepSessions[1].size;

        const funnel = stages.map(s => ({
            key: s.key,
            label: s.label,
            step: s.step,
            count: s.sessions.length,
            percentage: totalSessions > 0 ? Math.round((s.sessions.length / totalSessions) * 100) : 0,
            sessionIds: s.sessions, // for linking to filtered leads
        }));

        // 4. Extra metrics
        const extras = {
            interestedInInsurance: insuranceSessions.size,
            interestedInInsurancePercentage: subsSnapshot.size > 0
                ? Math.round((insuranceSessions.size / subsSnapshot.size) * 100) : 0,
            totalSubmissions: subsSnapshot.size,
        };

        res.json({ message: 'success', funnel, extras, sessionSubmissionMap });
    } catch (error) {
        console.error('Funnel data error:', error);
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
        // Remove limit for production
        // query = query.limit(2);

        const snapshot = await query.get();
        const rows = snapshot.docs.map(extractRow);

        // Build CSV string
        const csvContent = buildCsv(rows);

        // Upload to Firebase Storage
        const now = new Date();
        const ts = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
        const fileName = `csv_exports/submissions_${mode}_${ts}.csv`;

        // Use the explicit bucket name confirmed by the user
        const bucket = admin.storage().bucket('mortgage-85413.firebasestorage.app');
        const file = bucket.file(fileName);

        await file.save(csvContent, {
            contentType: 'text/csv',
            metadata: { cacheControl: 'public, max-age=31536000' }
        });

        // Generate signed URL (valid 7 days)
        let signedUrl = '';
        try {
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000
            });
            signedUrl = url;
        } catch (signError) {
            console.error('Error generating signed URL:', signError);
            // Fallback: try to make public if signing fails (or return empty string and let user download from console)
            try {
                await file.makePublic();
                signedUrl = file.publicUrl();
            } catch (publicError) {
                console.error('Error making file public:', publicError);
            }
        }

        const consoleUrl = `https://console.firebase.google.com/project/mortgage-85413/storage/${bucket.name}/files`;

        // Save export metadata to Firestore
        const exportDoc = {
            runTimestamp: admin.firestore.FieldValue.serverTimestamp(),
            runTimestampISO: now.toISOString(),
            mode,
            submissionCount: rows.length,
            csvStoragePath: fileName,
            csvDownloadUrl: signedUrl,
            consoleUrl,
            rows: [] // Don't save rows to Firestore anymore to save space/cost, just metadata
        };
        const docRef = await db.collection('csv_exports').add(exportDoc);

        // ... inside the existing adminRouter ...
        console.log(`CSV export (${mode}): ${rows.length} rows → ${fileName}`);
        res.json({
            success: true,
            exportId: docRef.id,
            csvDownloadUrl: signedUrl,
            consoleUrl,
            submissionCount: rows.length,
            csvStoragePath: fileName
        });
    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({ error: error.message });
    }
});

adminRouter.post('/export-events-csv', async (req, res) => {
    try {
        console.log('Starting events export...');
        const snapshot = await db.collection('events').orderBy('createdAt', 'desc').get();

        const EVENT_CSV_COLUMNS = ['id', 'sessionId', 'eventType', 'eventData', 'createdAt'];

        const rows = snapshot.docs.map(doc => {
            const d = doc.data();

            // Format Timestamp
            let createdAtStr = '';
            if (d.createdAt && typeof d.createdAt.toDate === 'function') {
                createdAtStr = d.createdAt.toDate().toISOString();
            } else if (d.createdAt) {
                createdAtStr = String(d.createdAt);
            }

            // Stringify eventData
            let eventDataStr = '';
            try {
                eventDataStr = JSON.stringify(d.eventData || {});
            } catch (e) {
                eventDataStr = '{}';
            }

            return {
                id: doc.id,
                sessionId: d.sessionId || '',
                eventType: d.eventType || '',
                eventData: eventDataStr,
                createdAt: createdAtStr
            };
        });

        // Build CSV
        const header = EVENT_CSV_COLUMNS.map(escapeCsvValue).join(',');
        const lines = rows.map(row =>
            EVENT_CSV_COLUMNS.map(col => escapeCsvValue(row[col])).join(',')
        );
        const csvContent = header + '\n' + lines.join('\n');

        // Upload to Firebase Storage
        const now = new Date();
        const ts = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
        const fileName = `csv_exports/events_${ts}.csv`;

        const bucket = admin.storage().bucket('mortgage-85413.firebasestorage.app');
        const file = bucket.file(fileName);

        await file.save(csvContent, {
            contentType: 'text/csv',
            metadata: { cacheControl: 'public, max-age=31536000' }
        });

        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            csvDownloadUrl: signedUrl,
            count: rows.length,
            csvStoragePath: fileName
        });

    } catch (error) {
        console.error('Event export error:', error);
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
                consoleUrl: d.consoleUrl,
                csvStoragePath: d.csvStoragePath
            };
        });

        res.json({ message: 'success', data });
    } catch (error) {
        console.error('Export history error:', error);
        res.status(500).json({ error: error.message });
    }
});

adminRouter.delete('/export-history/:id', async (req, res) => {
    try {
        const docId = req.params.id;
        console.log(`Deleting export: ${docId}`);
        const docRef = db.collection('csv_exports').doc(docId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Export not found' });
        }

        const data = doc.data();
        if (data.csvStoragePath) {
            try {
                // Use explicit bucket
                const bucket = admin.storage().bucket('mortgage-85413.firebasestorage.app');
                const file = bucket.file(data.csvStoragePath);
                await file.delete();
                console.log(`Deleted file: ${data.csvStoragePath}`);
            } catch (storageError) {
                console.warn('Failed to delete file from storage (might represent already deleted file):', storageError);
            }
        }

        await docRef.delete();
        res.json({ success: true });
    } catch (error) {
        console.error('Delete export error:', error);
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
