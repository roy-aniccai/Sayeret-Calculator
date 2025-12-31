import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createSubmission, createEvent, getAllSubmissions, getAllEvents } from './db/queries.js';

const app = express();
const PORT = 3005;

app.use(cors());
app.use(bodyParser.json());

// API: Submit Form Data
app.post('/api/submit', async (req, res) => {
    const { sessionId } = req.body;
    try {
        const result = await createSubmission(req.body, sessionId);
        res.json({
            message: 'success',
            data: result
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// API: Track Event
app.post('/api/event', async (req, res) => {
    const { sessionId, eventType, eventData } = req.body;
    try {
        const result = await createEvent(sessionId, eventType, eventData);
        res.json({
            message: 'success',
            id: result.id
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin API: Get Submissions
app.get('/api/admin/submissions', async (req, res) => {
    try {
        const submissions = await getAllSubmissions();
        res.json({
            message: 'success',
            data: submissions
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin API: Get Events
app.get('/api/admin/events', async (req, res) => {
    try {
        const events = await getAllEvents();
        res.json({
            message: 'success',
            data: events
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
