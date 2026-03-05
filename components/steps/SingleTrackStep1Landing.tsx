import React from 'react';
import { useSingleTrackForm } from '../../context/SingleTrackFormContext';

/**
 * SingleTrackStep1Landing - Campaign-optimized landing page component
 * 
 * Full-page landing design with hero stats, social proof, how-it-works steps,
 * and dual CTA blocks. Designed to maximize conversion before the calculator flow.
 * 
 * Requirements: 2.1, 2.2
 */
const SingleTrackStep1Landing: React.FC = () => {
  const { nextStep, campaignData, trackCampaignEvent } = useSingleTrackForm();

  const handleCTA = () => {
    trackCampaignEvent('single_track_landing_cta_click', {
      campaignId: campaignData?.campaignId,
      source: campaignData?.source,
      step: 1,
    });
    nextStep();
  };

  return (
    <div className="flex flex-col min-h-full bg-white" dir="rtl">
      {/* Blue Header Bar */}
      <div className="bg-blue-600 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <span className="text-sm font-semibold">יסוד ביטוח וחיסכון</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1.5 shadow-sm">
            <span className="text-xs font-semibold text-blue-700">רישיון משרד האוצר</span>
            <span className="text-sm">🏛️</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center pt-8 pb-6 px-4" style={{ background: 'linear-gradient(180deg, #EBF4FF 0%, #ffffff 100%)' }}>
        {/* Big Stat */}
        <div className="mb-2">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold text-blue-700">1,412</span>
            <span className="text-2xl font-bold text-blue-700">₪</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">חיסכון חודשי ממוצע שמצאנו ללקוחותינו</p>
        </div>

        {/* Main Headline */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mt-6">
          הבנק שלך לא יודיע לך
          <br />
          כשאתה משלם יותר מדי
        </h1>

        {/* Sub-paragraph */}
        <p className="text-sm text-gray-500 leading-relaxed mt-4 max-w-sm mx-auto">
          ריביות משתנות, מסלולים שהתיישנו, ותנאים שניתן לשפר -
          אבל רק אם יודעים לאן להסתכל. המחשבון שלנו עושה בדיוק את זה, בחינם, תוך 3 דקות.
        </p>
      </div>

      {/* Checkmarks Grid */}
      <div className="flex flex-wrap justify-center gap-2 px-4 mb-6">
        {[
          'תוצאה מיידית על המסך',
          'ללא חשיפת פרטים אישיים',
          'ללא התחייבות',
          'ללא עלות',
        ].map((text) => (
          <span
            key={text}
            className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full px-3 py-1.5"
          >
            <i className="fa-solid fa-check text-[10px]"></i>
            {text}
          </span>
        ))}
      </div>

      {/* Primary CTA */}
      <div className="px-6 mb-8">
        <button
          onClick={handleCTA}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          בדוק כמה אני יכול לחסוך
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          4 שאלות פשוטות • פחות מ-3 דקות
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 px-6 mb-6">
        <div className="flex-1 h-px bg-blue-200"></div>
        <span className="text-sm font-bold text-blue-600">איך זה עובד</span>
        <div className="flex-1 h-px bg-blue-200"></div>
      </div>

      {/* How It Works - 3 Steps */}
      <div className="flex flex-col gap-4 px-6 mb-8">
        {[
          {
            num: 1,
            title: 'עונים על 4 שאלות קצרות',
            desc: 'יתרת משכנתא, ריבית, תקופה, גיל. אין צורך בנתונים מדויקים, בתי. אומדן מספיק.',
          },
          {
            num: 2,
            title: 'המחשבון מנתח את המסלול שלך',
            desc: 'אנחנו משווים את התנאים שלך מול השיעורים הנמוכים ביותר בשוק ומחשבים את פוטנציאל החיסכון שלך.',
          },
          {
            num: 3,
            title: 'רואים תוצאה מיידית על החסכון',
            desc: 'כמה תשלמו פחות? מה העלות הכי נמוכה לרפיננס ומה עוד?',
          },
        ].map((item) => (
          <div
            key={item.num}
            className="flex gap-4 items-start bg-blue-50 rounded-xl border border-blue-100 p-4"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              {item.num}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Box */}
      <div className="mx-6 mb-4 rounded-xl border border-blue-200 overflow-hidden bg-blue-50">
        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-blue-200 py-4 px-2">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-blue-700">83%</div>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">מהמשתמשים מצאו<br />פוטנציאל לחיסכון</p>
          </div>
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-2xl font-extrabold text-blue-700">1,412</span>
              <span className="text-sm font-bold text-blue-700">₪</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">חיסכון חודשי<br />ממוצע שנמצא</p>
          </div>
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-2xl font-extrabold text-blue-700">3</span>
              <span className="text-sm font-bold text-blue-700">דק׳</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">זמן ממוצע<br />לקבלת תוצאות</p>
          </div>
        </div>
      </div>

      {/* Testimonial Quote */}
      <div className="mx-6 mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
        <p className="text-sm text-gray-600 italic leading-relaxed">
          "לא האמנתי שיש עד מה לשפר – החברים שלכם בסלולר 042 שילמנו יותר מ-1400 ₪ – תודה‎"
        </p>
        <p className="text-xs text-gray-400 mt-2">— אמיר, לקוח מחודשים בן 2016+</p>
      </div>

      {/* Bottom CTA Block */}
      <div className="bg-blue-600 py-8 px-6 text-center">
        <h2 className="text-xl font-bold text-white mb-4">
          מוכן לראות כמה אפשר לחסוך?
        </h2>
        <button
          onClick={handleCTA}
          className="w-full bg-white hover:bg-blue-50 text-blue-700 font-bold py-3.5 px-6 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i>
          התחל בדיקה חינם
        </button>
        <p className="text-xs text-blue-200 mt-2">
          ללא התחייבות • ללא מסירת פרטים אישיים
        </p>
      </div>

      {/* Campaign Attribution (if available) */}
      {campaignData?.campaignId && (
        <div className="text-center py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            קמפיין: {campaignData.campaignId}
            {campaignData.source && campaignData.source !== 'direct' && (
              <span className="ml-2">• מקור: {campaignData.source}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default SingleTrackStep1Landing;