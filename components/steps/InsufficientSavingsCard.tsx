import React from 'react';
import { ScenarioCard } from '../ui/ScenarioCard';
import { PaymentScenario } from '../../utils/scenarioCalculator';

interface InsufficientSavingsCardProps {
    maximumScenario: PaymentScenario;
    currentPayment: number;
}

export const InsufficientSavingsCard: React.FC<InsufficientSavingsCardProps> = ({ maximumScenario, currentPayment }) => {
    return (
        <div className="space-y-4">
            <ScenarioCard
                type="minimum" // Use minimum style (blue) as requested
                years={maximumScenario.years}
                monthlyReduction={maximumScenario.monthlyReduction}
                currentPayment={currentPayment}
                onClick={() => { }} // Non-interactive in this context
                titleOverride="האפשרות הטובה ביותר עבורך"
                descriptionOverride="" // Hide description as requested
                className="cursor-default hover:scale-100 border-blue-200 bg-blue-50" // Override hover effects
            />

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4">
                <div className="text-center">
                    <div className="text-xl font-bold text-green-600 mb-1">ניתן לחסוך עד 50,000 ₪ במצטבר בביטוח המשכנתא</div>
                    <p className="text-green-700 text-sm">בדיקה חינמית של הפוליסה הקיימת</p>
                </div>
            </div>
        </div>
    );
};
