import React, { useState, useEffect } from 'react';
import { pushGtmEvent } from '../utils/gtm';
import { Input } from './ui/Input';
import { Checkbox } from './ui/Checkbox';
import { useSingleTrackForm } from '../context/SingleTrackFormContext';
import { formatNumberWithCommas } from '../utils/helpers';

interface ContactOptionsPageProps {
  onClose: () => void;
  calculationSummary?: {
    currentPayment: number;
    newPayment?: number;
    monthlySavings?: number;
    totalSavings?: number;
    years?: number;
  };
}

/**
 * ContactOptionsPage - Page for choosing contact method after clicking "לשיחה עם המומחים"
 * 
 * Provides two options:
 * 1. Schedule meeting - Opens Calendly modal
 * 2. Request callback - Shows form with summary and saves to system
 */
export const ContactOptionsPage: React.FC<ContactOptionsPageProps> = ({
  onClose,
  calculationSummary
}) => {
  const { formData, trackCampaignEvent, sendSubmissionUpdate, submissionDocId } = useSingleTrackForm();
  const [selectedOption, setSelectedOption] = useState<'schedule' | 'callback' | null>(null);
  const [isCalendlyLoading, setIsCalendlyLoading] = useState(false);
  const [callbackForm, setCallbackForm] = useState({
    name: formData.leadName || '',
    phone: formData.leadPhone || '',
    interestedInInsurance: formData.interestedInInsurance ?? true, // Default to checked
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Push GTM event when contact options screen is shown
  useEffect(() => {
    pushGtmEvent('funnel_contact_options_opened', { funnel_stage: 'contact_options' });
  }, []);

  // Initialize Calendly widget
  const openCalendly = () => {
    setIsCalendlyLoading(true);

    trackCampaignEvent('contact_option_selected', {
      option: 'schedule_meeting',
      step: 6
    });

    // Track Calendly click in submission log
    if (submissionDocId) {
      sendSubmissionUpdate({
        action: {
          type: 'CLICK_CALENDLY',
          timestamp: new Date().toISOString()
        }
      }).catch(err => console.error('Failed to log Calendly click:', err));
    }

    // Simple approach - just open in new tab for reliability
    setTimeout(() => {
      setIsCalendlyLoading(false);
      // Push funnel event to GTM before opening Calendly
      pushGtmEvent('funnel_calendly_clicked', { funnel_stage: 'calendly' });
      window.open('https://calendly.com/tomers-finance-info/meet-with-me-1', '_blank');
    }, 500);
  };

  const handleCallbackSubmit = async () => {
    if (!callbackForm.name || !callbackForm.phone) {
      return;
    }

    setIsSubmitting(true);

    try {
      trackCampaignEvent('contact_option_selected', {
        option: 'request_callback',
        step: 6,
        formData: {
          name: callbackForm.name,
          phone: callbackForm.phone,
          interestedInInsurance: callbackForm.interestedInInsurance
        }
      });

      // Here you would typically save to your backend/database
      // For now, we'll simulate the API call
      if (submissionDocId) {
        await sendSubmissionUpdate({
          contactUpdate: {
            leadName: callbackForm.name,
            leadPhone: callbackForm.phone,
            interestedInInsurance: callbackForm.interestedInInsurance
          },
          action: {
            type: 'REQUEST_CALLBACK',
            timestamp: new Date().toISOString(),
            details: {
              notes: callbackForm.notes
            }
          }
        });
      }

      setIsSubmitted(true);

      // Push funnel event to GTM
      pushGtmEvent('funnel_callback_requested', { funnel_stage: 'callback' });
    } catch (error) {
      console.error('Error submitting callback request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-auto">
          <div className="p-8 text-center">
            <div className="mb-6">
              <i className="fa-solid fa-check-circle text-6xl text-green-500 mb-4"></i>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">תודה!</h2>
              <p className="text-gray-600 leading-relaxed">
                קיבלנו את הפנייה שלך. יועץ מומחה יחזור אליך בהקדם עם ניתוח מלא והצעה מותאמת.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedOption === 'callback') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">השאר פרטים</h2>
              <button
                onClick={() => setSelectedOption(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            {/* Minimal Contact Form */}
            <div className="space-y-4">
              <Input
                label="שם מלא"
                name="name"
                value={callbackForm.name}
                onChange={(e) => setCallbackForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="הזן את שמך המלא"
                required
              />

              <Input
                label="טלפון"
                name="phone"
                inputMode="tel"
                value={callbackForm.phone}
                onChange={(e) => setCallbackForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="050-1234567"
                required
              />

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <Checkbox
                  checked={callbackForm.interestedInInsurance}
                  onChange={(checked) => setCallbackForm(prev => ({ ...prev, interestedInInsurance: checked }))}
                  label="מעוניין גם בחיסכון בביטוח משכנתא"
                  description="עד 50,000 ש״ח חיסכון נוסף - בדיקה חינמית"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedOption(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-4 rounded-xl text-lg transition-all"
              >
                חזור
              </button>
              <button
                onClick={handleCallbackSubmit}
                disabled={!callbackForm.name || !callbackForm.phone || isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl text-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin ml-2"></i>
                    שולח...
                  </>
                ) : (
                  'שלח פרטים'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main options selection screen
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="mb-4">
              <i className="fa-solid fa-phone-volume text-5xl text-blue-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">איך תרצה להמשיך?</h2>
            <p className="text-gray-600">בחר את הדרך הנוחה לך ביותר ליצירת קשר</p>
          </div>

          <div className="space-y-4">
            {/* Schedule Meeting Option */}
            <div className="border-2 border-blue-200 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <i className="fa-solid fa-calendar-days"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">תיאום פגישה</h3>
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                    קבע פגישה עם המומחה שלנו.
                    בחר את הזמן הנוח לך ותקבל אישור מיידי.
                    {isCalendlyLoading && (
                      <span className="block text-blue-600 font-medium mt-2">
                        פותח יומן תיאומים...
                      </span>
                    )}
                  </p>
                  <button
                    onClick={openCalendly}
                    disabled={isCalendlyLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-lg transition-all disabled:opacity-50"
                  >
                    {isCalendlyLoading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin ml-2"></i>
                        פותח יומן...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-calendar-plus ml-2"></i>
                        פתח יומן תיאומים
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Request Callback Option */}
            <div className="border-2 border-green-200 rounded-xl p-4 hover:border-green-500 hover:bg-green-50 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">אשמח שיחזרו אלי</h3>
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                    השאר פרטים ויועץ מומחה יחזור אליך בהקדם עם ניתוח מלא
                    והצעה מותאמת אישית.
                  </p>
                  <button
                    onClick={() => setSelectedOption('callback')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl text-lg transition-all"
                  >
                    <i className="fa-solid fa-user-plus ml-2"></i>
                    מלא פרטים
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extend Window interface for Calendly
declare global {
  interface Window {
    Calendly: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}