import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import json
import os
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

# Set page config
st.set_page_config(page_title="Mortgage Pulse Analytics", layout="wide")

# Initialize Firebase Admin SDK
@st.cache_resource
def init_firebase():
    """Initialize Firebase Admin SDK with service account or default credentials"""
    try:
        # Try to use service account key if available
        service_account_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
            st.success("🔑 Using service account credentials")
        else:
            # Use default credentials (works in Google Cloud environments)
            if not firebase_admin._apps:
                firebase_admin.initialize_app()
            st.info("🌐 Using default credentials")
        
        # Get Firestore client for the 'mortgage' database
        # Note: For Firebase projects, use default database unless using multiple databases
        try:
            # Try with database parameter first (for multi-database projects)
            db = firestore.client(database='mortgage')
        except TypeError:
            # Fallback to default database (most common case)
            db = firestore.client()
            st.info("📊 Using default Firestore database")
        
        # Test connection with a simple query
        try:
            # Try to access collections to verify connection
            collections = db.collections()
            collection_names = [col.id for col in collections]
            st.success(f"📊 Connected to Firestore database 'mortgage' - Collections: {collection_names}")
        except Exception as test_error:
            st.warning(f"⚠️ Connected to Firebase but couldn't list collections: {test_error}")
        
        return db
        
    except Exception as e:
        error_msg = str(e)
        st.error(f"❌ Failed to initialize Firebase: {error_msg}")
        
        # Provide specific troubleshooting based on error type
        if "credentials" in error_msg.lower():
            st.error("🔐 **Credentials Error**")
            st.info("**Solutions:**")
            st.info("1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable")
            st.info("2. Download service account key from Firebase Console")
            st.info("3. Ensure the service account has Firestore permissions")
        elif "permission" in error_msg.lower():
            st.error("🚫 **Permission Error**")
            st.info("**Solutions:**")
            st.info("1. Check Firestore security rules")
            st.info("2. Verify service account has 'Firebase Admin SDK Administrator Service Agent' role")
        elif "network" in error_msg.lower() or "connection" in error_msg.lower():
            st.error("🌐 **Network Error**")
            st.info("**Solutions:**")
            st.info("1. Check internet connectivity")
            st.info("2. Verify firewall settings")
            st.info("3. Try again in a few moments")
        else:
            st.error("❓ **Unknown Error**")
            st.info("**General Solutions:**")
            st.info("1. Check Firebase project configuration")
            st.info("2. Verify database name is 'mortgage'")
            st.info("3. Ensure Firebase Admin SDK is properly installed")
        
        st.info("📖 **Setup Guide:** Check analytics/setup_firebase.md for detailed instructions")
        st.stop()

@st.cache_data(ttl=60)
def load_firestore_data():
    """Load data from Firestore collections with enhanced caching and error handling"""
    try:
        db = init_firebase()
        
        # Load Submissions with pagination for better performance
        submissions_ref = db.collection('submissions')
        submissions_query = submissions_ref.order_by('createdAt', direction=firestore.Query.DESCENDING).limit(1000)
        submissions_docs = submissions_query.stream()
        
        submissions_data = []
        for doc in submissions_docs:
            doc_data = doc.to_dict()
            # Convert Firestore timestamp to datetime
            if 'createdAt' in doc_data and doc_data['createdAt']:
                doc_data['created_at'] = doc_data['createdAt'].replace(tzinfo=None)
            else:
                doc_data['created_at'] = datetime.now()
            
            # Map Firestore fields to expected format
            submissions_data.append({
                'id': doc.id,
                'created_at': doc_data['created_at'],
                'lead_name': doc_data.get('leadName', ''),
                'lead_phone': doc_data.get('leadPhone', ''),
                'lead_email': doc_data.get('leadEmail', ''),
                'session_id': doc_data.get('sessionId', ''),
                'full_data_json': json.dumps(doc_data.get('fullDataJson', {}))
            })
        
        df_submissions = pd.DataFrame(submissions_data)
        if not df_submissions.empty:
            df_submissions['created_at'] = pd.to_datetime(df_submissions['created_at'])
        
        # Load Events with pagination for better performance
        events_ref = db.collection('events')
        events_query = events_ref.order_by('createdAt', direction=firestore.Query.DESCENDING).limit(1000)
        events_docs = events_query.stream()
        
        events_data = []
        for doc in events_docs:
            doc_data = doc.to_dict()
            # Convert Firestore timestamp to datetime
            if 'createdAt' in doc_data and doc_data['createdAt']:
                doc_data['created_at'] = doc_data['createdAt'].replace(tzinfo=None)
            else:
                doc_data['created_at'] = datetime.now()
            
            # Map Firestore fields to expected format
            events_data.append({
                'id': doc.id,
                'created_at': doc_data['created_at'],
                'session_id': doc_data.get('sessionId', ''),
                'event_type': doc_data.get('eventType', ''),
                'event_data_json': json.dumps(doc_data.get('eventData', {}))
            })
        
        df_events = pd.DataFrame(events_data)
        if not df_events.empty:
            df_events['created_at'] = pd.to_datetime(df_events['created_at'])
        
        # Cache metadata for debugging
        cache_info = {
            'submissions_count': len(submissions_data),
            'events_count': len(events_data),
            'last_updated': datetime.now().isoformat()
        }
        
        return df_submissions, df_events, cache_info
        
    except Exception as e:
        st.error(f"Error loading data from Firestore: {e}")
        # Return empty DataFrames to prevent crashes
        return pd.DataFrame(), pd.DataFrame(), {'error': str(e)}

try:
    df_subs, df_events, cache_info = load_firestore_data()
    
    # Show connection status
    if df_subs.empty and df_events.empty:
        st.warning("⚠️ No data found in Firestore collections. Make sure data is being submitted to Firebase.")
    else:
        st.success(f"✅ Connected to Firebase Firestore - Found {len(df_subs)} submissions and {len(df_events)} events")
        
    # Show cache info in sidebar
    with st.sidebar:
        st.subheader("Cache Info")
        if 'error' not in cache_info:
            st.write(f"📊 Submissions: {cache_info['submissions_count']}")
            st.write(f"📈 Events: {cache_info['events_count']}")
            st.write(f"🕒 Last Updated: {cache_info['last_updated'][:19]}")
            st.write("🔄 Cache TTL: 60 seconds")
        else:
            st.error(f"Cache Error: {cache_info['error']}")
        
except Exception as e:
    st.error(f"Error loading Firestore data: {e}")
    st.info("Using empty datasets for demo purposes")
    df_subs = pd.DataFrame()
    df_events = pd.DataFrame()
    cache_info = {'error': str(e)}

# Dashboard Header
st.title("📊 Mortgage Calculator Analytics Dashboard")
st.markdown("Real-time insights from user interactions and lead generation - **Now powered by Firebase Firestore!**")

# Connection Status
col_status1, col_status2 = st.columns(2)
with col_status1:
    if not df_subs.empty or not df_events.empty:
        st.success("🔥 Firebase Connected")
    else:
        st.warning("⚠️ No Data Found")

with col_status2:
    st.info(f"📊 Data Source: Firebase Firestore (mortgage database)")

# Key Metrics
col1, col2, col3, col4 = st.columns(4)

# Calculate metrics with error handling
total_leads = len(df_subs) if not df_subs.empty else 0
unique_sessions = df_events['session_id'].nunique() if not df_events.empty else 0
conversion_rate = (total_leads / unique_sessions * 100) if unique_sessions > 0 else 0

with col1:
    st.metric("Total Leads", total_leads)
with col2:
    st.metric("Unique Visitors", unique_sessions)
with col3:
    st.metric("Conversion Rate", f"{conversion_rate:.1f}%")
with col4:
    if not df_subs.empty and 'created_at' in df_subs.columns:
        last_lead = df_subs['created_at'].max().strftime('%Y-%m-%d %H:%M')
    else:
        last_lead = "N/A"
    st.metric("Last Lead", last_lead)

# Tabs
tab1, tab2, tab3 = st.tabs(["📈 Funnel & Journey", "💰 Financial Insights", "📋 Raw Data"])

with tab1:
    st.subheader("User Journey Funnel")
    
    # Process events for funnel
    if not df_events.empty:
        # Filter for step_view events
        step_events = df_events[df_events['event_type'] == 'step_view'].copy()
        
        if not step_events.empty:
            # Extract step number from json
            def get_step(json_str):
                try:
                    if isinstance(json_str, str):
                        data = json.loads(json_str)
                    else:
                        data = json_str if isinstance(json_str, dict) else {}
                    return data.get('step', 0)
                except:
                    return 0
            
            step_events['step_num'] = step_events['event_data_json'].apply(get_step)
            
            # Count unique sessions per step
            funnel_data = step_events.groupby('step_num')['session_id'].nunique().reset_index()
            funnel_data.columns = ['Step', 'Users']
            funnel_data = funnel_data.sort_values('Step')
            
            if not funnel_data.empty:
                fig_funnel = px.funnel(funnel_data, x='Users', y='Step', title='User Drop-off by Step')
                st.plotly_chart(fig_funnel, use_container_width=True)
            else:
                st.info("No step progression data available yet.")
        else:
            st.info("No step view events found yet.")
    else:
        st.info("No event data available yet.")

    st.subheader("Event Distribution")
    if not df_events.empty and 'event_type' in df_events.columns:
        fig_events = px.pie(df_events, names='event_type', title='Event Types Breakdown')
        st.plotly_chart(fig_events, use_container_width=True)
    else:
        st.info("No event data available for distribution analysis.")

with tab2:
    st.subheader("Lead Financial Profile")
    
    if not df_subs.empty and 'full_data_json' in df_subs.columns:
        # Extract financial data
        def extract_financials(json_str):
            try:
                if isinstance(json_str, str):
                    data = json.loads(json_str)
                else:
                    data = json_str if isinstance(json_str, dict) else {}
                return {
                    'Property Value': data.get('propertyValue', 0),
                    'Mortgage Balance': data.get('mortgageBalance', 0),
                    'Current Payment': data.get('currentPayment', data.get('mortgagePayment', 0))
                }
            except Exception as e:
                return {'Property Value': 0, 'Mortgage Balance': 0, 'Current Payment': 0}

        df_financials = df_subs['full_data_json'].apply(extract_financials).apply(pd.Series)
        
        # Filter out zero values for better visualization
        df_financials_clean = df_financials[(df_financials > 0).any(axis=1)]
        
        if not df_financials_clean.empty:
            col_f1, col_f2 = st.columns(2)
            
            with col_f1:
                if df_financials_clean['Property Value'].sum() > 0:
                    fig_prop = px.histogram(df_financials_clean, x='Property Value', nbins=20, 
                                          title='Property Value Distribution', color_discrete_sequence=['#3b82f6'])
                    st.plotly_chart(fig_prop, use_container_width=True)
                else:
                    st.info("No property value data available.")
                
            with col_f2:
                if df_financials_clean['Mortgage Balance'].sum() > 0 and df_financials_clean['Current Payment'].sum() > 0:
                    fig_mort = px.scatter(df_financials_clean, x='Mortgage Balance', y='Current Payment', 
                                        title='Mortgage Balance vs. Monthly Payment', color_discrete_sequence=['#ef4444'])
                    st.plotly_chart(fig_mort, use_container_width=True)
                else:
                    st.info("No mortgage payment data available.")
        else:
            st.info("No valid financial data found in submissions.")
    else:
        st.info("No submission data available for financial analysis.")

with tab3:
    st.subheader("Recent Submissions")
    if not df_subs.empty:
        # Display submissions with proper column handling
        display_columns = ['created_at', 'lead_name', 'lead_phone', 'lead_email']
        available_columns = [col for col in display_columns if col in df_subs.columns]
        
        if available_columns:
            st.dataframe(df_subs[available_columns].sort_values('created_at', ascending=False))
        else:
            st.info("Submission data structure is different than expected.")
            st.dataframe(df_subs.head())
    else:
        st.info("No submissions data available.")
    
    st.subheader("Recent Events")
    if not df_events.empty:
        # Display events with proper column handling
        display_columns = ['created_at', 'event_type', 'session_id', 'event_data_json']
        available_columns = [col for col in display_columns if col in df_events.columns]
        
        if available_columns:
            st.dataframe(df_events[available_columns].sort_values('created_at', ascending=False))
        else:
            st.info("Events data structure is different than expected.")
            st.dataframe(df_events.head())
    else:
        st.info("No events data available.")

# Footer
st.markdown("---")
st.caption("Mortgage Pulse Analytics | Built with Streamlit | **Now powered by Firebase Firestore** 🔥")
