

const BASE_URL = 'http://localhost:3005/api';

async function testBackend() {
    console.log("Testing Backend...");

    // 1. Test Submission
    console.log("1. Testing Submission...");
    const submissionData = {
        leadName: "Test User",
        leadPhone: "0500000000",
        leadEmail: "test@example.com",
        someOtherField: 123
    };

    try {
        const resSub = await fetch(`${BASE_URL}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData)
        });
        const jsonSub = await resSub.json();
        console.log("Submission Response:", resSub.status, jsonSub);

        if (resSub.status !== 200) throw new Error("Submission failed");
    } catch (e) {
        console.error("Submission Error:", e.message);
    }

    // 2. Test Event
    console.log("\n2. Testing Event Tracking...");
    const eventData = {
        sessionId: "test-session-id",
        eventType: "test_event",
        eventData: { foo: "bar" }
    };

    try {
        const resEvt = await fetch(`${BASE_URL}/event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        const jsonEvt = await resEvt.json();
        console.log("Event Response:", resEvt.status, jsonEvt);

        if (resEvt.status !== 200) throw new Error("Event tracking failed");
    } catch (e) {
        console.error("Event Error:", e.message);
    }

    // 3. Test Admin Get
    console.log("\n3. Testing Admin Get Submissions...");
    try {
        const resAdmin = await fetch(`${BASE_URL}/admin/submissions`);
        const jsonAdmin = await resAdmin.json();
        console.log("Admin Submissions:", jsonAdmin.data.length > 0 ? "Found data" : "No data");
        console.log("First submission:", jsonAdmin.data[0]);
    } catch (e) {
        console.error("Admin API Error:", e.message);
    }
}

testBackend();
