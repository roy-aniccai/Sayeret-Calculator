import React from 'react';

export const NoSavingsCard: React.FC = () => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center animate-fade-in shadow-sm">
            <div className="mb-4 relative inline-block">
                <div className="absolute inset-0 bg-blue-200 rounded-full opacity-50 blur-lg animate-pulse"></div>
                <i className="fa-solid fa-trophy text-yellow-500 text-5xl relative z-10 drop-shadow-sm"></i>
            </div>

            {/* Header removed */}

            <p className="text-gray-800 mb-6 text-xl font-bold leading-relaxed">
                אתה נמצא בתנאי משכנתא מעולים שלא ניתן לשפר
            </p>

            {/* Insurance Upsell Box */}
            <div className="bg-white border border-blue-100 rounded-xl p-4 mb-6 shadow-sm">
                {/* Header removed as per request */}
                <p className="text-blue-600 font-medium text-lg mb-2">
                    ניתן לחסוך עד 50,000 ₪ במצטבר בביטוח המשכנתא
                </p>
                <p className="text-blue-400 text-sm">
                    בדיקה חינמית של הפוליסה הקיימת שלך
                </p>
            </div>
        </div>
    );
};
