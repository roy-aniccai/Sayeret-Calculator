import streamlit as st
import pandas as pd
import sqlite3
import plotly.express as px
import plotly.graph_objects as go
import json
import os

# Set page config
st.set_page_config(page_title="Mortgage Pulse Analytics", layout="wide")

# Database Connection
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'server', 'database.sqlite')

@st.cache_data(ttl=60)
def load_data():
    conn = sqlite3.connect(DB_PATH)
    
    # Load Submissions
    submissions = pd.read_sql_query("SELECT * FROM submissions", conn)
    submissions['created_at'] = pd.to_datetime(submissions['created_at'])
    
    # Load Events
    events = pd.read_sql_query("SELECT * FROM events", conn)
    events['created_at'] = pd.to_datetime(events['created_at'])
    
    conn.close()
    return submissions, events

try:
    df_subs, df_events = load_data()
except Exception as e:
    st.error(f"Error loading database from {DB_PATH}: {e}")
    st.stop()

# Dashboard Header
st.title("📊 Mortgage Calculator Analytics Dashboard")
st.markdown("Real-time insights from user interactions and list generation.")

# Key Metrics
col1, col2, col3, col4 = st.columns(4)

total_leads = len(df_subs)
unique_sessions = df_events['session_id'].nunique()
conversion_rate = (total_leads / unique_sessions * 100) if unique_sessions > 0 else 0

with col1:
    st.metric("Total Leads", total_leads)
with col2:
    st.metric("Unique Visitors", unique_sessions)
with col3:
    st.metric("Conversion Rate", f"{conversion_rate:.1f}%")
with col4:
    last_lead = df_subs['created_at'].max().strftime('%Y-%m-%d %H:%M') if not df_subs.empty else "N/A"
    st.metric("Last Lead", last_lead)

# Tabs
tab1, tab2, tab3 = st.tabs(["📈 Funnel & Journey", "💰 Financial Insights", "📋 Raw Data"])

with tab1:
    st.subheader("User Journey Funnel")
    
    # Process events for funnel
    # Filter for step_view events
    step_events = df_events[df_events['event_type'] == 'step_view'].copy()
    
    if not step_events.empty:
        # Extract step number from json
        def get_step(json_str):
            try:
                data = json.loads(json_str)
                return data.get('step', 0)
            except:
                return 0
        
        step_events['step_num'] = step_events['event_data_json'].apply(get_step)
        
        # Count unique sessions per step
        funnel_data = step_events.groupby('step_num')['session_id'].nunique().reset_index()
        funnel_data.columns = ['Step', 'Users']
        funnel_data = funnel_data.sort_values('Step')
        
        fig_funnel = px.funnel(funnel_data, x='Users', y='Step', title='User Drop-off by Step')
        st.plotly_chart(fig_funnel, use_container_width=True)
    else:
        st.info("No step data available yet.")

    st.subheader("Event Distribution")
    fig_events = px.pie(df_events, names='event_type', title='Event Types Breakdown')
    st.plotly_chart(fig_events, use_container_width=True)

with tab2:
    st.subheader("Lead Financial Profile")
    
    if not df_subs.empty:
        # Extract financial data
        def extract_financials(json_str):
            try:
                data = json.loads(json_str)
                return {
                    'Property Value': data.get('propertyValue', 0),
                    'Mortgage Balance': data.get('mortgageBalance', 0),
                    'Current Payment': data.get('currentPayment', 0)
                }
            except:
                return {}

        df_financials = df_subs['full_data_json'].apply(extract_financials).apply(pd.Series)
        
        col_f1, col_f2 = st.columns(2)
        
        with col_f1:
            fig_prop = px.histogram(df_financials, x='Property Value', nbins=20, title='Property Value Distribution', color_discrete_sequence=['#3b82f6'])
            st.plotly_chart(fig_prop, use_container_width=True)
            
        with col_f2:
            fig_mort = px.scatter(df_financials, x='Mortgage Balance', y='Current Payment', title='Mortgage Balance vs. Monthly Payment', color_discrete_sequence=['#ef4444'])
            st.plotly_chart(fig_mort, use_container_width=True)
            
    else:
        st.info("No submission data available for financial analysis.")

with tab3:
    st.subheader("Recent Submissions")
    st.dataframe(df_subs[['created_at', 'lead_name', 'lead_phone', 'lead_email']].sort_values('created_at', ascending=False))
    
    st.subheader("Recent Events")
    st.dataframe(df_events[['created_at', 'event_type', 'session_id', 'event_data_json']].sort_values('created_at', ascending=False))

# Footer
st.markdown("---")
st.caption("Mortgage Pulse Analytics | Built with Streamlit")
