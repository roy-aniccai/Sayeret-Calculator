import React from 'react';
import { currentMortgageParams, calculateWeightedMortgageRate, calculateWeightedOtherLoansRate } from '../utils/mortgageParams';

export const ParametersDisplay: React.FC = () => {
  const weightedMortgageRate = calculateWeightedMortgageRate();
  const weightedOtherLoansRate = calculateWeightedOtherLoansRate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
      {/* Mortgage Rates */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <i className="fa-solid fa-home text-blue-600 text-2xl mr-3"></i>
          <h3 className="text-lg font-bold text-blue-900">ריביות משכנתא</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-blue-700">קל"צ:</span>
            <span className="font-bold">{(currentMortgageParams.mortgageRates.fixedRate * 100).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">משתנה לא צמודה:</span>
            <span className="font-bold">{(currentMortgageParams.mortgageRates.variableUnlinked * 100).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">משתנה צמודה:</span>
            <span className="font-bold">{(currentMortgageParams.mortgageRates.variableLinked * 100).toFixed(2)}%</span>
          </div>
          <div className="border-t border-blue-200 pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-blue-800 font-semibold">ריבית משוקללת:</span>
              <span className="font-bold text-blue-900">{(weightedMortgageRate * 100).toFixed(3)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Other Loans Rates */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <i className="fa-solid fa-credit-card text-purple-600 text-2xl mr-3"></i>
          <h3 className="text-lg font-bold text-purple-900">ריביות הלוואות אחרות</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-purple-700">ריבית נמוכה (1/3):</span>
            <span className="font-bold">{(currentMortgageParams.otherLoansRates.lowRate * 100).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-700">ריבית גבוהה (2/3):</span>
            <span className="font-bold">{(currentMortgageParams.otherLoansRates.highRate * 100).toFixed(2)}%</span>
          </div>
          <div className="border-t border-purple-200 pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-purple-800 font-semibold">ריבית משוקללת:</span>
              <span className="font-bold text-purple-900">{(weightedOtherLoansRate * 100).toFixed(3)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Regulations */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <i className="fa-solid fa-gavel text-green-600 text-2xl mr-3"></i>
          <h3 className="text-lg font-bold text-green-900">מגבלות רגולטוריות</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-green-700">תקופה מקסימלית:</span>
            <span className="font-bold">{currentMortgageParams.regulations.maxLoanTermYears} שנים</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">גיל מקסימלי:</span>
            <span className="font-bold">{currentMortgageParams.regulations.maxBorrowerAge} שנה</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">יחס מימון מקסימלי:</span>
            <span className="font-bold">{(currentMortgageParams.regulations.maxLtvRatio * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">החזר מינימלי:</span>
            <span className="font-bold">{currentMortgageParams.regulations.minMonthlyPayment.toLocaleString()} ₪</span>
          </div>
        </div>
      </div>

      {/* Fees */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <i className="fa-solid fa-receipt text-orange-600 text-2xl mr-3"></i>
          <h3 className="text-lg font-bold text-orange-900">עמלות ועלויות</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-orange-700">עמלת מיחזור:</span>
            <span className="font-bold">{(currentMortgageParams.fees.refinancingFee * 100).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-700">עלות שמאות:</span>
            <span className="font-bold">{currentMortgageParams.fees.appraisalFee.toLocaleString()} ₪</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-700">עלויות משפטיות:</span>
            <span className="font-bold">{currentMortgageParams.fees.legalFees.toLocaleString()} ₪</span>
          </div>
        </div>
      </div>

      {/* Simulator Settings */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <i className="fa-solid fa-sliders text-indigo-600 text-2xl mr-3"></i>
          <h3 className="text-lg font-bold text-indigo-900">הגדרות סימולטור</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-indigo-700">טווח תשלום:</span>
            <span className="font-bold">±{(currentMortgageParams.simulator.paymentRangePercent * 100).toFixed(0)}%</span>
          </div>
          <div className="text-xs text-indigo-600 mt-2">
            הסליידר בסימולטור יאפשר שינוי של עד {(currentMortgageParams.simulator.paymentRangePercent * 100).toFixed(0)}% מהתשלום הנוכחי
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:col-span-2">
        <div className="flex items-center mb-4">
          <i className="fa-solid fa-chart-line text-gray-600 text-2xl mr-3"></i>
          <h3 className="text-lg font-bold text-gray-900">סיכום</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {(weightedMortgageRate * 100).toFixed(3)}%
            </div>
            <div className="text-sm text-gray-600">ריבית משוקללת משכנתא</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {(weightedOtherLoansRate * 100).toFixed(3)}%
            </div>
            <div className="text-sm text-gray-600">ריבית משוקללת הלוואות אחרות</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <div className="text-xs text-gray-500">
            עדכון אחרון: דצמבר 2024 | מקור: בנק ישראל ובנקים מובילים
          </div>
        </div>
      </div>
    </div>
  );
};