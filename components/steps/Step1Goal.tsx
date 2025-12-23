import React from 'react';
import { useForm } from '../../context/FormContext';
import { TrackType } from '../../types';
import { SelectionCard } from '../ui/SelectionCard';
import { getTrackConfigSafe, getTrackDisplayName } from '../../utils/trackConfig';

export const Step1Goal: React.FC = () => {
  const { updateFormData, nextStep } = useForm();

  const handleSelect = (track: TrackType) => {
    updateFormData({ track });
    nextStep();
  };

  // Get track-specific configurations
  const monthlyReductionConfig = getTrackConfigSafe(TrackType.MONTHLY_REDUCTION);
  const shortenTermConfig = getTrackConfigSafe(TrackType.SHORTEN_TERM);

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">מה המטרה העיקרית?</h2>
      <div className="space-y-6">
        <SelectionCard
          title={getTrackDisplayName(TrackType.MONTHLY_REDUCTION)}
          description={monthlyReductionConfig.messaging.ctaTexts.primary}
          icon={`fa-solid ${monthlyReductionConfig.ui.iconClass}`}
          colorClass={monthlyReductionConfig.ui.primaryColor}
          onClick={() => handleSelect(TrackType.MONTHLY_REDUCTION)}
          trackSpecific={{
            priority: monthlyReductionConfig.calculation.optimizationPriority,
            focusMetric: monthlyReductionConfig.calculation.simulatorDefaults.focusMetric,
            tooltip: monthlyReductionConfig.messaging.tooltips.simulator
          }}
        />
        <SelectionCard
          title={getTrackDisplayName(TrackType.SHORTEN_TERM)}
          description={shortenTermConfig.messaging.ctaTexts.primary}
          icon={`fa-solid ${shortenTermConfig.ui.iconClass}`}
          colorClass={shortenTermConfig.ui.primaryColor}
          onClick={() => handleSelect(TrackType.SHORTEN_TERM)}
          trackSpecific={{
            priority: shortenTermConfig.calculation.optimizationPriority,
            focusMetric: shortenTermConfig.calculation.simulatorDefaults.focusMetric,
            tooltip: shortenTermConfig.messaging.tooltips.simulator
          }}
        />
      </div>
    </div>
  );
};
