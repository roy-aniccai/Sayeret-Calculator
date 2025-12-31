import React from 'react';
import { useForm } from '../../context/FormContext';
import { TrackType } from '../../types';

export const Step1Goal: React.FC = () => {
  const { updateFormData, nextStep } = useForm();

  const handleSelect = (track: TrackType) => {
    updateFormData({ track });
    nextStep();
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">מה המטרה העיקרית?</h2>
      <div className="space-y-6">
        <button
          onClick={() => handleSelect(TrackType.MONTHLY_REDUCTION)}
          className="w-full text-right cursor-pointer block border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl shrink-0">
              <i className="fa-solid fa-arrow-trend-down"></i>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-3xl mb-2">הפחתת תשלום חודשי</h3>
              <p className="text-xl text-gray-600 leading-snug mb-3">
                ההחזר כבד? נבדוק פריסה נוחה יותר.
              </p>
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-base font-medium">
                מיקוד: הפחתת תשלום
              </span>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleSelect(TrackType.SHORTEN_TERM)}
          className="w-full text-right cursor-pointer block border-2 border-gray-200 rounded-2xl p-6 hover:border-green-500 hover:bg-green-50 transition-all group"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl shrink-0">
              <i className="fa-solid fa-piggy-bank"></i>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-3xl mb-2">קיצור תקופת המשכנתא</h3>
              <p className="text-xl text-gray-600 leading-snug mb-3">
                רוצה לסיים מוקדם? נראה אם אפשר לקצר ולשלם פחות ריביות לבנק.
              </p>
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-600 text-base font-medium">
                מיקוד: קיצור שנים
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
