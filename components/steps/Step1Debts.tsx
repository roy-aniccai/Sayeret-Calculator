import React, { useState, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/helpers';

// Enhanced InputWithTooltip using the new Tooltip component
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
  autoAdvance?: boolean;
  maxLength?: number;
}> = ({ label, tooltip, ...inputProps }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <label className="block text-lg font-semibold text-gray-900">
        {label}
      </label>
      <Tooltip 
        content={tooltip}
        position="auto"
        fontSize="base"
        allowWrap={true}
        maxWidth={280}
      >
        <i className="fa-solid fa-info-circle text-blue-400 hover:text-blue-600 cursor-help text-sm"></i>
      </Tooltip>
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
      {/* Compact Step Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">נתוני משכנתא והלוואות</h2>
      
      <div className="space-y-4">
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
          autoAdvance={true}
        />

        {/* Other Loans Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-credit-card text-purple-500 text-lg"></i>
              <h3 className="text-base font-semibold text-gray-900">האם יש לך הלוואות נוספות?</h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleOtherLoansToggle(true)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
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
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
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
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">
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
                autoAdvance={true}
              />
            </div>
          )}
        </div>

        {/* Bank Overdraft Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-university text-blue-500 text-lg"></i>
              <h3 className="text-base font-semibold text-gray-900">האם יש מינוס ממוצע בבנק?</h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleBankOverdraftToggle(true)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
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
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
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
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">
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

        {/* Integrated CTA with actionable content */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-lightbulb text-blue-600 text-lg"></i>
            <p className="text-blue-700 text-sm font-medium">
              מידע מדויק = חיסכון מדויק יותר
            </p>
          </div>
          <Button 
            onClick={handleNext} 
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700"
          >
            המשך לחישוב
          </Button>
        </div>

        {/* Secondary CTA for going back */}
        <button onClick={prevStep} className="w-full text-gray-400 text-base mt-4 font-medium hover:text-gray-600 transition-colors">
          חזור אחורה
        </button>
      </div>
    </div>
  );
};