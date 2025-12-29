import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = 3005;

app.use(cors());
app.use(bodyParser.json());

// API: Submit Form Data
app.post('/api/submit', (req, res) => {
    const { leadName, leadPhone, leadEmail, sessionId, ...otherData } = req.body;
    const fullDataJson = JSON.stringify(req.body);

    const sql = `INSERT INTO submissions (lead_name, lead_phone, lead_email, full_data_json, session_id) VALUES (?, ?, ?, ?, ?)`;
    const params = [leadName, leadPhone, leadEmail, fullDataJson, sessionId];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: req.body,
            id: this.lastID
        });
    });
});

// API: Track Event
app.post('/api/event', (req, res) => {
    const { sessionId, eventType, eventData } = req.body;
    const eventDataJson = JSON.stringify(eventData || {});

    const sql = `INSERT INTO events (session_id, event_type, event_data_json) VALUES (?, ?, ?)`;
    const params = [sessionId, eventType, eventDataJson];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            id: this.lastID
        });
    });
});

// Admin API: Get Submissions
app.get('/api/admin/submissions', (req, res) => {
    const sql = "SELECT * FROM submissions ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        // Parse the JSON string back to object for the frontend
        // AND Transform snake_case columns to camelCase to match Production (Firebase) schema
        const submissions = rows.map(row => ({
            id: row.id,
            createdAt: row.created_at, // Map created_at -> createdAt
            leadName: row.lead_name,   // Map lead_name -> leadName
            leadPhone: row.lead_phone, // Map lead_phone -> leadPhone
            leadEmail: row.lead_email, // Map lead_email -> leadEmail
            sessionId: row.session_id, // Map session_id -> sessionId
            full_data_json: JSON.parse(row.full_data_json) // Keep this for legacy compat, but data is also in top level now
        }));
        res.json({
            message: 'success',
            data: submissions
        });
    });
});

// Admin API: Get Events
app.get('/api/admin/events', (req, res) => {
    const sql = "SELECT * FROM events ORDER BY created_at DESC LIMIT 100"; // Limit to last 100 events
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        const events = rows.map(row => ({
            id: row.id,
            createdAt: row.created_at, // Map created_at -> createdAt
            sessionId: row.session_id, // Map session_id -> sessionId
            eventType: row.event_type, // Map event_type -> eventType
            event_data_json: JSON.parse(row.event_data_json)
        }));
        res.json({
            message: 'success',
            data: events
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
