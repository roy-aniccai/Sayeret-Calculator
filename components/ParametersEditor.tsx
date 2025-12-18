import React, { useState, useEffect } from 'react';
import { currentMortgageParams, updateMortgageParams, MortgageParams } from '../utils/mortgageParams';

interface ParametersEditorProps {
  onClose: () => void;
}

export const ParametersEditor: React.FC<ParametersEditorProps> = ({ onClose }) => {
  const [params, setParams] = useState<MortgageParams>(currentMortgageParams);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'rates' | 'regulations' | 'fees' | 'simulator'>('rates');

  useEffect(() => {
    const isChanged = JSON.stringify(params) !== JSON.stringify(currentMortgageParams);
    setHasChanges(isChanged);
  }, [params]);

  const handleRateChange = (category: keyof MortgageParams['mortgageRates'], value: string) => {
    const numValue = parseFloat(value) / 100; // Convert percentage to decimal
    setParams(prev => ({
      ...prev,
      mortgageRates: {
        ...prev.mortgageRates,
        [category]: isNaN(numValue) ? 0 : numValue
      }
    }));
  };

  const handleOtherLoansRateChange = (category: keyof MortgageParams['otherLoansRates'], value: string) => {
    const numValue = parseFloat(value) / 100;
    setParams(prev => ({
      ...prev,
      otherLoansRates: {
        ...prev.otherLoansRates,
        [category]: isNaN(numValue) ? 0 : numValue
      }
    }));
  };

  const handleRegulationChange = (category: keyof MortgageParams['regulations'], value: string) => {
    let numValue: number;
    if (category === 'maxLtvRatio') {
      numValue = parseFloat(value) / 100; // Convert percentage to decimal
    } else {
      numValue = parseFloat(value);
    }
    
    setParams(prev => ({
      ...prev,
      regulations: {
        ...prev.regulations,
        [category]: isNaN(numValue) ? 0 : numValue
      }
    }));
  };

  const handleFeeChange = (category: keyof MortgageParams['fees'], value: string) => {
    let numValue: number;
    if (category === 'refinancingFee') {
      numValue = parseFloat(value) / 100; // Convert percentage to decimal
    } else {
      numValue = parseFloat(value);
    }
    
    setParams(prev => ({
      ...prev,
      fees: {
        ...prev.fees,
        [category]: isNaN(numValue) ? 0 : numValue
      }
    }));
  };

  const handleSimulatorChange = (category: keyof MortgageParams['simulator'], value: string) => {
    let numValue: number;
    if (category === 'paymentRangePercent') {
      numValue = parseFloat(value) / 100; // Convert percentage to decimal
    } else {
      numValue = parseFloat(value);
    }
    
    setParams(prev => ({
      ...prev,
      simulator: {
        ...prev.simulator,
        [category]: isNaN(numValue) ? 0 : numValue
      }
    }));
  };

  const handleSave = () => {
    // כאן נוכל להוסיף שמירה למסד נתונים או לקובץ
    console.log('Saving parameters:', params);
    alert('הפרמטרים נשמרו בהצלחה!\n(בגרסה זו השמירה היא זמנית בלבד)');
    onClose();
  };

  const handleReset = () => {
    setParams(currentMortgageParams);
  };

  const exportParams = () => {
    const dataStr = JSON.stringify(params, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mortgage-params-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">עריכת פרמטרי משכנתא</h2>
          <button onClick={onClose} className="text-blue-200 hover:text-white text-2xl">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('rates')}
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'rates'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fa-solid fa-percent"></i>
              <span>ריביות</span>
            </button>
            <button
              onClick={() => setActiveTab('regulations')}
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'regulations'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fa-solid fa-gavel"></i>
              <span>רגולציות</span>
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'fees'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fa-solid fa-dollar-sign"></i>
              <span>עמלות</span>
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'simulator'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fa-solid fa-sliders"></i>
              <span>סימולטור</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'rates' && (
            <div className="space-y-8">
              {/* Mortgage Rates */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">ריביות משכנתא</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      קל"צ (קבועה לא צמודה)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={(params.mortgageRates.fixedRate * 100).toFixed(2)}
                        onChange={(e) => handleRateChange('fixedRate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      משתנה לא צמודה
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={(params.mortgageRates.variableUnlinked * 100).toFixed(2)}
                        onChange={(e) => handleRateChange('variableUnlinked', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      משתנה צמודה למדד
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={(params.mortgageRates.variableLinked * 100).toFixed(2)}
                        onChange={(e) => handleRateChange('variableLinked', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Loans Rates */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">ריביות הלוואות אחרות</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ריבית נמוכה (שליש ראשון)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={(params.otherLoansRates.lowRate * 100).toFixed(2)}
                        onChange={(e) => handleOtherLoansRateChange('lowRate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ריבית גבוהה (שני שלישים)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={(params.otherLoansRates.highRate * 100).toFixed(2)}
                        onChange={(e) => handleOtherLoansRateChange('highRate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weighted Rate Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">ריביות משוקללות</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">ריבית משוקללת משכנתא: </span>
                    <span className="font-bold">
                      {(
                        (params.mortgageRates.fixedRate * params.mortgageDistribution.fixed +
                         params.mortgageRates.variableUnlinked * params.mortgageDistribution.variableUnlinked +
                         params.mortgageRates.variableLinked * params.mortgageDistribution.variableLinked) * 100
                      ).toFixed(3)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">ריבית משוקללת הלוואות אחרות: </span>
                    <span className="font-bold">
                      {(
                        (params.otherLoansRates.lowRate * (1/3) + params.otherLoansRates.highRate * (2/3)) * 100
                      ).toFixed(3)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'regulations' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">מגבלות רגולטוריות</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תקופה מקסימלית (שנים)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={params.regulations.maxLoanTermYears}
                    onChange={(e) => handleRegulationChange('maxLoanTermYears', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    גיל מקסימלי לסיום משכנתא
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="80"
                    value={params.regulations.maxBorrowerAge}
                    onChange={(e) => handleRegulationChange('maxBorrowerAge', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    יחס מימון מקסימלי (LTV)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="50"
                      max="100"
                      value={(params.regulations.maxLtvRatio * 100).toFixed(0)}
                      onChange={(e) => handleRegulationChange('maxLtvRatio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    החזר חודשי מינימלי (ש"ח)
                  </label>
                  <input
                    type="number"
                    min="500"
                    max="5000"
                    value={params.regulations.minMonthlyPayment}
                    onChange={(e) => handleRegulationChange('minMonthlyPayment', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">עמלות ועלויות</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    עמלת מיחזור
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="5"
                      value={(params.fees.refinancingFee * 100).toFixed(2)}
                      onChange={(e) => handleFeeChange('refinancingFee', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    עלות שמאות (ש"ח)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="10000"
                    value={params.fees.appraisalFee}
                    onChange={(e) => handleFeeChange('appraisalFee', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    עלויות משפטיות (ש"ח)
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="15000"
                    value={params.fees.legalFees}
                    onChange={(e) => handleFeeChange('legalFees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">הגדרות סימולטור</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    טווח תשלום בסימולטור
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="10"
                      max="100"
                      value={(params.simulator.paymentRangePercent * 100).toFixed(0)}
                      onChange={(e) => handleSimulatorChange('paymentRangePercent', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    קובע את הטווח של הסליידר בסימולטור (±{(params.simulator.paymentRangePercent * 100).toFixed(0)}% מהתשלום הנוכחי)
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">דוגמה</h4>
                  <div className="text-sm text-blue-700">
                    <p>תשלום נוכחי: 8,000 ש"ח</p>
                    <p>טווח סימולטור: ±{(params.simulator.paymentRangePercent * 100).toFixed(0)}%</p>
                    <p className="font-semibold mt-2">
                      טווח: {(8000 * (1 - params.simulator.paymentRangePercent)).toLocaleString()} - {(8000 * (1 + params.simulator.paymentRangePercent)).toLocaleString()} ש"ח
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <div className="flex gap-2">
            <button
              onClick={exportParams}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              <i className="fa-solid fa-download ml-2"></i>
              ייצא פרמטרים
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={!hasChanges}
            >
              <i className="fa-solid fa-undo ml-2"></i>
              איפוס
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-4 py-2 rounded-md transition-colors ${
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <i className="fa-solid fa-save ml-2"></i>
              שמור שינויים
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};