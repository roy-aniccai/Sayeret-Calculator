import React from 'react';
import { FormProvider, useForm } from './context/FormContext';
import { NotificationProvider } from './context/NotificationContext';
import { Step1Goal } from './components/steps/Step1Goal';
import { Step1Debts } from './components/steps/Step1Debts';
import { Step2Payments } from './components/steps/Step2Payments';
import { Step3Assets } from './components/steps/Step3Assets';
import { Step4Contact } from './components/steps/Step4Contact';
import { Step5Simulator } from './components/steps/Step5Simulator';
import { validateAllTrackConfigs } from './utils/trackConfig';
import { getMainHeaderTitle } from './utils/stepHeaderConfig';


const AppContent: React.FC = () => {
  const { step, resetForm, prevStep } = useForm();

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1Goal />;
      case 2: return <Step1Debts />;
      case 3: return <Step2Payments />;
      case 4: return <Step3Assets />;
      case 5: return <Step4Contact />;
      case 6: return <Step5Simulator />;
      default: return <Step1Goal />;
    }
  };

  const progressPercentage = (step / 6) * 100;
  // Simple routing for Admin
  const [showAdmin, setShowAdmin] = React.useState(window.location.pathname === '/admin');

  React.useEffect(() => {
    // Handle browser back/forward buttons
    const handlePopState = () => {
      setShowAdmin(window.location.pathname === '/admin');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Get dynamic header title based on current step
  const headerTitle = getMainHeaderTitle(step);

  return (
    <div className="flex sm:items-center sm:justify-center min-h-screen p-0 sm:p-4 relative bg-gray-100">
      <div className={`fixed inset-0 z-50 ${showAdmin ? 'block' : 'hidden'}`}>
        <React.Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-white z-50">Loading Admin Panel...</div>}>
          {showAdmin && React.createElement(React.lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard }))), {
            onClose: () => {
              setShowAdmin(false);
              window.history.pushState({}, '', '/');
            }
          })}
        </React.Suspense>
      </div>

      <div className="w-full sm:max-w-lg bg-white sm:rounded-2xl shadow-xl overflow-hidden relative h-[100dvh] sm:h-auto sm:min-h-[600px] flex flex-col">

        {/* Compact Header */}
        <div className="bg-blue-600 px-4 py-3 text-white relative">
          <div className="flex items-center justify-between">
            {/* Admin button removed - access via /admin */}
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="text-blue-200 hover:text-white transition-colors"
                title="חזור"
              >
                <i className="fa-solid fa-arrow-right text-lg"></i>
              </button>
            ) : (
              <div className="w-4"></div>
            )}

            <div className="text-center flex-1 flex items-center justify-center gap-2">
              <img 
                src="/logo.svg" 
                alt="סיירת המשכנתא" 
                className="w-6 h-6 flex-shrink-0"
              />
              <h1 className="text-lg font-bold">{headerTitle}</h1>
            </div>

            <button
              onClick={resetForm}
              className="text-blue-200 hover:text-white transition-colors"
              title="התחל מחדש"
            >
              <i className="fa-solid fa-rotate-right text-lg"></i>
            </button>
          </div>

          {/* Compact Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-800">
            <div
              className="h-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-grow relative overflow-y-auto">
          {renderStep()}
        </div>

      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Validate track configurations at startup
  React.useEffect(() => {
    try {
      validateAllTrackConfigs();
      console.log('Track configurations validated successfully');
    } catch (error) {
      console.error('Track configuration validation failed:', error);
      // In production, you might want to show a user-friendly error or fallback
    }
  }, []);

  return (
    <NotificationProvider>
      <FormProvider>
        <AppContent />
      </FormProvider>
    </NotificationProvider>
  );
};

export default App;