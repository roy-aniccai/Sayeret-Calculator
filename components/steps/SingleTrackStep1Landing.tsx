import React from 'react';
import { useSingleTrackForm } from '../../context/SingleTrackFormContext';

/**
 * SingleTrackStep1Landing - Campaign-optimized landing page component
 * 
 * This component serves as the entry point for the single-track calculator,
 * providing a focused landing page experience that clearly communicates the
 * "reduce monthly installments" value proposition to campaign users.
 * 
 * Requirements: 2.1, 2.2
 */
const SingleTrackStep1Landing: React.FC = () => {
  const { nextStep, campaignData, trackCampaignEvent } = useSingleTrackForm();

  // Handle CTA button click
  const handleProceedToDebtCollection = () => {
    // Track landing page CTA click
    trackCampaignEvent('single_track_landing_cta_click', {
      campaignId: campaignData?.campaignId,
      source: campaignData?.source,
      step: 1,
    });

    // Proceed to debt collection step (step 2)
    nextStep();
  };

  return (
    <div className="text-center space-y-8">
      {/* Hero Section */}
      <div className="space-y-6">
        {/* Main Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            הקטן את התשלום החודשי
            <br />
            על המשכנתא שלך
          </h1>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 leading-relaxed max-w-md mx-auto">
          נבדוק איך אפשר להקטין את התשלום החודשי שלך
          ולחסוך אלפי שקלים בחודש
        </p>
      </div>

      {/* Value Proposition Cards */}
      <div className="space-y-4">
        <div className="grid gap-4">
          {/* Benefit 1 */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl shrink-0">
              <i className="fa-solid fa-chart-line-down"></i>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-gray-900 text-lg">הקטנת תשלום חודשי</h3>
              <p className="text-gray-600">חסוך מאות עד אלפי שקלים בחודש</p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-xl shrink-0">
              <i className="fa-solid fa-calculator"></i>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-gray-900 text-lg">חישוב מדויק ומהיר</h3>
              <p className="text-gray-600">קבל תוצאות מיידיות ומותאמות אישית</p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl shrink-0">
              <i className="fa-solid fa-shield-check"></i>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-gray-900 text-lg">ללא התחייבות</h3>
              <p className="text-gray-600">חישוב חינמי ללא צורך במתן פרטים אישיים</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action - Mobile Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:static md:bg-transparent md:border-t-0 md:shadow-none md:p-0 md:mt-8 space-y-3">
        <button
          onClick={handleProceedToDebtCollection}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center justify-center gap-3">
            <i className="fa-solid fa-arrow-left"></i>
            בואו נתחיל לחסוך
          </span>
        </button>

        <p className="text-sm text-gray-500 text-center">
          החישוב לקח 2-3 דקות • ללא התחייבות • חינם לחלוטין
        </p>
      </div>

      {/* Campaign Attribution (if available) */}
      {campaignData?.campaignId && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            קמפיין: {campaignData.campaignId}
            {campaignData.source && campaignData.source !== 'direct' && (
              <span className="ml-2">• מקור: {campaignData.source}</span>
            )}
          </p>
        </div>
      )}

      {/* Trust Indicators */}
      <div className="pt-6 space-y-3">
        <div className="flex items-center justify-center gap-6 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-lock"></i>
            <span>מאובטח</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-clock"></i>
            <span>מהיר</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-heart"></i>
            <span>אמין</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleTrackStep1Landing;