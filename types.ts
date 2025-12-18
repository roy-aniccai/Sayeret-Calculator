export enum TrackType {
  MONTHLY_REDUCTION = 'monthly_reduction',
  SHORTEN_TERM = 'shorten_term',
  CONSOLIDATION = 'consolidation',
  INSURANCE_ONLY = 'insurance_only',
}

export enum UrgencyLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
}

export interface FormData {
  // Step 1
  track: TrackType | null;
  
  // Step 2 (Baseline)
  propertyValue: number;
  mortgageBalance: number;
  currentPayment: number;
  yearsRemaining: number;
  
  // Step 3 (Dynamic)
  netIncome: number;
  addedMonthlyPayment: number;
  lumpSum: number;
  standardLoans: number;
  highInterestLoans: number;
  loansPayment: number;
  urgency: UrgencyLevel | null;

  // Step 4
  leadName: string;
  leadPhone: string;
  leadEmail: string;
  termsAccepted: boolean;

  // Step 6 (Insurance Specific)
  isTwoBorrowers: boolean;
  borrower1Age: number;
  borrower1Smoker: boolean;
  borrower2Age: number;
  borrower2Smoker: boolean;
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

export interface InsuranceResult {
  totalLifetimeCost: number;
  potentialSavings: number;
  monthlyPremiumStart: number;
}