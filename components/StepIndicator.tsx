import React from 'react';
import { AppStep } from '../types';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: 'البدء' },
  { id: 2, label: 'البيانات' },
  { id: 3, label: 'المستندات' },
  { id: 4, label: 'التحقق' },
  { id: 5, label: 'الهوية' },
  { id: 6, label: 'طباعة' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="w-full py-6 px-4 no-print">
      <div className="flex items-center justify-between relative max-w-4xl mx-auto">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded"></div>
        <div 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 h-1 bg-sudan-green -z-10 transition-all duration-500 rounded"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step) => {
          const isActive = step.id <= currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border-4 transition-all duration-300 ${
                  isActive 
                    ? 'bg-sudan-green border-sudan-green text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-green-100 scale-110' : ''}`}
              >
                {step.id}
              </div>
              <span className={`mt-2 text-xs sm:text-sm font-medium hidden sm:block ${
                isActive ? 'text-sudan-green' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};