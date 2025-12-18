import React from 'react';
import { useForm } from '../../context/FormContext';
import { calculateResults } from '../../utils/calculator';
import { Button } from '../ui/Button';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';

export const Step5Results: React.FC = () => {
  const { formData, resetForm, setStep } = useForm();
  const results = calculateResults(formData);

  const chartData = [
    { name: results.labelBefore, value: results.valBefore, type: 'before' },
    { name: results.labelAfter, value: results.valAfter, type: 'after' },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <span className={`inline-block px-4 py-2 rounded-full mb-4 font-bold tracking-wide text-base ${results.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {results.badgeText}
        </span>
        <h2 className={`text-3xl font-extrabold leading-tight mb-3 ${results.isPositive ? 'text-green-700' : 'text-gray-900'}`}>
          {results.title}
        </h2>
        <p className="text-gray-600 text-xl px-2 whitespace-pre-line">
          {results.subtitle}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm h-80 w-full">
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
               <XAxis dataKey="name" tick={{fontSize: 16, fontWeight: 'bold'}} interval={0} />
               <YAxis hide />
               <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                 {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.type === 'before' ? '#d1d5db' : (results.isPositive ? '#22c55e' : '#ef4444')} 
                    />
                 ))}
                 <LabelList 
                    dataKey="value" 
                    position="top" 
                    formatter={(val: number) => `${val.toLocaleString()} ${results.unit}`}
                    style={{ fontSize: '20px', fontWeight: 'bold', fill: '#374151' }} 
                 />
               </Bar>
            </BarChart>
         </ResponsiveContainer>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl mb-8 border-r-8 border-gray-400 text-lg text-gray-700">
         <div className="flex gap-4">
             <div className={`text-4xl ${results.isPositive ? 'text-green-600' : 'text-red-600'}`}>
               <i className={`fa-solid ${results.icon}`}></i>
             </div>
             <div>
                <h4 className="font-bold text-gray-900 text-xl mb-1">
                  {results.isPositive ? "המשמעות הכלכלית" : "ניתוח סיכונים"}
                </h4>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {results.explanation}
                </p>
             </div>
         </div>
      </div>

      <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-2xl p-6 mt-4 mb-8 shadow-sm">
          <div className="flex items-center gap-4">
              <div className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-blue-200 text-2xl">
                  <i className="fa-solid fa-shield-heart"></i>
              </div>
              <div>
                  <h3 className="font-bold text-gray-900 text-xl">הוזלת ביטוח המשכנתא</h3>
                  <p className="text-lg text-gray-600">חיסכון נוסף של כ-<span className="font-bold text-green-600">25%</span></p>
              </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-100 flex justify-end">
              <button onClick={() => setStep(6)} className="text-lg text-blue-600 font-bold hover:underline flex items-center gap-2">
                  רוצה רק להוזיל ביטוח? לחץ כאן <i className="fa-solid fa-chevron-left text-sm"></i>
              </button>
          </div>
      </div>

      <Button onClick={() => alert("תודה! יועץ בכיר ייצור איתך קשר בשעות הקרובות עם הניתוח המלא.")} className="w-full animate-bounce py-6">
         תאמו לי שיחת מומחה למימוש הכל
      </Button>
      
      <button onClick={resetForm} className="w-full text-blue-600 font-medium text-xl mt-8 hover:underline">
          בדוק תרחיש אחר
      </button>
    </div>
  );
};
