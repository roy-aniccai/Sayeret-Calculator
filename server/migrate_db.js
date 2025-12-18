import db from './db.js';

db.run("ALTER TABLE submissions ADD COLUMN session_id TEXT", (err) => {
    if (err) {
        console.log("Column might already exist or error:", err.message);
    } else {
        console.log("Successfully added session_id to submissions table.");
    }
});
