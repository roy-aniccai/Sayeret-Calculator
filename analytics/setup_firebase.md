# Firebase Analytics Setup Guide

## Prerequisites

1. **Install Dependencies**
   ```bash
   cd analytics
   pip install -r requirements.txt
   ```

2. **Firebase Credentials Setup**

   ### Option 1: Service Account Key (Recommended for local development)
   1. Go to Firebase Console → Project Settings → Service Accounts
   2. Generate a new private key (JSON file)
   3. Save the JSON file securely (e.g., `firebase-service-account.json`)
   4. Set environment variable:
      ```bash
      export GOOGLE_APPLICATION_CREDENTIALS="path/to/firebase-service-account.json"
      ```

   ### Option 2: Default Credentials (For Google Cloud environments)
   - If running on Google Cloud, default credentials will be used automatically
   - No additional setup required

## Running the Analytics Dashboard

```bash
cd analytics
streamlit run app.py
```

## Troubleshooting

### "Failed to initialize Firebase" Error
- Ensure `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set correctly
- Verify the service account JSON file exists and is readable
- Check that the service account has Firestore read permissions

### "No data found" Warning
- Verify that your application is sending data to Firebase Functions
- Check that the Firebase Functions are deployed and working
- Ensure the Firestore database name is 'mortgage' (as configured in functions)

### Connection Issues
- Verify internet connectivity
- Check Firebase project ID and database configuration
- Ensure Firestore security rules allow read access for the service account

## Data Structure

The dashboard expects these Firestore collections:

### `submissions` collection
- `leadName`: string
- `leadPhone`: string  
- `leadEmail`: string
- `sessionId`: string
- `fullDataJson`: object (complete form data)
- `createdAt`: timestamp

### `events` collection
- `sessionId`: string
- `eventType`: string
- `eventData`: object (event details)
- `createdAt`: timestamp

## Next Steps

Once the dashboard is working:
1. Verify data is displaying correctly
2. Test real-time updates by submitting forms
3. Proceed with enhanced analytics features (Phase 2)