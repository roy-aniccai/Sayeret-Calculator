import React, { useState } from 'react';
import { useForm } from '../../context/FormContext';
import { Button } from '../ui/Button';

export const Step6InsuranceInput: React.FC = () => {
  const { formData, updateFormData, nextStep, setStep } = useForm();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.borrower1Age || formData.borrower1Age < 18 || formData.borrower1Age > 80) {
      newErrors.borrower1Age = 'גיל לא תקין';
    }
    if (formData.isTwoBorrowers) {
      if (!formData.borrower2Age || formData.borrower2Age < 18 || formData.borrower2Age > 80) {
        newErrors.borrower2Age = 'גיל לא תקין';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    nextStep();
  };

  const handleBack = () => {
    setStep(5);
  };

  const handleChangeAge = (field: 'borrower1Age' | 'borrower2Age', val: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    updateFormData({ [field]: parseInt(val) || 0 });
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">פרטים לביטוח</h2>
      <p className="text-center text-gray-600 text-xl mb-10">הגיל והסטטוס משפיעים דרמטית על העלות</p>
      
      {/* Toggle Single/Couple */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 p-2 rounded-2xl flex items-center shadow-inner">
          <button 
            onClick={() => updateFormData({ isTwoBorrowers: false })}
            className={`px-8 py-4 rounded-xl text-xl font-bold transition-all flex items-center gap-3 ${!formData.isTwoBorrowers ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <i className="fa-regular fa-user"></i>
            לווה יחיד
          </button>
          <button 
             onClick={() => updateFormData({ isTwoBorrowers: true })}
             className={`px-8 py-4 rounded-xl text-xl font-bold transition-all flex items-center gap-3 ${formData.isTwoBorrowers ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <i className="fa-solid fa-user-group"></i>
            זוג לווים
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Borrower 1 */}
        <div className={`border-2 ${errors.borrower1Age ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-white'} rounded-3xl p-8 shadow-sm transition-colors`}>
          <div className="mb-6 font-bold text-gray-800 text-2xl flex justify-between">
            <span>לווה ראשון</span>
          </div>
          <div className="flex gap-8">
             <div className="flex-1">
               <label className="block text-xl text-gray-500 mb-3">גיל</label>
               <input 
                  type="number"
                  value={formData.borrower1Age || ''}
                  onChange={(e) => handleChangeAge('borrower1Age', e.target.value)}
                  className="w-full text-center font-bold text-5xl border-b-4 border-gray-200 focus:border-blue-500 outline-none py-2 bg-transparent"
               />
               {errors.borrower1Age && <p className="text-red-600 mt-2 text-center font-bold">{errors.borrower1Age}</p>}
             </div>
             <div className="flex-1">
               <label className="block text-xl text-gray-500 mb-3 text-center">מעשן/ת?</label>
               <div className="flex border rounded-2xl overflow-hidden h-16 bg-white">
                 <button 
                    onClick={() => updateFormData({ borrower1Smoker: true })}
                    className={`flex-1 text-xl transition-colors ${formData.borrower1Smoker ? 'bg-red-100 text-red-700 font-bold' : 'bg-gray-50 text-gray-400'}`}
                 >כן</button>
                 <button 
                    onClick={() => updateFormData({ borrower1Smoker: false })}
                    className={`flex-1 text-xl transition-colors ${!formData.borrower1Smoker ? 'bg-green-100 text-green-700 font-bold' : 'bg-gray-50 text-gray-400'}`}
                 >לא</button>
               </div>
             </div>
          </div>
        </div>

        {/* Borrower 2 */}
        {formData.isTwoBorrowers && (
          <div className={`border-2 ${errors.borrower2Age ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-white'} rounded-3xl p-8 shadow-sm animate-fade-in-up transition-colors`}>
            <div className="mb-6 font-bold text-gray-800 text-2xl flex justify-between">
              <span>לווה שני</span>
            </div>
            <div className="flex gap-8">
               <div className="flex-1">
                 <label className="block text-xl text-gray-500 mb-3">גיל</label>
                 <input 
                    type="number"
                    value={formData.borrower2Age || ''}
                    onChange={(e) => handleChangeAge('borrower2Age', e.target.value)}
                    className="w-full text-center font-bold text-5xl border-b-4 border-gray-200 focus:border-blue-500 outline-none py-2 bg-transparent"
                 />
                 {errors.borrower2Age && <p className="text-red-600 mt-2 text-center font-bold">{errors.borrower2Age}</p>}
               </div>
               <div className="flex-1">
                 <label className="block text-xl text-gray-500 mb-3 text-center">מעשן/ת?</label>
                 <div className="flex border rounded-2xl overflow-hidden h-16 bg-white">
                   <button 
                      onClick={() => updateFormData({ borrower2Smoker: true })}
                      className={`flex-1 text-xl transition-colors ${formData.borrower2Smoker ? 'bg-red-100 text-red-700 font-bold' : 'bg-gray-50 text-gray-400'}`}
                   >כן</button>
                   <button 
                      onClick={() => updateFormData({ borrower2Smoker: false })}
                      className={`flex-1 text-xl transition-colors ${!formData.borrower2Smoker ? 'bg-green-100 text-green-700 font-bold' : 'bg-gray-50 text-gray-400'}`}
                   >לא</button>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 flex gap-4">
        <button onClick={handleBack} className="w-20 h-20 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors text-3xl">
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <Button onClick={handleNext} className="flex-1 flex items-center justify-center gap-4 text-2xl">
           <i className="fa-solid fa-calculator"></i>
           הצג תוצאות
        </Button>
      </div>
    </div>
  );
};