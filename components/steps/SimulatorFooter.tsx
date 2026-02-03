import React from 'react';
import { Button } from '../ui/Button';

interface SimulatorFooterProps {
    onContactExpert: () => void;
    onTryAnother: () => void;
    primaryColor?: string;
    className?: string;
}

export const SimulatorFooter: React.FC<SimulatorFooterProps> = ({
    onContactExpert,
    onTryAnother,
    primaryColor = 'blue',
    className = ''
}) => {
    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:static md:bg-transparent md:border-t-0 md:shadow-none md:p-0 md:mt-4 space-y-3 ${className}`}>
            {/* Primary CTA */}
            <Button
                onClick={onContactExpert}
                className="w-full py-3 md:py-4 text-lg md:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 transform transition-all hover:scale-[1.02]"
            >
                <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-phone-volume animate-bounce"></i>
                    אני רוצה שתחסכו לי
                </span>
            </Button>

            {/* Secondary CTA */}
            <button
                onClick={onTryAnother}
                className={`w-full text-${primaryColor}-600 font-medium text-base md:text-lg hover:underline`}
            >
                בדוק תרחיש אחר
            </button>
        </div>
    );
};
