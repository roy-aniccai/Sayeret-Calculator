import React from 'react';
import { useForm } from '../../context/FormContext';
import { TrackType } from '../../types';
import { SelectionCard } from '../ui/SelectionCard';

export const Step1Goal: React.FC = () => {
  const { updateFormData, nextStep } = useForm();

  const handleSelect = (track: TrackType) => {
    updateFormData({ track });
    nextStep();
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">מה המטרה העיקרית?</h2>
      <div className="space-y-6">
        <SelectionCard
          title="להוריד את ההחזר החודשי"
          description="ההחזר כבד? נבדוק פריסה נוחה יותר."
          icon="fa-solid fa-arrow-trend-down"
          colorClass="blue"
          onClick={() => handleSelect(TrackType.MONTHLY_REDUCTION)}
        />
        <SelectionCard
          title="קיצור שנים וחיסכון"
          description="לשלם פחות לבנק במסלול אגרסיבי."
          icon="fa-solid fa-piggy-bank"
          colorClass="green"
          onClick={() => handleSelect(TrackType.SHORTEN_TERM)}
        />

      </div>
    </div>
  );
};
