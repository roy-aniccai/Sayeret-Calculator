import db from '../db.js';

export const createSubmission = (data, sessionId) => {
    return new Promise((resolve, reject) => {
        const { leadName, leadPhone, leadEmail, ...otherData } = data;
        const fullDataJson = JSON.stringify(data);
        const sql = `INSERT INTO submissions (lead_name, lead_phone, lead_email, full_data_json, session_id) VALUES (?, ?, ?, ?, ?)`;
        const params = [leadName, leadPhone, leadEmail, fullDataJson, sessionId];

        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, ...data });
        });
    });
};

export const createEvent = (sessionId, eventType, eventData) => {
    return new Promise((resolve, reject) => {
        const eventDataJson = JSON.stringify(eventData || {});
        const sql = `INSERT INTO events (session_id, event_type, event_data_json) VALUES (?, ?, ?)`;
        const params = [sessionId, eventType, eventDataJson];

        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID });
        });
    });
};

export const getAllSubmissions = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM submissions ORDER BY created_at DESC";
        db.all(sql, [], (err, rows) => {
            if (err) return reject(err);

            // Transform snake_case columns to camelCase
            const submissions = rows.map(row => ({
                id: row.id,
                createdAt: row.created_at,
                leadName: row.lead_name,
                leadPhone: row.lead_phone,
                leadEmail: row.lead_email,
                sessionId: row.session_id,
                full_data_json: JSON.parse(row.full_data_json)
            }));
            resolve(submissions);
        });
    });
};

export const getAllEvents = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM events ORDER BY created_at DESC LIMIT 100";
        db.all(sql, [], (err, rows) => {
            if (err) return reject(err);

            const events = rows.map(row => ({
                id: row.id,
                createdAt: row.created_at,
                sessionId: row.session_id,
                eventType: row.event_type,
                event_data_json: JSON.parse(row.event_data_json)
            }));
            resolve(events);
        });
    });
};
