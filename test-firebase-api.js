// Test script to verify Firebase API connectivity
const testData = {
    sessionId: "test-session-456",
    leadName: "Test User Firebase",
    leadPhone: "0501234567",
    leadEmail: "test@example.com"
};

const API_URL = 'https://us-central1-mortgage-85413.cloudfunctions.net/api';

console.log(`Testing Firebase API at: ${API_URL}/submit`);

fetch(`${API_URL}/submit`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
})
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        return response.json();
    })
    .then(data => {
        console.log('✅ Success:', data);
    })
    .catch(error => {
        console.error('❌ Error:', error);
    });
