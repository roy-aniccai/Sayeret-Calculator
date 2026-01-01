export enum TrackType {
  MONTHLY_REDUCTION = 'monthly_reduction',
  SHORTEN_TERM = 'shorten_term',
}

export enum UrgencyLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
}

export interface FormData {
  // Step 1
  track: TrackType | null;

  // Step 1 - Debts
  mortgageBalance: number;
  otherLoansBalance: number;
  bankAccountBalance: number; // Can be negative (overdraft)

  // Step 2 - Monthly Payments
  mortgagePayment: number;
  otherLoansPayment: number;
  targetTotalPayment: number;

  // Step 3 - Assets
  propertyValue: number;

  // Step 4 - Contact
  leadName: string;
  leadPhone: string;

  // Step 5 - Simulator (optional for enhanced value)
  age: number | null;

  // Step 3 - One-time Payment (Shorten Term Track)
  oneTimePaymentAmount?: number;

  // Legacy fields (keeping for compatibility)
  currentPayment: number;
  yearsRemaining: number;
  netIncome: number;
  addedMonthlyPayment: number;
  lumpSum: number;
  standardLoans: number;
  highInterestLoans: number;
  loansPayment: number;
  urgency: UrgencyLevel | null;
  leadEmail: string;
  termsAccepted: boolean;
  interestedInInsurance: boolean;
}

export interface CalculationResult {
  title: string;
  subtitle: string;
  labelBefore: string;
  labelAfter: string;
  valBefore: number;
  valAfter: number;
  unit: string;
  isPositive: boolean;
  explanation: string;
  badgeText: string;
  icon: string;
}


export interface Submission {
  id: number;
  createdAt?: string; // New API
  created_at?: string; // Legacy/SQLite raw
  leadName?: string; // New API
  lead_name?: string; // Legacy
  leadPhone?: string; // New API
  lead_phone?: string; // Legacy
  leadEmail?: string; // New API
  lead_email?: string; // Legacy
  full_data_json: any;
}

export interface EventLog {
  id: number;
  createdAt?: string;
  created_at?: string;
  sessionId?: string;
  session_id?: string;
  eventType?: string;
  event_type?: string;
  event_data_json: any;
}
