import React, { useState, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/helpers';

// Move InputWithTooltip outside the component to prevent recreation on every render
const InputWithTooltip: React.FC<{
  label: string;
  tooltip: string;
  name: string;
  inputMode?: string;
  suffix?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}> = ({ label, tooltip, ...inputProps }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <label className="block text-lg font-semibold text-gray-900">
        {label}
      </label>
      <div className="relative group">
        <i className="fa-solid fa-info-circle text-blue-400 hover:text-blue-600 cursor-help text-sm"></i>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-white border border-gray-200 shadow-lg text-gray-700 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 max-w-xs transform -translate-x-1/2">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-px border-4 border-transparent border-t-gray-200"></div>
        </div>
      </div>
    </div>
    <Input {...inputProps} label="" />
  </div>
);

export const Step1Debts: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useForm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasOtherLoans, setHasOtherLoans] = useState(formData.otherLoansBalance > 0);
  const [hasBankOverdraft, setHasBankOverdraft] = useState(formData.bankAccountBalance < 0);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFormattedNumber(value);
    
    // Clear error when user types
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
    
    updateFormData({ [name]: numValue });
  }, [updateFormData]);

  const handleOtherLoansChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFormattedNumber(e.target.value);
    updateFormData({ otherLoansBalance: value });
  }, [updateFormData]);

  const handleBankOverdraftChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFormattedNumber(e.target.value);
    updateFormData({ bankAccountBalance: -value });
  }, [updateFormData]);

  const handleOtherLoansToggle = useCallback((hasLoans: boolean) => {
    setHasOtherLoans(hasLoans);
    // Don't reset data when toggling - keep it persistent
  }, []);

  const handleBankOverdraftToggle = useCallback((hasOverdraft: boolean) => {
    setHasBankOverdraft(hasOverdraft);
    // Don't reset data when toggling - keep it persistent
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.mortgageBalance) newErrors.mortgageBalance = 'נא להזין יתרת משכנתא';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    nextStep();
  };



  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">נתוני משכנתא והלוואות</h2>
      <p className="text-gray-600 text-center mb-8">כל המידע נשאר חסוי ומשמש לחישוב מדויק</p>
      
      <div className="space-y-6">
        {/* Mortgage Balance */}
        <InputWithTooltip
          label="יתרת משכנתא נוכחית"
          tooltip="נדרש לחישוב הריבית החדשה ואפשרויות המיחזור"
          name="mortgageBalance"
          inputMode="numeric"
          suffix="₪"
          value={formatNumberWithCommas(formData.mortgageBalance)}
          onChange={handleChange}
          placeholder="1,200,000"
          error={errors.mortgageBalance}
          icon={<i className="fa-solid fa-home text-blue-500"></i>}
        />

        {/* Other Loans Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <i className="fa-solid fa-credit-card text-purple-500 text-xl"></i>
              <h3 className="text-lg font-semibold text-gray-900">האם יש לך הלוואות נוספות?</h3>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleOtherLoansToggle(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  hasOtherLoans 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                כן
              </button>
              <button
                type="button"
                onClick={() => handleOtherLoansToggle(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !hasOtherLoans 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                לא
              </button>
            </div>
          </div>

          {hasOtherLoans && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">
                נאחד את כל החובות למשכנתא אחת בריבית נמוכה
              </p>
              <InputWithTooltip
                label="סך כל ההלוואות האחרות"
                tooltip="כולל אשראי אישי, הלוואת רכב, כרטיס אשראי וכל הלוואה אחרת"
                name="otherLoansBalance"
                inputMode="numeric"
                suffix="₪"
                value={formatNumberWithCommas(formData.otherLoansBalance)}
                onChange={handleOtherLoansChange}
                placeholder="150,000"
                icon={<i className="fa-solid fa-credit-card text-purple-500"></i>}
              />
            </div>
          )}
        </div>

        {/* Bank Overdraft Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <i className="fa-solid fa-university text-blue-500 text-xl"></i>
              <h3 className="text-lg font-semibold text-gray-900">האם יש מינוס ממוצע בבנק?</h3>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleBankOverdraftToggle(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  hasBankOverdraft 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                כן
              </button>
              <button
                type="button"
                onClick={() => handleBankOverdraftToggle(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !hasBankOverdraft 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                לא
              </button>
            </div>
          </div>

          {hasBankOverdraft && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">
                חובות בריבית גבוהה שכדאי לאחד למשכנתא
              </p>
              <InputWithTooltip
                label="סכום המינוס הממוצע"
                tooltip="הסכום הממוצע שאתה במינוס בחשבון הבנק - חוב בריבית גבוהה"
                name="bankOverdraftAmount"
                inputMode="numeric"
                suffix="₪"
                value={formatNumberWithCommas(Math.abs(formData.bankAccountBalance))}
                onChange={handleBankOverdraftChange}
                placeholder="5,000"
                icon={<i className="fa-solid fa-university text-blue-500"></i>}
              />
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-lightbulb text-blue-600 text-xl mt-1"></i>
            <div>
              <p className="text-blue-700 text-sm">
                ככל שתספק יותר מידע מדויק, נוכל לחשב עבורך חיסכון מדויק יותר ולמצוא את הפתרון הטוב ביותר.
              </p>
            </div>
          </div>
        </div>

        <Button fullWidth onClick={handleNext} className="mt-8">
          המשך לשלב הבא
        </Button>
        
        <button onClick={prevStep} className="w-full text-gray-400 text-xl mt-6 font-medium">
          חזור אחורה
        </button>
      </div>
    </div>
  );
};