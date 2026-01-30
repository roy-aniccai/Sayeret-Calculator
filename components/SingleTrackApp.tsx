import React, { useEffect, useState } from 'react';
import { SingleTrackFormProvider, useSingleTrackForm } from '../context/SingleTrackFormContext';
import { NotificationProvider } from '../context/NotificationContext';
import SingleTrackStep1Landing from './steps/SingleTrackStep1Landing';
import { SingleTrackStep2Debts } from './steps/SingleTrackStep2Debts';
import { SingleTrackStep3Payments } from './steps/SingleTrackStep3Payments';
import { SingleTrackStep4Assets } from './steps/SingleTrackStep4Assets';
import { SingleTrackStep5Contact } from './steps/SingleTrackStep5Contact';
import { SingleTrackStep6Simulator } from './steps/SingleTrackStep6Simulator';
import { 
  parseCampaignDataFromLocation, 
  createCampaignData, 
  getDefaultSingleTrackExperience,
  type CampaignData 
} from '../utils/campaignUrlParser';
import { getSimulatorVersionFromUrl, type SimulatorVersion } from '../utils/abTestingUtils';
import { useScrollLock } from '../utils/useScrollLock';

// Props interface for the SingleTrackApp component
interface SingleTrackAppProps {
  campaignId?: string;
  utmParams?: Record<string, string>;
}

/**
 * SingleTrackApp - Independent React application for single-track calculator
 * 
 * This component creates a campaign-optimized version of the mortgage calculator
 * that bypasses track selection and provides a focused user experience for the
 * "reduce monthly installments" track.
 * 
 * Enhanced with robust error handling for missing or malformed campaign data.
 * 
 * Requirements: 4.2, 5.1, 5.2
 */
const SingleTrackApp: React.FC<SingleTrackAppProps> = ({ campaignId, utmParams }) => {
  const [campaignData, setCampaignData] = useState<CampaignData>(() => getDefaultSingleTrackExperience());
  const [isLoading, setIsLoading] = useState(true);
  const [simulatorVersion, setSimulatorVersion] = useState<SimulatorVersion>('A');

  // Parse campaign parameters and simulator version from URL on component mount
  useEffect(() => {
    const initializeCampaignData = async () => {
      try {
        setIsLoading(true);
        
        // Get simulator version from URL parameter
        const urlVersion = getSimulatorVersionFromUrl();
        setSimulatorVersion(urlVersion);
        
        let parsedCampaignData: CampaignData;
        
        // If props are provided (for testing), use them
        if (campaignId || utmParams) {
          const search = utmParams ? 
            '?' + Object.entries(utmParams).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&') : 
            '';
          const pathname = campaignId ? `/reduce-payments/${campaignId}` : '/';
          
          parsedCampaignData = createCampaignData(search, pathname);
        } else {
          // Parse from browser location with error handling
          parsedCampaignData = parseCampaignDataFromLocation();
        }
        
        setCampaignData(parsedCampaignData);
        
        // Log campaign initialization with error information
        if (parsedCampaignData.errors.length > 0) {
          console.warn('Single-track calculator loaded with campaign warnings:', {
            campaignData: parsedCampaignData,
            errors: parsedCampaignData.errors
          });
        } else {
          console.log('Single-track calculator loaded successfully with campaign data:', parsedCampaignData);
        }
        
        // Track initialization event with error context
        if (typeof window !== 'undefined') {
          const eventData = {
            campaignData: parsedCampaignData,
            hasErrors: parsedCampaignData.errors.length > 0,
            errorCount: parsedCampaignData.errors.length,
            isValidCampaign: parsedCampaignData.isValid,
          };
          
          console.log('Single-track initialization event:', eventData);
        }
        
      } catch (error) {
        console.error('Critical error initializing campaign data:', error);
        
        // Use default experience on critical error
        const fallbackData = getDefaultSingleTrackExperience();
        fallbackData.errors.push(`Initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setCampaignData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCampaignData();
  }, [campaignId, utmParams]);

  // Show loading state while initializing campaign data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען מחשבון משכנתא...</p>
        </div>
      </div>
    );
  }

  // Convert campaign data to the format expected by SingleTrackFormProvider
  const initialCampaignData = {
    campaignId: campaignData.campaignId,
    source: campaignData.source,
    utmParams: campaignData.utmParams,
    landingTime: campaignData.landingTime,
    isValid: campaignData.isValid,
    errors: campaignData.errors,
  };

  return (
    <NotificationProvider>
      <SingleTrackFormProvider initialCampaignData={initialCampaignData}>
        <SingleTrackAppContent campaignData={campaignData} simulatorVersion={simulatorVersion} />
      </SingleTrackFormProvider>
    </NotificationProvider>
  );
};

/**
 * SingleTrackAppContent - The main content component that uses the form context
 * Enhanced with error handling for campaign data issues and A/B testing support
 */
const SingleTrackAppContent: React.FC<{ 
  campaignData: CampaignData; 
  simulatorVersion: SimulatorVersion;
}> = ({ campaignData, simulatorVersion }) => {
  const { step, prevStep, resetForm } = useSingleTrackForm();
  const { containerRef, scrollClassName } = useScrollLock();

  // In the reduce-payments single-track flow, we treat:
  // - Step 1 as Landing (no counter)
  // - Steps 2-5 as the 4 "real" steps
  // - Step 6 as Results (no counter)
  const FLOW_TOTAL_STEPS = 4;
  const getFlowStepIndex = (currentStep: number): number | null => {
    if (currentStep >= 2 && currentStep <= 5) return currentStep - 1; // 1..4
    return null;
  };
  const flowStepIndex = getFlowStepIndex(step);

  // Show error notification if there are campaign data issues (non-blocking)
  const showCampaignWarning = campaignData.errors.length > 0 && !campaignData.isValid;

  // Render step content with error handling
  const renderStep = () => {
    try {
      switch (step) {
        case 1:
          return <SingleTrackStep1Landing />;
        case 2:
          return <SingleTrackStep2Debts />;
        case 3:
          return <SingleTrackStep3Payments />;
        case 4:
          return <SingleTrackStep4Assets />;
        case 5:
          return <SingleTrackStep5Contact />;
        case 6:
          return <SingleTrackStep6Simulator version={simulatorVersion} />;
        default:
          // Fallback for invalid step numbers
          console.error(`Invalid step number: ${step}, resetting to step 1`);
          resetForm();
          return <SingleTrackStep1Landing />;
      }
    } catch (error) {
      console.error('Error rendering step:', error);
      
      // Fallback error UI
      return (
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">שגיאה בטעינת השלב</h2>
          <p className="text-gray-600 mb-6">אירעה שגיאה בטעינת השלב הנוכחי</p>
          <button 
            onClick={resetForm} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            התחל מחדש
          </button>
        </div>
      );
    }
  };

  // Get step-specific header title with fallback
  const getHeaderTitle = (currentStep: number): string => {
    try {
      const baseTitle = (() => {
        switch (currentStep) {
        case 1: return "הקטן תשלום חודשי";
        case 2: return "מצב חובות נוכחי";
        case 3: return "החזרים חודשיים נוכחיים";
        case 4: return "פרטים למיחזור";
        case 5: return "פרטי קשר";
        case 6: return "סימולטור משכנתא";
        default: return "הקטן תשלום חודשי";
        }
      })();

      const currentFlowIndex = getFlowStepIndex(currentStep);
      if (currentFlowIndex) {
        return `${baseTitle} (שלב ${currentFlowIndex} מתוך ${FLOW_TOTAL_STEPS})`;
      }

      return baseTitle;
    } catch (error) {
      console.error('Error getting header title:', error);
      return "הקטן תשלום חודשי";
    }
  };

  // Calculate progress percentage for the 4-step flow.
  // Landing (step 1) shows 0%, results (step 6) shows 100%.
  const progressPercentage = (() => {
    if (flowStepIndex) return (flowStepIndex / FLOW_TOTAL_STEPS) * 100;
    if (step === 6) return 100;
    return 0;
  })();

  // Safe navigation handlers with error handling
  const handlePrevStep = () => {
    try {
      prevStep();
    } catch (error) {
      console.error('Error navigating to previous step:', error);
    }
  };

  const handleResetForm = () => {
    try {
      resetForm();
    } catch (error) {
      console.error('Error resetting form:', error);
      // Force reload as last resort
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex sm:items-center sm:justify-center min-h-screen p-0 sm:p-4 relative bg-gray-100">
      <div className="w-full sm:max-w-lg bg-white sm:rounded-2xl shadow-xl overflow-hidden relative h-[100dvh] sm:h-auto sm:min-h-[600px] flex flex-col">
        
        {/* Campaign warning notification (non-blocking) */}
        {showCampaignWarning && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fa-solid fa-exclamation-triangle text-yellow-400"></i>
              </div>
              <div className="mr-3">
                <p className="text-yellow-800">
                  המחשבון פועל במצב ברירת מחדל - לא זוהו נתוני קמפיין
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Header with progress bar */}
        <div className="bg-blue-600 px-4 py-3 text-white relative">
          <div className="flex items-center justify-between">
            {/* Back button - only show if not on first step */}
            {step > 1 ? (
              <button
                onClick={handlePrevStep}
                className="text-blue-200 hover:text-white transition-colors"
                title="חזור"
              >
                <i className="fa-solid fa-arrow-right text-lg"></i>
              </button>
            ) : (
              <div className="w-4"></div>
            )}

            {/* Header title with logo */}
            <div className="text-center flex-1 flex items-center justify-center gap-2">
              <img 
                src="/logo.svg" 
                alt="סיירת המשכנתא" 
                className="w-6 h-6 flex-shrink-0"
              />
              <h1 className="text-lg font-bold">{getHeaderTitle(step)}</h1>
            </div>

            {/* Restart button */}
            <button
              onClick={handleResetForm}
              className="text-blue-200 hover:text-white transition-colors"
              title="התחל מחדש"
            >
              <i className="fa-solid fa-rotate-right text-lg"></i>
            </button>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-800">
            <div
              className="h-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Content area */}
        <div 
          ref={containerRef}
          className={`p-6 flex-grow relative ${scrollClassName}`}
        >
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default SingleTrackApp;