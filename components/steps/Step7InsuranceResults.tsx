import React from 'react';
import { useForm } from '../../context/FormContext';
import { calculateInsuranceSavings } from '../../utils/calculator';
import { formatCurrency } from '../../utils/helpers';
import { Button } from '../ui/Button';

export const Step7InsuranceResults: React.FC = () => {
  const { formData, setStep, resetForm, sessionId } = useForm() as any;
  const insuranceData = calculateInsuranceSavings(formData);

  const handleContact = () => {
    import('../../utils/api').then(({ trackEvent }) => {
      trackEvent(sessionId, 'contact_request', { type: 'insurance_savings' });
    });
    alert("תודה! פנייתך התקבלה בהצלחה.");
  };

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-10">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 text-5xl shadow-lg shadow-blue-200">
          <i className="fa-solid fa-shield-heart"></i>
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900">פוטנציאל חיסכון</h2>
        <p className="text-gray-500 text-xl mt-3">בהשוואה לתעריפי בסיס בנקאיים</p>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-md mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-green-50 rounded-bl-full -z-0"></div>

        <div className="relative z-10">
          <p className="text-xl text-gray-500 mb-3 font-medium">חיסכון מצטבר משוער</p>
          <div className="text-6xl font-extrabold text-green-600 mb-10 tracking-tight">
            {formatCurrency(insuranceData.potentialSavings)}
          </div>

          <div className="h-px bg-gray-100 mb-8"></div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-lg text-gray-400 mb-1">תשלום חודשי (התחלה)</p>
              <p className="font-bold text-gray-800 text-3xl">{formatCurrency(insuranceData.monthlyPremiumStart)}</p>
            </div>
            <div>
              <p className="text-lg text-gray-400 mb-1">סה"כ לתקופה</p>
              <p className="font-bold text-gray-800 text-3xl">{formatCurrency(insuranceData.totalLifetimeCost)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-8 rounded-3xl mb-10 text-xl text-blue-800 border border-blue-100 leading-relaxed">
        <i className="fa-solid fa-circle-info ml-2"></i>
        החישוב מתבסס על סטטיסטיקה של מחירי שוק והנחות סוכן ממוצעות (כ-22%). המחיר הסופי נקבע בחיתום רפואי.
      </div>

      <Button onClick={handleContact} variant="success" fullWidth className="animate-bounce py-6 text-3xl">
        אני רוצה לממש את החיסכון
      </Button>

      <button onClick={() => setStep(6)} className="w-full text-gray-400 text-xl mt-10 hover:text-gray-600">
        חזרה לעריכת פרטים
      </button>
      <button onClick={resetForm} className="w-full text-blue-600 font-medium text-2xl mt-6">
        חזרה להתחלה
      </button>
    </div>
  );
};
