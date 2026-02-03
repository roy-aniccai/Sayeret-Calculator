// Test script to verify API connectivity
const testData = {
    sessionId: "test-session-123",
    leadName: "Test User",
    leadPhone: "0501234567",
    leadEmail: "test@example.com"
};

fetch('http://localhost:3005/api/submit', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
})
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
