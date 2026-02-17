const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
// Attempts to use application default credentials (e.g., from 'gcloud auth application-default login')
// If that fails, it falls back to a basic config which might not work for Firestore without auth.
// Users running this locally should have authenticated via CLI.

try {
    // Try to load service account if available (optional)
    try {
        const serviceAccount = require('../../service-account-key.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (e) {
        // Fallback to default credentials
        admin.initializeApp({
            projectId: 'mortgage-85413'
        });
    }

    const db = admin.firestore();

    async function exportEvents() {
        console.log('Connecting to Firestore...');

        // Fetch all events
        const snapshot = await db.collection('events').orderBy('createdAt', 'desc').get();

        if (snapshot.empty) {
            console.log('No events found in the database.');
            return;
        }

        console.log(`Found ${snapshot.size} events. Processing...`);

        const events = [];
        snapshot.forEach(doc => {
            const data = doc.data();

            // Format Timestamp
            let createdAt = '';
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                createdAt = data.createdAt.toDate().toISOString();
            } else if (data.createdAt) {
                createdAt = new Date(data.createdAt).toISOString();
            }

            // Flatten/Stringify eventData
            let eventDataStr = '';
            try {
                eventDataStr = JSON.stringify(data.eventData || {});
            } catch (e) {
                eventDataStr = '{}';
            }
            // Escape double quotes for CSV
            eventDataStr = eventDataStr.replace(/"/g, '""');

            events.push([
                doc.id,
                data.sessionId || '',
                data.eventType || '',
                `"${eventDataStr}"`, // Wrap in quotes
                createdAt
            ].join(','));
        });

        // Add Header
        const header = ['id', 'sessionId', 'eventType', 'eventData', 'createdAt'].join(',');
        const csvContent = [header, ...events].join('\n');

        // Write to file
        const outputPath = path.join(__dirname, '../../events_export.csv');
        fs.writeFileSync(outputPath, csvContent);

        console.log(`Successfully exported ${events.length} events to:`);
        console.log(outputPath);
    }

    exportEvents().catch(err => {
        console.error('Error exporting events:', err);
        process.exit(1);
    });

} catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    process.exit(1);
}
