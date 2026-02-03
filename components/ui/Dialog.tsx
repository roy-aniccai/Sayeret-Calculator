import React, { useEffect, useState } from 'react';
import { Button } from './Button';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    confirmText?: string;
    showFooterButton?: boolean;
    showIcon?: boolean;
    showCloseButton?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
    isOpen,
    onClose,
    title = "סיירת המשכנתא",
    children,
    confirmText = "אישור",
    showFooterButton = true,
    showIcon = true,
    showCloseButton = false
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
            // Small delay to allow render before transition
            setTimeout(() => setIsVisible(true), 10);
            document.body.style.overflow = 'hidden';
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setIsRendered(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isRendered) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog Content */}
            <div
                className={`relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                    }`}
            >
                {/* Header decoration */}
                <div className="h-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <div className="p-8 text-center space-y-6">
                    {/* Close Button X */}
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                    )}

                    {/* Icon */}
                    {showIcon && (
                        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <i className="fa-solid fa-comments text-3xl text-blue-600"></i>
                        </div>
                    )}

                    <div className="space-y-3">
                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                            {title}
                        </h3>

                        {/* Message Body */}
                        <div className="text-gray-600 text-lg leading-relaxed">
                            {children}
                        </div>
                    </div>

                    {showFooterButton && (
                        <div className="pt-2">
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={onClose}
                                className="!py-3 !text-xl !rounded-xl shadow-blue-200"
                            >
                                {confirmText}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
