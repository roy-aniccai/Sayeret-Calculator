import React from 'react';
import { FormProvider, useForm } from './context/FormContext';
import { Step1Goal } from './components/steps/Step1Goal';
import { Step1Debts } from './components/steps/Step1Debts';
import { Step2Payments } from './components/steps/Step2Payments';
import { Step3Assets } from './components/steps/Step3Assets';
import { Step4Contact } from './components/steps/Step4Contact';
import { Step5Simulator } from './components/steps/Step5Simulator';


const AppContent: React.FC = () => {
  const { step, resetForm } = useForm();

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
  const [showAdmin, setShowAdmin] = React.useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative">
      <div className={`fixed inset-0 z-50 ${showAdmin ? 'block' : 'hidden'}`}>
        <React.Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-white z-50">Loading Admin Panel...</div>}>
          {showAdmin && React.createElement(React.lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard }))), { onClose: () => setShowAdmin(false) })}
        </React.Suspense>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden relative min-h-[600px] flex flex-col">

        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center relative">
          <div className="absolute top-6 left-6">
            <button onClick={() => setShowAdmin(true)} className="text-blue-400 hover:text-white text-xs opacity-50 hover:opacity-100" title="Admin">
              <i className="fa-solid fa-lock"></i>
            </button>
          </div>

          <button
            onClick={resetForm}
            className="absolute top-6 right-6 text-blue-200 hover:text-white transition-colors"
            title="התחל מחדש"
          >
            <i className="fa-solid fa-rotate-right text-xl"></i>
          </button>

          <h1 className="text-2xl font-bold mb-2">בדיקת דופק למשכנתא</h1>
          <p className="text-blue-100 text-sm opacity-90">האלגוריתם מזהה הזדמנויות חיסכון בזמן אמת</p>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-blue-800">
            <div
              className="h-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-grow relative">
          {renderStep()}
        </div>

      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FormProvider>
      <AppContent />
    </FormProvider>
  );
};

export default App;