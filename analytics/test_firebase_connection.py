#!/usr/bin/env python3
"""
Test script to verify Firebase connection for analytics dashboard
"""

import os
import sys
import json
from datetime import datetime

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    print("✅ Firebase Admin SDK imported successfully")
except ImportError as e:
    print(f"❌ Failed to import Firebase Admin SDK: {e}")
    print("Run: pip install firebase-admin google-cloud-firestore")
    sys.exit(1)

def test_firebase_connection():
    """Test Firebase connection and basic operations"""
    
    print("\n🔥 Testing Firebase Connection...")
    
    try:
        # Initialize Firebase
        service_account_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
        
        if service_account_path and os.path.exists(service_account_path):
            print(f"🔑 Using service account: {service_account_path}")
            cred = credentials.Certificate(service_account_path)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
        else:
            print("🌐 Using default credentials")
            if not firebase_admin._apps:
                firebase_admin.initialize_app()
        
        # Get Firestore client
        try:
            # Try with database parameter first (for multi-database projects)
            db = firestore.client(database='mortgage')
        except TypeError:
            # Fallback to default database (most common case)
            db = firestore.client()
            print("📊 Using default Firestore database")
        print("✅ Firebase initialized successfully")
        
        # Test collections access
        print("\n📊 Testing collections access...")
        
        # Test submissions collection
        submissions_ref = db.collection('submissions')
        submissions_count = len(list(submissions_ref.limit(1).stream()))
        print(f"📝 Submissions collection accessible: {submissions_count > 0}")
        
        # Test events collection  
        events_ref = db.collection('events')
        events_count = len(list(events_ref.limit(1).stream()))
        print(f"📈 Events collection accessible: {events_count > 0}")
        
        # Get sample data
        print("\n📋 Sample data:")
        
        # Sample submission
        submissions_sample = list(submissions_ref.limit(1).stream())
        if submissions_sample:
            sample_doc = submissions_sample[0]
            sample_data = sample_doc.to_dict()
            print(f"📝 Sample submission ID: {sample_doc.id}")
            print(f"   - Lead Name: {sample_data.get('leadName', 'N/A')}")
            print(f"   - Created: {sample_data.get('createdAt', 'N/A')}")
        else:
            print("📝 No submissions found")
        
        # Sample event
        events_sample = list(events_ref.limit(1).stream())
        if events_sample:
            sample_doc = events_sample[0]
            sample_data = sample_doc.to_dict()
            print(f"📈 Sample event ID: {sample_doc.id}")
            print(f"   - Event Type: {sample_data.get('eventType', 'N/A')}")
            print(f"   - Created: {sample_data.get('createdAt', 'N/A')}")
        else:
            print("📈 No events found")
        
        print("\n✅ Firebase connection test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Firebase connection test failed: {e}")
        
        # Provide troubleshooting tips
        error_msg = str(e).lower()
        if "credentials" in error_msg:
            print("\n🔐 Credentials Issue:")
            print("1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable")
            print("2. Download service account key from Firebase Console")
            print("3. Ensure the key file exists and is readable")
        elif "permission" in error_msg:
            print("\n🚫 Permission Issue:")
            print("1. Check Firestore security rules")
            print("2. Verify service account has proper roles")
        elif "not found" in error_msg:
            print("\n📊 Database Issue:")
            print("1. Verify database name is 'mortgage'")
            print("2. Check if collections exist in Firebase Console")
        
        return False

if __name__ == "__main__":
    print("🧪 Firebase Connection Test")
    print("=" * 40)
    
    success = test_firebase_connection()
    
    if success:
        print("\n🎉 Ready to run analytics dashboard!")
        print("Run: streamlit run app.py")
    else:
        print("\n🔧 Please fix the issues above before running the dashboard")
    
    sys.exit(0 if success else 1)