# Design Document: Comprehensive Analytics Audit and Improvement

## Overview

This design addresses critical issues in the current analytics system and implements comprehensive improvements including proper data collection, CRM integration with Scalla CRM, and enhanced user journey tracking. The system will transition from SQLite to Firestore, implement proper lead scoring, and provide seamless CRM integration.

## Current System Analysis

### Issues Identified

1. **Database Mismatch**: Analytics dashboard reads from SQLite (`server/database.sqlite`) while the application uses Firestore
2. **Incomplete Data Collection**: Missing comprehensive user journey tracking across all form steps
3. **No CRM Integration**: No automated lead export to Scalla CRM system
4. **Inconsistent Event Tracking**: Different tracking implementations between FormContext and SingleTrackFormContext
5. **Missing Lead Qualification**: No automated lead scoring or prioritization
6. **Limited Campaign Attribution**: Incomplete UTM parameter tracking and campaign analysis

### Current Data Flow

```
User Interaction → FormContext/SingleTrackFormContext → trackEvent() → utils/api.ts → server/index.js → SQLite
                                                      → submitData() → server/index.js → SQLite
```

### Current Data Structure

**SQLite Tables:**
- `submissions`: id, created_at, lead_name, lead_phone, lead_email, full_data_json, session_id
- `events`: id, created_at, session_id, event_type, event_data_json

## Proposed System Architecture

### New Data Flow

```
User Interaction → Enhanced Form Contexts → Event Tracker → Firestore Collections
                                        → Lead Scorer → CRM Integration → Scalla CRM
                                        → Analytics Dashboard → Real-time Insights
```

### Firestore Collections Design

#### 1. Users Collection (`users`)
```typescript
interface UserProfile {
  id: string;                    // Auto-generated document ID
  sessionId: string;             // Unique session identifier
  createdAt: Timestamp;          // First interaction timestamp
  updatedAt: Timestamp;          // Last update timestamp
  
  // Contact Information
  leadName: string;              // שם מלא
  leadPhone: string;             // מספר טלפון
  leadEmail?: string;            // Email (optional)
  age?: number;                  // גיל
  
  // Financial Profile
  mortgageBalance: number;       // יתרת משכנתא נוכחית
  otherLoansBalance: number;     // סך ההלוואות האחרות
  mortgagePayment: number;       // החזר משכנתא חודשי נוכחי
  otherLoansPayment: number;     // החזר הלוואות אחרות חודשי
  propertyValue: number;         // שווי נכס מוערך כיום
  targetTotalPayment: number;    // Target monthly payment
  oneTimePaymentAmount: number;  // One-time payment capability
  
  // Preferences and Interests
  interestedInInsurance?: boolean;
  track: 'MONTHLY_REDUCTION' | 'SHORTEN_TERM' | null;
  
  // Campaign Attribution
  campaignId?: string;
  utmParams: Record<string, string>;
  referrer?: string;
  landingPage?: string;
  
  // Lead Qualification
  leadScore: number;             // Calculated lead score (0-100)
  leadTier: 'HOT' | 'WARM' | 'COLD';
  qualificationFactors: string[];
  
  // CRM Integration
  crmStatus: 'PENDING' | 'SYNCED' | 'FAILED';  // סטאטוס: תואמה פגישה/מחכה לשיחה מיועץ משכנתא/מחכה לשיחה מסוכן ביטוח
  crmLeadId?: string;            // Scalla CRM lead ID
  crmSyncedAt?: Timestamp;
  crmErrors?: string[];
  
  // Journey Completion
  completedSteps: number[];      // Array of completed step numbers
  conversionStep?: number;       // Step where conversion occurred
  isConverted: boolean;
  conversionTimestamp?: Timestamp;
}
```

#### 2. Events Collection (`events`)
```typescript
interface UserEvent {
  id: string;                    // Auto-generated document ID
  userId: string;                // Reference to user document
  sessionId: string;             // Session identifier
  timestamp: Timestamp;          // Event timestamp
  
  // Event Classification
  eventType: string;             // Event type identifier
  eventCategory: 'NAVIGATION' | 'INTERACTION' | 'CONVERSION' | 'ERROR';
  
  // Event Context
  step?: number;                 // Current form step
  component?: string;            // UI component involved
  action?: string;               // Specific action taken
  
  // Event Data
  eventData: Record<string, any>; // Flexible event data
  
  // Performance Metrics
  duration?: number;             // Time spent on action (ms)
  previousStep?: number;         // Previous step (for navigation)
  
  // Technical Context
  userAgent?: string;
  viewport?: { width: number; height: number };
  device?: 'MOBILE' | 'TABLET' | 'DESKTOP';
}
```

#### 3. Sessions Collection (`sessions`)
```typescript
interface UserSession {
  id: string;                    // Session ID
  userId?: string;               // Reference to user (if converted)
  startTime: Timestamp;
  endTime?: Timestamp;
  duration?: number;             // Session duration in seconds
  
  // Session Metrics
  pageViews: number;
  stepProgression: number[];     // Steps visited in order
  maxStepReached: number;
  bounceRate: boolean;           // True if single page view
  
  // Attribution
  campaignData: Record<string, any>;
  referrer?: string;
  landingPage: string;
  
  // Conversion
  converted: boolean;
  conversionStep?: number;
  conversionValue?: number;      // Estimated lead value
}
```

## Enhanced Event Tracking System

### Event Types and Categories

#### Navigation Events
- `session_start`: User begins session
- `step_view`: User views a form step
- `step_complete`: User completes a form step
- `step_next`: User advances to next step
- `step_prev`: User returns to previous step
- `form_reset`: User resets the form

#### Interaction Events
- `field_focus`: User focuses on input field
- `field_blur`: User leaves input field
- `field_change`: User modifies field value
- `button_click`: User clicks button
- `tooltip_view`: User views tooltip
- `validation_error`: Form validation fails

#### Conversion Events
- `lead_qualified`: User provides contact information
- `form_submit`: User submits complete form
- `crm_sync`: Lead synced to CRM
- `appointment_scheduled`: Meeting scheduled

#### Error Events
- `api_error`: API call fails
- `validation_error`: Form validation fails
- `crm_sync_error`: CRM integration fails

### Enhanced Form Context Implementation

```typescript
// Enhanced tracking in SingleTrackFormContext
const trackEnhancedEvent = (eventType: string, eventData?: any) => {
  const enhancedEventData = {
    sessionId,
    userId: formData.leadName ? generateUserId(sessionId, formData.leadName) : null,
    timestamp: new Date().toISOString(),
    step,
    track: TrackType.MONTHLY_REDUCTION,
    formData: sanitizeFormData(formData),
    campaignData,
    device: getDeviceType(),
    viewport: getViewportSize(),
    ...eventData,
  };
  
  // Send to Firestore via enhanced API
  trackFirestoreEvent(eventType, enhancedEventData);
};
```

## Lead Scoring Algorithm

### Scoring Factors

1. **Profile Completeness (0-30 points)**
   - Name provided: 10 points
   - Phone provided: 10 points
   - Age provided: 5 points
   - Email provided: 5 points

2. **Financial Profile Quality (0-40 points)**
   - High property value (>2M NIS): 15 points
   - Significant mortgage balance (>1M NIS): 10 points
   - High monthly payments (>5K NIS): 10 points
   - Additional loans: 5 points

3. **Engagement Level (0-20 points)**
   - Completed all steps: 10 points
   - Time spent on form (>2 minutes): 5 points
   - Multiple sessions: 5 points

4. **Intent Indicators (0-10 points)**
   - Interested in insurance: 5 points
   - Specific target payment: 5 points

### Lead Tiers
- **HOT (80-100 points)**: High-value, engaged prospects
- **WARM (50-79 points)**: Qualified prospects with good potential
- **COLD (0-49 points)**: Early-stage or low-engagement prospects

## Scalla CRM Integration

### CRM Field Mapping

| Form Field | Hebrew Label | Scalla CRM Field |
|------------|--------------|------------------|
| mortgageBalance | יתרת משכנתא נוכחית | mortgage_balance |
| otherLoansBalance | סך ההלוואות האחרות | other_loans_balance |
| mortgagePayment | החזר משכנתא חודשי נוכחי | mortgage_payment |
| otherLoansPayment | החזר הלוואות אחרות חודשי | other_loans_payment |
| propertyValue | שווי נכס מוערך כיום | property_value |
| leadName | שם מלא | full_name |
| leadPhone | מספר טלפון | phone_number |
| age | גיל | age |
| crmStatus | סטאטוס | status |

### CRM Status Values
- `תואמה פגישה` - Meeting scheduled
- `מחכה לשיחה מיועץ משכנתא` - Waiting for mortgage advisor call
- `מחכה לשיחה מסוכן ביטוח` - Waiting for insurance agent call

### CRM Integration Flow

```typescript
interface ScallaCRMPayload {
  full_name: string;
  phone_number: string;
  age?: number;
  mortgage_balance: number;
  other_loans_balance: number;
  mortgage_payment: number;
  other_loans_payment: number;
  property_value: number;
  status: string;
  lead_score: number;
  campaign_source?: string;
  utm_params?: Record<string, string>;
  created_at: string;
}

const syncToScallaCRM = async (userProfile: UserProfile): Promise<void> => {
  const payload: ScallaCRMPayload = {
    full_name: userProfile.leadName,
    phone_number: userProfile.leadPhone,
    age: userProfile.age,
    mortgage_balance: userProfile.mortgageBalance,
    other_loans_balance: userProfile.otherLoansBalance,
    mortgage_payment: userProfile.mortgagePayment,
    other_loans_payment: userProfile.otherLoansPayment,
    property_value: userProfile.propertyValue,
    status: determineCRMStatus(userProfile),
    lead_score: userProfile.leadScore,
    campaign_source: userProfile.campaignId,
    utm_params: userProfile.utmParams,
    created_at: userProfile.createdAt.toISOString(),
  };
  
  // API call to Scalla CRM
  const response = await fetch(SCALLA_CRM_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SCALLA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error(`CRM sync failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  
  // Update user profile with CRM sync status
  await updateUserProfile(userProfile.id, {
    crmStatus: 'SYNCED',
    crmLeadId: result.lead_id,
    crmSyncedAt: new Date(),
  });
};
```

## Analytics Dashboard Enhancement

### Firestore Integration

```python
# analytics/app.py - Updated for Firestore
import streamlit as st
import pandas as pd
from google.cloud import firestore
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta

# Initialize Firestore client
@st.cache_resource
def init_firestore():
    return firestore.Client()

@st.cache_data(ttl=60)
def load_firestore_data():
    db = init_firestore()
    
    # Load Users
    users_ref = db.collection('users')
    users_docs = users_ref.stream()
    users_data = [doc.to_dict() for doc in users_docs]
    df_users = pd.DataFrame(users_data)
    
    # Load Events
    events_ref = db.collection('events')
    events_docs = events_ref.limit(1000).stream()  # Limit for performance
    events_data = [doc.to_dict() for doc in events_docs]
    df_events = pd.DataFrame(events_data)
    
    return df_users, df_events
```

### Enhanced Analytics Features

1. **Real-time Lead Scoring Dashboard**
2. **Campaign Attribution Analysis**
3. **User Journey Funnel Visualization**
4. **CRM Sync Status Monitoring**
5. **Lead Quality Metrics**
6. **Conversion Rate Analysis by Source**

## Data Migration and Cleanup Plan

### Phase 1: Backup Current Data
1. Export existing SQLite data to JSON
2. Store backup in secure location
3. Verify backup integrity

### Phase 2: Implement New System
1. Deploy Firestore collections
2. Update API endpoints
3. Enhance form contexts
4. Implement CRM integration

### Phase 3: Data Cleanup
1. Clear existing SQLite tables
2. Initialize Firestore collections
3. Verify new data collection
4. Monitor system health

### Phase 4: Validation
1. Test complete user journey
2. Verify CRM integration
3. Validate analytics dashboard
4. Confirm data quality

## Security and Privacy Considerations

### Data Protection
- Encrypt sensitive data in transit and at rest
- Implement proper access controls
- Regular security audits
- GDPR compliance measures

### Privacy Controls
- User consent management
- Data retention policies
- Right to deletion
- Data anonymization options

## Performance Optimization

### Firestore Optimization
- Proper indexing strategy
- Query optimization
- Batch operations for bulk updates
- Connection pooling

### Analytics Performance
- Data caching strategies
- Incremental data loading
- Query result caching
- Dashboard optimization

## Monitoring and Alerting

### System Health Monitoring
- Data collection rate monitoring
- Error rate tracking
- CRM sync success rates
- Dashboard performance metrics

### Alerting System
- Failed CRM syncs
- Data quality issues
- System errors
- Performance degradation

## Implementation Timeline

### Week 1: Foundation
- Firestore setup and configuration
- Enhanced form context implementation
- Basic event tracking enhancement

### Week 2: CRM Integration
- Scalla CRM API integration
- Lead scoring implementation
- CRM sync workflow

### Week 3: Analytics Enhancement
- Dashboard Firestore integration
- Enhanced analytics features
- Data visualization improvements

### Week 4: Testing and Migration
- Comprehensive testing
- Data migration execution
- System validation and monitoring

This design provides a comprehensive solution for the analytics audit and improvement, addressing all identified issues while implementing robust CRM integration and enhanced user journey tracking.