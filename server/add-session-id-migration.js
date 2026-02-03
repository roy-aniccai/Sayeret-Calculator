import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    } else {
        console.log('Connected to the SQLite database for migration.');

        // Check if session_id column exists
        db.all("PRAGMA table_info(submissions)", [], (err, columns) => {
            if (err) {
                console.error('Error checking table structure:', err.message);
                process.exit(1);
            }

            const hasSessionId = columns.some(col => col.name === 'session_id');

            if (hasSessionId) {
                console.log('✅ session_id column already exists in submissions table');
                db.close();
            } else {
                console.log('Adding session_id column to submissions table...');
                db.run('ALTER TABLE submissions ADD COLUMN session_id TEXT', (err) => {
                    if (err) {
                        console.error('❌ Error adding session_id column:', err.message);
                        process.exit(1);
                    } else {
                        console.log('✅ Successfully added session_id column to submissions table');
                        db.close();
                    }
                });
            }
        });
    }
});
