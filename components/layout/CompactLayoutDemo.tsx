import React, { useState } from 'react';
import { CompactStepLayout } from './CompactStepLayout';
import { IntegratedCTA, createCTAConfig } from './IntegratedCTA';
import { InputWithTooltip } from './InputWithTooltip';
import { SPACING_PATTERNS, COMMON_CLASSES, combineClasses } from '../../utils/layoutUtils';

/**
 * Demo component showing how to use the shared layout utilities
 * This serves as a template for implementing consistent step layouts
 */
export const CompactLayoutDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    sampleField: '',
    anotherField: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    console.log('Moving to next step with data:', formData);
  };

  const handleBack = () => {
    console.log('Going back to previous step');
  };

  // Create CTA configurations using the factory functions
  const primaryCTA = (
    <IntegratedCTA
      config={createCTAConfig.primary(
        'מידע מדויק = חיסכון מדויק יותר',
        'המשך לחישוב',
        handleNext,
        'כל השדות מלאים בהצלחה'
      )}
    />
  );

  const infoCTA = (
    <IntegratedCTA
      config={createCTAConfig.info(
        'טיפ חשוב',
        'למד עוד',
        () => console.log('Show more info'),
        'מידע נוסף יכול לשפר את הדיוק'
      )}
    />
  );

  return (
    <CompactStepLayout
      stepName="דוגמה לפריסה קומפקטית"
      primaryCTA={primaryCTA}
      secondaryCTA={infoCTA}
      onBack={handleBack}
    >
      {/* Form fields using consistent spacing */}
      <div className={SPACING_PATTERNS.container}>
        <InputWithTooltip
          label="שדה לדוגמה"
          tooltip="זהו שדה לדוגמה המדגים את השימוש ברכיב InputWithTooltip המשותף"
          name="sampleField"
          value={formData.sampleField}
          onChange={handleChange}
          placeholder="הזן ערך כלשהו"
          error={errors.sampleField}
          icon={<i className="fa-solid fa-user text-blue-500"></i>}
        />

        <InputWithTooltip
          label="שדה נוסף"
          tooltip="שדה נוסף המדגים את העקביות בעיצוב ובהתנהגות"
          name="anotherField"
          inputMode="numeric"
          suffix="₪"
          value={formData.anotherField}
          onChange={handleChange}
          placeholder="1,000"
          error={errors.anotherField}
          icon={<i className="fa-solid fa-calculator text-green-500"></i>}
          autoAdvance={true}
        />

        {/* Information section using consistent styling */}
        <div className={COMMON_CLASSES.sectionContainer}>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium text-sm">מידע סטטיסטי:</span>
            <span className="text-xl font-bold text-gray-900">
              95% דיוק
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            מבוסס על נתונים מעודכנים מהשוק
          </p>
        </div>

        {/* Toggle section example */}
        <div className={combineClasses(COMMON_CLASSES.sectionContainer, 'space-y-3')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-toggle-on text-blue-500 text-lg"></i>
              <h3 className="text-base font-semibold text-gray-900">אפשרות נוספת</h3>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm rounded-lg font-medium bg-blue-600 text-white">
                כן
              </button>
              <button className="px-3 py-1.5 text-sm rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300">
                לא
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            תיאור קצר של האפשרות הנוספת
          </p>
        </div>
      </div>
    </CompactStepLayout>
  );
};