/**
 * CTA Optimization Demo Component
 * Demonstrates the new CTA visibility optimization features including:
 * - Viewport visibility detection
 * - Automatic positioning adjustments
 * - CTA interaction persistence
 * - CTA prioritization system
 */

import React, { useRef, useState } from 'react';
import { SimpleCTAGroup, CTAPrioritization, CTAConfig } from '../ui/CTAPrioritization';
import { useCTAInteractionPersistence } from '../../utils/useCTAInteractionPersistence';
import { Input } from '../ui/Input';

export const CTAOptimizationDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const contentRef = useRef<HTMLDivElement>(null);
  const primaryCTARef = useRef<HTMLDivElement>(null);
  
  // Set up CTA interaction persistence
  const { interactionState, updatePositioning } = useCTAInteractionPersistence(
    contentRef,
    [primaryCTARef],
    {
      stickyBehavior: 'when-hidden',
      persistDuringFocus: true,
      persistDuringInput: true,
      updateOnContentChange: true
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    alert('Form submitted! This demonstrates the primary CTA action.');
  };

  const handleSaveDraft = () => {
    alert('Draft saved! This demonstrates a secondary CTA action.');
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '', message: '' });
    alert('Form cleared! This demonstrates a tertiary CTA action.');
  };

  // Example CTA configurations
  const ctaConfigs: CTAConfig[] = [
    {
      id: 'submit',
      text: 'שלח טופס',
      onClick: handleSubmit,
      priority: 'primary',
      icon: 'fa-solid fa-paper-plane',
      variant: 'primary'
    },
    {
      id: 'save-draft',
      text: 'שמור טיוטה',
      onClick: handleSaveDraft,
      priority: 'secondary',
      icon: 'fa-solid fa-save'
    },
    {
      id: 'cancel',
      text: 'נקה',
      onClick: handleCancel,
      priority: 'tertiary',
      icon: 'fa-solid fa-trash'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        הדגמת מערכת CTA מותאמת
      </h2>
      
      {/* Content that might require scrolling */}
      <div ref={contentRef} className="space-y-6">
        
        {/* Status indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">מצב CTA נוכחי:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• נראה: {interactionState.isVisible ? 'כן' : 'לא'}</p>
            <p>• דביק: {interactionState.isSticky ? 'כן' : 'לא'}</p>
            <p>• אינטראקציה פעילה: {interactionState.interactionActive ? 'כן' : 'לא'}</p>
          </div>
        </div>

        {/* Long form to demonstrate scrolling behavior */}
        <div className="space-y-4">
          <Input
            label="שם מלא"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="הזן את שמך המלא"
          />
          
          <Input
            label="כתובת אימייל"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="example@email.com"
          />
          
          <Input
            label="מספר טלפון"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="050-1234567"
          />
          
          {/* Large textarea to force scrolling */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-2">
              הודעה
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="כתוב כאן את ההודעה שלך..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
          </div>
        </div>

        {/* Demonstration of different CTA layouts */}
        <div className="space-y-6">
          
          {/* Simple CTA Group */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">קבוצת CTA פשוטה:</h3>
            <SimpleCTAGroup
              primaryText="המשך"
              primaryAction={handleSubmit}
              primaryIcon="fa-solid fa-arrow-left"
              secondaryText="חזור"
              secondaryAction={handleCancel}
              secondaryIcon="fa-solid fa-arrow-right"
              layout="inline"
            />
          </div>

          {/* Full CTA Prioritization */}
          <div ref={primaryCTARef}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">מערכת עדיפויות CTA מלאה:</h3>
            <CTAPrioritization
              ctas={ctaConfigs}
              layout="stacked"
              persistentPrimary={true}
              className="bg-gray-50 p-4 rounded-lg"
            />
          </div>

          {/* Inline layout example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">פריסה אופקית:</h3>
            <CTAPrioritization
              ctas={ctaConfigs.slice(0, 2)} // Only primary and secondary
              layout="inline"
              persistentPrimary={false}
            />
          </div>
        </div>

        {/* Additional content to demonstrate scrolling */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">תוכן נוסף להדגמת גלילה:</h3>
          
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">סעיף {i + 1}</h4>
              <p className="text-gray-600">
                זהו תוכן לדוגמה שנועד להדגים כיצד מערכת ה-CTA מתנהגת כאשר יש תוכן רב
                שדורש גלילה. שימו לב כיצד ה-CTA הראשי נשאר נגיש גם כאשר אתם גוללים למטה.
              </p>
            </div>
          ))}
        </div>

        {/* Manual update button */}
        <div className="text-center">
          <button
            onClick={updatePositioning}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            עדכן מיקום CTA ידנית
          </button>
        </div>
      </div>
    </div>
  );
};